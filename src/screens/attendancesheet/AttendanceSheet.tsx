
//   import React, { useState, useEffect } from 'react';
//   import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TouchableHighlight, Image, ImageBackground, StyleProp, Alert } from 'react-native';
//   import { useAuth } from "context/AuthContext";
//   import Svg, { LinearGradient, Stop, Rect } from 'react-native-svg';
//   import LottieView from 'lottie-react-native';

//   import { color } from '@rneui/base';
//   import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
//   import { ScreenStackHeaderRightView } from 'react-native-screens';
//   import { set, setDate } from 'date-fns';
//   import data from '../../data/data';
//   import AsyncStorage from '@react-native-async-storage/async-storage';

//   interface PunchData {
//     in: string;
//     out: string;
//     in_image: string;
//     out_image: string;
//   }

//   interface ShiftAttendanceItem {
//     Year: string;
//     attendance: string;
//     date: number;
//     day: string;
//     holiday: number;
//     month: string;
//     punches: PunchData[];
//   }

//   interface AttendanceItem {
//     Year: string;
//     attandance: string;
//     date: number;
//     day: string;
//     holiday: number;
//     in: string;
//     in_image: string;
//     month: string;
//     out: string;
//     out_image: string;
//   }

//   const AttendanceSheet: React.FC = () => {
//     const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [shiftdata, setshiftdata] = useState<ShiftAttendanceItem[]>([]);
//     const [showShiftView, setShowShiftView] = useState<boolean>(false);
//     const { userInfo } = useAuth();
//     const parseData = JSON.parse(userInfo ? userInfo : {});
//     const fullname = parseData.data?.data?.name;
//     const user_ids = parseData["data"].user_id;
//     const userid = parseData?.data?.data?.user_id;
//     const designation = parseData.data?.data?.designation;
    
//     const currentDate = new Date();
//     const previousMonth = currentDate.getMonth();
//     const month = previousMonth + 1;
//     const [selectedMonth, setSelectedMonth] = useState<string>(`${month}`);
//     const [selectedYear, setSelectedYear] = useState<string>(`${currentDate.getFullYear()}`);
//     const [totalPresent, setTotalPresent] = useState<number>(0);
//     const [totalAbsent, setTotalAbsent] = useState<number>(0);
//     const [totalhalfday, settotalhalday] = useState<number>(0);
    
//     const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
//     const [isYearModalVisible, setIsYearModalVisible] = useState(false);

//     const months = [
//       { label: <Text style={{color:"black"}}>January</Text>, value: '1' },
//       { label:<Text style={{color:"black"}} >February</Text> , value: '2' },
//       { label:  <Text style={{color:"black"}}>March</Text>, value: '3' },
//       { label: <Text style={{color:"black"}}>April</Text> , value: '4' },
//       { label: <Text style={{color:"black"}}>May</Text>, value: '5' },
//       { label:  <Text style={{color:"black"}}>June</Text>, value: '6' },
//       { label: <Text style={{color:"black"}}>July</Text> , value: '7' },
//       { label: <Text style={{color:"black"}}>August</Text>, value: '8' },
//       { label: <Text style={{color:"black"}}>September</Text>, value: '9' },
//       { label: <Text style={{color:"black"}}>October</Text>, value: '10' },
//       { label: <Text style={{color:"black"}}>November</Text>, value: '11' },
//       { label: <Text style={{color:"black"}}>December</Text>, value: '12' },
//     ];
    
//     const currentYear = new Date().getFullYear();
//     const startYear = 2020;
//     const years = [];

//     for (let year = startYear; year <= currentYear; year++) {
//       years.push({ label: <Text style={{ color: "black" }}>{year}</Text>, value: year.toString() });
//     }

//     const getCheckInOutData = async () => {
//       try {
//         const longitute = await AsyncStorage.getItem("longitute");
//         const latitute = await AsyncStorage.getItem("latitute");
//         console.log(longitute, latitute)
//       } catch(err) {
//         console.log(err)
//       }
//     }

//     useEffect(() => {
//       fetchAttendanceData();
//       getCheckInOutData()
//       console.log("r", userid)
//     }, [user_ids]);

//     const fetchAttendanceData = async () => {
//       fetchshitattendanceData()
//       setLoading(true);
//       try {
//         const response = await fetch('https://whiteforcepayroll.com/admin/api/getMonthAttendance', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             user_id: `${user_ids ? user_ids : userid}`,
//             month: selectedMonth,
//             year: selectedYear,
//           }),
//         });
        
//         const json = await response.json();
        
//         if (json.status) {
//           setAttendanceData(json.data);
          
//           let present = 0;
//           let absent = 0;
//           let halfday = 0;
          
//           json.data.forEach((item: AttendanceItem) => {
//             if (item.attandance === 'P') {
//               present++;
//             } else if (item.attandance === 'H' && item.holiday === 0) {
//               halfday++;
//             } else if(item.attandance === 'A' && item.holiday === 0) {
//               absent++;
//             }
//           });

//           setTotalPresent(present);
//           setTotalAbsent(absent);
//           settotalhalday(halfday)
//         } else {
//           setAttendanceData([]);
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setAttendanceData([]); 
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchshitattendanceData = async() => {
//       try {
//         const res = await fetch("https://whiteforcepayroll.com/admin/api/getMonthAttendance-new", {
//           method: "POST",
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             user_id: `${user_ids ? user_ids : userid}`,
//             month: selectedMonth,
//             year: selectedYear,
//           }),
//         })
        
//         const data = await res.json();
//         setshiftdata(data.data || []);
//         console.log("shift", data)
//       } catch(err) {
//         console.log(err)
//       }
//     }

//     // Render item for shift view with multiple punches
//     const renderShiftItem = ({ item }: { item: ShiftAttendanceItem }) => {
//       const formattedDate = `${item.date}`;
//       let attendanceStatus = '';
      
//       if (item.attendance === 'P') {
//         attendanceStatus = 'P';
//       } else if (item.attendance === 'H' && item.holiday === 0) {
//         attendanceStatus = 'H';
//       } else if (item.attendance === 'A' && item.holiday === 0) {
//         attendanceStatus = 'A';
//       } else {
//         attendanceStatus = '__';
//       }

//       return (
//         <View style={styles.shiftRow}>
//           <View style={styles.shiftDateCell}>
//             <Text style={styles.shiftDateText}>{item.day}, {formattedDate}</Text>
//             <Text style={styles.shiftAttendanceText}>{attendanceStatus}</Text>
//           </View>
          
//           <View style={styles.punchesContainer}>
//   {item.punches && item.punches.length > 0 ? (
//     [...item.punches].reverse().map((punch, index) => (
//       <View key={index} style={styles.punchRow}>
//         <View style={styles.punchItem}>
//           <Text style={styles.punchLabel}> #{index + 1}.    In: </Text>
//           <Text style={styles.punchTime}>{punch.in || "__"}</Text>
//         </View>
//         <View style={styles.punchItem}>
//           <Text style={styles.punchLabel}>Out: </Text>
//           <Text style={styles.punchTime}>{punch.out || "__"}</Text>
//         </View>
//       </View>
//     ))
//   ) : (
//     <Text style={styles.noPunchText}>No punches recorded</Text>
//   )}
// </View>

//         </View>
//       );
//     };

//     // Original render item for simple view
//     const renderItem = ({ item }: { item: AttendanceItem }) => {
//       const formattedDate = `${item.date}`;
//       let attendanceStatus = '';
      
//       if (item.attandance === 'P') {
//         attendanceStatus = 'P';
//       } else if (item.attandance === 'H' && item.holiday === 0) {
//         attendanceStatus = 'H';
//       } else if (item.attandance === 'A' && item.holiday === 0) {
//         attendanceStatus = 'A';
//       } else {
//         attendanceStatus = '__';
//       }
      
//       return (
//         <View style={styles.row}>
//           <Text style={styles.cell}>{item.day},{formattedDate}</Text>
//           <View style={styles.cell1}>
//             <Text style={{color:"black"}}>{attendanceStatus}</Text>
//           </View>
//           <Text style={styles.cell1}>{item.in ? item.in : "__"}</Text> 
//           <View style={{ marginTop:0, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center" }}>
//             <Text style={{display:item.in ? "flex" : "none", color:"black", alignItems:"center"}}>{item.out ? item.out : "__"}</Text>
//           </View>
//         </View>
//       );
//     };

//     return (
//       <View style={styles.container}>
//         <Svg height="100%" width="100%" style={{ position: 'absolute', top: 0, left: 0, display:"flex", justifyContent:"center", alignItems:"center"}}>
//           <LinearGradient id="gradient1" x1="40%" y1="0%" x2="40%" y2="70%">
//             <Stop offset="0%" stopColor="#0C322D" stopOpacity="1" />
//             <Stop offset="50%" stopColor="#17533F" stopOpacity="0.9" />
//           </LinearGradient>
//           <Rect x="0" y="0" width="100%" height="100%" fill="url(#gradient1)" />
//           <View style={{width:ScreenWidth*1, height:"100%", backgroundColor:"transparent", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
//             <View style={{width:ScreenWidth*0.4, height:"100%", marginTop:ScreenHeight*0.15, alignItems:"center"}} >
//               <View style={{alignItems:"center", flexDirection:"column", gap:15}}>
//                 <View>
//                   <View style={{ width:ScreenWidth*1, justifyContent:"center", display:"flex", flexDirection:"row"}}>
//                     <Text style={{color:"white", fontSize:22, textTransform:"capitalize", fontWeight:"600"}}>
//                       {fullname ? fullname : parseData["data"].name}
//                     </Text>
//                   </View>
//                   <View style={{flexDirection:"row", margin:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
//                     <Image resizeMode="contain" style={{width:15, height:15}} source={require("../../assets/../assets/images/camera/verified.png")} />
//                     <Text style={{color:"white", fontSize:15, textTransform:"capitalize", fontWeight:"600"}}>
//                       {parseData["data"].designation ? parseData["data"].designation : designation ? designation : "your Atendance"}
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </Svg>
        
//         <View style={{flex:1, marginTop: ScreenHeight * 0.14}}>
//           <View style={{display:"flex", width:ScreenWidth*1, flexDirection:"row", justifyContent:"center", gap:20}}>
//             <TouchableOpacity 
//               style={{ 
//                 width:ScreenWidth*0.27, 
//                 backgroundColor:"#B3C3BF", 
//                 height:ScreenHeight*0.034, 
//                 borderWidth:1, 
//                 borderColor:"rgb(20, 77, 68)", 
//                 alignItems:"center", 
//                 gap:15, 
//                 display:"flex", 
//                 flexDirection:"row", 
//                 marginTop:50, 
//                 borderRadius:ScreenWidth*1, 
//                 justifyContent:"center", 
//                 shadowColor: "#000", 
//                 shadowOffset: { width: 100, height: 200 }, 
//                 shadowOpacity: 0, 
//                 shadowRadius: 1.84, 
//                 elevation: 10 
//               }} 
//               onPress={() => setIsMonthModalVisible(true)}
//             >
//               <View>
//                 <Text style={{fontWeight:"700"}}>
//                   {months.find((month) => month.value === selectedMonth)?.label}
//                 </Text>
//               </View>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={{
//                 backgroundColor:"#B3C3BF", 
//                 height:ScreenHeight*0.034, 
//                 alignItems:"center", 
//                 borderWidth:1, 
//                 borderColor:"rgb(20, 77, 68)", 
//                 gap:15, 
//                 display:"flex", 
//                 flexDirection:"row", 
//                 marginTop:50, 
//                 width:ScreenWidth*0.27, 
//                 justifyContent:"center", 
//                 borderRadius:ScreenWidth*1
//               }} 
//               onPress={() => setIsYearModalVisible(true)}
//             >
//               <View>
//                 <Text style={{fontWeight:"700"}} onPress={() => setIsYearModalVisible(true)}>
//                   {years.find((month) => month.value === selectedYear)?.label}
//                 </Text>
//               </View>
//             </TouchableOpacity>
            
//             <TouchableOpacity onPress={fetchAttendanceData}>
//               <View style={{
//                 flexDirection:"row", 
//                 justifyContent:"center", 
//                 gap:10, 
//                 height:ScreenHeight*0.034, 
//                 backgroundColor:"#315947", 
//                 borderWidth:ScreenWidth*0.001, 
//                 borderColor:"white", 
//                 width:ScreenWidth*0.27, 
//                 display:"flex", 
//                 alignItems:"center", 
//                 marginTop:50, 
//                 borderRadius:ScreenWidth*1
//               }}>
//                 <Image style={{width:14, height:14}} source={require("../../assets/../assets/images/camera/share.png")} />
//                 <Text style={{color:"white", textTransform:"capitalize", fontSize:15}}>Submit</Text>
//               </View>
//             </TouchableOpacity>
//           </View>
          
//           <View style={{
//             backgroundColor: 'white',
//             flex: 1,
//             paddingTop: 20,
//             padding: ScreenWidth*0.02,
//             borderColor: 'rgb(29,91,65)',
//             borderTopRightRadius: 30,
//             borderTopLeftRadius: 30,
//             marginTop: ScreenHeight * 0.04,
//           }}>
//             <View style={{justifyContent:"center", alignItems:"center", marginBottom:5}}>
//               <Text style={{ fontSize:19, fontWeight:"700", color:"black" }}>
//                 <Text style={{color:'rgb(29,91,65)'}}>A</Text>ttendance Table
//               </Text>
//             </View>
            
//             {/* Toggle button for shift view - Compact */}
//             <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:5, marginBottom:3}}>
//               <TouchableOpacity 
//                 style={[
//                   styles.toggleButton, 
//                   !showShiftView && styles.toggleButtonActive
//                 ]}
//                 onPress={() => setShowShiftView(false)}
//               >
//                 <Text style={[
//                   styles.toggleButtonText, 
//                   !showShiftView && styles.toggleButtonTextActive
//                 ]}>
//                   Simple
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={[
//                   styles.toggleButton, 
//                   showShiftView && styles.toggleButtonActive
//                 ]}
//                 onPress={() => setShowShiftView(true)}
//               >
//                 <Text style={[
//                   styles.toggleButtonText, 
//                   showShiftView && styles.toggleButtonTextActive
//                 ]}>
//                   Shift
//                 </Text>
//               </TouchableOpacity>
//             </View>
            
//             {loading ? (
//               <View style={styles.centeredContainer}>
//                 <LottieView
//                   loop
//                   autoPlay
//                   source={require("../.././../assets/camera/loaers.json")}
//                   style={{width:ScreenWidth*0.3, height:ScreenHeight*0.2}}
//                 />
//               </View>
//             ) : (
//               <>
//                 {(showShiftView ? shiftdata.length : attendanceData.length) === 0 ? (
//                   <Image style={styles.attendancescreen} />
//                 ) : (
//                   <>
//                     <View style={styles.tableBackground}>
//                       {showShiftView ? (
//                         <>
//                           {/* Shift View Header */}
//                           <View style={styles.shiftHeader}>
//                             <Text style={styles.shiftHeaderText}>Date & Status</Text>
//                             <Text style={styles.shiftHeaderText}>Punch Records</Text>
//                           </View>
                          
//                           {/* Shift View Rows */}
//                           <FlatList
//                             data={shiftdata}
//                             keyExtractor={(item, index) => `${item.date}-${index}`}
//                             renderItem={renderShiftItem}
//                           />
//                         </>
//                       ) : (
//                         <>
//                           {/* Simple View Header */}
//                           <View style={styles.header}>
//                             <Text style={styles.headerCell1}>Date</Text>
//                             <Text style={styles.headerCellat}>Attendance</Text> 
//                             <Text style={styles.headerCell}>In</Text> 
//                             <Text style={styles.headerCell}>Out</Text> 
                            
//                           </View>
                          
//                           {/* Simple View Rows */}
//                           <FlatList
//                             data={attendanceData}
//                             keyExtractor={(item, index) => `${item.date}-${index}`}
//                             renderItem={renderItem}
//                           />
//                         </>
//                       )}
                      
//                       <View style={{
//                         display:"flex", 
//                         flexDirection:'row', 
//                         padding:10, 
//                         height:ScreenHeight*0.06, 
//                         alignItems:"center", 
//                         justifyContent:"space-between"
//                       }}> 
//                         <View style={{ display:"flex", flexDirection:"row", alignItems:"center"}}>
//                           <Text style={{color:"black", fontSize:15, fontWeight:"bold"}}>FullDay :</Text>
//                           <Text style={{color:"rgb(29,91,65)", fontWeight:"bold", fontSize:18}}>  {totalPresent}</Text>
//                         </View>
//                         <View style={{ display:"flex", flexDirection:"row", alignItems:"center"}}>
//                           <Text style={{color:"black", fontSize:15, fontWeight:"bold"}}>HalfDay :</Text>
//                           <Text style={{color:"rgb(29,91,65)", fontWeight:"bold", fontSize:18}}>  {totalhalfday}</Text>
//                         </View>
//                         <View style={{ display:"flex", flexDirection:"row", alignItems:"center"}}>
//                           <Text style={{color:"black", fontSize:15, fontWeight:"bold"}}>Total Absent :</Text>
//                           <Text style={{color:"red", fontWeight:"bold", fontSize:18}}>  {totalAbsent}</Text>
//                         </View>
//                       </View>
//                     </View>
//                   </>
//                 )}
//               </>
//             )}

//             {/* Month Selection Modal */}
//             <Modal
//               transparent={true}
//               visible={isMonthModalVisible}
//               onRequestClose={() => setIsMonthModalVisible(false)}
//             >
//               <View style={styles.modalContainer}>
//                 <View style={styles.modalContent}>
//                   <FlatList
//                     data={months}
//                     keyExtractor={(item) => item.value}
//                     renderItem={({ item }) => (
//                       <TouchableHighlight
//                         onPress={() => {
//                           setSelectedMonth(item.value);
//                           setIsMonthModalVisible(false);
//                         }}
//                         style={{
//                           padding: 10,
//                           borderBottomWidth: 1,
//                           borderBottomColor: '#ddd', 
//                           backgroundColor: month.toString() === item.value ? "#e6e6e6" : "white"
//                         }}
//                       >
//                         <Text>{item.label}</Text>
//                       </TouchableHighlight>
//                     )}
//                   />
//                 </View>
//               </View>
//             </Modal>

//             {/* Year Selection Modal */}
//             <Modal
//               transparent={true}
//               visible={isYearModalVisible}
//               onRequestClose={() => setIsYearModalVisible(false)}
//             >
//               <View style={styles.modalContainer}>
//                 <View style={styles.modalContent}>
//                   <FlatList
//                     data={years}
//                     keyExtractor={(item) => item.value}
//                     renderItem={({ item }) => (
//                       <TouchableHighlight
//                         onPress={() => {
//                           setSelectedYear(item.value);
//                           setIsYearModalVisible(false);
//                         }}
//                         style={styles.modalOption}
//                       >
//                         <Text>{item.label}</Text>
//                       </TouchableHighlight>
//                     )}
//                   />
//                 </View>
//               </View>
//             </Modal>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       width: ScreenWidth*1
//     },
//     attendancescreen: {
//       width: 400,
//       height: 400,
//       alignSelf: 'center',
//       marginTop: 120,
//     },
//     present: {
//       color: "rgb(37 99 235)"
//     },
//     absent: {
//       color: "#ff0000"
//     },
//     dropdownContainer: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginBottom: ScreenHeight*0.03,
//     },
//     dropdown: {
//       flex: 1,
//       marginHorizontal: 5,
//     },
//     centeredContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     selectedValue: {
//       padding: 10,
//       backgroundColor: '#eaeaea',
//       color: "black",
//       borderRadius: 5,
//     },
//     tableBackground: {
//       flex: 1,
//       borderRadius: 10,
//       overflow: 'hidden',
//     },
//     redText: {
//       color: "black"
//     },
//     black: {
//       color: "black"
//     },
//     blueText: {
//       color: "black"
//     },
//     backgroundImage: {
//       opacity: 0.15,
//     },
//     submitButton: {
//       backgroundColor: '"rgb(29,91,65)"',
//       padding: 10,
//       borderRadius: 5,
//       alignItems: 'center',
//     },
//     submitButtonText: {
//       color: '#fff',
//       fontWeight: 'bold',
//       fontSize: 16,
//     },
//     loadingText: {
//       textAlign: 'center',
//       marginTop: 20,
//       fontSize: 16,
//     },
//     header: {
//       flexDirection: 'row',
//       borderRadius: 5,
//       justifyContent: "center",
//       paddingVertical: 10,
//       marginTop: ScreenHeight*0.01,
//       height: ScreenWidth*0.11,
//     },
//     headerCell: {
//       display: "flex",
//       flex: 1,
//       fontWeight: '500',
//       textAlign: 'center',
//       alignItems: "center",
//       justifyContent: "center",
//       color: "white",
//       height: ScreenHeight*0.038,
//       paddingVertical: 7,
//       fontSize: 14,
//       backgroundColor: "rgb(29,91,65)",
//       borderRightWidth: 1,
//       borderRightColor: "white",
//     },
//     headerCell1: {
//       display: "flex",
//       flex: 1.4,
//       fontWeight: '500',
//       textAlign: 'center',
//       alignItems: "center",
//       justifyContent: "center",
//       color: "white",
//       height: ScreenHeight*0.038,
//       paddingVertical: 7,
//       fontSize: 14,
//       backgroundColor: "rgb(29,91,65)",
//       borderRightWidth: 1,
//       borderRightColor: "white",
//     },
//     headerCellat: {
//       display: "flex",
//       flex: 1.2,
//       fontWeight: '500',
//       textAlign: 'center',
//       alignItems: "center",
//       justifyContent: "center",
//       color: "white",
//       height: ScreenHeight*0.038,
//       paddingVertical: 7,
//       fontSize: 14,
//       backgroundColor: "rgb(29,91,65)",
//       borderRightWidth: 1,
//       borderRightColor: "white",
//     },
//     row: {
//       flexDirection: 'row',
//       flex: 1,
//       padding: ScreenWidth*0.03,
//       borderBottomWidth: 1,
//       borderBottomColor: '#ccc',
//     },
//     mainrow: {
//       flexDirection: "column",
//       flex: 1,
//       padding: ScreenWidth*0.03,
//       borderBottomWidth: 1,
//       borderBottomColor: '#0c0c0cff',
//     },
//     cell: {
//       flex: 1.4,
//       flexDirection: "row",
//       textAlign: 'center',
//       color: "black",
//       fontSize: ScreenWidth*0.03,
//     },
//     cell1: {
//       flex: 1,
//       textAlign: 'center',
//       justifyContent: "center",
//       alignItems: "center",
//       color: "black",
//       fontSize: ScreenWidth*0.033,
//     },
//     cell2: {
//       flex: 1,
//       textAlign: 'center',
//       color: ""
//     },
//     cell3: {
//       flex: 1,
//       textAlign: 'center',
//       color: ""
//     },
//     cell4: {
//       flex: 1,
//       textAlign: 'center',
//       color: "blue"
//     },
//     modalContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     },
//     modalContent: {
//       backgroundColor: '#fff',
//       padding: 20,
//       borderRadius: 5,
//       width: '80%',
//     },
//     modalOption: {
//       padding: 10,
//       borderBottomWidth: 1,
//       borderBottomColor: '#ddd',
//     },
//     // New styles for shift view
//     toggleButton: {
//       paddingHorizontal: 15,
//       paddingVertical: 5,
//       marginHorizontal: 3,
//       borderRadius: 15,
//       backgroundColor: '#e0e0e0',
//     },
//     toggleButtonActive: {
//       backgroundColor: 'rgb(29,91,65)',
//     },
//     toggleButtonText: {
//       color: '#666',
//       fontWeight: '600',
//       fontSize: 12,
//     },
//     toggleButtonTextActive: {
//       color: 'white',
//     },
//     shiftHeader: {
//       flexDirection: 'row',
//       borderRadius: 5,
//       justifyContent: "center",
//       paddingVertical: 10,
//       marginTop: ScreenHeight*0.01,
//       height: ScreenWidth*0.11,
//     },
//     shiftHeaderText: {
//       display: "flex",
//       flex: 1,
//       fontWeight: '500',
//       textAlign: 'center',
//       alignItems: "center",
//       justifyContent: "center",
//       color: "white",
//       height: ScreenHeight*0.038,
//       paddingVertical: 7,
//       fontSize: 14,
//       backgroundColor: "rgb(29,91,65)",
//       borderRightWidth: 1,
//       borderRightColor: "white",
//     },
//     shiftHeaderTextLast: {
//       display: "flex",
//       flex: 1,
//       fontWeight: '500',
//       textAlign: 'center',
//       alignItems: "center",
//       justifyContent: "center",
//       color: "white",
//       height: ScreenHeight*0.038,
//       paddingVertical: 7,
//       fontSize: 14,
//       backgroundColor: "rgb(29,91,65)",
//     },
//     shiftRow: {
//       borderBottomWidth: 1,
//       borderBottomColor: '#ccc',
//       paddingVertical: 12,
//       paddingHorizontal: 10,
//     },
//     shiftDateCell: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: 8,
//       paddingBottom: 8,
//       borderBottomWidth: 1,
//       borderBottomColor: '#e0e0e0',
//     },
//     shiftDateText: {
//       color: 'black',
//       fontSize: 14,
//       fontWeight: '600',
//     },
//     shiftAttendanceText: {
//       color: 'white',
//       fontSize: 14,
//       fontWeight: 'bold',
//       backgroundColor: 'rgb(29,91,65)',
//       paddingHorizontal: 12,
//       paddingVertical: 4,
//       borderRadius: 12,
//       textAlign: 'center',
//     },
//     punchesContainer: {
//       paddingLeft: 10,
//     },
//     punchRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginVertical: 4,
//       backgroundColor: '#f5f5f5',
//       padding: 8,
//       borderRadius: 8,
//     },
//     punchItem: {
//       flex: 1,
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     punchLabel: {
//       color: '#666',
//       fontSize: 12,
//       marginRight: 5,
//     },
//     punchTime: {
//       color: 'black',
//       fontSize: 13,
//       fontWeight: '600',
//       textAlign: 'center',
//     },
//     noPunchText: {
//       color: '#999',
//       fontSize: 13,
//       fontStyle: 'italic',
//       textAlign: 'center',
//       paddingVertical: 8,
//     },
//   });

//   export default AttendanceSheet;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TouchableHighlight, Image, ImageBackground, StyleProp, Alert, ScrollView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from "context/AuthContext";
import Svg, { LinearGradient, Stop, Rect } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserWiseTrackingWebView from './Mapview/Userlocation';
import Icon from 'react-native-dynamic-vector-icons';
interface PunchData {
  in: string;
  out: string;
  in_image: string;
  out_image: string;
}

interface ShiftAttendanceItem {
  Year: string;
  attendance: string;
  date: number;
  day: string;
  holiday: number;
  month: string;
  punches: PunchData[];
}

interface AttendanceItem {
  Year: string;
  attandance: string;
  date: number;
  day: string;
  holiday: number;
  in: string;
  in_image: string;
  month: string;
  out: string;
  out_image: string;
}

const AttendanceSheet: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  // Dynamic route params passed from Clientlist or other screens
  const routeUserId = route.params?.userId ?? route.params?.user_id ?? route.params?.isActive;
  const routeName = route.params?.name;
  const routeImage = route.params?.image;
  const routeDesignation = route.params?.designation;

  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [shiftdata, setshiftdata] = useState<ShiftAttendanceItem[]>([]);
  const [showShiftView, setShowShiftView] = useState<boolean>(false);
  
  // Map modal state
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const { userInfo } = useAuth();
  let parseData: any = {};
  try {
    parseData = typeof userInfo === "string" ? JSON.parse(userInfo || "{}") : (userInfo || {});
  } catch (err) {
    parseData = {};
  }
  const fullname = parseData.data?.data?.name || parseData?.data?.name;
  const user_ids = parseData?.["data"]?.user_id;
  const userid = parseData?.data?.data?.user_id;
  const designation = parseData?.data?.data?.designation || parseData?.["data"]?.designation;

  // Prefer dynamic route params; fall back to context values
  const effectiveUserId = routeUserId ? `${routeUserId}` : `${user_ids ? user_ids : (userid || "")}`;
  const effectiveDisplayName = routeName || fullname || parseData?.["data"]?.name || "Your Attendance";
  const effectiveDesignation = routeDesignation || designation || "Attendance";
  const effectiveImage = routeImage || parseData?.data?.data?.image || parseData?.["data"]?.image;
  
  const currentDate = new Date();
  const previousMonth = currentDate.getMonth();
  const month = previousMonth + 1;
  const [selectedMonth, setSelectedMonth] = useState<string>(`${month}`);
  const [selectedYear, setSelectedYear] = useState<string>(`${currentDate.getFullYear()}`);
  const [totalPresent, setTotalPresent] = useState<number>(0);
  const [totalAbsent, setTotalAbsent] = useState<number>(0);
  const [totalhalfday, settotalhalday] = useState<number>(0);
  
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);

  const months = [
    { label: <Text style={{color:"black"}}>January</Text>, value: '1' },
    { label:<Text style={{color:"black"}} >February</Text> , value: '2' },
    { label:  <Text style={{color:"black"}}>March</Text>, value: '3' },
    { label: <Text style={{color:"black"}}>April</Text> , value: '4' },
    { label: <Text style={{color:"black"}}>May</Text>, value: '5' },
    { label:  <Text style={{color:"black"}}>June</Text>, value: '6' },
    { label: <Text style={{color:"black"}}>July</Text> , value: '7' },
    { label: <Text style={{color:"black"}}>August</Text>, value: '8' },
    { label: <Text style={{color:"black"}}>September</Text>, value: '9' },
    { label: <Text style={{color:"black"}}>October</Text>, value: '10' },
    { label: <Text style={{color:"black"}}>November</Text>, value: '11' },
    { label: <Text style={{color:"black"}}>December</Text>, value: '12' },
  ];
  
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const years = [];

  for (let year = startYear; year <= currentYear; year++) {
    years.push({ label: <Text style={{ color: "black" }}>{year}</Text>, value: year.toString() });
  }

  const getCheckInOutData = async () => {
    try {
      const longitute = await AsyncStorage.getItem("longitute");
      const latitute = await AsyncStorage.getItem("latitute");
      console.log(longitute, latitute)
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchAttendanceData();
    getCheckInOutData()
    console.log("attendance user id:", effectiveUserId)
  }, [effectiveUserId]);

  const fetchAttendanceData = async () => {
    fetchshitattendanceData()
    setLoading(true);
    try {
      const response = await fetch('https://whiteforcepayroll.com/admin/api/getMonthAttendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: `${effectiveUserId}`,
          month: selectedMonth,
          year: selectedYear,
        }),
      });
      
      const json = await response.json();
      console.log("attendance", json)
      if (json.status) {
        setAttendanceData(json.data);
        
        let present = 0;
        let absent = 0;
        let halfday = 0;
        
        json.data.forEach((item: AttendanceItem) => {
          if (item.attandance === 'P') {
            present++;
          } else if (item.attandance === 'H' && item.holiday === 0) {
            halfday++;
          } else if(item.attandance === 'A' && item.holiday === 0) {
            absent++;
          }
        });

        setTotalPresent(present);
        setTotalAbsent(absent);
        settotalhalday(halfday)
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAttendanceData([]); 
    } finally {
      setLoading(false);
    }
  };

  const fetchshitattendanceData = async() => {
    try {
      const res = await fetch("https://whiteforcepayroll.com/admin/api/getMonthAttendance-new", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: `${effectiveUserId}`,
          month: selectedMonth,
          year: selectedYear,
        }),
      })
      
      const data = await res.json();
      setshiftdata(data.data || []);
      // console.log("shift", data)
       if (data?.data?.length > 0) {
      data.data.forEach((item) => {
        if (item?.punches?.length > 0) {
          item.punches.forEach((punch) => {
            console.log("Out Image:", punch.out_image);
          });
        }
      });
    }
    } catch(err) {
      console.log(err)
    }
  }

  // Function to handle map view
  const handleViewMap = (date: number, month: string, year: string) => {
    // Format date as YYYY-MM-DD
    const formattedDate = `${year}-${month.padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setIsMapModalVisible(true);
  };

  // Render item for shift view with multiple punches
  const renderShiftItem = ({ item }: { item: ShiftAttendanceItem }) => {
    const formattedDate = `${item.date}`;
    let attendanceStatus = '';
    
    if (item.attendance === 'P') {
      attendanceStatus = 'P';
    } else if (item.attendance === 'H' && item.holiday === 0) {
      attendanceStatus = 'H';
    } else if (item.attendance === 'A' && item.holiday === 0) {
      attendanceStatus = 'A';
    } else {
      attendanceStatus = '__';
    }

    // Check if there's any checkout time
    const hasCheckout = item.punches && item.punches.some(punch => punch.out && punch.out !== "__");

    return (
      <View style={styles.shiftRow}>
        <View style={styles.shiftDateCell}>
          <Text style={styles.shiftDateText}>{item.day}, {formattedDate}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Text style={styles.shiftAttendanceText}>{attendanceStatus}</Text>
            {hasCheckout && (
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => handleViewMap(item.date, item.month, item.Year)}
              >
                <Image 
                  style={{width: 16, height: 16, tintColor: 'white'}} 
                  source={require("../../assets/../assets/images/camera/share.png")} 
                />
                <Text style={styles.mapButtonText}>Map</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.punchesContainer}>
          {item.punches && item.punches.length > 0 ? (
            console.log(item.punches.in_image, "punches"),
            [...item.punches].reverse().map((punch, index) => (
              <View key={index} style={styles.punchRow}>
                <View style={styles.punchItem}>
                  <Text style={styles.punchLabel}> #{index + 1}.    In: </Text>
                  <Text style={styles.punchTime}>{punch.in || "__"}</Text>
                </View>
                <View style={styles.punchItem}>
                  <Text style={styles.punchLabel}>Out: </Text>
                  <Text style={styles.punchTime}>{punch.out || "__"}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noPunchText}>No punches recorded</Text>
          )}
        </View>
      </View>
    );
  };

  // Original render item for simple view
  const renderItem = ({ item }: { item: AttendanceItem }) => {
    const formattedDate = `${item.date}`;
    let attendanceStatus = '';
    
    if (item.attandance === 'P') {
      attendanceStatus = 'P';
    } else if (item.attandance === 'H' && item.holiday === 0) {
      attendanceStatus = 'H';
    } else if (item.attandance === 'A' && item.holiday === 0) {
      attendanceStatus = 'A';
    } else {
      attendanceStatus = '__';
    }

    // Check if there's checkout time
    const hasCheckout = item.out && item.out !== "__";
    
    return (
      <View style={styles.row}>
        <View style={styles.cellDate}>
          <Text style={styles.cellDateText}>{item.day},{formattedDate}</Text>
        </View>
        <View style={styles.cellCenter}>
          <Text style={{color:"black"}}>{attendanceStatus}</Text>
        </View>
        <View style={styles.cellCenter}>
          <Text style={{color:"black"}}>{item.in ? item.in : "__"}</Text>
        </View>
        <View style={styles.cellCenter}>
          <Text style={{color:"black"}}>{item.out ? item.out : "__"}</Text>
        </View>
        <View style={styles.cellMap}>
          {hasCheckout ? (
            <TouchableOpacity 
              style={styles.mapButtonSmall}
              onPress={() => handleViewMap(item.date, item.month, item.Year)}
            >
              <Icon name="map-marker-alt" type="FontAwesome5" size={16} color="white" />
            </TouchableOpacity>
          ) : (
            <Text style={{color: '#ccc'}}>--</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ---------------- Back Arrow Button ---------------- */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 25,
          left: 16,
          zIndex: 999,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name="arrow-back"
          type="Ionicons"
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <Svg height="100%" width="100%" style={{ position: 'absolute', top: 0, left: 0, display:"flex", justifyContent:"center", alignItems:"center"}}>
        <LinearGradient id="gradient1" x1="40%" y1="0%" x2="40%" y2="70%">
          <Stop offset="0%" stopColor="#0C322D" stopOpacity="1" />
          <Stop offset="50%" stopColor="#17533F" stopOpacity="0.9" />
        </LinearGradient>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#gradient1)" />
        <View style={{width:ScreenWidth*1, height:"100%", backgroundColor:"transparent", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
          <View style={{width:ScreenWidth*0.4, height:"100%", marginTop:ScreenHeight*0.15, alignItems:"center"}} >
            <View style={{alignItems:"center", flexDirection:"column", gap:15}}>
              <View>
                <View style={{ width:ScreenWidth*1, justifyContent:"center", display:"flex", flexDirection:"row"}}>
                  <Text style={{color:"white", fontSize:22, textTransform:"capitalize", fontWeight:"600"}}>
                    {effectiveDisplayName}
                  </Text>
                </View>
                <View style={{flexDirection:"row", margin:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                  <Image resizeMode="contain" style={{width:15, height:15}} source={require("../../assets/../assets/images/camera/verified.png")} />
                  <Text style={{color:"white", fontSize:15, textTransform:"capitalize", fontWeight:"600"}}>
                    {effectiveDesignation}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Svg>
      
      <View style={{flex:1, marginTop: ScreenHeight * 0.14}}>
        <View style={{display:"flex", width:ScreenWidth*1, flexDirection:"row", justifyContent:"center", gap:20}}>
          <TouchableOpacity 
            style={{ 
              width:ScreenWidth*0.27, 
              backgroundColor:"#B3C3BF", 
              height:ScreenHeight*0.034, 
              borderWidth:1, 
              borderColor:"rgb(20, 77, 68)", 
              alignItems:"center", 
              gap:15, 
              display:"flex", 
              flexDirection:"row", 
              marginTop:50, 
              borderRadius:ScreenWidth*1, 
              justifyContent:"center", 
              shadowColor: "#000", 
              shadowOffset: { width: 100, height: 200 }, 
              shadowOpacity: 0, 
              shadowRadius: 1.84, 
              elevation: 10 
            }} 
            onPress={() => setIsMonthModalVisible(true)}
          >
            <View>
              <Text style={{fontWeight:"700"}}>
                {months.find((month) => month.value === selectedMonth)?.label}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              backgroundColor:"#B3C3BF", 
              height:ScreenHeight*0.034, 
              alignItems:"center", 
              borderWidth:1, 
              borderColor:"rgb(20, 77, 68)", 
              gap:15, 
              display:"flex", 
              flexDirection:"row", 
              marginTop:50, 
              width:ScreenWidth*0.27, 
              justifyContent:"center", 
              borderRadius:ScreenWidth*1
            }} 
            onPress={() => setIsYearModalVisible(true)}
          >
            <View>
              <Text style={{fontWeight:"700"}} onPress={() => setIsYearModalVisible(true)}>
                {years.find((month) => month.value === selectedYear)?.label}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={fetchAttendanceData}>
            <View style={{
              flexDirection:"row", 
              justifyContent:"center", 
              gap:10, 
              height:ScreenHeight*0.034, 
              backgroundColor:"#315947", 
              borderWidth:ScreenWidth*0.001, 
              borderColor:"white", 
              width:ScreenWidth*0.27, 
              display:"flex", 
              alignItems:"center", 
              marginTop:50, 
              borderRadius:ScreenWidth*1
            }}>
              <Image style={{width:14, height:14}} source={require("../../assets/../assets/images/camera/share.png")} />
              <Text style={{color:"white", textTransform:"capitalize", fontSize:15}}>Submit</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={{
          backgroundColor: 'white',
          flex: 1,
          paddingTop: 20,
          padding: ScreenWidth*0.02,
          borderColor: 'rgb(29,91,65)',
          borderTopRightRadius: 30,
          borderTopLeftRadius: 30,
          marginTop: ScreenHeight * 0.04,
        }}>
          <View style={{justifyContent:"center", alignItems:"center", marginBottom:5}}>
            <Text style={{ fontSize:19, fontWeight:"700", color:"black" }}>
              <Text style={{color:'rgb(29,91,65)'}}>A</Text>ttendance Table
            </Text>
          </View>
          
          {/* Toggle button for shift view - Compact */}
          <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:5, marginBottom:3}}>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                !showShiftView && styles.toggleButtonActive
              ]}
              onPress={() => setShowShiftView(false)}
            >
              <Text style={[
                styles.toggleButtonText, 
                !showShiftView && styles.toggleButtonTextActive
              ]}>
                Simple
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                showShiftView && styles.toggleButtonActive
              ]}
              onPress={() => setShowShiftView(true)}
            >
              <Text style={[
                styles.toggleButtonText, 
                showShiftView && styles.toggleButtonTextActive
              ]}>
                Shift
              </Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.centeredContainer}>
              <LottieView
                loop
                autoPlay
                source={require("../.././../assets/camera/loaers.json")}
                style={{width:ScreenWidth*0.3, height:ScreenHeight*0.2}}
              />
            </View>
          ) : (
            <>
              {(showShiftView ? shiftdata.length : attendanceData.length) === 0 ? (
                <Image style={styles.attendancescreen} />
              ) : (
                <>
                  <View style={styles.tableBackground}>
                    {showShiftView ? (
                      <>
                        {/* Shift View Header */}
                        <View style={styles.shiftHeader}>
                          <Text style={styles.shiftHeaderText}>Date & Status</Text>
                          <Text style={styles.shiftHeaderText}>Punch Records</Text>
                        </View>
                        
                        {/* Shift View Rows */}
                        <FlatList
                          data={shiftdata}
                          keyExtractor={(item, index) => `${item.date}-${index}`}
                          renderItem={renderShiftItem}
                        />
                      </>
                    ) : (
                      <>
                        {/* Simple View - Horizontal Scrollable Table */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                          <View style={{minWidth: ScreenWidth * 1.2}}>
                            {/* Simple View Header */}
                            <View style={styles.header}>
                              <View style={styles.headerCellDate}>
                                <Text style={styles.headerCellText}>Date</Text>
                              </View>
                              <View style={styles.headerCellStandard}>
                                <Text style={styles.headerCellText}>Attendance</Text>
                              </View>
                              <View style={styles.headerCellStandard}>
                                <Text style={styles.headerCellText}>In</Text>
                              </View>
                              <View style={styles.headerCellStandard}>
                                <Text style={styles.headerCellText}>Out</Text>
                              </View>
                              <View style={styles.headerCellMap}>
                                <Text style={styles.headerCellText}>Map</Text>
                              </View>
                            </View>
                            
                            {/* Simple View Rows */}
                            <FlatList
                              data={attendanceData}
                              keyExtractor={(item, index) => `${item.date}-${index}`}
                              renderItem={renderItem}
                            />
                          </View>
                        </ScrollView>
                      </>
                    )}
                    
                    {/* <View style={{
                      display:"flex", 
                      flexDirection:'row', 
                      padding:10, 
                      height:ScreenHeight*0.06, 
                      alignItems:"center", 
                      justifyContent:"space-between"
                    }}> 
                      <View style={{ display:"flex", flexDirection:"row", alignItems:"center"}}>
                        <Text style={{color:"black", fontSize:15, fontWeight:"bold"}}>FullDay :</Text>
                        <Text style={{color:"rgb(29,91,65)", fontWeight:"bold", fontSize:18}}>  {totalPresent}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", alignItems:"center"}}>
                        <Text style={{color:"black", fontSize:15, fontWeight:"bold"}}>HalfDay :</Text>
                        <Text style={{color:"rgb(29,91,65)", fontWeight:"bold", fontSize:18}}>  {totalhalfday}</Text>
                      </View>
                      <View style={{ display:"flex", flexDirection:"row", alignItems:"center"}}>
                        <Text style={{color:"black", fontSize:15, fontWeight:"bold"}}>Total Absent :</Text>
                        <Text style={{color:"red", fontWeight:"bold", fontSize:18}}>  {totalAbsent}</Text>
                      </View>
                    </View> */}
                  </View>
                </>
              )}
            </>
          )}

          {/* Month Selection Modal */}
          <Modal
            transparent={true}
            visible={isMonthModalVisible}
            onRequestClose={() => setIsMonthModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={months}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableHighlight
                      onPress={() => {
                        setSelectedMonth(item.value);
                        setIsMonthModalVisible(false);
                      }}
                      style={{
                        padding: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#ddd', 
                        backgroundColor: month.toString() === item.value ? "#e6e6e6" : "white"
                      }}
                    >
                      <Text>{item.label}</Text>
                    </TouchableHighlight>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Year Selection Modal */}
          <Modal
            transparent={true}
            visible={isYearModalVisible}
            onRequestClose={() => setIsYearModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={years}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableHighlight
                      onPress={() => {
                        setSelectedYear(item.value);
                        setIsYearModalVisible(false);
                      }}
                      style={styles.modalOption}
                    >
                      <Text>{item.label}</Text>
                    </TouchableHighlight>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Map Modal */}
          <Modal
            visible={isMapModalVisible}
            animationType="slide"
            onRequestClose={() => setIsMapModalVisible(false)}
          >
            <View style={styles.mapModalContainer}>
              <View style={styles.mapModalHeader}>
                <Text style={styles.mapModalTitle}>Location Tracking - {selectedDate}</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsMapModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <UserWiseTrackingWebView 
                userId={effectiveUserId} 
                date={selectedDate} 
              />
            </View>
          </Modal>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: ScreenWidth*1
  },
  attendancescreen: {
    width: 400,
    height: 400,
    alignSelf: 'center',
    marginTop: 120,
  },
  present: {
    color: "rgb(37 99 235)"
  },
  absent: {
    color: "#ff0000"
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ScreenHeight*0.03,
  },
  dropdown: {
    flex: 1,
    marginHorizontal: 5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedValue: {
    padding: 10,
    backgroundColor: '#eaeaea',
    color: "black",
    borderRadius: 5,
  },
  tableBackground: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  redText: {
    color: "black"
  },
  black: {
    color: "black"
  },
  blueText: {
    color: "black"
  },
  backgroundImage: {
    opacity: 0.15,
  },
  submitButton: {
    backgroundColor: '"rgb(29,91,65)"',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: "center",
    marginTop: ScreenHeight*0.01,
  },
  headerCellText: {
    fontWeight: '600',
    textAlign: 'center',
    color: "white",
    fontSize: 14,
  },
  headerCellDate: {
    width: 140,
    backgroundColor: "rgb(29,91,65)",
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCellStandard: {
    width: 100,
    backgroundColor: "rgb(29,91,65)",
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCellMap: {
    width: 80,
    backgroundColor: "rgb(29,91,65)",
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    display: "flex",
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    height: ScreenHeight*0.038,
    paddingVertical: 7,
    fontSize: 14,
    backgroundColor: "rgb(29,91,65)",
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCell1: {
    display: "flex",
    flex: 1.4,
    fontWeight: '500',
    textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    height: ScreenHeight*0.038,
    paddingVertical: 7,
    fontSize: 14,
    backgroundColor: "rgb(29,91,65)",
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  headerCellat: {
    display: "flex",
    flex: 1.2,
    fontWeight: '500',
    textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    height: ScreenHeight*0.038,
    paddingVertical: 7,
    fontSize: 14,
    backgroundColor: "rgb(29,91,65)",
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  cellDate: {
    width: 140,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  cellDateText: {
    color: "black",
    fontSize: 13,
  },
  cellCenter: {
    width: 100,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellMap: {
    width: 80,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainrow: {
    flexDirection: "column",
    flex: 1,
    padding: ScreenWidth*0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#0c0c0cff',
  },
  cell: {
    flex: 1.4,
    flexDirection: "row",
    textAlign: 'center',
    color: "black",
    fontSize: ScreenWidth*0.03,
  },
  cell1: {
    flex: 1,
    textAlign: 'center',
    justifyContent: "center",
    alignItems: "center",
    color: "black",
    fontSize: ScreenWidth*0.033,
  },
  cell2: {
    flex: 1,
    textAlign: 'center',
    color: ""
  },
  cell3: {
    flex: 1,
    textAlign: 'center',
    color: ""
  },
  cell4: {
    flex: 1,
    textAlign: 'center',
    color: "blue"
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    width: '80%',
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  // New styles for shift view
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginHorizontal: 3,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
  },
  toggleButtonActive: {
    backgroundColor: 'rgb(29,91,65)',
  },
  toggleButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  shiftHeader: {
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: ScreenHeight*0.01,
    height: ScreenWidth*0.11,
  },
  shiftHeaderText: {
    display: "flex",
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    height: ScreenHeight*0.038,
    paddingVertical: 7,
    fontSize: 14,
    backgroundColor: "rgb(29,91,65)",
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  shiftHeaderTextLast: {
    display: "flex",
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    height: ScreenHeight*0.038,
    paddingVertical: 7,
    fontSize: 14,
    backgroundColor: "rgb(29,91,65)",
  },
  shiftRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  shiftDateCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  shiftDateText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  shiftAttendanceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgb(29,91,65)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
  },
  punchesContainer: {
    paddingLeft: 10,
  },
  punchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  punchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  punchLabel: {
    color: '#666',
    fontSize: 12,
    marginRight: 5,
  },
  punchTime: {
    color: 'black',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  noPunchText: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  // Map button styles
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(29,91,65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mapButtonSmall: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(29,91,65)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 5,
  },
  // Map modal styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgb(29,91,65)',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  mapModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AttendanceSheet;