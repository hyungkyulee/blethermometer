import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native'

import { Colors } from 'react-native/Libraries/NewAppScreen'

// import BleManager from '../BleManager';
import BleManager from 'react-native-ble-manager'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const ConnectionState = {
  SCANNING: 'SCANNING',
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  DISCOVERING: 'DISCOVERING',
  CONNECTED: 'CONNECTED',
  DISCONNECTING: 'DISCONNECTING',
  COMMUNICATING: 'COMMUNICATING',
}

const FromBleManager = () => {
  const [isScanning, setIsScanning] = useState(false)
  const peripherals = new Map()
  const [list, setList] = useState([])

  const [scannedDevices, setScannedDevices] = useState<Device[]>([])
  const [targetDevice, setTargetDevice] = useState<Device>()
  const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED)
  const [currentTest, setCurrentTest] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [connectedDevice, setConnectedDevice] = useState<Device>()
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([])

  const getConnectionStatus = (): string => {
    switch (connectionState) {
      case ConnectionState.SCANNING:
        return 'SCANNING...'
      case ConnectionState.CONNECTING:
        return 'Connecting...'
      case ConnectionState.DISCOVERING:
        return 'Discovering...'
      case ConnectionState.CONNECTED:
        return 'Connected'
      case ConnectionState.COMMUNICATING:
        return 'Ready for reading or writing'
      case ConnectionState.DISCONNECTED:
      case ConnectionState.DISCONNECTING:
        if (targetDevice) {
          return 'Found ' + targetDevice.id
        }
    }

    return 'Searching...'
  }

  const delay = (milliseconds: number) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, milliseconds)
    })
  }

  const startScan = async () => {
    if (!isScanning) {
      await BleManager.scan([], 3, false, {})
      await delay(3000)
      var discoveredPeripherals = await BleManager.getDiscoveredPeripherals()
      console.log('----> discovered Peripherals', discoveredPeripherals)

      // BleManager.scan([], 3, true)
      //   .then(results => {
      //     console.log('Scanning... : ', results);
      //     setIsScanning(true);
      //   })
      //   .catch(err => {
      //     console.error(err);
      //   });
    }
  }

  const handleStopScan = () => {
    console.log('Scan is stopped')
    setIsScanning(false)
  }

  const handleDisconnectedPeripheral = (data: { peripheral: string }) => {
    let peripheral = peripherals.get(data.peripheral)
    if (peripheral) {
      peripheral.connected = false
      peripherals.set(peripheral.id, peripheral)
      setList(Array.from(peripherals.values()))
    }
    console.log('Disconnected from ' + data.peripheral)
  }

  const handleUpdateValueForCharacteristic = (data: { peripheral: string; characteristic: string; value: any }) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value)
  }

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length === 0) {
        console.log('No connected peripherals')
      }
      console.log(results)
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i]
        peripheral.connected = true
        peripherals.set(peripheral.id, peripheral)
        setList(Array.from(peripherals.values()))
      }
    })
  }

  const handleDiscoverPeripheral = (peripheral: { name: string; id: any }) => {
    console.log('Got ble peripheral', peripheral)
    if (!peripheral.name) {
      peripheral.name = 'NO NAME'
    }
    peripherals.set(peripheral.id, peripheral)
    setList(Array.from(peripherals.values()))
  }

  const testPeripheral = (peripheral: { connected: any; id: string }) => {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id)
      } else {
        BleManager.connect(peripheral.id)
          .then(() => {
            let p = peripherals.get(peripheral.id)
            if (p) {
              p.connected = true
              peripherals.set(peripheral.id, p)
              setList(Array.from(peripherals.values()))
            }
            console.log('============================ Connected to ' + peripheral.id)

            setTimeout(() => {
              /* Test read current RSSI value */
              BleManager.retrieveServices(peripheral.id).then(peripheralData => {
                console.log('============================ Retrieved peripheral services', peripheralData)

                BleManager.readRSSI(peripheral.id).then(rssi => {
                  console.log('============================ Retrieved actual RSSI value', rssi)
                  let p = peripherals.get(peripheral.id)
                  if (p) {
                    p.rssi = rssi
                    peripherals.set(peripheral.id, p)
                    setList(Array.from(peripherals.values()))
                  }
                })
              })

              // Test using bleno's pizza example
              // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
              /*
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
            console.log(peripheralInfo);
            var service = '13333333-3333-3333-3333-333333333337';
            var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
            var crustCharacteristic = '13333333-3333-3333-3333-333333330001';

            setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                console.log('Started notification on ' + peripheral.id);
                setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                    console.log('Writed NORMAL crust');
                    BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                        console.log('Writed 351 temperature, the pizza should be BAKED');
                        
                        //var PizzaBakeResult = {
                        //  HALF_BAKED: 0,
                        //  BAKED:      1,
                        //  CRISPY:     2,
                        //  BURNT:      3,
                        //  ON_FIRE:    4
                        //};
                    });
                    });

                }, 500);
                }).catch((error) => {
                console.log('Notification error', error);
                });
            }, 200);
            });*/
            }, 900)
          })
          .catch(error => {
            console.log('Connection error', error)
          })
      }
    }
  }

  const readPeripheralData = (peripheralId, readServiceUUID, readCharacteristicUUID) => {
    return new Promise((resolve, reject) => {
      BleManager.read(this.peripheralId, this.readServiceUUID[index], this.readCharacteristicUUID[index])
        .then(data => {
          const str = this.byteToString(data)
          console.log('Read: ', data, str)
          resolve(str)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  useEffect(() => {
    BleManager.start({ showAlert: false })

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral)
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan)
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral)
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic)

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(result => {
        if (result) {
          console.log('Permission is OK')
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(permResult => {
            if (permResult) {
              console.log('User accept')
            } else {
              console.log('User refuse')
            }
          })
        }
      })
    }

    return () => {
      console.log('unmount')
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral')
      bleManagerEmitter.removeAllListeners('BleManagerStopScan')
      bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral')
      bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic')
      // bleManagerEmitter.removeListener(
      //   'BleManagerDiscoverPeripheral',
      //   handleDiscoverPeripheral,
      // );
      // bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
      // bleManagerEmitter.removeListener(
      //   'BleManagerDisconnectPeripheral',
      //   handleDisconnectedPeripheral,
      // );
      // bleManagerEmitter.removeListener(
      //   'BleManagerDidUpdateValueForCharacteristic',
      //   handleUpdateValueForCharacteristic,
      // );
    }
  }, [])

  const renderItem = (item: any) => {
    const color = item.connected ? 'green' : '#fff'
    return (
      <TouchableHighlight onPress={() => testPeripheral(item)}>
        <View style={[styles.row, { backgroundColor: color }]}>
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: '#333333',
              padding: 10,
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 10,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
            }}>
            RSSI: {item.rssi}
          </Text>
          <Text
            style={{
              fontSize: 8,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
              paddingBottom: 20,
            }}>
            {item.id}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  const Button = function (props: { [x: string]: any; onPress: any; title: any }) {
    const { onPress, title, ...restProps } = props
    return (
      <TouchableOpacity onPress={onPress} {...restProps}>
        <Text style={[styles.buttonStyle, restProps.disabled ? styles.disabledButtonStyle : null]}>{title}</Text>
      </TouchableOpacity>
    )
  }

  const renderHeader = () => {
    return (
      <View style={{ padding: 10, marginTop: 10, alignContent: 'center' }}>
        <Text style={styles.textStyle} numberOfLines={1}>
          Device: {getConnectionStatus()}
        </Text>
        <View style={{ padding: 0, paddingTop: 0 }}>
          <Button style={{ paddingTop: 0 }} onPress={() => startScan()} title={'Scan'} />
        </View>
        <View style={{ padding: 0, paddingTop: 0 }}>
          <Button style={{ paddingTop: 10 }} onPress={() => retrieveConnected()} title={'Retrieve connected device'} />
        </View>
      </View>
    )
  }

  const renderList = () => {
    return (
      <View style={{ padding: 10, paddingTop: 0 }}>
        <Text style={[styles.textStyle, { paddingBottom: 10, alignSelf: 'center' }]}>Select a device to execute</Text>
        <FlatList
          data={list.filter(x => x.name !== 'NO NAME')}
          renderItem={({ item }) => renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
        />
        <Button
          style={{ paddingTop: 10 }}
          onPress={() => {
            setList([])
          }}
          title={'Clear'}
        />
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#15127e" />
      <SafeAreaView>
        <ScrollView style={styles.container}>
          {renderHeader()}

          {/* {renderModal()} */}
          {/* {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
            <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
        )} */}
          {/* <View style={styles.body}>
            <View style={{ margin: 10 }}>
              <Button title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'} onPress={() => startScan()} />
            </View>

            <View style={styles.engine}>
              <Text style={styles.footer}>aaaaaa This is the Test App</Text>
            </View>

            <View style={{ margin: 10 }}>
              <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()} />
            </View>

            {list.length == 0 && (
              <View style={{ flex: 1, margin: 20 }}>
                <Text style={{ textAlign: 'center' }}>No peripherals</Text>
              </View>
            )}
          </View> */}
        </ScrollView>

        {renderList()}
        {/* <FlatList
          data={list.filter(x => x.name !== 'NO NAME')}
          renderItem={({ item }) => renderItem(item)}
          keyExtractor={item => item.id}
        /> */}
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2924fb',
    padding: 5,
  },
  textStyle: {
    color: 'white',
    fontSize: 20,
  },
  logTextStyle: {
    color: 'white',
    fontSize: 9,
  },
  buttonStyle: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    backgroundColor: '#15127e',
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
  disabledButtonStyle: {
    backgroundColor: '#15142d',
    color: '#919191',
  },
  row: {},
})

export default FromBleManager
