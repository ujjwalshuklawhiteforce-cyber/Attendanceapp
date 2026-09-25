
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, FlatList, Image, ImageBackground, ScrollView, View, StyleProp, Platform, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import createStyles from "./AdminHomeScreen.style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TodayData from "./mock/TodayData";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { StackActions, useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import CalendarItem from "./components/calendar-item/CalendarItem";
import TodayAttendance from "./components/today-attendance/TodayAttendance";
import ActivityData from "./mock/ActivityData";
import ActivityCard from "./components/activity-item/ActivityCard";
import SlideButton from "rn-slide-button";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import {
  requestCalendarPermission,
  requestCameraPermission,
  requestLocationPermission,
} from "@services/event-emitter/permission";
import AdminAttendanceSheet from "@screens/attendancesheet/AdminAttendanceSheet";
import { useAuth } from "context/AuthContext";
import { getLocationName } from "@services/global.service";
import GetLocation from "react-native-get-location";
import * as NavigationService from "react-navigation-helpers";
import { SCREENS } from "@shared-constants";
import AwesomeCamera from "@shared-components/camera/CameraCapture";
import { imag } from "@tensorflow/tfjs";
import { useNavigation } from "@react-navigation/native";
import { normalize } from "@rneui/themed";
import { normalizeText } from "@rneui/base";
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";
const profileURI = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
// eslint-disable-next-line max-len
// "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80";
const AdminAttendancesheetlist: React.FC = () => {
  const { userInfo, setdata, isdata } = useAuth();
  const parseData = JSON.parse(userInfo ? userInfo : "{}");
  const data = JSON.parse(userInfo ? userInfo : "{}");

  const imagesource = data.data?.data?.image;

  const fullname = parseData.data?.data?.name;
  const name = parseData["data"]?.name;
  const user_ids = parseData["data"].user_id;
  const clientid = parseData["data"].client_id;
  const client_id = parseData["data"].client_id ? parseData.data?.data?.client_id : parseData.data?.client_id;
  const userid = parseData?.data?.data?.user_id;
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekDays, setWeekDays] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<{ name: string; user_id: number } | null>(null);
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");
  const [navigating, setNavigating] = useState(false);

  const flatListRef = useRef<any>(null);
  const users = {
    user_id: userid ? userid : user_ids,
    name: fullname
  }
  // const [imageSource, setImageSource] = useState('');

  const borderColors = ["#F38F0C", "#16BC77", "#0F58B9", "#D91172", "#2A2C3A"];

  const [isOpen, setIsOpen] = useState(false);

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
  };
  // const handleNavigateToTermss = () => {
  //   navigation.navigate("atlist");
  // };
  const handleUserSelect = (user) => {
    setSelectedUser({ name: user.name, user_id: user.user_id });
    user ? setIsOpen(true) : setIsOpen(false);
    NavigationService.navigationRef.current?.dispatch(StackActions.push('adminsheetlist'));
  };

  /** Navigate to employee sheet with brief loader */
  const handleEmployeePress = (member: any) => {
    setNavigating(true);
    setdata(member);
    setTimeout(() => {
      setNavigating(false);
      NavigationService.navigationRef.current?.dispatch(StackActions.push('adminsheetlist'));
    }, 400);
  };
  useEffect(() => {
    fetchTeamData();
    getWeekDays();
    scrollToActiveItem();

    const onBackPress = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => backHandler.remove();
  }, [navigation]);
  const fetchTeamData = async () => {
    try {
      const response = await fetch('https://whiteforcepayroll.com/admin/api/get-employee-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: isdata,
        }),
      });

      const json = await response.json();
      if (response.ok && json.status) {
        const employees = json.data?.employees || [];
        setTeamData(employees);
        await AsyncStorage.setItem('myDataKey', JSON.stringify(employees));
      } else {
        throw new Error(json.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkIsPresent = (member: any) => {
    const s = String(member?.status || "").trim().toUpperCase();
    return s === "P" || s === "PRESENT";
  };

  const presentCount = useMemo(() => {
    return teamData.filter((member: any) => checkIsPresent(member)).length;
  }, [teamData]);

  const absentCount = useMemo(() => {
    return teamData.length - presentCount;
  }, [teamData, presentCount]);

  const filteredData = useMemo(() => {
    return teamData.filter((member: any) => {
      const rawName = (member?.name || "").trim().toLowerCase();
      const rawCode = (member?.user_regcode || "").trim().toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = query
        ? rawName.includes(query) || rawCode.includes(query)
        : true;

      const isPresent = checkIsPresent(member);
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PRESENT"
          ? isPresent
          : !isPresent;

      return matchesSearch && matchesStatus;
    });
  }, [teamData, searchQuery, statusFilter]);

  // const handlePermission = async () => {
  //   if (
  //     (await requestCameraPermission()) &&
  //     (await requestLocationPermission()) &&
  //     (await requestCalendarPermission())
  //   ) {
  //     // cam(true);
  //   } else {
  //     // setIsCameraVisible(false);
  //   }
  // };

  // const getWeekDays = () => {
  //   const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  //   const today = new Date();

  //   // Get the first day (Sunday) of the current week
  //   const firstDayOfWeek = new Date(today);
  //   firstDayOfWeek.setDate(today.getDate() - today.getDay());

  //   const weekdays = [];

  //   for (let i = 0; i < 7; i++) {
  //     const currentDay = new Date(firstDayOfWeek);
  //     currentDay.setDate(firstDayOfWeek.getDate() + i);

  //     const dayName = days[currentDay.getDay()];
  //     const dayDate = currentDay.getDate(); // Get only the date
  //     const isActive = currentDay.getDay() === today.getDay(); // Mark the current weekday as active

  //     weekdays.push({
  //       date: dayDate,
  //       day: dayName,
  //       isActive: isActive || false,
  //     });
  //   }
  //   setWeekDays(weekdays);
  // };
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
            height: 90, width: 90, borderColor: "white", borderWidth: 1, marginTop: -200, marginBottom: 10, borderRadius: 100, ...Platform.select({
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
            <Image resizeMode="contain" style={{ width: 10, height: 14 }} source={require("../../assets/../assets/images/camera/verified.png")} />
            <Text color="white" style={{ fontSize: normalizeText(13) }}>Admin</Text>
          </View>
          <View style={{}}>
            <TouchableOpacity onPress={() => {
              handleUserSelect(users)
            }} style={{ backgroundColor: "#C3C3C3", alignItems: "center", height: ScreenHeight * 0.038, width: ScreenWidth * 0.5, justifyContent: "center", gap: 10, display: "flex", flexDirection: "row", borderRadius: ScreenWidth * 1 }}>
              <Image style={{ width: 20, height: 20 }} source={require("../../assets/../assets/images/camera/chatting.png")} />
              <Text color="black" style={{ color: "black", fontWeight: "700", textTransform: "capitalize", fontSize: 14 }}>your Attendance </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </>
  );


  const renderActivityCards = () => (
    <View style={{ width: ScreenWidth * 1, height: ScreenHeight * 0.2, }}>


    </View>

  );

  return (
    <>
      {/* ---------------- Navigation Loader Overlay ---------------- */}
      <Modal transparent visible={navigating} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(30,56,48,0.55)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 30,
              alignItems: "center",
              gap: 14,
              elevation: 10,
            }}
          >
            <ActivityIndicator size="large" color="#1e3830" />
            <Text color="#1e3830" style={{ fontSize: 14, fontWeight: "600" }}>
              Loading...
            </Text>
          </View>
        </View>
      </Modal>

      {isOpen ? (
        <View style={{}}>
          <AdminAttendanceSheet
            isActive={selectedUser?.user_id}
            name={selectedUser?.name}
          />
        </View>
      ) : null}
      <SafeAreaView style={styles.container}>
        {/* ---------------- Back Arrow Button ---------------- */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 50 : 20,
            left: 16,
            zIndex: 999,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.22)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="arrow-back"
            type={IconType.Ionicons}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <View>

          <ImageBackground style={{
            backgroundColor: "#1e3830",
            paddingTop: 80,
            paddingBottom: 30,
            // zIndex: 1,
            position: "absolute",
            // position:"relative",
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
          <ScrollView contentContainerStyle={{ flexGrow: 1, }}>
            <View
              style={{
                backgroundColor: "white",
                zIndex: 99,
                width: ScreenWidth,
                marginTop: ScreenWidth * 0.6,
                borderRadius: 25,
                paddingRight: 10,
                paddingLeft: 10,
                paddingBottom: 20, // Optional, to add space at the bottom
              }}
            >
              <View style={{ width: "100%", flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
                <TextInput
                  style={{
                    marginBottom: 14,
                    backgroundColor: "#1e3830",
                    minWidth: ScreenWidth * 0.60,
                    width: ScreenWidth * 0.85,
                    height: 43,
                    paddingRight: 45,
                    paddingLeft: 20,
                    color: "white",
                    position: "relative",
                    borderRadius: 50,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={"rgba(255,255,255,0.65)"}
                  autoCapitalize="none"
                />
                <View style={{ position: "absolute", top: 13, right: 50 }}>
                  <Image style={{ width: 18, height: 18 }} source={require("../../assets/../assets/images/camera/searchbutton.png")} />
                </View>
              </View>

              {/* Status Filter Tabs (All / Present / Absent) */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                {/* All */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setStatusFilter("ALL")}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 7,
                    paddingHorizontal: 8,
                    borderRadius: 20,
                    backgroundColor: statusFilter === "ALL" ? "#1e3830" : "#F0F4F2",
                    borderWidth: 1,
                    borderColor: statusFilter === "ALL" ? "#1e3830" : "#D1DDD6",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: statusFilter === "ALL" ? "#FFFFFF" : "#555555",
                    }}
                  >
                    All
                  </Text>
                  <View
                    style={{
                      backgroundColor: statusFilter === "ALL" ? "rgba(255,255,255,0.25)" : "#E0E8E3",
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 10,
                      minWidth: 20,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: statusFilter === "ALL" ? "#FFFFFF" : "#555555",
                      }}
                    >
                      {teamData.length}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Present */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setStatusFilter("PRESENT")}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 7,
                    paddingHorizontal: 8,
                    borderRadius: 20,
                    backgroundColor: statusFilter === "PRESENT" ? "#16BC77" : "#F0F4F2",
                    borderWidth: 1,
                    borderColor: statusFilter === "PRESENT" ? "#16BC77" : "#D1DDD6",
                    gap: 5,
                  }}
                >
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: statusFilter === "PRESENT" ? "#FFFFFF" : "#16BC77",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: statusFilter === "PRESENT" ? "#FFFFFF" : "#16BC77",
                    }}
                  >
                    Present
                  </Text>
                  <View
                    style={{
                      backgroundColor: statusFilter === "PRESENT" ? "rgba(255,255,255,0.3)" : "#E0E8E3",
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 10,
                      minWidth: 20,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: statusFilter === "PRESENT" ? "#FFFFFF" : "#16BC77",
                      }}
                    >
                      {presentCount}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Absent */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setStatusFilter("ABSENT")}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 7,
                    paddingHorizontal: 8,
                    borderRadius: 20,
                    backgroundColor: statusFilter === "ABSENT" ? "#FF4444" : "#F0F4F2",
                    borderWidth: 1,
                    borderColor: statusFilter === "ABSENT" ? "#FF4444" : "#D1DDD6",
                    gap: 5,
                  }}
                >
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: statusFilter === "ABSENT" ? "#FFFFFF" : "#FF4444",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: statusFilter === "ABSENT" ? "#FFFFFF" : "#FF4444",
                    }}
                  >
                    Absent
                  </Text>
                  <View
                    style={{
                      backgroundColor: statusFilter === "ABSENT" ? "rgba(255,255,255,0.3)" : "#E0E8E3",
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 10,
                      minWidth: 20,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: statusFilter === "ABSENT" ? "#FFFFFF" : "#FF4444",
                      }}
                    >
                      {absentCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                <Text color="black" style={{ fontSize: 17, margin: 10, color: "black", fontWeight: "bold" }}>
                  Attendance Team List
                </Text>
                <TouchableOpacity onPress={() => {

                  navigation.navigate("atlist")
                }} style={{ margin: 10 }}>
                  <Image style={{ width: 20, height: 20 }} source={require("../../assets/../assets/images/camera/available.png")} />
                  {/* <Text color="black" style={{color:"black", fontWeight:"700", textTransform:"capitalize", fontSize:14}}>your Attendance </Text> */}
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#1e3830" />
                  <Text color="#1e3830" style={{ marginTop: 10, fontSize: 13 }}>
                    Loading employees...
                  </Text>
                </View>
              ) : filteredData.length === 0 ? (
                <View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <Text color="#999" style={{ fontSize: 14 }}>
                    {searchQuery
                      ? "No employees match your search."
                      : statusFilter === "PRESENT"
                      ? "No present employees found."
                      : statusFilter === "ABSENT"
                      ? "No absent employees found."
                      : "No employees found."}
                  </Text>
                </View>
              ) : (
                 filteredData.map((member, index) => {
                  const rawName = (member.name || "").trim();
                  const displayName = rawName.length > 22 ? `${rawName.slice(0, 22)}...` : rawName;
                  const rawCode = (member.user_regcode || "");
                  const displayCode = rawCode.length > 20 ? rawCode.slice(0, 20) + "..." : rawCode;
                  const isPresent = checkIsPresent(member);
                  const statusBgColor = isPresent ? "#16BC77" : "#FF4444";
                  const statusLabel = isPresent ? "P" : "A";
                  const statusText = isPresent ? "Present" : "Absent";
                  return (
                    <TouchableOpacity 
                      key={member.user_id}
                      activeOpacity={0.75}
                      onPress={() => handleEmployeePress(member)}
                      style={{
                        backgroundColor: "#F9FFFC",
                        flexDirection: "column",
                        justifyContent: "center",
                        elevation: 2,
                        borderRadius: 10,
                        margin: 10,
                        height: 80,
                        paddingLeft: 15,
                        borderLeftColor: borderColors[index % borderColors.length],
                        borderLeftWidth: 10,
                        paddingRight: 15,
                        paddingVertical: 10,
                        marginBottom: 25,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 20, flex: 1 }}>
                          <Image
                            style={{ width: 50, height: 50, borderRadius: 50, marginRight: 8 }}
                            source={{ uri: member.image || "https://t4.ftcdn.net/jpg/11/28/72/75/360_F_1128727502_ce2UdfqSn42Ia48OeSy7a6UBX590HZnJ.jpg" }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              color="black"
                              style={{ textTransform: "capitalize", fontWeight: "bold", fontSize: 14 }}
                              numberOfLines={1}
                            >
                              {displayName}
                            </Text>
                            <Text
                              style={{ fontSize: 13, color: borderColors[index % borderColors.length] }}
                              numberOfLines={1}
                            >
                              {displayCode}
                            </Text>
                          </View>
                        </View>
                        {/* Status Badge */}
                        <View style={{ alignItems: "center", gap: 4 }}>
                          <View
                            style={{
                              backgroundColor: statusBgColor,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 20,
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 70,
                            }}
                          >
                            <Text
                              color="white"
                              style={{ fontSize: 12, fontWeight: "700", color: "white", letterSpacing: 0.5 }}
                            >
                              {statusLabel} · {statusText}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>

        </View>
        {/* 
    {isOpen? (
        // <AwesomeCamera
        //   setIsOpen={handleSetIsOpen}
        //   getData={(data) => {
        //     console.log(data);
        //   }}
       
        // />
       <View style={{}}>
        <AdminAttendanceSheet 
  isActive={selectedUser ? selectedUser : null} 
  name={selectedUser ? selectedUser.name : "efw"} 
/>
       </View>
      ):null} */}
      </SafeAreaView>
    </>
  );
};

export default AdminAttendancesheetlist;
