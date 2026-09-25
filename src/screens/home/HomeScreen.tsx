import React, { useEffect, useMemo, useRef, useState, } from "react";
import { Alert, BackHandler, Vibration, Image, Animated, View, Modal, Pressable, TouchableOpacity, Dimensions, PanResponder, } from 'react-native';
import LottieView from "lottie-react-native";
import RNFS from 'react-native-fs';
import FaceCaptureModalforfacnet from "@screens/payementslip/AutoCapture";
// import { Tooltip } from "react-native-paper";
import { Tooltip } from "@rneui/base";
import moment from "moment"
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import createStyles from "./HomeScreen.style";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
// import { StyleSheet } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from "react-native-progress";
import Orientation from 'react-native-orientation-locker';

import {
  requestCameraPermission,
  requestLocationPermission,
} from "@services/event-emitter/permission";
import GetLocation from 'react-native-get-location';
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useAuth } from "context/AuthContext";
import * as NavigationService from "react-navigation-helpers";
import { SCREENS } from "@shared-constants";
import AwesomeCamera from "@shared-components/camera/CameraCapture";
import { useLoader } from "context/LoaderContext";
import axios from "axios";
import { getDistance } from 'geolib';
import NetInfo from "@react-native-community/netinfo";
import SharedPreferences from 'react-native-shared-preferences';
import { useLocationService } from 'LocationServiceManager';

import FaceCaptureModal from "Facematching/CameraOverlay";
import cosineSimilarity from "FaceEmbading/Cosinesimilarity";
import getImageEmbedding from "FaceEmbading/GetimageEmbading";
import { set } from "date-fns";
import { NativeModules } from 'react-native';
import { cos } from "@tensorflow/tfjs";
const { FaceNetModule } = NativeModules;
dayjs.extend(customParseFormat);
// const profileURI =
//   // eslint-disable-next-line max-len
//   "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80";
const HomeScreen: React.FC = ({ navigation }) => {
  const { userInfo } = useAuth();
  const { setIsLoading } = useLoader()
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [modalVisible, setModalVisible] = useState(false);

  const [facematchmodal, setfacematchmodal] = useState<any>(false)
  const [modalVisible1, setModalVisible1] = useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState(null);
  const [checkedout, setcheckedout] = useState(false)
  const [imagesource, setimagesource] = useState()
  const [username, setusername] = useState()
  const [lastCheckin, setLastCheckin] = useState<any>(null);
  const [isDisabled, setIsDisabled] = useState(false); // Disable button
  const [locationName, setLocationName] = useState<any>(null);
  const [weekDays, setWeekDays] = useState<any>([]);
  const [addressLoading, setIsAddressLoading] = useState<any>();
  const [isnointernet, setisnointernet] = useState<any>(false)
  const [checkintime, setcheckintime] = useState<any>()
  const [checkouttime, setcheckouttime] = useState<any>()
  const [punching, setpunching] = useState<any>()
  const flatListRef = useRef<any>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loader, setloader] = useState(false);
  const [attendancedata, setattendancedata] = useState(true)
  const [distance, setdistance] = useState("");
  const [progress, setProgress] = useState(0);
  const [locationdata, setloctiondata] = useState(false)
  const [nointernet, setnointernet] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [date, setdate] = useState<string>("")
  const parseData = JSON.parse(userInfo || "{}");
  const [refreshing, setRefreshing] = useState(false);
  const [isOutsideAllowed, setIsOutsideAllowed] = useState(false);
  const [isavailableembading, setisavailableembading] = useState(false)
  const [mapmodalVisible, setmapModalVisible] = useState(false);
  const [croppedimage, setcroppedimage] = useState<any>(null)
  const [referenceEmbeddings, setReferenceEmbeddings] = useState([]);
  const [testImage, setTestImage] = useState(null);

  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [captureForReference, setCaptureForReference] = useState(true);

  const userid = parseData?.data?.data?.user_id
  const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
  const data = JSON.parse(userInfo ? userInfo : {});
  const uname = data?.data?.data?.name;
  const imagese = data.data?.data?.image;
  const finalImageSource =
    imagesource ??
    parseData?.data?.image ??
    null;
  const { startTracking, stopTracking, locations, clearLocations } = useLocationService();

  const fullName = username || parseData["data"]?.name || '';
  const [firstName, ...rest] = fullName.trim().split(' ');
  const allowedRadiusdistance = 200;
  const fetchLastCheckin = async () => {
    try {
      const response = await fetch(
        "https://whiteforcepayroll.com/admin/api/getLastCheckin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id }),
        }
      );

      const result = await response.json();
      console.log("last checkin api", result);

      let dateToUse = null;

      // ✅ If data exists, extract date
      if (result?.data?.in) {
        dateToUse = result.data.in.split(" ")[0];
        setLastCheckin(dateToUse);

        result.data.out === null
          ? setIsCheckedIn(true)
          : setIsCheckedIn(false);
      } else {
        console.log("No last checkin data found.");
        setIsCheckedIn(false);

        // 🔥 Optional: use today's date if API failed
        dateToUse = moment().format("YYYY-MM-DD");
      }

      // ✅ ALWAYS call second API
      await fetchFaceDetails(dateToUse);

    } catch (error) {
      console.error("Error fetching last checkin:", error);

      // 🔥 Even if first API fails completely,
      // still call second API with today's date
      const today = moment().format("YYYY-MM-DD");
      await fetchFaceDetails(today);
    }
  };

  // const fetchLastCheckin = async () => {
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


  // useEffect(() => {
  //   const getStoredLocations = async () => {
  //     try {
  //       const stored = await AsyncStorage.getItem("employee_locations");
  //       if (stored) {
  //         const parsed = JSON.parse(stored);
  //         console.log("📦 Retrieved locations:", parsed);
  //        console.log("fvfd",parsed);
  //       } else {
  //         console.log("⚠️ No locations found in storage");
  //       }
  //     } catch (err) {
  //       console.log("❌ Error retrieving locations:", err.message);
  //     }
  //   };

  //   getStoredLocations();
  //     const fetchShiftData = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://whiteforcepayroll.com/admin/api/employee-location-shift-data",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ user_id: user_id }),
  //         }
  //       );

  //       const json = await response.json();
  //       console.log("📍 Locations:", json?.data?.locations);
  //     } catch (err) {
  //       console.log("❌ Error:", err.message);
  //     }
  //   };

  //   fetchShiftData();
  //    fetchLastCheckin()
  // }, []);

  useEffect(() => {
    fetchLastCheckin();

    // getUserWiseLocationTracking(user_id, "2026-01-22");
    loadReferenceFaces()
    const getStoredLocations = async () => {
      try {
        const stored = await AsyncStorage.getItem("employee_locations");
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log("📦 Retrieved locations:", parsed);
          console.log("fvfd", parsed);
        } else {
          console.log("⚠️ No locations found in storage");
        }
      } catch (err) {
        console.log("❌ Error retrieving locations:", err.message);
      }
    };

    const fetchShiftData = async () => {
      try {
        const response = await fetch(
          "https://whiteforcepayroll.com/admin/api/employee-location-shift-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user_id }),
          }
        );

        const json = await response.json();
        console.log("📍 Locations:", json?.data?.locations);
      } catch (err) {
        console.log("❌ Error:", err.message);
      }
    };

    // ✅ NEW: fetch user face details here
    const fetchFaceDetails = async () => {
      try {
        const response = await axios.post(
          "https://whiteforcepayroll.com/admin/api/get-user-face-details",
          {
            user_id: user_id,
            is_embedded: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const isEmbedded = response?.data?.data?.face_embedded_1;




        if (!isEmbedded) {
          setisavailableembading(true);
        } else {
          setisavailableembading(false);
        }

      } catch (err) {
        console.log("❌ Face Details Error:", err.message);
      }
    };

    // -------------------------
    getStoredLocations();
    fetchShiftData();
    fetchFaceDetails();   // <-- ✅ using your API here
    // -------------------------
  }, []);

  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available) {
        console.log(`Biometric type: ${biometryType}`);

        const resultObject = await rnBiometrics.simplePrompt({
          promptMessage: 'Authenticate with fingerprint',
        });

        if (resultObject.success) {
          handleSetIsOpen(true);
        } else {
          // Alert.alert('Authentication failed', 'Please try again.');
        }
      } else {
        // If biometric not available, proceed anyway
        handleSetIsOpen(true);
      }
    } catch (error) {
    }
  };
  const handleTooltipPress = (key) => {
    setVisibleTooltip((prev) => (prev === key ? null : key));
  };
  const updateTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    setCurrentTime(formattedTime); // Set current time
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = now.getDate();
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const datedetails = `${date} ${monthName} ${year}`;
    setdate(datedetails); // Set current date
  };
  const screenWidth = Dimensions.get("window").width;
  const submitCheckInOut = async (path) => {
    const base64Image = await RNFS.readFile(path, 'base64');
    const apiUrl = "https://whiteforcepayroll.com/admin/api/checkInOut";

    // Get current location
    const storedLat = await AsyncStorage.getItem("latitude");
    const storedLng = await AsyncStorage.getItem("longitude");
    const latitude = storedLat ? Number(storedLat) : null;
    const longitude = storedLng ? Number(storedLng) : null;

    const checkInData = await AsyncStorage.getItem("checkInData");
    let ConvertedDate = "";
    if (checkInData) {
      try {
        const parsed = JSON.parse(checkInData);
        if (parsed?.date) {
          ConvertedDate = dayjs(parsed.date, "D, MMMM YYYY").format("YYYY-MM-DD");
        }
      } catch (e) {
        console.warn("Invalid checkInData:", e);
      }
    }

    const date = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString();

    const pad = (n) => n.toString().padStart(2, '0');

    const formatted =
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

    const monthNew = date.getMonth() + 1;

    // Prepare location tracking data
    let locationTrackingData = [];

    if (isCheckedIn && locations.length > 0) {
      // On checkout: send all tracked locations
      locationTrackingData = locations.map(loc => ({
        time: loc.time,
        location: loc.location || locationName, // ✅ REQUIRED
        latitude: loc.latitude,
        longitude: loc.longitude,
        // accuracy: loc.accuracy, // ❌ remove unless backend supports it
      }));

      console.log("Total locations to send:", locationTrackingData, locations.length);
    } else {
      // On check-in: send current location only
      locationTrackingData = [
        {
          time: formatted,
          location: locationName,
          latitude,
          longitude,
        },
      ];
    }

    const params = {
      user_id: user_id,
      attendace_time: formatted,
      date: isCheckedIn ? `${lastCheckin}` : `${year}-${monthNew}-${day}`,
      image: `${base64Image}`,
      geolocation: `${locationName}`,
      type: isCheckedIn ? "0" : "1",
      location_tracking: isCheckedIn ? locationTrackingData : [],
    };

    try {
      const response = await axios.post(apiUrl, params, {
        headers: {
          "Content-Type": "application/json",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 99);
          setProgress(percentCompleted);
        },
      });

      console.log("Response Body:", response.data);
      console.log("Location Points Sent:", locationTrackingData.length);
      setloader(false);

      if (params.type === "1") {
        // ✅ CHECK-IN LOGIC
        setloader(false);
        setModalVisible(true);
        setIsCheckedIn(true);
        setcheckintime(time);

        // Clear previous location data
        await clearLocations();

        // Start location tracking
        try {
          await startTracking();
          console.log("✅ Location tracking started successfully");

        } catch (trackError) {
          console.error("❌ Failed to start location tracking:", trackError);

        }

        navigation.replace(SCREENS.HOME);

        await AsyncStorage.setItem("checkInData", JSON.stringify({
          date: `${day}, ${month} ${year}`,
          time,
          type: "Check-In",
        }));
        await AsyncStorage.setItem("checkinStatus", JSON.stringify(true));

      } else if (params.type === "0") {
        // ✅ CHECK-OUT LOGIC
        setloader(false);
        setModalVisible1(true);
        setIsCheckedIn(false);
        setcheckouttime(time);

        // Stop location tracking
        try {
          await stopTracking();
          console.log(`✅ Location tracking stopped. Total points tracked: ${locations.length}`);
          // Alert.alert(
          //   'Check-Out Successful', 
          //   `Your work session has been recorded with ${locations.length} location points.`
          // );
        } catch (trackError) {
          console.error("❌ Failed to stop location tracking:", trackError);
        }

        // Clear location data after successful checkout
        await clearLocations();

        navigation.replace(SCREENS.HOME);

        const checkInData = await AsyncStorage.getItem("checkInData");
        await AsyncStorage.setItem("checkOutData", JSON.stringify({
          date: `${day}, ${month} ${year}`,
          time,
          type: "Check-Out",
          timestamp: checkInData,
          totalLocations: locations.length,
        }));
        await AsyncStorage.setItem("checkinStatus", JSON.stringify(false));
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Server error", error.message || "An error occurred while submitting check-in/out.");
      setloader(false);
    } finally {
      setProgress(100);
      setloader(false);
    }
  };
  //   const submitCheckInOut = async (path) => {

  //     const base64Image = await RNFS.readFile(path, 'base64');
  //     const apiUrl = "https://whiteforcepayroll.com/admin/api/checkInOut";
  //     const storedLat = await AsyncStorage.getItem("latitude");
  // const storedLng = await AsyncStorage.getItem("longitude");

  // const latitude = storedLat ? Number(storedLat) : null;
  // const longitude = storedLng ? Number(storedLng) : null;

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
  //       image: `${base64Image}`,
  //       geolocation: `${locationName}`,
  //       type: isCheckedIn ? "0" : "1",
  //      location_tracking:  [
  //       {
  //         time,
  //         location: locationName,
  //         latitude,
  //         longitude,
  //       },
  //     ],

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
  //       console.log("Params Sent:", path);
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
  //       Alert.alert(" Server error", error.message);
  //       setloader(false)

  //     }
  //     finally {
  //       setProgress(100);
  //             setloader(false)

  //     }
  //   };
  const getAllowedLocations = async () => {
    const data = await AsyncStorage.getItem("employee_locations");
    return data ? JSON.parse(data) : [];
  };

  useEffect(() => {
    const testCheckInStorage = async () => {
      console.log("checkintdata", isCheckedIn)
      const checkInDataRaw = await AsyncStorage.getItem("checkInData");
      const checkInData = checkInDataRaw ? JSON.parse(checkInDataRaw) : null;
      console.log("checkintime", checkInData);
    };

    testCheckInStorage();
  }, []);
  const getCheckInOutData = async () => {
    try {
      const checkInData = await AsyncStorage.getItem("checkInData");
      const checkOutData = await AsyncStorage.getItem("checkOutData");

      if (checkInData) {
        console.log("Retrieved Check-In Data:", JSON.parse(checkInData));
      }
      if (checkOutData) {
        console.log("Retrieved Check-Out Data:", JSON.parse(checkOutData));
        const checkoutdata = JSON.parse(checkOutData);
        // setcheckouttime(checkoutdata.time);
      }
    } catch (error) {
      console.error("Failed to fetch check-in/check-out data:", error);
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
  };
  const fetchFaceDetails = async (date: string) => {
    try {
      const user = user_id;
      const payload = { user_id: user, date };
      console.log("userId:", user);

      let faceDetailsResponse;

      try {
        faceDetailsResponse = await axios.post(
          "https://whiteforcepayroll.com/admin/api/getDateAttendance-new",
          payload
        );
        console.log("payload:", payload);

        // setattendancedata(false);

        const punches = faceDetailsResponse.data.data.punches;

        if (punches && punches.length > 0) {
          const { in: checkInTime, out: checkOutTime } = punches[0];

          console.log("checkInTime:", checkInTime, "checkOutTime:", checkOutTime);

          setcheckintime(checkInTime);
          setcheckouttime(checkOutTime);

          // 🔹 Parser with trim + multiple formats
          const parseTime = (time: string) => {
            if (!time) return moment.invalid();
            const cleanTime = time.trim();
            const formats = ["h:mm A", "hh:mm A", "HH:mm:ss"];
            for (let fmt of formats) {
              const parsed = moment(cleanTime, fmt, true);
              if (parsed.isValid()) return parsed;
            }
            return moment.invalid();
          };

          if (checkInTime && checkOutTime) {
            const start = parseTime(checkInTime);
            const end = parseTime(checkOutTime);

            if (start.isValid() && end.isValid()) {
              const diff = moment.duration(end.diff(start));
              const hours = Math.floor(diff.asHours());
              const minutes = diff.minutes();
              const formattedTime = `${hours}h ${minutes}m`;

              console.log("✅ Total time:", formattedTime);
              setpunching(formattedTime);
            } else {
              console.warn("❌ Invalid time format:", checkInTime, checkOutTime);
            }
          } else if (checkInTime) {
            console.log("User has only checked in.");
            setIsCheckedIn(true);
          } else {
            console.log("No punches found.");
            setIsCheckedIn(false);
          }
        } else {
          console.log("No punches found for this date.");
          setIsCheckedIn(false);
        }
      } catch (apiError) {
        console.warn("API request failed:", apiError);
      }
    } catch (err) {
      console.error("Unexpected error fetching face details:", err);
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const API_KEY = "pk.8040bc9590a7efd54a33390bb8d5cc8f"; // replace this

      const url = `https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${latitude}&lon=${longitude}&format=json`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("locationiq data", data)
      if (data?.address) {
        return data.address;  // full address object
      } else {
        console.warn("No address found");
        return null;
      }

    } catch (error) {
      console.error("LocationIQ Error:", error);
      return null;
    }
  };
  // const getAddressFromCoordinates = async (latitude, longitude) => {
  //   try {
  //     const API_KEY = "aca283a736124fe4b0a50f4b1c587da5";

  //     const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${API_KEY}`;

  //     const response = await fetch(url);
  //     const data = await response.json();

  //     console.log("Geoapify data:", data);

  //     if (data?.features?.length > 0) {
  //       return data.features[0].properties;
  //     }

  //     return null;
  //   } catch (error) {
  //     console.error("Geoapify Error:", error);
  //     return null;
  //   }
  // };
  const fetchStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(' ');
      if (status !== null) {
        setIsCheckedIn(JSON.parse(status)); // Convert string back to boolean
      }
    } catch (error) {
      console.error('Failed to load status from AsyncStorage:', error);
    }
  };
  useEffect(() => {

    setIsLoading(false)
    const currentDate = new Date;
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    console.log("dateeeeeeee", date)
    // fetchFaceDetails(date)
    setimagesource(imagese);
    setusername(uname);
    getCheckInOutData()



    fetchStatus()

    // Update time every second
    updateTime();
    const intervalId = setInterval(updateTime, 1000); // Update every second


    // Log information

    // console.log("User ID:", JSON.stringify(imagedetails));
    // console.log("All stored data:", parseData);

    console.log("This is my current location:", locationName);

    setIsAddressLoading(true);
    Orientation.lockToPortrait(); // Change to lockToLandscape() for landscape mode

    // Back button handler
    const backAction = () => {
      return false; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    requestLocationPermission().then(async (res) => {
      if (!res) return;

      const options = {
        enableHighAccuracy: true,
        timeout: 60000,
      };

      try {
        // 📍 Current GPS location
        const position = await GetLocation.getCurrentPosition(options);
        const { latitude, longitude } = position;
        setattendancedata(false);

        await AsyncStorage.setItem("latitude", latitude.toString());
        await AsyncStorage.setItem("longitude", longitude.toString());

        console.log("📍 Current Location:", latitude, longitude);

        // 🔹 Address (UI only)
        const address = await getAddressFromCoordinates(latitude, longitude);
        if (address) {
          const county = address.county || "";
          const city = address.city || "";
          setLocationName(`${county} ${city}`);
        }

        // ==================================
        // ⭐ READ ALLOWED LOCATIONS
        // ==================================
        const locations = await getAllowedLocations();

        // 🔥 RULE: No locations → geo-fence disabled
        if (!Array.isArray(locations) || locations.length === 0) {
          console.log("ℹ️ No allowed locations → geo-fence disabled");
          setIsOutsideAllowed(false);
          setIsAddressLoading(false);
          return;
        }

        const FIXED_RADIUS = allowedRadiusdistance ?? 200; // meters

        let isInsideAnyLocation = false;
        let nearestDistance = Infinity;

        for (const loc of locations) {
          if (!loc.latitude || !loc.longitude) continue;

          const allowedLocation = {
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude),
          };

          const distance = getDistance(
            { latitude, longitude },
            allowedLocation
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
          }

          if (distance <= FIXED_RADIUS) {
            isInsideAnyLocation = true;
            break; // stop as soon as inside any zone
          }
        }

        if (isInsideAnyLocation) {
          console.log("✅ Inside allowed zone");
          setIsOutsideAllowed(false);
        } else {
          console.warn("❌ Outside allowed zones");
          setIsOutsideAllowed(true);
          setloctiondata(true);
          setdistance(formatDistance(nearestDistance));
        }

        setIsAddressLoading(false);

      } catch (error) {
        console.error("❌ Location Error:", error);
        setIsAddressLoading(false);
      }
    });



    // requestLocationPermission().then(async (res) => {
    //   if (res) {
    //     const options = {
    //       enableHighAccuracy: true,
    //       timeout: 60000,
    //       maximumAge: 1000,
    //     };

    //     try {
    //       const position = await GetLocation.getCurrentPosition(options);
    //       const { latitude, longitude } = position;

    //       await AsyncStorage.setItem("latitude", JSON.stringify(latitude));
    //       await AsyncStorage.setItem("longitude", JSON.stringify(longitude));

    //       const address = await getAddressFromCoordinates(latitude, longitude);
    //       console.log("longXXXXX", longitude, "latXXXXXXXXXXXX", latitude)
    //       if (address) {
    //         const county = address.county || '';
    //         const city = address.city || '';
    //         setLocationName(`${county}, ${city}`);
    //         console.log("Address info:", county, city);
    //       }
    //     const response = await fetch(
    //       "https://whiteforcepayroll.com/admin/api/employee-location-shift-data",
    //       {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ user_id: user_id }),
    //       }
    //     );

    //     const json = await response.json();
    //     const locations = json?.data?.locations || [];

    //     // Save in AsyncStorage
    //     await AsyncStorage.setItem("employee_locations", JSON.stringify(locations));
    //     console.log("✅ Saved locations:", locations);

    //     // Pick the first location (or handle multiple if needed)
    //     if (locations.length > 0) {
    //       const allowedLocation = {
    //         latitude: parseFloat(locations[0].latitude),
    //         longitude: parseFloat(locations[0].longitude),
    //       };
    //       const allowedRadius = parseInt(locations[0].radius, 10) || 100; // default 100m

    //       // ✅ Distance calculation
    //       const distance = getDistance({ latitude, longitude }, allowedLocation);
    //       if (distance <= allowedRadius) {
    //         console.log("✅ You are within the check-in zone.");
    //       } else {
    //         const readableDistance = formatDistance(distance);
    //         console.log( "distance",distance)
    //         setloctiondata(true);
    //         setdistance(`${readableDistance}`);
    //         console.warn("❌ Outside check-in zone.");
    //         setmapModalVisible(true)
    //       }
    //     } else {
    //       console.warn("❌ No allowed locations found for this user.");
    //     }

    //       setIsAddressLoading(false);
    //     } catch (error) {
    //       console.error("Location Error:", error.message, error);
    //       setIsAddressLoading(false);
    //     }
    //   }
    // });
    getCheckInOutData()
    // Other actions
    getWeekDays();
    scrollToActiveItem();

    // Cleanup on unmount
    return () => {

      clearInterval(intervalId); // Clear the interval
      backHandler.remove(); // Remove back button listener
    };
  }, []);
  const formatDistance = (meters) => {
    return meters >= 1000
      ? `${Math.floor(meters / 1000)} km`
      : `${Math.floor(meters)} m`;
  };

  const handlePermission = async () => {
    if (
      // (await requestCameraPermission()) &&
      (await requestLocationPermission())
      // (await requestCalendarPermission())
    ) {
      // cam(true);
    } else {
      // setIsCameraVisible(false);
      setIsDisabled(true)
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a network request (e.g., API call)
    setTimeout(() => {
      fetchStatus()
      handlePermission()
      setIsLoading(false)
      // setIsAddressLoading(true);

      requestLocationPermission().then(async (res) => {
        if (!res) return;

        const options = {
          enableHighAccuracy: true,
          timeout: 60000,
        };

        try {
          // 📍 Current GPS location
          const position = await GetLocation.getCurrentPosition(options);
          const { latitude, longitude } = position;

          await AsyncStorage.setItem("latitude", latitude.toString());
          await AsyncStorage.setItem("longitude", longitude.toString());

          console.log("📍 Current Location:", latitude, longitude);

          // 🔹 Address (UI only)
          const address = await getAddressFromCoordinates(latitude, longitude);
          if (address) {
            const county = address.county || "";
            const city = address.city || "";
            setLocationName(`${county}, ${city}`);
          }

          // ==================================
          // ⭐ READ ALLOWED LOCATIONS
          // ==================================
          const locations = await getAllowedLocations();

          // 🔥 RULE: No locations → geo-fence disabled
          if (!Array.isArray(locations) || locations.length === 0) {
            console.log("ℹ️ No allowed locations → geo-fence disabled");
            setIsOutsideAllowed(false);
            setIsAddressLoading(false);
            return;
          }

          const FIXED_RADIUS = allowedRadiusdistance ?? 200; // meters

          let isInsideAnyLocation = false;
          let nearestDistance = Infinity;

          for (const loc of locations) {
            if (!loc.latitude || !loc.longitude) continue;

            const allowedLocation = {
              latitude: Number(loc.latitude),
              longitude: Number(loc.longitude),
            };

            const distance = getDistance(
              { latitude, longitude },
              allowedLocation
            );

            if (distance < nearestDistance) {
              nearestDistance = distance;
            }

            if (distance <= FIXED_RADIUS) {
              isInsideAnyLocation = true;
              break; // stop as soon as inside any zone
            }
          }

          if (isInsideAnyLocation) {
            console.log("✅ Inside allowed zone");
            setIsOutsideAllowed(false);
          } else {
            console.warn("❌ Outside allowed zones");
            setIsOutsideAllowed(true);
            setloctiondata(true);
            setdistance(formatDistance(nearestDistance));
          }

          setIsAddressLoading(false);

        } catch (error) {
          console.error("❌ Location Error:", error);
          setIsAddressLoading(false);
        }
      });

      setRefreshing(false);
    }, 2000);
  };

  const getWeekDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    // Get the first day (Sunday) of the current week
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());

    const weekdays = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(firstDayOfWeek);
      currentDay.setDate(firstDayOfWeek.getDate() + i);

      const dayName = days[currentDay.getDay()];
      const dayDate = currentDay.getDate(); // Get only the date
      const isActive = currentDay.getDay() === today.getDay(); // Mark the current weekday as active

      weekdays.push({
        date: dayDate,
        day: dayName,
        isActive: isActive || false,
      });
    }
    setWeekDays(weekdays);
  };

  const scrollToActiveItem = () => {
    const activeIndex = weekDays.findIndex((item: any) => item.isActive);
    if (activeIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: activeIndex });
    }
  };

  useEffect(() => {
    if (testImage && referenceEmbeddings.length > 0) {
      matchFace();
    }
  }, [testImage]);


  /** Load previously saved reference faces from AsyncStorage */
  const loadReferenceFaces = async () => {
    try {
      let refs = [];
      let embeds = [];

      for (let i = 1; i <= 3; i++) {
        // const path = await AsyncStorage.getItem(`face_path_${i}`);
        const emb = await AsyncStorage.getItem(`face_embedding_${i}`);

        if (emb) {
          // refs.push({ uri: `file://${path}`, path });
          embeds.push(JSON.parse(emb)); // 🔥 embedding array
        }
      }
      // console.log("Loaded reference embeddings:", embeds);
      // setReferenceImages(refs);
      setReferenceEmbeddings(embeds);
    } catch (err) {
      console.log("Error loading reference faces:", err);
    }
  };

  /** Convert file uri to Base64 */
  const uriToBase64 = async (uri) => {
    const path = uri.replace("file://", "");
    return await RNFS.readFile(path, "base64");
  };


  /** Open camera modal */
  const openAutoCapture = (isReference: boolean) => {
    setCaptureForReference(isReference);
    setIsCaptureOpen(true);
  };

  /** Handle captured image from camera */
  const onAutoCapture = async (image) => {
    setIsCaptureOpen(false);
    if (!image?.uri) return;

    try {
      const imgObj = {
        uri: image.uri,
        path: image.uri.replace("file://", ""),
      };

      const base64 = await uriToBase64(image.uri);

      if (captureForReference) {
        // 🔥 ENROLL → GET EMBEDDING
        const result = await FaceNetModule.captureAndGetEmbedding(
          `data:image/jpeg;base64,${base64}`
        );

        // setReferenceImages(prev => [...prev, imgObj]);
        setReferenceEmbeddings(prev => [...prev, result.embedding]);

        const index = referenceEmbeddings.length + 1;
        await AsyncStorage.setItem(`face_path_${index}`, imgObj.path);
        await AsyncStorage.setItem(
          `face_embedding_${index}`,
          JSON.stringify(result.embedding)
        );

      } else {
        // 🔥 TEST IMAGE → triggers auto match
        setTestImage(imgObj);
      }
    } catch (err) {
      console.error("onAutoCapture error:", err);
    } finally {
    }
  };

  const matchFace = async () => {
    if (!testImage) return;
    if (referenceEmbeddings.length === 0)
      return Alert.alert("Error", "No reference embeddings found");

    try {
      setloader(true);
      const testBase64 = await uriToBase64(testImage.uri);

      const result = await FaceNetModule.matchWithEmbeddings(
        `data:image/jpeg;base64,${testBase64}`,
        referenceEmbeddings
      );


      if (result.isMatch) {
        submitCheckInOut(testImage.path); // ✅ SUCCESS FLOW
      } else {
        setloader(false);
        setfacematchmodal(true)
      }
    } catch (err) {
      setloader(false);
      Alert.alert("Error", err.message || "Face match failed");
    } finally {

    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */


  const renderHeader = () => (
    <ScrollView contentContainerStyle={{}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        {/* <View style={styles.profileDetailContainer}>

          <View style={styles.profileInfo}>

<Image
            resizeMode="contain"
            source={{ uri: croppedimage }}
            style={{height: 240, width: 240, borderRadius: 20}}
          />
          </View>
        </View> */}


        <View style={styles.profileDetailContainer}>
          {/* {renderNotifiButton()} */}

          <View style={styles.profileInfo}>

            <Text color={"black"} style={{ fontSize: screenWidth * 0.068, fontWeight: "bold", textTransform: "capitalize" }}>

              Hey {firstName} !
            </Text>
            {/* <Text>Hy good morning  have a nice day</Text> */}
            {addressLoading == true ? (
              // <Text
              //   color={colors.subtitleSecond}
              //   style={styles.profileInfoSubTitle}
              // >

              // </Text>
              <LottieView
                source={require('../../assets/images/camera/loader.json')}
                autoPlay
                loop
                style={{ width: 30, height: 30 }}
              />
            ) : (

              <Text color=" rgb(29,91,65)"

                // color={colors.subtitleSecond}
                style={styles.profileInfoSubTitle}
              >
                {locationName}
              </Text>
            )}

          </View>
        </View>




        <RNBounceable
          onPress={() => {
            NavigationService.navigate(SCREENS.PROFILE);
          }}
        >
          <Image
            resizeMode="cover"
            source={{
              uri:
                finalImageSource ? finalImageSource :
                  "https://t4.ftcdn.net/jpg/11/28/72/75/360_F_1128727502_ce2UdfqSn42Ia48OeSy7a6UBX590HZnJ.jpg"
            }}
            style={styles.profilePicImageStyle}
          />
        </RNBounceable>

      </View>
      {/* start...... new */}
      <View style={{ margin: screenWidth * 0.06, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Text color="black" style={{ fontSize: 55, color: "black" }}>{currentTime}</Text>
        <Text color="black" style={{ fontSize: 17 }}>{date}</Text>
      </View>
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: screenWidth * 0.1,
      }}>

        <View style={{
          padding: screenWidth * 0.05,
          borderRadius: ScreenWidth * 1,
          // width:'auto'

          backgroundColor: isDisabled ? '#edcece' : '#E1E1E1',
        }}
        >
          <TouchableOpacity >
            <TouchableOpacity
              onPress={() => {
                // 1️⃣ If no embedding → go to login
                if (isavailableembading) {
                  NavigationService.navigate("login");
                  return;
                }

                // 2️⃣ If outside allowed location → show map popup
                if (isOutsideAllowed) {
                  setmapModalVisible(true);
                  Vibration.vibrate(200);
                  return;
                }

                // 3️⃣ If button is disabled → do checkout logic
                if (!isDisabled) {
                  openAutoCapture(false);
                  Vibration.vibrate(300);
                  return;
                }

                // 4️⃣ Normal Check-in / Check-out flow
                Vibration.vibrate(100);
                handleBiometricAuth();
                setIsCaptureOpen(true);
              }}

              style={{
                width: ScreenHeight * 0.2,
                height: ScreenHeight * 0.2,
                borderRadius: screenWidth * 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#DDE5E5",
                elevation: 5,
                shadowColor: "black",
                shadowOffset: { width: screenWidth * 0.09, height: ScreenHeight * 0.09 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                borderWidth: screenWidth * 0.04,
                borderColor: "#ffff",
              }}
              disabled={attendancedata}
            >
              {isnointernet ? (
                <Image
                  style={{ width: 40, height: 50 }}
                  source={require("../../assets/images/camera/offlinetap.png")}
                />
              ) : isCheckedIn ? (
                <Image
                  style={{ width: 40, height: 50 }}
                  source={require("../../assets/images/camera/checkout.png")}
                />
              ) : (
                <Image
                  style={{ width: 40, height: 50 }}
                  source={require("../../assets/images/camera/tap.png")}
                />
              )}

              <Text
                color={
                  isnointernet
                    ? "#d6ac5dff"
                    : isCheckedIn
                      ? "#B62020"
                      : "green"
                }
                style={{
                  fontSize: 16,
                  marginTop: ScreenHeight * 0.01,
                  fontWeight: "700",
                }}
              >
                {isnointernet
                  ? "No Internet"
                  : isCheckedIn
                    ? "Check-Out"
                    : "Check-In"}
              </Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </View>
      </View>
      <View style={{
        marginTop: ScreenHeight * 0.1, display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%"
      }} >
        {visibleTooltip === 'checkin' ? (
          <Tooltip
            visible={true}
            onClose={() => setVisibleTooltip(null)}
            popover={
              <View style={{ maxWidth: 200 }}>
                <Text color="white" style={{ color: 'white' }}>Your check-in time</Text>
              </View>}
            backgroundColor="rgb(29,91,65)">
            <TouchableOpacity onPress={() => handleTooltipPress('checkin')}>
              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <Image style={{ width: 25, height: 25 }} source={require("../../assets/images/camera/history.png")} />
                <Text style={{ marginTop: ScreenHeight * 0.02, marginBottom: ScreenHeight * 0.01, fontSize: 15, fontWeight: "600", color: "black" }}>
                  {checkintime ? checkintime : "-- + --"}
                </Text>
                <Text style={{ color: "black" }}>Checkin Time</Text>
              </View>
            </TouchableOpacity>
          </Tooltip>
        ) : (
          <TouchableOpacity onPress={() => handleTooltipPress('checkin')}>
            <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
              <Image style={{ width: 25, height: 25 }} source={require("../../assets/images/camera/history.png")} />
              <Text style={{ marginTop: ScreenHeight * 0.02, marginBottom: ScreenHeight * 0.01, fontSize: 15, fontWeight: "600", color: "black" }}>
                {checkintime ? checkintime : "-- + --"}
              </Text>
              <Text style={{ color: "black" }}>Checkin Time</Text>
            </View>
          </TouchableOpacity>
        )}
        {visibleTooltip === 'checkout' ? (
          <Tooltip
            visible={true}
            onClose={() => setVisibleTooltip(null)}
            popover={<Text color="white" style={{ color: 'white' }}>Your check-out time</Text>}
            backgroundColor="rgb(29,91,65)"
          >
            <TouchableOpacity onPress={() => setVisibleTooltip('checkout')}>
              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <Image
                  style={{ width: 25, height: 25 }}
                  source={require("../../assets/images/camera/historys.png")}
                />
                <Text
                  style={{
                    marginTop: ScreenHeight * 0.02,
                    marginBottom: ScreenHeight * 0.01,
                    color: "black"
                  }}
                >
                  {checkouttime ? checkouttime : "-- + --"}
                </Text>
                <Text style={{ color: "black" }}>Checkout Time</Text>
              </View>
            </TouchableOpacity>
          </Tooltip>
        ) : (
          <TouchableOpacity onPress={() => setVisibleTooltip('checkout')}>
            <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
              <Image
                style={{ width: 25, height: 25 }}
                source={require("../../assets/images/camera/historys.png")}
              />
              <Text
                style={{
                  marginTop: ScreenHeight * 0.02,
                  marginBottom: ScreenHeight * 0.01,
                  color: "black"
                }}
              >
                {checkouttime ? checkouttime : "-- + --"}
              </Text>
              <Text style={{ color: "black" }}>Checkout Time</Text>
            </View>
          </TouchableOpacity>
        )}
        {visibleTooltip === 'total' ? (
          <Tooltip
            visible={true}
            onClose={() => setVisibleTooltip(null)}
            popover={<Text color="white" style={{ color: 'white' }}>  Total working time</Text>}
            backgroundColor="rgb(29,91,65)"
          >
            <TouchableOpacity onPress={() => setVisibleTooltip('total')}>
              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <Image
                  style={{ width: 30, height: 30 }}
                  source={require("../../assets/images/camera/arrow.png")}
                />
                <Text
                  style={{
                    marginTop: ScreenHeight * 0.02,
                    marginBottom: ScreenHeight * 0.01,
                    color: "black"
                  }}
                >
                  {punching ? punching : "-- + --"}
                </Text>
                <Text style={{ color: "black" }}>Total time</Text>
              </View>
            </TouchableOpacity>
          </Tooltip>
        ) : (
          <TouchableOpacity onPress={() => setVisibleTooltip('total')}>
            <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
              <Image
                style={{ width: 30, height: 30 }}
                source={require("../../assets/images/camera/arrow.png")}
              />
              <Text
                style={{
                  marginTop: ScreenHeight * 0.02,
                  marginBottom: ScreenHeight * 0.01,
                  color: "black"
                }}
              >
                {punching ? punching : "-- + --"}
              </Text>
              <Text style={{ color: "black" }}>Total time</Text>
            </View>
          </TouchableOpacity>
        )}


      </View>
      {/* end...... new */}
      {/* {renderCalendarList()} */}
      {/* <TouchableOpacity style={{
        marginTop: ScreenHeight * 0.06, display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%" , backgroundColor:"rgb(29,91,65)", padding: 10, borderRadius: 5
      }} onPress={() => {navigation.navigate("ALLOWANCE")}}>
  <View>
   <Text color="white" style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
     Request to the allowance
   </Text>
  </View>
 </TouchableOpacity>  */}
    </ScrollView>
  );
  return (
    <>
      <SafeAreaView style={styles.container}>

        {renderHeader()}

        <Modal
          transparent={true}
          animationType="fade"
          visible={loader}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalImageContainer}>
                <LottieView
                  loop
                  autoPlay
                  source={require("/assets/gif/face-recognition.json")}
                  style={styles.modalImage}
                />
              </View>
              <View style={styles.modalHeadingContainer}>
                <Text style={styles.modalHeading} color={colors.black} bold>
                  {/* Proccessing... */}

                  <View style={{ justifyContent: "center", display: "flex", alignItems: "center", width: screenWidth }}>
                    <Progress.Bar progress={progress / 100} width={200} style={{ marginTop: 20 }} />
                    <Text style={{ marginTop: 10, fontSize: 15, alignSelf: "center" }}>{progress}%...</Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >

                  </View>

                </Text>
                <Text style={styles.modalSubHeading} color={"black"}>

                </Text>
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  // onPress={() => {
                  //   handlePermission();
                  //   Keyboard.dismiss();
                  // }}
                  onPress={() => {
                    // setModalVisible2(false)
                    // setModalVisible2(false)
                  }}
                >
                  <View style={[styles.modalButton]}>
                    <Text style={styles.buttonText} color={colors.white} >
                      Please Wait...
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
            <View
              style={{
                backgroundColor: "white",
                height: ScreenHeight * 0.16,
                borderRadius: 10,
                alignItems: 'center',
                width: screenWidth * 0.7
              }}
            >
              <View >
                <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
              </View>
              <TouchableOpacity style={{ position: "absolute", top: 10, right: 12, padding: 6, }} onPress={() => { setModalVisible(false) }}>
                <Text color="#555" style={{ fontSize: 18, fontWeight: "bold", color: "#555" }}>✕</Text>
              </TouchableOpacity>

              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>

                <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>Checkin !!</Text>
                <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}> You have checked In successfully..</Text>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={facematchmodal}
          onRequestClose={() => setfacematchmodal(false)}
        >
          <Pressable style={{
            flex: 1,
            justifyContent: "center",
            // width: "100%",
            backgroundColor: "rgba(59, 59, 58, 0.5)",
          }}
            onPress={() => setfacematchmodal(false)}>

            <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
              <View
                style={{
                  backgroundColor: "white",
                  height: ScreenHeight * 0.16,
                  borderRadius: 10,
                  alignItems: 'center',
                  width: screenWidth * 0.7
                }}
              >
                <View >
                  <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
                </View>
                <View style={{ position: "absolute", top: 0, right: 5, }}>
                  <TouchableOpacity style={{ padding: 10 }} onPress={() => { setfacematchmodal(false) }}>

                    <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
                  </TouchableOpacity>
                </View>

                <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>

                  <Text color="rgba(119, 65, 14, 1)" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }} > No Face Match !</Text>
                  <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}>  Please try again ...</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Modal>
        {/* open map tracking */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={mapmodalVisible}
          onRequestClose={() => setmapModalVisible(false)}
        >
          <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
            <View
              style={{
                backgroundColor: "white",
                height: ScreenHeight * 0.19,
                borderRadius: 10,
                alignItems: 'center',
                width: screenWidth * 0.78
              }}
            >
              <View >
                <Image style={{ width: ScreenWidth * 0.158, height: ScreenWidth * 0.158, borderRadius: 50, position: "absolute", top: -40, left: -35 }} source={require("../../../assets/camera/newlogo.png")} />
              </View>
              <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setmapModalVisible(false) }}>

                <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
              </TouchableOpacity>

              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, marginTop: 10, width: screenWidth * 0.9 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 }}>
                  <Text color="black" style={{ fontSize: 18, color: 'black', fontWeight: 'bold', textTransform: "capitalize" }}>
                    outside check-in zone
                  </Text>
                  <Text color="#FF690C" style={{ fontSize: 16, textTransform: "capitalize", color: '#FF690C', fontWeight: 'bold' }}>
                    {distance}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => {
                  NavigationService.navigate("maproute")
                }} style={{ alignItems: "center", marginTop: 20, padding: 10, height: 40, width: 250, backgroundColor: "#224942", borderWidth: 1, borderRadius: 20, }}><Text color="white" style={{ color: 'white', }}>Click to view in map</Text></TouchableOpacity>

              </View>
            </View>
          </View>
        </Modal>
        {/* ............... */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible1}
          onRequestClose={() => setModalVisible1(false)}
        >
          <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
            <View
              style={{
                backgroundColor: "white",

                // marginTop:screenWidth*0.0 , // Space from the top
                // padding: screenWidth*0.04,
                height: ScreenHeight * 0.16,
                borderRadius: 10,


                alignItems: 'center',
                width: screenWidth * 0.7
              }}
            >

              <View >

                <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
              </View>
              <TouchableOpacity style={{ position: "absolute", top: 10, right: 12, padding: 6, }} onPress={() => { setModalVisible1(false) }}>
                <Text color="#555" style={{ fontSize: 18, fontWeight: "bold", color: "#555" }}>✕</Text>
              </TouchableOpacity>

              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>
                <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>Checkout!!</Text>
                <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}> You have checked Out successfully..</Text>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={nointernet}
          onRequestClose={() => setnointernet(false)}
        >
          <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
            <View
              style={{
                backgroundColor: "white",

                // marginTop:screenWidth*0.0 , // Space from the top
                // padding: screenWidth*0.04,
                height: ScreenHeight * 0.16,
                borderRadius: 10,


                alignItems: 'center',
                width: screenWidth * 0.7
              }}
            >

              <View >

                <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
              </View>
              <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setnointernet(false) }}>

                <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
              </TouchableOpacity>

              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>No Internet</Text>
                  <Image style={{ width: 20, height: 20 }} source={require("../../../assets/camera/network-signal.png")} />
                </View>
                <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}> Please check your connection...</Text>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={checkedout}
          onRequestClose={() => setcheckedout(false)}
        >
          <View style={{ flex: 1, position: "relative", justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(12, 11, 10, 0.5)' }}>
            <View
              style={{
                backgroundColor: "white",

                // marginTop:screenWidth*0.0 , // Space from the top
                // padding: screenWidth*0.04,
                height: ScreenHeight * 0.16,
                borderRadius: 10,


                alignItems: 'center',
                width: screenWidth * 0.7
              }}
            >

              <View >

                <Image style={{ width: ScreenWidth * 0.18, height: ScreenWidth * 0.18, borderRadius: 50, position: "absolute", top: -34, left: -35 }} source={require("../../../assets/camera/ic_launchers.png")} />
              </View>
              <TouchableOpacity style={{ position: "absolute", top: 20, right: 15, }} onPress={() => { setcheckedout(false) }}>

                <Image style={{ width: 15, height: 15 }} source={require("../../../assets/camera/close.png")} />
              </TouchableOpacity>

              <View style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", height: ScreenHeight * 0.15, width: screenWidth * 0.7 }}>
                <Text color="black" style={{ fontSize: 24, color: 'rgb(29,91,65)', fontWeight: 'bold' }}>Checked Out!!</Text>
                <Text color="black" style={{ color: '#FFFFFF', marginTop: 10 }}>You have already checked out...</Text>
              </View>
            </View>
          </View>
        </Modal>



        {/* {isOpen && (
          <>
            <AwesomeCamera
              setIsOpen={handleSetIsOpen}
              onChange={(v, image) => {
                if (v === true) {
                  // console.log("image ka path", image?.slice(0,50));
                  // handleButtonPress();
                  submitCheckInOut(image)
                } else {
                  // setModalVisible2(true);
                  // 3 seconds timeout
                }
              }}

              onLoading={(v) => setloader(v)}
              getData={(data) => {
                // console.log("photos data...",data);
                //  setphotodata(data)
                // console.log(photodata)
                // submitCheckInOut(data)
                console.log("Modal show", data)
              }}

            />

          </>
        )} */}
        {isCaptureOpen && (
          <FaceCaptureModalforfacnet
            isActive={true}
            style={styles}
            setIsActiveCamera={setIsCaptureOpen}
            email=""
            password=""
            onCapture={onAutoCapture}
            closebutton={true}
          />
        )}
      </SafeAreaView>

    </>
  );
};

export default HomeScreen;
