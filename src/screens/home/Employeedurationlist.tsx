
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, FlatList, Image, ImageBackground, ScrollView, View, StyleProp ,Platform  ,TextInput, Alert} from 'react-native';
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
const profileURI ="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  // eslint-disable-next-line max-len
  // "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80";
const Employeedurationlist: React.FC = () => {
    const { userInfo,setdata, isdatas } = useAuth();
    const parseData = JSON.parse(userInfo ? userInfo : {});
    const data= JSON.parse(userInfo? userInfo:{});

    const imagesource=data.data?.data?.image;
  
  const fullname=parseData.data?.data?.name;
  const name=parseData["data"]?.name;
    const  user_ids=parseData["data"].user_id ;
    const clientid=parseData["data"].client_id;
    const client_id=parseData.data?.data?.client_id;
  const userid=parseData?.data?.data?.user_id;
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

  const flatListRef = useRef<any>(null);
 const users={
  user_id:userid?userid:user_ids,
  name:fullname
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
   
// Alert.alert("FESrffefres",users.name)
    // Set the selected user state
    setSelectedUser({ name: user.name, user_id: user.user_id });
    user?setIsOpen(true):setIsOpen(false)
NavigationService.navigationRef.current?.dispatch(StackActions.push('adminsheetlist'));

  };
  useEffect(() => {
   fetchTeamData()
   
// console.log("GGTrd", parseData)
    getWeekDays();
    scrollToActiveItem();
    // return () => backHandler.remove();
  }, []);
  const fetchTeamData = async () => {
    try {
      const response = await fetch('https://whiteforcepayroll.com/admin/api/manager-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manager_id: userid?userid:user_ids,
          client_id: clientid?clientid:client_id,
        }),
      });

      const json = await response.json();
// console.log("teamdata",json.data)
      if (response.ok) {
        setTeamData(json.data || []);
        console.log("dsfdadaewrw",json.data)
        await AsyncStorage.setItem('myDataKey', JSON.stringify(json.data));
        const value = await AsyncStorage.getItem('myDataKey');
        // console.log("greeeeeeeeeeeeeeeeeeeee",value)
      } else {
        throw new Error(json.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = searchQuery
    ? teamData.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teamData;
  
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

<View style={{width:ScreenWidth*1, height:ScreenHeight*0.1 ,flexDirection:"row", justifyContent:"center" ,alignContent:"center", }}> 
<View style={{display:"flex", flexDirection:"column", alignItems:"center",gap:10}}>
{/* <Image style={{height:110,width:110 ,marginTop:-100 ,borderRadius:100}} src={profileURI}/> */}
<Image  style={{height:90,width:90 ,borderColor:"white", borderWidth:1,marginTop:-200 , marginBottom:10,borderRadius:100, ...Platform.select({
      android: {
        elevation: 100,
        shadowColor:'white'
      },
    }),}}
              resizeMode="cover"
              source={{ uri:imagesource?imagesource: parseData["data"]?.image }}
            />
<Text color="white" style={{fontSize:normalizeText(20), textTransform:"capitalize", fontWeight:"800"}}>{fullname?fullname:name}</Text>
            <View style={{display:"flex", flexDirection:"row",gap:8, alignItems:"center", marginTop:-9}}>
            <Image  style={{width:10,height:14}} source={require("../../assets/../assets/images/camera/verified.png")} />
            <Text color="white" style={{fontSize:normalizeText(13)}}>Sales Manger</Text>  
              </View>  
             {/* <View style={{zIndex:1}}>
             <TouchableOpacity   onPress={()=>{

                // handleUserSelect(users) 
            }} style={{backgroundColor:"#C3C3C3" , alignItems:"center",  height:ScreenHeight*0.038, width:ScreenWidth*0.5, justifyContent:"center", gap:10, display:"flex", flexDirection:"row",borderRadius:ScreenWidth*1}}>
                      <Image style={{width:20,height:20}} source={require("../../assets/../assets/images/camera/chatting.png")} />
                     <Text color="black" style={{color:"black", fontWeight:"700", textTransform:"capitalize", fontSize:14}}>your Attendance </Text>
                    </TouchableOpacity>  
              </View>              */}
</View> 
</View>
      {/* <View style={styles.header}>
        <View style={styles.profileDetailContainer}>
          <RNBounceable
            onPress={() => {
              NavigationService.navigate(SCREENS.PROFILE);
            }}
          >
            <Image
              resizeMode="cover"
              source={{ uri: profileURI }}
              style={styles.profilePicImageStyle}
            />
          </RNBounceable>
          <View style={styles.profileInfo}>
            <Text color={colors.titleSecond} style={styles.profileInfoTitle}>
              {/* {capitalizeEachWord()} */}
              {/* {parseData["data"]?.name}
            </Text>
            {addressLoading == true ? (
              <Text
                color={colors.subtitleSecond}
                style={styles.profileInfoSubTitle}
              >
                Loading Address...
              </Text>
            ) : (
              <Text
                color={colors.subtitleSecond}
                style={styles.profileInfoSubTitle}
              >
                {locationName}
              </Text>
            )}
            <View>
          <Text>
            heekooo
          </Text>
        </View>
          </View>
        </View> */}
        {/* {renderNotifiButton()}
      </View> */} 
      
      {/* {renderCalendarList()} */}
    </>
  );

  const renderCalendarList = () => (

    <View style={styles.calendarListContainer}>
      
      {/* <FlatList
  ref={flatListRef}
  style={styles.calendarListFlatlist}
  horizontal
  data={weekDays}
  showsHorizontalScrollIndicator={false}
  keyExtractor={(_item, index) => index.toString()}
  initialScrollIndex={1} // middle item (today)

  renderItem={({ item }) => (
    <CalendarItem
      style={{ backgroundColor: "red" }}
      data={item}
      isActive={item.isActive}
      key={item.date}
    />
  )}
/> */}
<View style={{flexDirection:"row", justifyContent:"center"  ,marginRight:20}}>
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

  // const renderTodayCards = () => (
  //   <View style={[styles.attendanceContent, styles.scrollViewHeight]}>
  //     <View style={styles.attendanceContentTotalAttSec}>
  //       <Text
  //         color={colors.titleSecond}
  //         style={styles.attendanceContentTotalAttTitle}
  //       >
  //         Total Attendance
  //       </Text>
  //       <View style={styles.attendanceCardsContainer}>
  //         {TodayData.map((data) => (
  //           <TodayAttendance key={data.id} data={data}></TodayAttendance>
  //         ))}
  //       </View>
  //     </View>
  //     {renderActivityCards()}
  //   </View>
  // );

  const renderActivityCards = () => (
    <View style={{width:ScreenWidth*1 ,height:ScreenHeight*0.2 ,}}>


      </View>
    // <View style={styles.activityContent}>
    //   <View style={styles.activityContentContainer}>
    //     <Text
    //       color={colors.titleSecond}
    //       style={styles.attendanceContentTotalAttTitle}
    //     >
    //       Your Today's Activity
    //     </Text>
    //     <View style={styles.activityContentCardsContainer}>
    //       {ActivityData.map((data) => (
    //         <ActivityCard key={data.id} data={data}></ActivityCard>
    //       ))}
    //     </View>
    //   </View>
    // </View>
  );

  const renderContent = () => (
    <>
    <View style={{ width:ScreenWidth*1, backgroundColor:"white" , height:ScreenHeight*0.03 , borderTopLeftRadius:50, borderTopRightRadius:50,
    

    }}>

    </View>
      {/* <ScrollView>{renderTodayCards()}</ScrollView> */}
      {/* <View style={styles.renderContent}>
        <Text>
          <SlideButton
            width={ScreenWidth * 0.8}
            borderRadius={ScreenWidth * 0.048}
            thumbStyle={styles.slideButton}
            containerStyle={styles.slideContainer}
            autoReset={true}
            animation={true}
            icon={
              <Icon
                name="arrow-forward-outline"
                type={IconType.Ionicons}
                color={colors.primary}
                style={styles.notificationIcon}
              />
            }
            onSlideStart={() => {}}
            onSlideEnd={async () => {
              await handlePermission();
              // setIsCameraVisible(true);
              setShowCamera(true);
              handleSetIsOpen(true)
            }}
            title="Swipe to Check In"
          />
        </Text>
      </View> */}
    </>
  );

  return (
    
    <>
    {  isOpen?(<View style={{}}>
                <AdminAttendanceSheet 
              isActive={selectedUser?.user_id}
              name={selectedUser?.name}
              />
             </View>
             
            ):null}
      <SafeAreaView style={styles.container}>
    <View>
      
    <ImageBackground style={{ backgroundColor: "#1e3830",
      paddingTop: 80,
      paddingBottom: 30,
      zIndex: 0,
      position: "absolute",
      top: -50,
      width:ScreenWidth,
      height:ScreenHeight*0.5,
      left: 0,
      right: 0, }} source={require("../../../assets/camera/loginbackground.png")}> 
      {renderActivityCards()}
        {/* {renderCamera()} */}
        {renderHeader()}
       
        {/* {renderContent()} */}
        </ImageBackground>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
  <View
    style={{
      backgroundColor: "white",
      zIndex: 0,
      width: ScreenWidth,
      marginTop: ScreenWidth * 0.6,
      borderRadius: 25,
      paddingRight: 10,
      paddingLeft: 10,
      paddingBottom: 20, // Optional, to add space at the bottom
    }}
  >
    {/* <View style={{ width: "100%", flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
      <TextInput
        style={{
          marginBottom: 25,
          backgroundColor: "#1e3830",
          minWidth: ScreenWidth * 0.60,
          width: ScreenWidth * 0.85,
          height: 43,
          paddingRight: 45,
          paddingLeft: 20,
          color: "White",
          position: "relative",
          borderRadius: 50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={"wh"}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={{ position: "absolute", top: 15, right: 50 }}>
        <Image style={{ width: 18, height: 18 }} source={require("../../assets/../assets/images/camera/searchbutton.png")} />
      </View>
    </View> */}
<View>
    <Text color="black" style={{textTransform:"capitalize" ,color:"black" ,fontSize:18, fontWeight:"bold", marginTop:20}}>
        Total {isdatas} Employee list
    </Text>
</View>
    <View>
      <Text color="black" style={{ fontSize: 17, margin: 10, color: "black", fontWeight: "bold" }}>
      
      </Text>
    </View>

    {filteredData.map((member, index) => (
      <View
        key={member.user_id}
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <View>
              <Image
                style={{ width: 50, height: 50, borderRadius: 50, marginRight: 8 }}
                source={{ uri: member.image || "https://t4.ftcdn.net/jpg/11/28/72/75/360_F_1128727502_ce2UdfqSn42Ia48OeSy7a6UBX590HZnJ.jpg" }}
              />
            </View>
            <View>
              <Text color="black" style={{ textTransform: "capitalize", fontWeight: "bold", fontSize: 14 }}>
                {member.name}
              </Text>
              <Text style={{ fontSize: 13, color: borderColors[index % borderColors.length] }}>
                {member.email.length > 20 ? member.email.slice(0, 20) + "..." : member.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPressIn={() => {
              // handleUserSelect(member);
              // setSelectedUser({ name: user.name, user_id: user.user_id });
    // user?setIsOpen(true):setIsOpen(false)
    setdata(member)
NavigationService.navigationRef.current?.dispatch(StackActions.push('adminsheetlist'));
            }}
            style={{
              backgroundColor: borderColors[index % borderColors.length],
              padding: 5,
              borderRadius: 50,
            }}
          >
            <Image style={{ width: 20, height: 20 }} source={require("../../assets/images/camera/next.png")} />
          </TouchableOpacity>
        </View>
      </View>
    ))}
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

export default Employeedurationlist;
