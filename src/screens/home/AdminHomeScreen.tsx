import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackHandler, FlatList, Image, ImageBackground, ScrollView, View, StyleProp, Platform, Alert } from 'react-native';
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import Orientation from "react-native-orientation-locker";
import createStyles from "./AdminHomeScreen.style";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import CalendarItem from "./components/calendar-item/CalendarItem";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

import { useAuth } from "context/AuthContext";
import * as NavigationService from "react-navigation-helpers";
import { SCREENS } from "@shared-constants";
import AwesomeCamera from "@shared-components/camera/CameraCapture";
import { useNavigation } from "@react-navigation/native";
import { normalize } from "@rneui/themed";
import { normalizeText } from "@rneui/base";
import { StackActions } from "@react-navigation/native";
const profileURI = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
// eslint-disable-next-line max-len
// "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80";

const AdminHomeScreen: React.FC = () => {
  const { userInfo, isdatas, setdatas } = useAuth();
  const parseData = JSON.parse(userInfo ? userInfo : {});
  const fullname = parseData.data?.data?.name;
  const name = parseData["data"]?.name;

  const data = JSON.parse(userInfo ? userInfo : {});
  const userid = parseData?.data?.data?.user_id
  const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
  const imagesource = data.data?.data?.image;

  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  const [locationName, setLocationName] = useState(null);
  const [weekDays, setWeekDays] = useState<any>([]);
  const [collection, setcollection] = useState<any>();

  const flatListRef = useRef<any>(null);

  const [attendanceStats, setAttendanceStats] = useState({
    totalEmployees: 0,
    totalPresent: 0,
    totalAbsent: 0,
  });
  // const [imageSource, setImageSource] = useState('');


  const [isOpen, setIsOpen] = useState(false);

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
  };
  const handleNavigateToTermss = () => {
    NavigationService.navigationRef.current?.dispatch(StackActions.push('attendanceclient'));
  };
  const fetchTeamData = async () => {
    const currentDate = new Date().toISOString().split('T')[0];

    try {
      const attendanceResponse = await fetch('https://whiteforcepayroll.com/admin/api/attendance-list-for-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userid || user_id,
          date: currentDate,
        }),
      });

      const attendanceJson = await attendanceResponse.json();
      await AsyncStorage.setItem('attendanceData', JSON.stringify(attendanceJson));
      if (attendanceResponse.ok) {
        const attendanceData = attendanceJson.data || {};
        console.log("attendancedata", attendanceData);

        const inUsers = attendanceData.in_users || {};
        const outUsers = attendanceData.out_users || {};
        const notInUsers = attendanceData.not_in_users || [];

        const totalIn = Object.keys(inUsers).length;
        const totalOut = Object.keys(outUsers).length;
        const totalNotIn = Array.isArray(notInUsers) ? notInUsers.length : 0;

        const totalEmployees = totalIn + totalOut + totalNotIn;

        setAttendanceStats({
          totalEmployees,
          totalPresent: totalIn,   // or totalIn + totalOut if both are "present"
          totalOut,
          totalAbsent: totalNotIn,
        });

        // setNotInUsers(notInUsers); // if you need to display this list elsewhere

        console.log("Total Employees:", totalEmployees);
        console.log("Total Present (In):", totalIn);
        console.log("Total Out:", totalOut);
        console.log("Total Absent (Not In):", totalNotIn);
      } else {
        throw new Error(attendanceJson.message || 'Something went wrong fetching attendance data');
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
    }
  };
  const currentDate = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  useEffect(() => {
    fetchTeamData()
    //  Alert.alert("welcome to the home screen")
    Orientation.lockToPortrait(); // Change to lockToLandscape() for landscape mode

    const backAction = () => {
      return false; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    getWeekDays();
    scrollToActiveItem();
    return () => backHandler.remove();
  }, []);
  const getWeekDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    const weekdays = [];

    for (let i = -2; i <= 2; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);

      weekdays.push({
        date: day.getDate(),
        day: days[day.getDay()],
        isActive: i === 0, // only today is active
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

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const renderNotifiButton = () => (
    <RNBounceable>
      <View style={styles.notificationIconContainer}>
        <Icon
          name="notifications-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.notificationIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderHeader = () => (
    <>

      <View style={{ width: ScreenWidth * 1, height: ScreenHeight * 0.1, flexDirection: "row", justifyContent: "center", alignContent: "center", }}>
        <View style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {/* <Image style={{height:110,width:110 ,marginTop:-100 ,borderRadius:100}} src={profileURI}/> */}
          <Image style={{
            height: 90, width: 90, borderColor: "white", borderWidth: 1, marginTop: -160, marginBottom: 10, borderRadius: 100, ...Platform.select({
              android: {
                elevation: 100,
                shadowColor: 'white'
              },
            }),
          }}
            resizeMode="cover"
            source={{ uri: imagesource ? imagesource : parseData["data"]?.image }}
          />
          <Text color="white" style={{ fontSize: normalizeText(20), textTransform: "capitalize", fontWeight: "800" }}>{fullname ? fullname : name}</Text>
          <View style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center", marginTop: -9 }}>
            <Image resizeMode="contain" style={{ width: 14, height: 14 }} source={require("../../assets/../assets/images/camera/verified.png")} />
            <Text color="white" style={{ fontSize: normalizeText(14) }}>Manager</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderCalendarList = () => (

    <View style={styles.calendarListContainer}>
      <View style={{ flexDirection: "row", justifyContent: "center", marginRight: 20 }}>
        {weekDays.map((item, index) => (
          <CalendarItem
            key={index}
            data={item}
            isActive={item.isActive}
            style={{ flex: 1, alignItems: "center" }} // optional inline style
          />
        ))}
      </View>
    </View>

  );
  const renderActivityCards = () => (
    <View style={{ width: ScreenWidth * 1, height: ScreenHeight * 0.2, }}>


    </View>
  );

  const renderContent = () => (
    <>
      <View style={{
        width: ScreenWidth * 1, backgroundColor: "white", height: ScreenHeight * 0.03, borderTopLeftRadius: 50, borderTopRightRadius: 50,


      }}>

      </View>
    </>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View>

          <ImageBackground style={{
            backgroundColor: "#1e3830",
            paddingTop: 80,
            paddingBottom: 30,
            zIndex: 0,
            position: "absolute",
            top: -50,
            width: ScreenWidth,
            height: ScreenHeight * 0.5,
            left: 0,
            right: 0,
          }} source={require("../../../assets/camera/loginbackground.png")}>
            {renderActivityCards()}
            {/* {renderCamera()} */}
            {renderHeader()}

            {/* {renderContent()} */}
          </ImageBackground>
          <ScrollView >
            <View style={{
              flex: 1,
              backgroundColor: "white",
              zIndex: 0, height: ScreenHeight, width: ScreenWidth,
              marginTop: ScreenWidth * 0.6, borderRadius: 25, paddingRight: 10, paddingLeft: 10
            }}>
              <View>
                <Text color="black" style={{ fontSize: 15, fontWeight: "700", color: "black", padding: 20, marginTop: 10 }}>
                  Today Attendance
                </Text>
              </View>
              {renderCalendarList()}
              <View>

                <Text color="black" style={{ fontSize: 16, fontWeight: "bold", color: "black", paddingTop: 20, paddingLeft: 20, paddingRight: 20 }} >Number of Employee</Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", padding: normalize(30) }}>
                <View style={{ backgroundColor: "#3772F3", borderRadius: 50, elevation: 20, height: ScreenWidth * 0.17, width: ScreenWidth * 0.17, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Text color="white" style={{ color: "white", fontSize: normalize(20), fontWeight: "bold" }}>
                    {attendanceStats.totalEmployees}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#16BC77", borderRadius: 50, elevation: 20, height: ScreenWidth * 0.17, width: ScreenWidth * 0.17, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Text color="white" style={{ color: "white", fontSize: normalize(20), fontWeight: "bold" }}>
                    {attendanceStats.totalPresent}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#F38F0C", elevation: 20, borderRadius: 50, height: ScreenWidth * 0.17, width: ScreenWidth * 0.17, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Text color="white" style={{ color: "white", fontSize: normalize(20), fontWeight: "bold" }}>
                    {attendanceStats.totalAbsent}
                  </Text>
                </View>
              </View>
              <View style={{ display: "flex", width: ScreenWidth * 0.98, justifyContent: "center", borderRadius: 50, flexDirection: "row", paddingLeft: 20, paddingBottom: 20, paddingRight: 20, marginRight: 40 }}>
                <TouchableOpacity onPress={() => {
                  setdatas("")
                  navigation.navigate("empduration")
                }} style={{ display: "flex", flex: 1, flexDirection: "row", backgroundColor: "#21423C", height: 39, borderRightWidth: 1, alignItems: "center", alignContent: "center", justifyContent: "center", borderRightColor: "white", borderTopLeftRadius: 50, borderBottomLeftRadius: 50, }}>
                  <Text color="white" style={{ color: "white", fontSize: normalize(12), fontWeight: "600" }}>
                    Total
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setdatas("present")
                  navigation.navigate("empduration")
                }} style={{ display: "flex", flex: 1, flexDirection: "row", backgroundColor: "#21423C", height: 39, borderRightWidth: 1, alignItems: "center", alignContent: "center", justifyContent: "center", borderRightColor: "white" }}>
                  <Text color="white" style={{ color: "white", fontSize: normalizeText(12), fontWeight: "600" }}>
                    Present
                  </Text>
                </TouchableOpacity  >
                <TouchableOpacity onPress={() => {
                  setdatas("absent")
                  navigation.navigate("empduration")
                }} style={{ display: "flex", flex: 1, flexDirection: "row", borderTopRightRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#21423C", height: 39, borderRightWidth: 1, alignItems: "center", alignContent: "center", justifyContent: "center", borderRightColor: "white" }}>
                  <Text color="white" style={{ color: "white", fontSize: normalizeText(12), fontWeight: "600" }}>
                    Absent
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text color="black" style={{ fontSize: 15, fontWeight: "700", color: "black", padding: 20 }}>
                  Leave  Management
                </Text>
              </View>
              <View style={{ backgroundColor: "white", marginTop: 10, borderRadius: 10, paddingRight: 20, height: 100, width: ScreenWidth, }}>
                <View style={{ backgroundColor: "#21423C", borderRadius: 10, height: 110, paddingLeft: 15, marginBottom: 10 }}>
                  <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: 15 }}>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text color="white" style={{ fontSize: normalize(16), fontWeight: "600" }}> Leave Management </Text>
                      <TouchableOpacity onPress={() => {
                        navigation.navigate("LEAVEREQUESTS")
                      }} style={{ backgroundColor: "white", padding: 3, borderRadius: 50 }}>
                        <Image style={{ width: 18, height: 18 }} source={require("../../../assets/camera/right-chevron.png")} />
                      </TouchableOpacity>
                    </View>
                    <View style={{ display: "flex", flexDirection: "column", }}>
                      <View style={{ display: "flex", flexDirection: "row", marginTop: 30 }}>
                        <Text style={{ backgroundColor: "white", height: 2.8, width: ScreenWidth * 0.4 }}></Text>
                        <Text style={{ backgroundColor: "#232625", height: 2.8, width: ScreenWidth * 0.25 }}></Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View>
                  <Text color="black" style={{ fontSize: 15, fontWeight: "700", color: "black", padding: 20 }}>
                    Check Attendance Sheet
                  </Text>
                </View>
                <TouchableOpacity onPress={handleNavigateToTermss} style={{ marginBottom: 10, backgroundColor: "#F9FFFC", flexDirection: "column", justifyContent: "center", elevation: 2, borderRadius: 10, height: 100, paddingLeft: 15, marginTop: 10, borderLeftColor: "#16BC77", borderLeftWidth: 10 }}>
                  <View>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Image style={{ width: 18, height: 18 }} source={require("../../assets/images/camera/profile.png")} />
                        <Text color="black" style={{ fontWeight: "bold" }}>Attendance</Text>
                      </View>
                      <View style={{ backgroundColor: "#21423C", padding: 5, borderRadius: 50, margin: 10 }}>
                        <Image style={{ width: 18, height: 18 }} source={require("../../assets/images/camera/next.png")} />
                      </View>

                    </View>

                  </View>
                  <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", }}>


                    <View style={{ display: "flex", flexDirection: "row", margin: 10 }}>
                      <Text style={{ backgroundColor: "#21423C", borderTopLeftRadius: 50, borderBottomLeftRadius: 50, height: ScreenWidth * 0.01, width: ScreenWidth * 0.4 }}></Text>
                      <Text style={{ borderTopRightRadius: 50, borderBottomRightRadius: 50, backgroundColor: "#EBEBEB", height: ScreenWidth * 0.01, width: ScreenWidth * 0.4 }}></Text>
                    </View>
                  </View>
                  <View style={{ display: "flex", flexDirection: "row", gap: 80, alignItems: "center", }}>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ height: 8, width: 8, backgroundColor: "#21423C", borderRadius: 50 }}></Text>
                      <Text color="black" style={{ fontWeight: "bold", margin: 10, fontSize: 13 }}>{currentMonth}{" "}{currentYear}</Text>
                    </View>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ height: 8, width: 8, backgroundColor: "#EBEBEB", borderRadius: 50 }}></Text>
                      <Text color="black" style={{ fontWeight: "bold", margin: 10, fontSize: 13 }}>{currentMonth}{" "}{currentYear}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </View>

        {isOpen && (
          <AwesomeCamera
            setIsOpen={handleSetIsOpen}
            getData={(data) => {
              console.log(data);
            }}
          />
        )}
      </SafeAreaView>
    </>
  );
};

export default AdminHomeScreen;
