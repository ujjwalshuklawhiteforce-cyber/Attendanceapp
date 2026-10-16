import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { isReadyRef, navigationRef } from "react-navigation-helpers";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import NetInfo from "@react-native-community/netinfo";

// Screens
import HomeScreen from "@screens/home/HomeScreen";
import ProfileScreen from "@screens/profile/ProfileScreen";
import LeaveDetailScreen from "@screens/leavedetail/LeaveDetailScreen";
import Appss from "@screens/task/Tasklist";
import LoginScreen from "@screens/login/LoginScreen";
import OnboardingScreen from "@screens/obboarding/OnboardingScreen";
import TeamMemberDetailScreen from "@screens/teamMemberDetail/TeamMemberDetailScreen";
import AddTeamMemberScreen from "@screens/addteammember/AddTeamMemberScreen";
import { useAuth } from "context/AuthContext";
import AddTaskScreen from "@screens/addTask/AddTaskScreen";
import AttendanceSheet from "@screens/attendancesheet/AttendanceSheet";
import PaymentSlip from "@screens/payementslip/PaymentSlip";
import TermsAndConditions from "@screens/servicescreen/Terms&Condition";
import PrivacyandPolicy from "@screens/servicescreen/Privacy&policy";
import ChangePassword from "@screens/passwordsecurity/ChangePassword";
import ProfileEditFormScreen from "@screens/profile/ProfileEditFormPage";
import { SCREENS } from "@shared-constants";
import { LightTheme } from "@theme/themes";
import { ScreenWidth } from "@freakycoder/react-native-helpers";
import TaskCreator from "@screens/addTask/CreateTask";
import AdminHomeScreen from "@screens/home/AdminHomeScreen";
import AttendanceSummaryScreen from "@screens/home/Adminattendancelist";
import AdminAttendanceSheet from "@screens/attendancesheet/AdminAttendanceSheet";
import Employeedurationlist from "@screens/home/Employeedurationlist";
import MapWithRoute from "@screens/attendancesheet/Mapview/mapview";
import AdminAttendanceClientlist from "@screens/home/Clientlist/Clientlist";
import VideoPlayerFullScreen from "@screens/home/components/Video refrence/Videorefrence";
import FaceMatchScreen from "@shared-components/registercamera/Registerface";
import LeaveRecordsScreen from "@screens/leaves/Leaverecordscreen";
import LeaveRequestsScreen from "@screens/leaves/Leaveapproval";
import TeamScreen from "@screens/team/TeamScreen";
import EmployeeAllowanceForm from "./Allowance/Allowance";
import NetworkStatusBar from "../../networkconnectivity";
import PasswordRecoveryScreen from "@screens/login/ForgotPassword/ForgotPassword";
import AttendanceRegularizationScreen from "@screens/Rgularisation/Regualrisation";
import CompOffAccrualScreen from "@screens/comoff/Compoff";
import Allotedteam from ".././screens/home/Allotedteam/Allotedteam"
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const horizontalAnimation: any = {
  cardStyleInterpolator: ({ current, layouts }: any) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
    },
  }),
};

// Custom hook for responsive tab bar configuration
const useResponsiveTabBar = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 414;

  const baseTabBarHeight = isSmallDevice ? 60 : isMediumDevice ? 65 : 70;
  const common = {
    tabBarHeight: baseTabBarHeight + insets.bottom,
    bottomPadding: insets.bottom > 0 ? insets.bottom : 8,
    insets,
  };

  if (isSmallDevice) {
    return {
      ...common,
      iconSize: 20,
      fontSize: 9,
      showLabels: false,
      horizontalPadding: width * 0.02,
      activeLineWidth: width * 0.12,
      activeBackgroundWidth: width * 0.12,
    };
  }

  if (isMediumDevice) {
    return {
      ...common,
      iconSize: 22,
      fontSize: 10,
      showLabels: true,
      horizontalPadding: width * 0.03,
      activeLineWidth: width * 0.15,
      activeBackgroundWidth: width * 0.15,
    };
  }

  return {
    ...common,
    iconSize: 24,
    fontSize: 11,
    showLabels: true,
    horizontalPadding: width * 0.036,
    activeLineWidth: width * 0.18,
    activeBackgroundWidth: width * 0.18,
  };
};

/**
 * Tab navigator ab top-level component hai.
 * Pehle `renderTabNavigation` NavigationContent ke andar tha, to har render par
 * naya component type ban ta tha aur poora tab tree remount hota tha.
 */
const MainTabs = () => {
  const { isAdmin } = useAuth();
  const responsiveConfig = useResponsiveTabBar();

  const renderTabIcon = (route: any, focused: boolean, color: string) => {
    let iconName = "home";
    switch (route.name) {
      case SCREENS.HOME:
        iconName = focused ? "home" : "home-outline";
        break;
      case SCREENS.NOTIFICATION:
        iconName = focused ? "notifications" : "clipboard-list";
        break;
      case "ATTENDANCE":
        iconName = focused ? "calendar" : "calendar-outline";
        break;
      case SCREENS.TEAM:
        iconName = focused ? "people" : "people-outline";
        break;
      case "PAYSLIP":
        iconName = focused ? "receipt" : "receipt-outline";
        break;
      case SCREENS.PROFILE:
        iconName = focused ? "person" : "person-outline";
        break;
      default:
        iconName = focused ? "home" : "home-outline";
        break;
    }
    return (
      <View style={styles.iconContainer}>
        {focused && (
          <View
            style={[
              styles.isActiveLine,
              { width: responsiveConfig.activeLineWidth },
            ]}
          />
        )}
        {focused && (
          <View
            style={[
              styles.isActive,
              { width: responsiveConfig.activeBackgroundWidth },
            ]}
          />
        )}
        <Icon
          name={iconName}
          type={IconType.Ionicons}
          size={responsiveConfig.iconSize}
          color={color}
          style={{ zIndex: 99 }}
        />
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }: any) =>
          renderTabIcon(route, focused, color),
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        tabBarShowLabel: responsiveConfig.showLabels,
        tabBarLabelStyle: {
          fontSize: responsiveConfig.fontSize,
          fontWeight: "600",
          marginTop: -2,
          marginBottom: 2,
        },
        tabBarStyle: {
          height: responsiveConfig.tabBarHeight,
          position: "relative",
          paddingHorizontal: responsiveConfig.horizontalPadding,
          paddingTop: 8,
          paddingBottom: responsiveConfig.bottomPadding,
          backgroundColor: "rgb(29,91,65)",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          paddingBottom:
            Platform.OS === "ios" && responsiveConfig.insets.bottom > 0 ? 0 : 4,
        },
      })}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="ATTENDANCE"
        component={isAdmin ? AdminHomeScreen : AttendanceSheet}
        options={{ tabBarLabel: "Attendance" }}
      />
      <Tab.Screen
        name="PAYSLIP"
        component={PaymentSlip}
        options={{ tabBarLabel: "Payslip" }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const NavigationContent = () => {
  const { isLoggedIn, isOnboarded, isLoading } = useAuth();

  useEffect(() => {
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgb(29,91,65)" />
      </SafeAreaView>
    );
  }

  const logCurrentRoute = (label: string) => {
    if (!__DEV__) return;
    console.log(
      `[Nav] ${label} → route:`,
      navigationRef.current?.getCurrentRoute?.()?.name,
    );
  };

  /**
   * Screens conditional hain (onboarding / login / app), is liye initialRouteName
   * nahi diya: React Navigation khud current branch ki pehli screen kholta hai.
   */
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
        logCurrentRoute("ready");
      }}
      onStateChange={() => logCurrentRoute("changed")}
      theme={LightTheme}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen
            name={SCREENS.ONBOARDING}
            component={OnboardingScreen}
            options={horizontalAnimation}
          />
        ) : !isLoggedIn ? (
          <>
            <Stack.Screen
              name={SCREENS.LOGIN}
              component={LoginScreen}
              options={horizontalAnimation}
            />
            <Stack.Screen
              name="ForgetPassword"
              component={PasswordRecoveryScreen}
              options={horizontalAnimation}
            />
          </>
        ) : (
          <>
            <Stack.Screen name={SCREENS.HOME} component={MainTabs} />
            <Stack.Screen
              name={SCREENS.ADDTEAMMEMBER}
              component={AddTeamMemberScreen}
              options={horizontalAnimation}
            />
            <Stack.Screen
              name={SCREENS.DETAIL}
              component={LeaveDetailScreen}
              options={horizontalAnimation}
            />
            <Stack.Screen
              name={SCREENS.TEAMMEMBERDETAIL}
              component={TeamMemberDetailScreen}
              options={horizontalAnimation}
            />
            <Stack.Screen name="profile" component={ProfileEditFormScreen} />
            <Stack.Screen name="attendance" component={AttendanceSummaryScreen} />
            <Stack.Screen
              name="attendanceclient"
              component={AdminAttendanceClientlist}
            />
            <Stack.Screen name="adminclient" component={AttendanceSummaryScreen} />
            <Stack.Screen
              name="refrencevideo"
              component={VideoPlayerFullScreen}
            />
            <Stack.Screen name="atlist" component={AttendanceSheet} />
            <Stack.Screen
              name="adminsheetlist"
              component={AdminAttendanceSheet}
            />
            <Stack.Screen name="terms" component={TermsAndConditions} />
            <Stack.Screen name="privacy" component={PrivacyandPolicy} />
            <Stack.Screen name="tasklist" component={Appss} />
            <Stack.Screen name="compoff" component={CompOffAccrualScreen} />
            <Stack.Screen name="allotedteam" component={Allotedteam} />
            <Stack.Screen name="LEAVE" component={LeaveRecordsScreen} />
            <Stack.Screen name="LEAVEAPPROVAL" component={LeaveDetailScreen} />
            <Stack.Screen name="TeamMemberDetails" component={TeamScreen} />
            <Stack.Screen name="ALLOWANCE" component={EmployeeAllowanceForm} />
            <Stack.Screen
              name="Rgularisation"
              component={AttendanceRegularizationScreen}
            />
            <Stack.Screen name="LEAVEREQUESTS" component={LeaveRequestsScreen} />
            <Stack.Screen name="empduration" component={Employeedurationlist} />
            <Stack.Screen name="maproute" component={MapWithRoute} />
            <Stack.Screen name="login" component={FaceMatchScreen} />
            <Stack.Screen name="admin" component={AdminHomeScreen} />
            <Stack.Screen name="createtask" component={TaskCreator} />
            <Stack.Screen name="changepassword" component={ChangePassword} />
            <Stack.Screen
              name={SCREENS.ADDTASK}
              component={AddTaskScreen}
              options={horizontalAnimation}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Online/offline banner ka logic. Listener aur timer unmount par clean hote hain.
 */
const useConnectivityStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showConnectivityStatus, setShowConnectivityStatus] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConnectedRef = useRef<boolean | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const handleConnectivityChange = (connected: boolean) => {
      if (!mounted || !isInitializedRef.current) return; // initial fetch se pehle ke events ignore

      const prev = prevConnectedRef.current;
      if (prev === connected) return; // koi change nahi

      if (connected === false) {
        console.log("[Net] 🔴 OFFLINE");
        setIsOnline(false);
        setShowConnectivityStatus(true);
        clearHideTimer();
      } else if (prev === false) {
        console.log("[Net] 🟢 BACK ONLINE");
        setIsOnline(true);
        setShowConnectivityStatus(true);
        clearHideTimer();
        // 3 second baad banner hide
        hideTimerRef.current = setTimeout(() => {
          setShowConnectivityStatus(false);
          hideTimerRef.current = null;
        }, 3000);
      }

      prevConnectedRef.current = connected;
    };

    NetInfo.fetch()
      .then((state) => {
        if (!mounted) return;
        const connected = state.isConnected ?? true;
        console.log(`[Net] initial → isConnected=${connected} | type=${state.type}`);

        prevConnectedRef.current = connected;
        isInitializedRef.current = true;

        // App offline start hui to turant banner dikhao
        setIsOnline(connected);
        setShowConnectivityStatus(!connected);
      })
      .catch((error) => {
        console.log("[Net] NetInfo.fetch() failed:", error);
        if (!mounted) return;
        prevConnectedRef.current = true;
        isInitializedRef.current = true;
        setIsOnline(true);
      });

    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isConnected ?? true);
    });

    return () => {
      mounted = false;
      unsubscribe();
      clearHideTimer();
    };
  }, []);

  return { isOnline, showConnectivityStatus };
};

// Main Navigation component wrapped with SafeAreaProvider
const Navigation = () => {
  const { isOnline, showConnectivityStatus } = useConnectivityStatus();

  return (
    <SafeAreaProvider>
      <NetworkStatusBar isOnline={isOnline} showStatus={showConnectivityStatus} />
      <NavigationContent />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  isActive: {
    position: "absolute",
    height: "75%",
    // backgroundColor: 'rgba(203, 173, 106, 0.2)',
    marginLeft: "auto",
    marginRight: "auto",
    top: 0,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: ScreenWidth * 0.03,
    borderTopRightRadius: ScreenWidth * 0.03,
    borderBottomLeftRadius: ScreenWidth * 0.03,
    borderBottomRightRadius: ScreenWidth * 0.03,
  },
  isActiveLine: {
    position: "absolute",
    backgroundColor: "#CBAD6A",
    height: 3,
    marginLeft: "auto",
    marginRight: "auto",
    top: -10,
    borderRadius: 2,
  },
});

export default Navigation;