// import React, { useEffect, useState } from 'react'
// import {
//   Platform,
//   View,
//   Text,
//   StatusBar,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   TouchableHighlight,
// } from 'react-native'
// import { BleManager, BleError, Device, State, LogLevel, Service, Characteristic } from 'react-native-ble-plx'
// import { StyleSheet } from 'react-native'
// import { Colors } from 'react-native/Libraries/NewAppScreen'

// const manager = new BleManager()

// const ConnectionState = {
//   SCANNING: 'SCANNING',
//   DISCONNECTED: 'DISCONNECTED',
//   CONNECTING: 'CONNECTING',
//   DISCOVERING: 'DISCOVERING',
//   CONNECTED: 'CONNECTED',
//   DISCONNECTING: 'DISCONNECTING',
//   COMMUNICATING: 'COMMUNICATING',
// }

// const Button = function (props: { [x: string]: any; onPress: any; title: any }) {
//   const { onPress, title, ...restProps } = props
//   return (
//     <TouchableOpacity onPress={onPress} {...restProps}>
//       <Text style={[styles.buttonStyle, restProps.disabled ? styles.disabledButtonStyle : null]}>{title}</Text>
//     </TouchableOpacity>
//   )
// }

// const PlxBleManager = () => {
//   const [info, setInfo] = useState('')
//   const [logs, setLogs] = useState<BleError[]>([])

//   const [values, setValues] = useState({})

//   const [scannedDevices, setScannedDevices] = useState<Device[]>([])
//   const [targetDevice, setTargetDevice] = useState<Device>()
//   const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED)
//   const [currentTest, setCurrentTest] = useState('')
//   const [showModal, setShowModal] = useState(false)
//   const [connectedDevice, setConnectedDevice] = useState<Device>()
//   const [availableServices, setAvailableServices] = useState<Service[]>([])
//   const [characteristics, setCharacteristics] = useState<Characteristic[]>([])

//   useEffect(() => {
//     // if (Platform.OS === 'ios') {
//     //   manager.onStateChange((state: State) => {
//     //     if (state === State.PoweredOn) {
//     //       handleScanning()
//     //     }
//     //   })
//     // } else {
//     //   handleScanning()
//     // }
//   }, [])

//   const handleScanning = () => {
//     const startScan = () => {
//       manager.startDeviceScan(null, { allowDuplicates: false, },
//         async (error, device) => {
//           setConnectionState(ConnectionState.SCANNING)
//           if (error) {
//             manager.stopDeviceScan();
//           }

//           console.log('-----> ', device?.localName, device?.name);
//           if (device?.localName !== null || device?.name !== null) {
//             setScannedDevices([...scannedDevices, device as Device]);
//             manager.stopDeviceScan();
//           } 
//         },)
//     }
//   }

//   const handleScanning2 = () => {
//     // if (Platform.OS === 'ios') {
//     // manager.onStateChange((state: State) => {
//     // if (state === State.PoweredOn) {
//     manager.startDeviceScan(null, { allowDuplicates: false }, (e, device) => {
//       setConnectionState(ConnectionState.SCANNING)
//       console.log('-------> ', device?.name)

//       if (e) {
//         setLogs([...logs, e])
//         return
//       }

//       // if (device && scannedDevices.filter(x => x.id === device.id).length === 0) {
//       setScannedDevices([...scannedDevices, device as Device])
//       // console.log('Listed Devices: ', scannedDevices, device.name)
//       // }
//       // if (device?.name === 'Hyungkyu Lee’s AirPods') {
//       //   setInfo('Connecting to Hyungkyu’s Airpods')
//       //   manager.stopDeviceScan()
//       //   device
//       //     .connect()
//       //     .then(peripheral => {
//       //       setInfo('Discovering services and characteristics')
//       //       const result = peripheral.discoverAllServicesAndCharacteristics()
//       //       console.log(result)
//       //       setValues(result)
//       //     })
//       //     .then(peripheral => {
//       //       setInfo('Setting notifications')
//       //       // return setupNotifications(peripheral)
//       //     })
//       //     .then(() => {
//       //       setInfo('Listening...')
//       //     })
//       //     .catch((e: BleError): void => setLogs([...logs, e]))
//       // }
//     })

//     setConnectionState(ConnectionState.DISCOVERING)
//     // }
//     // })
//     // }
//   }

//   const handleStopScanning = () => {
//     manager.stopDeviceScan()
//     setConnectionState(ConnectionState.DISCOVERING)
//   }

//   const getConnectionStatus = (): string => {
//     switch (connectionState) {
//       case ConnectionState.SCANNING:
//         return 'SCANNING...'
//       case ConnectionState.CONNECTING:
//         return 'Connecting...'
//       case ConnectionState.DISCOVERING:
//         return 'Discovering...'
//       case ConnectionState.CONNECTED:
//         return 'Connected'
//       case ConnectionState.COMMUNICATING:
//         return 'Ready for reading or writing'
//       case ConnectionState.DISCONNECTED:
//       case ConnectionState.DISCONNECTING:
//         if (targetDevice) {
//           return 'Found ' + targetDevice.id
//         }
//     }

//     return 'Searching...'
//   }

//   const isDeviceReadyToConnect = (): boolean => {
//     return targetDevice != null && connectionState === ConnectionState.DISCONNECTED
//   }

//   const isDeviceReadyToDisconnect = (): boolean => {
//     return connectionState === ConnectionState.CONNECTED
//   }

//   const isDeviceReadyToExecuteTests = (): boolean => {
//     return scannedDevices.length > 0
//   }

//   const handleConnection = async (selectedDevice: Device) => {
//     setConnectionState(ConnectionState.CONNECTING)
//     const theDevice = await selectedDevice.connect()
//     if (theDevice) {
//       setConnectedDevice(theDevice)
//       setConnectionState(ConnectionState.DISCOVERING)
//     }

//     // const response = await connectedDevice.discoverAllServicesAndCharacteristics(connectedDevice.id)
//     // const services = await response.services()
//     const services = await manager.servicesForDevice(theDevice.id)
//     if (services.length === 0) {
//       console.log('There is no available services or characteristic on the device: ', theDevice)
//       setConnectionState(ConnectionState.DISCONNECTING)
//       const subscription = manager.onDeviceDisconnected(theDevice.id, (e: BleError | null, d: Device | null) =>
//         console.log('xxxxxxxxxxxxxxxx : ', e, d),
//       )
//       subscription.remove()
//       setConnectionState(ConnectionState.DISCONNECTED)
//       return
//     }

//     setShowModal(true)
//     setAvailableServices(services)
//     setConnectionState(ConnectionState.CONNECTED)
//   }

//   const handleSelectService = async (selectedService: Service) => {
//     if (connectedDevice) {
//       setCharacteristics(await manager.characteristicsForDevice(connectedDevice.id, selectedService.uuid))
//       setConnectionState(ConnectionState.COMMUNICATING)
//     }
//   }

//   const Buffer = require('buffer').Buffer
//   const handleWriteCharacteristic = async (serviceId, characteristicId, value) => {
//     const theDevice = await targetDevice?.connect()
//     await theDevice?.discoverAllServicesAndCharacteristics()

//     const valueBase64 = new Buffer(value).toString('base64')
//     await theDevice?.writeCharacteristicWithResponseForService(serviceUuid, characteristicUuid, valueBase64)
//   }

//   const handleReadCharacteristic = async (selectedDevice, serviceId, characteristicId, transactionId) => {
//     await targetCharacteristic.readCharacteristicForService(serviceId, characteristicId, transactionId)
//   }

//   const renderHeader = () => {
//     return (
//       <View style={{ padding: 10, marginTop: 10, alignContent: 'center' }}>
//         <Text style={styles.textStyle} numberOfLines={1}>
//           Device: {getConnectionStatus()}
//         </Text>
//         <View style={{ padding: 0, paddingTop: 0 }}>
//           <Button style={{ paddingTop: 0 }} onPress={() => handleScanning()} title={'Scan'} />
//         </View>
//         <View style={{ padding: 0, paddingTop: 0 }}>
//           <Button style={{ paddingTop: 10 }} onPress={() => handleStopScanning()} title={'Stop'} />
//         </View>
//         <View style={{ flexDirection: 'row', paddingTop: 10 }}>
//           <Button
//             disabled={!isDeviceReadyToConnect()}
//             style={{ flex: 1 }}
//             onPress={() => {
//               if (targetDevice != null) {
//                 handleConnection(targetDevice)
//               }
//             }}
//             title={'Connect'}
//           />
//           <View style={{ width: 5 }} />
//           <Button
//             disabled={!isDeviceReadyToDisconnect()}
//             style={{ flex: 1 }}
//             onPress={() => {
//               targetDevice?.onDisconnected((e, d) => console.log(e, d)).remove()
//               setConnectionState(ConnectionState.DISCONNECTED)
//             }}
//             title={'Disconnect'}
//           />
//         </View>
//         <View style={{ flexDirection: 'row', paddingTop: 5 }}>
//           <Button
//             disabled={!isDeviceReadyToExecuteTests()}
//             style={{ flex: 1 }}
//             onPress={() => {
//               setShowModal(true)
//             }}
//             title={'Execute test'}
//           />
//           <View style={{ width: 5 }} />
//           <Button
//             style={{ flex: 1 }}
//             disabled={targetDevice == null}
//             onPress={() => {
//               targetDevice?.readCharacteristicForService(availableServices[0], characteristics[0])
//             }}
//             title={'Forget'}
//           />
//         </View>
//       </View>
//     )
//   }

//   const renderList = () => {
//     return (
//       <View style={{ height: '100%', padding: 10, paddingTop: 0 }}>
//         <Text style={[styles.textStyle, { paddingBottom: 10, alignSelf: 'center' }]}>Select a device to execute</Text>
//         <FlatList
//           data={scannedDevices}
//           renderItem={({ item }) => renderItem(item)}
//           keyExtractor={(item, index) => index.toString()}
//         />
//         <Button
//           style={{ paddingTop: 10 }}
//           onPress={() => {
//             setScannedDevices([])
//           }}
//           title={'Clear'}
//         />
//       </View>
//     )
//   }

//   const renderItem = (item: any) => {
//     const color = item.connected ? 'green' : '#fff'
//     return (
//       <TouchableHighlight onPress={() => handleConnection(item)} disabled={!isDeviceReadyToExecuteTests()}>
//         <View style={[styles.row, { backgroundColor: color }]}>
//           <Text
//             style={{
//               fontSize: 12,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 5,
//             }}>
//             {item.name}
//           </Text>
//           <Text
//             style={{
//               fontSize: 10,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 2,
//             }}>
//             RSSI: {item.rssi}
//           </Text>
//           <Text
//             style={{
//               fontSize: 8,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 2,
//               paddingBottom: 5,
//             }}>
//             {item.id}
//           </Text>
//         </View>
//       </TouchableHighlight>
//     )
//   }

//   const renderLogs = () => {
//     return (
//       <View style={{ flex: 1, padding: 10, paddingTop: 0 }}>
//         <Text style={{ textAlign: 'center' }}>====== Log history =====</Text>
//         <FlatList
//           style={{ flex: 1 }}
//           data={logs}
//           renderItem={({ item }) => <Text style={styles.logTextStyle}> {item} </Text>}
//           keyExtractor={(item, index) => index.toString()}
//         />
//         <Button
//           style={{ paddingTop: 10 }}
//           onPress={() => {
//             setLogs([])
//           }}
//           title={'Clear logs'}
//         />
//       </View>
//     )
//   }

//   const renderModal = () => {
//     // $FlowFixMe: SensorTagTests are keeping SensorTagTestMetadata as values.
//     // const tests: Array<SensorTagTestMetadata> = Object.values(SensorTagTests)

//     return (
//       <Modal animationType="fade" transparent={true} visible={showModal} onRequestClose={() => {}}>
//         <View
//           style={{
//             backgroundColor: '#00000060',
//             flex: 1,
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}>
//           <View
//             style={{
//               backgroundColor: '#2a24fb',
//               borderRadius: 10,
//               height: '50%',
//               padding: 5,
//               shadowColor: 'black',
//               shadowRadius: 20,
//               shadowOpacity: 0.9,
//               elevation: 20,
//             }}>
//             {scannedDevices.length > 0 && (
//               <>
//                 <Text style={[styles.textStyle, { paddingBottom: 10, alignSelf: 'center' }]}>Devices</Text>
//                 <FlatList
//                   data={scannedDevices}
//                   renderItem={({ item }) => renderItem(item)}
//                   keyExtractor={(item, index) => index.toString()}
//                 />
//               </>
//             }
//             {getConnectionStatus() === ConnectionState.COMMUNICATING ? (
//               <>
//                 <Text style={[styles.textStyle, { paddingBottom: 10, alignSelf: 'center' }]}>Services</Text>
//                 <FlatList
//                   data={availableServices}
//                   renderItem={({ item }) => renderServiceItem(item)}
//                   keyExtractor={(item, index) => index.toString()}
//                 />
//               </>
//             ) : (
//               <>
//                 <Text style={[styles.textStyle, { paddingBottom: 10, alignSelf: 'center' }]}>Characteristics</Text>
//                 <FlatList
//                   data={characteristics}
//                   renderItem={({ item }) => renderCharacteristicItem(item)}
//                   keyExtractor={(item, index) => index.toString()}
//                 />
//               </>
//             )}
//             <Button
//               style={{ paddingTop: 5 }}
//               onPress={() => {
//                 setShowModal(false)
//               }}
//               title={'Cancel'}
//             />
//           </View>
//         </View>
//       </Modal>
//     )
//   }

//   const renderCharacteristicItem = (item: Characteristic) => {
//     const color = item.isReadable ? 'green' : '#fff'
//     return (
//       <TouchableHighlight onPress={() => console.log('clicked')}>
//         <View style={[styles.row, { backgroundColor: color }]}>
//           <Text
//             style={{
//               fontSize: 12,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 10,
//             }}>
//             ID: {item.id}
//           </Text>
//           <Text
//             style={{
//               fontSize: 10,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 2,
//             }}>
//             Writable: {item.isWritableWithResponse || item.isWritableWithoutResponse}
//           </Text>
//           <Text
//             style={{
//               fontSize: 8,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 2,
//               paddingBottom: 20,
//             }}>
//             {item.value}
//           </Text>
//         </View>
//       </TouchableHighlight>
//     )
//   }

//   const renderServiceItem = (item: Service) => {
//     const color = item.uuid ? 'green' : '#fff'
//     return (
//       <TouchableHighlight onPress={() => handleSelectService(item)}>
//         <View style={[styles.row, { backgroundColor: color }]}>
//           <Text
//             style={{
//               fontSize: 12,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 10,
//             }}>
//             Service Id: {item.id}
//           </Text>
//           <Text
//             style={{
//               fontSize: 10,
//               textAlign: 'center',
//               color: '#333333',
//               padding: 2,
//             }}>
//             UUID: {item.uuid}
//           </Text>
//         </View>
//       </TouchableHighlight>
//     )
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#15127e" />
//       {renderHeader()}
//       {logs.length > 0 && renderLogs()}
//       {renderList()}
//       {renderModal()}
//     </SafeAreaView>
//   )
// }

// export default PlxBleManager

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#2924fb',
//     padding: 5,
//   },
//   textStyle: {
//     color: 'white',
//     fontSize: 20,
//   },
//   logTextStyle: {
//     color: 'white',
//     fontSize: 9,
//   },
//   buttonStyle: {
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: 5,
//     backgroundColor: '#15127e',
//     color: 'white',
//     textAlign: 'center',
//     fontSize: 20,
//   },
//   disabledButtonStyle: {
//     backgroundColor: '#15142d',
//     color: '#919191',
//   },
//   row: {},
// })
