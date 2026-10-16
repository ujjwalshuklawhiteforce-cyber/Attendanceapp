// import React, { useEffect, useMemo, useRef, useState, } from "react";
// import { Alert, BackHandler, Vibration, Image, Animated, View, Modal, Pressable, TouchableOpacity, Dimensions, PanResponder, } from 'react-native';
// import LottieView from "lottie-react-native";
// import RNFS from 'react-native-fs';

// // import { Tooltip } from "react-native-paper";
// import { Tooltip } from "@rneui/base";
// import moment from "moment"
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// // import Icon, { IconType } from "react-native-dynamic-vector-icons";
// import { SafeAreaView } from "react-native-safe-area-context";
// import createStyles from "./HomeScreen.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
// import { useTheme } from "@react-navigation/native";
// import Text from "@shared-components/text-wrapper/TextWrapper";
// import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
// // import { StyleSheet } from "react-native";
// import ReactNativeBiometrics from "react-native-biometrics";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Progress from "react-native-progress";
// import Orientation from 'react-native-orientation-locker';
// import {
//   requestCameraPermission,
//   requestLocationPermission,
// } from "@services/event-emitter/permission";
// import GetLocation from 'react-native-get-location';
// import { RefreshControl, ScrollView } from "react-native-gesture-handler";
// import { useAuth } from "context/AuthContext";
// import * as NavigationService from "react-navigation-helpers";
// import { SCREENS } from "@shared-constants";
// import AwesomeCamera from "@shared-components/camera/CameraCapture";
// import { useLoader } from "context/LoaderContext";
// import axios from "axios";
// import { getDistance } from 'geolib';
// import { NativeModules } from 'react-native';
// const { FaceNetModule } = NativeModules;

// import NetInfo from "@react-native-community/netinfo";
// import FaceCaptureModal from "Facematching/CameraOverlay";
// import cosineSimilarity from "FaceEmbading/Cosinesimilarity";
// import getImageEmbedding from "FaceEmbading/GetimageEmbading";
// import { set } from "date-fns";
// import FaceCaptureModalforfacnet from "@screens/payementslip/AutoCapture";
// dayjs.extend(customParseFormat);

// // const profileURI =
// //   // eslint-disable-next-line max-len
// //   "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80";

// const HomeScreen: React.FC = ({ navigation }) => {
//   const { userInfo } = useAuth();
//   const { setIsLoading } = useLoader()
//   const theme = useTheme();
//   const { colors } = theme;
//   const styles = useMemo(() => createStyles(theme), [theme]);
//   const [modalVisible, setModalVisible] = useState(false );

// const[facematchmodal, setfacematchmodal] = useState <any>(false)
//   const [modalVisible1, setModalVisible1] = useState(false);
//   const [visibleTooltip, setVisibleTooltip] = useState(null);
//   const [checkedout, setcheckedout] = useState(false)
//   const [imagesource, setimagesource] = useState()
//   const [username, setusername] = useState()
//   const[lastCheckin, setLastCheckin] = useState<any>(null);
//   const [isDisabled, setIsDisabled] = useState(false); // Disable button
//   const [locationName, setLocationName] = useState<any>(null);
//   const [weekDays, setWeekDays] = useState<any>([]);
//   const [addressLoading, setIsAddressLoading] = useState<any>();
//   const [isnointernet, setisnointernet] = useState<any>(false)
//   const [checkintime, setcheckintime] = useState<any>()
//   const [checkouttime, setcheckouttime] = useState<any>()
//   const [punching, setpunching] = useState<any>()
//   const flatListRef = useRef<any>(null);
//   const [isCheckedIn, setIsCheckedIn] = useState(false);
//   const [loader, setloader] = useState(false);
//   const [attendancedata, setattendancedata] = useState(true)
//   const [distance, setdistance] = useState("");
//   const [progress, setProgress] = useState(0);
//   const [locationdata, setloctiondata] = useState(false)
//   const [nointernet , setnointernet] = useState(false);
//   const [currentTime, setCurrentTime] = useState("");
//   const [date, setdate] = useState<string>("")
//   const parseData = JSON.parse(userInfo || "{}");
//   const [refreshing, setRefreshing] = useState(false);
//   const [mapmodalVisible, setmapModalVisible] = useState(false);
// // .....
//   const [loading, setLoading] = useState(false);
//   const [matchResult, setMatchResult] = useState(null);
//   const [referenceImages, setReferenceImages] = useState([]);
// const [referenceEmbeddings, setReferenceEmbeddings] = useState([]);
// const [testImage, setTestImage] = useState(null);

//   const [isCaptureOpen, setIsCaptureOpen] = useState(false);
//   const [captureForReference, setCaptureForReference] = useState(true);

//   const userid = parseData?.data?.data?.user_id
//   const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
//   const data = JSON.parse(userInfo ? userInfo : {});
//   const uname = data?.data?.data?.name;
//   const imagese = data.data?.data?.image;
//   const allowedLocation = {
//   latitude:23.155716,
//     longitude:79.925001
//   };
//   const fullName = username || parseData["data"]?.name || '';
//   const [firstName, ...rest] = fullName.trim().split(' ');
//   const allowedRadius = 200;
// const fetchLastCheckin = async () => {
//     const state = await NetInfo.fetch();
//     if (!state.isConnected) {
//     setnointernet(true)
//     setisnointernet(true)
//       return;
//     }
//       try {
//         const response = await fetch("https://whiteforcepayroll.com/admin/api/getLastCheckin", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             user_id: user_id, 
//           }),
//         });

//         const result = await response.json();
//         console.log("last checkin api", result)
//         const inDate = result.data.in.split(" ")[0];
//         setLastCheckin(inDate);
// result.data.out=== null? setIsCheckedIn(true):setIsCheckedIn(false)
//         console.log("checkin date", inDate)
//         console.log("user id last ", result)
//       } catch (error) {
//         console.error("Error fetching last checkin:", error);
//       }
//     };
//   useEffect(() => {
//     const getStoredLocations = async () => {
//       try {
//         const stored = await AsyncStorage.getItem("employee_locations");
//         if (stored) {
//           const parsed = JSON.parse(stored);
//           console.log("📦 Retrieved locations:", parsed);
//          console.log("fvfd",parsed);
//         } else {
//           console.log("⚠️ No locations found in storage");
//         }
//       } catch (err) {
//         console.log("❌ Error retrieving locations:", err.message);
//       }
//     };

//     getStoredLocations();
//       const fetchShiftData = async () => {
//       try {
//         const response = await fetch(
//           "https://whiteforcepayroll.com/admin/api/employee-location-shift-data",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ user_id: user_id }),
//           }
//         );

//         const json = await response.json();
//         console.log("📍 Locations:", json?.data?.locations);
//       } catch (err) {
//         console.log("❌ Error:", err.message);
//       }
//     };

//     fetchShiftData();
//      fetchLastCheckin()
//   }, []);


//   const handleBiometricAuth = async () => {
//     const rnBiometrics = new ReactNativeBiometrics();

//     try {
//       const { available, biometryType } = await rnBiometrics.isSensorAvailable();

//       if (available) {
//         console.log(`Biometric type: ${biometryType}`);

//         const resultObject = await rnBiometrics.simplePrompt({
//           promptMessage: 'Authenticate with fingerprint',
//         });

//         if (resultObject.success) {
//           handleSetIsOpen(true);
//         } else {
//           // Alert.alert('Authentication failed', 'Please try again.');
//         }
//       } else {
//         // If biometric not available, proceed anyway
//         handleSetIsOpen(true);
//       }
//     } catch (error) {
//     }
//   };
//   const handleTooltipPress = (key) => {
//     setVisibleTooltip((prev) => (prev === key ? null : key));
//   };
//   const updateTime = () => {
//     const now = new Date();
//     let hours = now.getHours();
//     const minutes = now.getMinutes();
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
//     const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
//     setCurrentTime(formattedTime); // Set current time
//     const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//     const date = now.getDate();
//     const monthName = monthNames[now.getMonth()];
//     const year = now.getFullYear();
//     const datedetails = `${date} ${monthName} ${year}`;
//     setdate(datedetails); // Set current date
//   };
//   const screenWidth = Dimensions.get("window").width;
//   const submitCheckInOut = async (path) => {
//     const apiUrl = "https://whiteforcepayroll.com/admin/api/checkInOut";
//     const checkInData = await AsyncStorage.getItem("checkInData");
//     let ConvertedDate = "";
//     if (checkInData) {
//       try {
//         const parsed = JSON.parse(checkInData);
//         if (parsed?.date) {
//           ConvertedDate = dayjs(parsed.date, "D, MMMM YYYY").format("YYYY-MM-DD");
//         }
//       } catch (e) {
//         console.warn("Invalid checkInData:", e);
//       }
//     }
//     const date = new Date();
//     const months = [
//       "January", "February", "March", "April", "May", "June", "July",
//       "August", "September", "October", "November", "December",
//     ];
//     const month = months[date.getMonth()];
//     const day = date.getDate();
//     const year = date.getFullYear();
//     const time = date.toLocaleTimeString();

//     const pad = (n) => n.toString().padStart(2, '0');

//     const formatted =
//       `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
//       `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;



//     const monthNew = date.getMonth() + 1

//     const params = {
//       user_id: user_id,
//       // date:"1/01/2024",
//       attendace_time: formatted,
//       // date: dateToSend || `${year}-${monthNew}-${day}`,
//       date:isCheckedIn?`${lastCheckin}`: `${year}-${monthNew}-${day}`,
//       image: `${path}`,
//       geolocation: `${locationName}`,
//       type: isCheckedIn ? "0" : "1",
//       location_tracking: [
//         { time: `${time}`, location: `${locationName}` },


//         { time: `${time}`, location: `${locationName}` },
//       ],
//     };


//     try {
//       const response = await axios.post(apiUrl, params, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 99);
//           setProgress(percentCompleted);
//         },
//       });
//       console.log("Response Body:", response.data);
//       setloader(false)

//       if (params.type === "1") {
//         // Check-in logic
//         setloader(false)
//         setModalVisible(true)
//         setIsCheckedIn(true);
//         setcheckintime(time);
// navigation.replace(SCREENS.HOME);

//         await AsyncStorage.setItem("checkInData", JSON.stringify({
//           date: `${day}, ${month} ${year}`,
//           time,
//           type: "Check-In",
//         }));
//         await AsyncStorage.setItem("checkinStatus", JSON.stringify(true));

//       } else if (params.type === "0") {
//         setloader(false)
//         setModalVisible1(true)
//         // Check-out logic
      
//         setIsCheckedIn(false);
//         setcheckouttime(time)
//         navigation.replace(SCREENS.HOME);
//         const checkInData = await AsyncStorage.getItem("checkInData");
//         await AsyncStorage.setItem("checkOutData", JSON.stringify({
//           date: `${day}, ${month} ${year}`,
//           time,
//           type: "Check-Out",
//           timestamp: checkInData,
//         }));
//         await AsyncStorage.setItem("checkinStatus", JSON.stringify(false));
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       Alert.alert("Error", error.message);
//       setloader(false)

//     }
//     finally {
//       setProgress(100);

//     }
//   };
//   useEffect(() => {
//     const testCheckInStorage = async () => {
// console.log("checkintdata", isCheckedIn)
//       const checkInDataRaw = await AsyncStorage.getItem("checkInData");
//       const checkInData = checkInDataRaw ? JSON.parse(checkInDataRaw) : null;
//       console.log("checkintime", checkInData);
//     };

//     testCheckInStorage();
//   }, []);
//   const getCheckInOutData = async () => {
//     try {
//       const checkInData = await AsyncStorage.getItem("checkInData");
//       const checkOutData = await AsyncStorage.getItem("checkOutData");

//       if (checkInData) {
//         console.log("Retrieved Check-In Data:", JSON.parse(checkInData));
//       }
//       if (checkOutData) {
//         console.log("Retrieved Check-Out Data:", JSON.parse(checkOutData));
//         const checkoutdata = JSON.parse(checkOutData);
//         // setcheckouttime(checkoutdata.time);
//       }
//     } catch (error) {
//       console.error("Failed to fetch check-in/check-out data:", error);
//     }
//   };
//   const [isOpen, setIsOpen] = useState(false);

//   const handleSetIsOpen = (open: boolean) => {
//     setIsOpen(open);
//   };  
// const fetchFaceDetails = async (date: string) => {
//   try {
//     const user = user_id;
//     const payload = { user_id: user, date };
//     console.log("userId:", user);

//     let faceDetailsResponse;

//     try {
//       faceDetailsResponse = await axios.post(
//         "https://whiteforcepayroll.com/admin/api/getDateAttendance-new",
//         payload
//       );
//       console.log("payload:", payload);

//       setattendancedata(false);

//       const punches = faceDetailsResponse.data.data.punches;

//       if (punches && punches.length > 0) {
//         const { in: checkInTime, out: checkOutTime } = punches[0];

//         console.log("checkInTime:", checkInTime, "checkOutTime:", checkOutTime);

//         setcheckintime(checkInTime);
//         setcheckouttime(checkOutTime);

//         // 🔹 Parser with trim + multiple formats
//         const parseTime = (time: string) => {
//           if (!time) return moment.invalid();
//           const cleanTime = time.trim();
//           const formats = ["h:mm A", "hh:mm A", "HH:mm:ss"];
//           for (let fmt of formats) {
//             const parsed = moment(cleanTime, fmt, true);
//             if (parsed.isValid()) return parsed;
//           }
//           return moment.invalid();
//         };

//         if (checkInTime && checkOutTime) {
//           const start = parseTime(checkInTime);
//           const end = parseTime(checkOutTime);

//           if (start.isValid() && end.isValid()) {
//             const diff = moment.duration(end.diff(start));
//             const hours = Math.floor(diff.asHours());
//             const minutes = diff.minutes();
//             const formattedTime = `${hours}h ${minutes}m`;

//             console.log("✅ Total time:", formattedTime);
//             setpunching(formattedTime);
//           } else {
//             console.warn("❌ Invalid time format:", checkInTime, checkOutTime);
//           }
//         } else if (checkInTime) {
//           console.log("User has only checked in.");
//           setIsCheckedIn(true);
//         } else {
//           console.log("No punches found.");
//           setIsCheckedIn(false);
//         }
//       } else {
//         console.log("No punches found for this date.");
//         setIsCheckedIn(false);
//       }
//     } catch (apiError) {
//       console.warn("API request failed:", apiError);
//     }
//   } catch (err) {
//     console.error("Unexpected error fetching face details:", err);
//   }
// };

//   const getAddressFromCoordinates = async (latitude, longitude) => {
//     console.log("latitude", latitude)
//     try {
//       const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
//       const data = await response.json();

//       if (data && data.address) {
//         // console.log("all data",data)
//         return data.address;
//       } else {
//         throw new Error('No address found');
//       }
//     } catch (error) {
//       console.error('Error fetching address:', error);
//       return null;
//     }
//   };
//   const fetchStatus = async () => {
//     try {
//       const status = await AsyncStorage.getItem(' ');
//       if (status !== null) {
//         setIsCheckedIn(JSON.parse(status)); // Convert string back to boolean
//       }
//     } catch (error) {
//       console.error('Failed to load status from AsyncStorage:', error);
//     }
//   };
//   useEffect(() => {

//     setIsLoading(false)
//     const currentDate = new Date;
//     const year = currentDate.getFullYear();
//     const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
//     const day = String(currentDate.getDate()).padStart(2, '0');
//     const date = `${year}-${month}-${day}`;
//     console.log("dateeeeeeee", date)
//     fetchFaceDetails(date)
//     setimagesource(imagese);
//     setusername(uname);
//     getCheckInOutData()



//     fetchStatus()

//     // Update time every second
//     updateTime();
//     const intervalId = setInterval(updateTime, 1000); // Update every second


//     // Log information

//     // console.log("User ID:", JSON.stringify(imagedetails));
//     // console.log("All stored data:", parseData);

//     console.log("This is my current location:", locationName);

//     setIsAddressLoading(true);
//     Orientation.lockToPortrait(); // Change to lockToLandscape() for landscape mode

//     // Back button handler
//     const backAction = () => {
//       return false; // Prevent default back action
//     };

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );



//     requestLocationPermission().then(async (res) => {
//       if (res) {
//         const options = {
//           enableHighAccuracy: true,
//           timeout: 60000,
//           maximumAge: 1000,
//         };

//         try {
//           const position = await GetLocation.getCurrentPosition(options);
//           const { latitude, longitude } = position;

//           await AsyncStorage.setItem("latitude", JSON.stringify(latitude));
//           await AsyncStorage.setItem("longitude", JSON.stringify(longitude));

//           const address = await getAddressFromCoordinates(latitude, longitude);
//           console.log("longXXXXX", longitude, "latXXXXXXXXXXXX", latitude)
//           if (address) {
//             const county = address.county || '';
//             const city = address.city || '';
//             setLocationName(`${county}, ${city}`);
//             console.log("Address info:", county, city);
//           }
//         const response = await fetch(
//           "https://whiteforcepayroll.com/admin/api/employee-location-shift-data",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ user_id: user_id }),
//           }
//         );

//         const json = await response.json();
//         const locations = json?.data?.locations || [];

//         // Save in AsyncStorage
//         await AsyncStorage.setItem("employee_locations", JSON.stringify(locations));
//         console.log("✅ Saved locations:", locations);

//         // Pick the first location (or handle multiple if needed)
//         if (locations.length > 0) {
//           const allowedLocation = {
//             latitude: parseFloat(locations[0].latitude),
//             longitude: parseFloat(locations[0].longitude),
//           };
//           const allowedRadius = parseInt(locations[0].radius, 10) || 100; // default 100m

//           // ✅ Distance calculation
//           const distance = getDistance({ latitude, longitude }, allowedLocation);
//           if (distance <= allowedRadius) {
//             console.log("✅ You are within the check-in zone.");
//           } else {
//             const readableDistance = formatDistance(distance);
//             console.log( "distance",distance)
//             setloctiondata(true);
//             setdistance(`${readableDistance}`);
//             console.warn("❌ Outside check-in zone.");
//             setmapModalVisible(true)
//           }
//         } else {
//           console.warn("❌ No allowed locations found for this user.");
//         }

//           setIsAddressLoading(false);
//         } catch (error) {
//           console.error("Location Error:", error.message, error);
//           setIsAddressLoading(false);
//         }
//       }
//     });
//     getCheckInOutData()
//     // Other actions
//     getWeekDays();
//     scrollToActiveItem();

//     // Cleanup on unmount
//     return () => {
     
//       clearInterval(intervalId); // Clear the interval
//       backHandler.remove(); // Remove back button listener
//     };
//   }, []);
//   const formatDistance = (meters) => {
//     return meters >= 1000
//       ? `${Math.floor(meters / 1000)} km`
//       : `${Math.floor(meters)} m`;
//   };

//   const handlePermission = async () => {
//     if (
//       // (await requestCameraPermission()) &&
//       (await requestLocationPermission())
//       // (await requestCalendarPermission())
//     ) {
//       // cam(true);
//     } else {
//       // setIsCameraVisible(false);
//       setIsDisabled(true)
//     }
//   };
//   const onRefresh = () => {
//     setRefreshing(true);
//     // Simulate a network request (e.g., API call)
//     setTimeout(() => {
//       fetchStatus()
//       handlePermission()
//       setIsLoading(false)
//        fetchLastCheckin()
//       // setIsAddressLoading(true);

//       requestLocationPermission().then(async (res) => {
//         if (res) {
//           const options = {
//             enableHighAccuracy: true,
//             timeout: 60000,
//             maximumAge: 1000,
//           };

//           try {
//             const position = await GetLocation.getCurrentPosition(options);
//             const { latitude, longitude } = position;

//             await AsyncStorage.setItem("latitude", JSON.stringify(latitude));
//             await AsyncStorage.setItem("longitude", JSON.stringify(longitude));

//             const address = await getAddressFromCoordinates(latitude, longitude);
//             console.log("long", longitude, "lat", latitude)
//             if (address) {
//               const county = address.county || '';
//               const city = address.city || '';
//               setLocationName(`${county}, ${city}`);
//               console.log("Address info:", county, city);
//             }
//             const distance = getDistance(
//               { latitude, longitude },
//               allowedLocation
//             );

//             // Alert.alert(`distance allowed ${distance}meters`);

//             if (distance <= allowedRadius) {
//               // Alert.alert("✅ You are within the check-in zone.");
//               // Allow check-in/check-out
//             } else {
//               const readableDistance = formatDistance(distance);
//               setloctiondata(true)

//               console.warn("❌ Outside check-in zone.",);
//               setdistance(`${readableDistance}`)

//               // Alert.alert(`distance is ${distance} meter to punch in` );
//               // Disable or block check-in
//             }
//             setIsAddressLoading(false);
//           } catch (error) {
//             console.error("Location Error:", error.message, error);
//             setIsAddressLoading(false);
//           }
//         }
//       });
     
//       setRefreshing(false);
//     }, 2000);
//   };

//   const getWeekDays = () => {
//     const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const today = new Date();

//     // Get the first day (Sunday) of the current week
//     const firstDayOfWeek = new Date(today);
//     firstDayOfWeek.setDate(today.getDate() - today.getDay());

//     const weekdays = [];

//     for (let i = 0; i < 7; i++) {
//       const currentDay = new Date(firstDayOfWeek);
//       currentDay.setDate(firstDayOfWeek.getDate() + i);

//       const dayName = days[currentDay.getDay()];
//       const dayDate = currentDay.getDate(); // Get only the date
//       const isActive = currentDay.getDay() === today.getDay(); // Mark the current weekday as active

//       weekdays.push({
//         date: dayDate,
//         day: dayName,
//         isActive: isActive || false,
//       });
//     }
//     setWeekDays(weekdays);
//   };

//   const scrollToActiveItem = () => {
//     const activeIndex = weekDays.findIndex((item: any) => item.isActive);
//     if (activeIndex !== -1 && flatListRef.current) {
//       flatListRef.current.scrollToIndex({ index: activeIndex });
//     }
//   };
// useEffect(() => {
//   loadReferenceFaces();
// }, []);

// /** Auto-run matchFace when test image is captured */
// useEffect(() => {
//   if (testImage && referenceEmbeddings.length > 0) {
//     matchFace();
//   }
// }, [testImage]);


// /** Load previously saved reference faces from AsyncStorage */
// const loadReferenceFaces = async () => {
//   try {
//     let refs = [];
//     let embeds = [];

//     for (let i = 1; i <= 3; i++) {
//       const path = await AsyncStorage.getItem(`face_path_${i}`);
//       const emb = await AsyncStorage.getItem(`face_embedding_${i}`);

//       if (path && emb) {
//         refs.push({ uri: `file://${path}`, path });
//         embeds.push(JSON.parse(emb)); // 🔥 embedding array
//       }
//     }

//     setReferenceImages(refs);
//     setReferenceEmbeddings(embeds);
//   } catch (err) {
//     console.log("Error loading reference faces:", err);
//   }
// };

// /** Convert file uri to Base64 */
// const uriToBase64 = async (uri) => {
//   const path = uri.replace("file://", "");
//   return await RNFS.readFile(path, "base64");
// };


// /** Open camera modal */
// const openAutoCapture = (isReference: boolean) => {
//   setCaptureForReference(isReference);
//   setIsCaptureOpen(true);
// };

// /** Handle captured image from camera */
// const onAutoCapture = async (image) => {
//   setIsCaptureOpen(false);
//   if (!image?.uri) return;

//   try {
//     setLoading(true);

//     const imgObj = {
//       uri: image.uri,
//       path: image.uri.replace("file://", ""),
//     };

//     const base64 = await uriToBase64(image.uri);

//     if (captureForReference) {
//       // 🔥 ENROLL → GET EMBEDDING
//       const result = await FaceNetModule.captureAndGetEmbedding(
//         `data:image/jpeg;base64,${base64}`
//       );

//       setReferenceImages(prev => [...prev, imgObj]);
//       setReferenceEmbeddings(prev => [...prev, result.embedding]);

//       const index = referenceEmbeddings.length + 1;
//       await AsyncStorage.setItem(`face_path_${index}`, imgObj.path);
//       await AsyncStorage.setItem(
//         `face_embedding_${index}`,
//         JSON.stringify(result.embedding)
//       );

//     } else {
//       // 🔥 TEST IMAGE → triggers auto match
//       setTestImage(imgObj);
//       setMatchResult(null);
//     }
//   } catch (err) {
//     console.error("onAutoCapture error:", err);
//   } finally {
//     setLoading(false);
//   }
// };

// const matchFace = async () => {
//   if (!testImage) return;
//   if (referenceEmbeddings.length === 0)
//     return Alert.alert("Error", "No reference embeddings found");

//   try {
//     setloader(true);
//     setMatchResult(null);

//     const testBase64 = await uriToBase64(testImage.uri);

//     const result = await FaceNetModule.matchWithEmbeddings(
//       `data:image/jpeg;base64,${testBase64}`,
//       referenceEmbeddings
//     );

//     setMatchResult(result);

//     if (result.isMatch) {
//       submitCheckInOut(testImage.path); // ✅ SUCCESS FLOW
//     } else {
//       Alert.alert(
//         "❌ No Match",
//         `Similarity: ${(result.similarity * 100).toFixed(1)}%`
//       );
//     }
//   } catch (err) {
//     Alert.alert("Error", err.message || "Face match failed");
//   } finally {
//     setloader(false);
//   }
// };


//   /* -------------------------------------------------------------------------- */
//   /*                               Render Methods                               */
//   /* -------------------------------------------------------------------------- */


//   const renderHeader = () => (
//     <ScrollView contentContainerStyle={{}}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//       }>
//       <View style={styles.header}>
//         <View style={styles.profileDetailContainer}>
//           {/* {renderNotifiButton()} */}

//           <View style={styles.profileInfo}>

//             <Text color={"black"} style={{ fontSize: screenWidth * 0.068, fontWeight: "bold", textTransform: "capitalize" }}>

//               Hey {firstName} !
//             </Text>
//             {/* <Text>Hy good morning  have a nice day</Text> */}
//             {addressLoading == true ? (
//               <LottieView
//                 source={require('../../assets/images/camera/loader.json')}
//                 autoPlay
//                 loop
//                 style={{ width: 30, height: 30 }}
//               />
//             ) : (

//               <Text color=" rgb(29,91,65)"

//                 // color={colors.subtitleSecond}
//                 style={styles.profileInfoSubTitle}
//               >
//                 {locationName}
//               </Text>
//             )}

//           </View>
//         </View>
//         <RNBounceable
//           onPress={() => {
//             NavigationService.navigate(SCREENS.PROFILE);
//           }}
//         >
//           <Image
//             resizeMode="cover"
//             source={{ uri: imagesource ? imagesource : parseData["data"]?.image }}
//             style={styles.profilePicImageStyle}
//           />
//         </RNBounceable>

//       </View>
//       {/* start...... new */}
//       <View style={{ margin: screenWidth * 0.06, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
//         <Text color="black" style={{ fontSize: 55, color: "black" }}>{currentTime}</Text>
//         <Text color="black" style={{ fontSize: 17 }}>{date}</Text>
//       </View>
//       <View style={{
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: screenWidth * 0.1,
//       }}>

//         <View style={{

//           padding: screenWidth * 0.05,
//           borderRadius: ScreenWidth * 1,
//           // width:'auto'

//           backgroundColor: isDisabled ? '#edcece' : '#E1E1E1',
//         }}
//         >
//           <TouchableOpacity disabled={locationdata}>
//             <TouchableOpacity onPress={() => {
//               if (isDisabled) {
//                 setcheckedout(true)
//                 Vibration.vibrate(300)
//               }
//               else {

//                 Vibration.vibrate(100)
//                 openAutoCapture(false)
//                 // handleBiometricAuth()
//                 // handleSetIsOpen(true)
//               } 
//               // setmodalopen(true)
//             }} style={{
//               width: ScreenHeight * 0.2,
//               height: ScreenHeight * 0.2,
//               borderRadius: screenWidth * 1,
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#DDE5E5',
//               elevation: 5,
//               shadowColor: 'black',
//               shadowOffset: { width: screenWidth * 0.09, height: ScreenHeight * 0.09 },
//               shadowOpacity: 0.25,
//               shadowRadius: 4,
//               borderWidth: screenWidth * 0.04,
//               borderColor: '#ffff',
//             }}
//               disabled={attendancedata}
//             >

//               { isnointernet?
//               <Image style={{ width: 40, height: 50 }} source={require("../../assets/images/camera/offlinetap.png")} />:
              
//               isCheckedIn ? <Image style={{ width: 40, height: 50 }} source={require("../../assets/images/camera/checkout.png")} /> : <Image style={{ width: 40, height: 50 }} source={require("../../assets/images/camera/tap.png")} />}
//               <Text color={ isnointernet?"#d6ac5dff": isCheckedIn? "#B62020" : "green"} style={{ fontSize: 16, marginTop: ScreenHeight * 0.01, fontWeight: "700" }}>
//                 { isnointernet?"No Internet":
                 
//                     isCheckedIn 
//                       ? "Check-Out"
//                       : "Check-In"
//                 }
//               </Text>
//             </TouchableOpacity>
//           </TouchableOpacity>
//         </View>
//       </View>
//       <View style={{
//         marginTop: ScreenHeight * 0.1, display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%"
//       }} >
//         {visibleTooltip === 'checkin' ? (
//           <Tooltip
//             visible={true}
//             onClose={() => setVisibleTooltip(null)}
//             popover={
//               <View style={{ maxWidth: 200 }}>
//                 <Text color="white" style={{ color: 'white' }}>Your check-in time</Text>
//               </View> }
//             backgroundColor="rgb(29,91,65)">
//             <TouchableOpacity onPress={() => handleTooltipPress('checkin')}>
//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
//                 <Image style={{ width: 25, height: 25 }} source={require("../../assets/images/camera/history.png")} />
//                 <Text style={{ marginTop: ScreenHeight * 0.02, marginBottom: ScreenHeight * 0.01, fontSize: 15, fontWeight: "600", color: "black" }}>
//                   {checkintime ? checkintime : "-- + --"}
//                 </Text>
//                 <Text style={{ color: "black" }}>Checkin Time</Text>
//               </View>
//             </TouchableOpacity>
//           </Tooltip>
//         ) : (
//           <TouchableOpacity onPress={() => handleTooltipPress('checkin')}>
//             <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
//               <Image style={{ width: 25, height: 25 }} source={require("../../assets/images/camera/history.png")} />
//               <Text style={{ marginTop: ScreenHeight * 0.02, marginBottom: ScreenHeight * 0.01, fontSize: 15, fontWeight: "600", color: "black" }}>
//                 {checkintime ? checkintime : "-- + --"}
//               </Text>
//               <Text style={{ color: "black" }}>Checkin Time</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//         {visibleTooltip === 'checkout' ? (
//           <Tooltip
//             visible={true}
//             onClose={() => setVisibleTooltip(null)}
//             popover={<Text color="white" style={{ color: 'white' }}>Your check-out time</Text>}
//             backgroundColor="rgb(29,91,65)"
//           >
//             <TouchableOpacity onPress={() => setVisibleTooltip('checkout')}>
//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
//                 <Image
//                   style={{ width: 25, height: 25 }}
//                   source={require("../../assets/images/camera/historys.png")}
//                 />
//                 <Text
//                   style={{
//                     marginTop: ScreenHeight * 0.02,
//                     marginBottom: ScreenHeight * 0.01,
//                     color: "black"
//                   }}
//                 >
//                   {checkouttime ? checkouttime : "-- + --"}
//                 </Text>
//                 <Text style={{ color: "black" }}>Checkout Time</Text>
//               </View>
//             </TouchableOpacity>
//           </Tooltip>
//         ) : (
//           <TouchableOpacity onPress={() => setVisibleTooltip('checkout')}>
//             <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
//               <Image
//                 style={{ width: 25, height: 25 }}
//                 source={require("../../assets/images/camera/historys.png")}
//               />
//               <Text
//                 style={{
//                   marginTop: ScreenHeight * 0.02,
//                   marginBottom: ScreenHeight * 0.01,
//                   color: "black"
//                 }}
//               >
//                 {checkouttime ? checkouttime : "-- + --"}
//               </Text>
//               <Text style={{ color: "black" }}>Checkout Time</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//         {visibleTooltip === 'total' ? (
//           <Tooltip
//             visible={true}
//             onClose={() => setVisibleTooltip(null)}
//             popover={<Text color="white" style={{ color: 'white' }}>  Total working time</Text>}
//             backgroundColor="rgb(29,91,65)"
//           >
//             <TouchableOpacity onPress={() => setVisibleTooltip('total')}>
//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
//                 <Image
//                   style={{ width: 30, height: 30 }}
//                   source={require("../../assets/images/camera/arrow.png")}
//                 />
//                 <Text
//                   style={{
//                     marginTop: ScreenHeight * 0.02,
//                     marginBottom: ScreenHeight * 0.01,
//                     color: "black"
//                   }}
//                 >
//                   {punching ? punching : "-- + --"}
//                 </Text>
//                 <Text style={{ color: "black" }}>Total time</Text>
//               </View>
//             </TouchableOpacity>
//           </Tooltip>
//         ) : (
//           <TouchableOpacity onPress={() => setVisibleTooltip('total')}>
//             <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
//               <Image
//                 style={{ width: 30, height: 30 }}
//                 source={require("../../assets/images/camera/arrow.png")}
//               />
//               <Text
//                 style={{
//                   marginTop: ScreenHeight * 0.02,
//                   marginBottom: ScreenHeight * 0.01,
//                   color: "black"
//                 }}
//               >
//                 {punching ? punching : "-- + --"}
//               </Text>
//               <Text style={{ color: "black" }}>Total time</Text>
//             </View>
//           </TouchableOpacity>
//         )}

//       </View>
//       {/* end...... new */}
//       {/* {renderCalendarList()} */}
//     </ScrollView>
//   );
//   return (
//     <>
//       <SafeAreaView style={styles.container}>

//         {renderHeader()}

//         <Modal
//           transparent={true}
//           animationType="fade"
//           visible={loader}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalImageContainer}>
//                 <LottieView
//                   loop
//                   autoPlay
//                   source={require("/assets/gif/face-recognition.json")}
//                   style={styles.modalImage}
//                 />
//               </View>
//               <View style={styles.modalHeadingContainer}>
//                 <Text style={styles.modalHeading} color={colors.black} bold>
//                   {/* Proccessing... */}

//                   <View style={{ justifyContent: "center", display: "flex", alignItems: "center", width: screenWidth }}>
//                     <Progress.Bar progress={progress / 100} width={200} style={{ marginTop: 20 }} />
//                     <Text style={{ marginTop: 10, fontSize: 15, alignSelf: "center" }}>{progress}%...</Text>
//                   </View>

//                   <View
//                     style={{
//                       flex: 1,
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                     }}
//                   >

//                   </View>

//                 </Text>
//                 <Text style={styles.modalSubHeading} color={"black"}>

//                 </Text>
//               </View>
//               <View style={styles.modalButtonContainer}>
//                 <TouchableOpacity
//                   // onPress={() => {
//                   //   handlePermission();
//                   //   Keyboard.dismiss();
//                   // }}
//                   onPress={() => {
//                     // setModalVisible2(false)
//                     // setModalVisible2(false)
//                   }}
//                 >
//                   <View style={[styles.modalButton]}>
//                     <Text style={styles.buttonText} color={colors.white} >
//                       Please Wait...
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
//             <View
//               style={{
//                 backgroundColor: "white",
//                 height: ScreenHeight * 0.16,
//                 borderRadius: 10,
//                 alignItems: 'center',
//                 width: screenWidth * 0.7
//               }}
//             >
//               <View >
//                 <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
//               </View>
//               <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setModalVisible(false) }}>

//                 <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
//               </TouchableOpacity>

//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>

//                 <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>Checkin !!</Text>
//                 <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}> You have checked In successfully..</Text>
//               </View>
//             </View>
//           </View>
//         </Modal>
//           <Modal
//           animationType="fade"
//           transparent={true}
//           visible={facematchmodal}
//           onRequestClose={() => setfacematchmodal(false)}
//         >
//           <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
//             <View
//               style={{
//                 backgroundColor: "white",
//                 height: ScreenHeight * 0.16,
//                 borderRadius: 10,
//                 alignItems: 'center',
//                 width: screenWidth * 0.7
//               }}
//             >
//               <View >
//                 <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
//               </View>
//               <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setfacematchmodal(false) }}>

//                 <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
//               </TouchableOpacity>

//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>

//                 <Text color="rgba(119, 65, 14, 1)" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }} > No Face Match !</Text>
//                 <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}>  Please try again ...</Text>
//               </View>
//             </View>
//           </View>
//         </Modal>
//         {/* open map tracking */}
//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={mapmodalVisible}
//           onRequestClose={() => setmapModalVisible(false)}
//         >
//           <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
//             <View
//               style={{
//                 backgroundColor: "white",
//                 height: ScreenHeight * 0.19,
//                 borderRadius: 10,
//                 alignItems: 'center',
//                 width: screenWidth * 0.78
//               }}
//             >
//               <View >
//                 <Image style={{ width: ScreenWidth * 0.158, height: ScreenWidth * 0.158, borderRadius: 50, position: "absolute", top: -40, left: -35 }} source={require("../../../assets/camera/newlogo.png")} />
//               </View>
//               <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setmapModalVisible(false) }}>

//                 <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
//               </TouchableOpacity>

//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, marginTop: 10, width: screenWidth * 0.9 }}>
//                 <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 }}>
//                   <Text color="black" style={{ fontSize: 18, color: 'black', fontWeight: 'bold', textTransform: "capitalize" }}>
//                     outside check-in zone
//                   </Text>
//                   <Text color="#FF690C" style={{ fontSize: 16, textTransform: "capitalize", color: '#FF690C', fontWeight: 'bold' }}>
//                     {distance}
//                   </Text>
//                 </View>

//                 <TouchableOpacity onPress={() => {
//                   NavigationService.navigate("maproute")
//                 }} style={{ alignItems: "center", marginTop: 20, padding: 10, height: 40, width: 250, backgroundColor: "#224942", borderWidth: 1, borderRadius: 20, }}><Text color="white" style={{ color: 'white', }}>Click to view in map</Text></TouchableOpacity>

//               </View>
//             </View>
//           </View>
//         </Modal>
//         {/* ............... */}
//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={modalVisible1}
//           onRequestClose={() => setModalVisible1(false)}
//         >
//           <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
//             <View
//               style={{
//                 backgroundColor: "white",

//                 // marginTop:screenWidth*0.0 , // Space from the top
//                 // padding: screenWidth*0.04,
//                 height: ScreenHeight * 0.16,
//                 borderRadius: 10,


//                 alignItems: 'center',
//                 width: screenWidth * 0.7
//               }}
//             >

//               <View >

//                 <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
//               </View>
//               <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setModalVisible1(false) }}>

//                 <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
//               </TouchableOpacity>

//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>
//                 <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>Checkout!!</Text>
//                 <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}> You have checked Out successfully..</Text>
//               </View>
//             </View>
//           </View>
//         </Modal>
//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={nointernet}
//           onRequestClose={() => setnointernet(false)}
//         >
//           <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
//             <View
//               style={{
//                 backgroundColor: "white",

//                 // marginTop:screenWidth*0.0 , // Space from the top
//                 // padding: screenWidth*0.04,
//                 height: ScreenHeight * 0.16,
//                 borderRadius: 10,


//                 alignItems: 'center',
//                 width: screenWidth * 0.7
//               }}
//             >

//               <View >

//                 <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
//               </View>
//               <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setnointernet(false) }}>

//                 <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
//               </TouchableOpacity>

//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>
//                <View style={{ flexDirection:"row" ,alignItems:"center",gap:10}}>
//                  <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>No Internet</Text>
//                 <Image style={{ width: 20, height: 20 }} source={require("../../../assets/camera/network-signal.png")} />
//                </View>
//                 <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}> Please check your connection...</Text>
//               </View>
//             </View>
//           </View>
//         </Modal>
//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={checkedout}
//           onRequestClose={() => setcheckedout(false)}
//         >
//           <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
//             <View
//               style={{
//                 backgroundColor: "white",

//                 // marginTop:screenWidth*0.0 , // Space from the top
//                 // padding: screenWidth*0.04,
//                 height: ScreenHeight * 0.16,
//                 borderRadius: 10,


//                 alignItems: 'center',
//                 width: screenWidth * 0.7
//               }}
//             >

//               <View >

//                 <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
//               </View>
//               <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setcheckedout(false) }}>

//                 <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
//               </TouchableOpacity>

//               <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>
//                 <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>Checked Out!!</Text>
//                 <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}>You have already checked out...</Text>
//               </View>
//             </View>
//           </View>
//         </Modal>
       


//         {/* {isOpen && (
//           <>
//             <AwesomeCamera
//               setIsOpen={handleSetIsOpen}
//               onChange={(v, image) => {
//                 if (v === true) {
//                   // console.log("image ka path", image?.slice(0,50));
//                   // handleButtonPress();
//                   submitCheckInOut(image)
//                 } else {
//                   // setModalVisible2(true);
//                   // 3 seconds timeout
//                 }
//               }}

//               onLoading={(v) => setloader(v)}
//               getData={(data) => {
//                 // console.log("photos data...",data);
//                 //  setphotodata(data)
//                 // console.log(photodata)
//                 // submitCheckInOut(data)
//                 console.log("Modal show", data)
//               }}

//             />

//           </>
//         )} */}
//         {isCaptureOpen && (
//                 <FaceCaptureModalforfacnet
//                   isActive={true}
//                   style={styles}
//                   setIsActiveCamera={setIsCaptureOpen}
//                   email=""
//                   password=""
//                   onCapture={onAutoCapture}
//                   closebutton={true}
//                 />
//               )}

//       </SafeAreaView>

//     </>
//   );
// };

// export default HomeScreen;
