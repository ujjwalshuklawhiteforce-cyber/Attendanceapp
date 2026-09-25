import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  useColorScheme,
  Modal,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native";
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { isReadyRef, navigationRef } from "react-navigation-helpers";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useRef } from "react";
import NetInfo from '@react-native-community/netinfo';

// Screens
import HomeScreen from "@screens/home/HomeScreen";
import ProfileScreen from "@screens/profile/ProfileScreen";
import DetailScreen from "@screens/leavedetail/LeaveDetailScreen";
import TaskScreen from "@screens/task/TaskScreen";
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
import ProfileEditScreen from "@screens/profile/ProfileViewScreen";
import ChangePassword from "@screens/passwordsecurity/ChangePassword";
import ProfileViewScreen from "@screens/profile/ProfileViewScreen";
import ProfileEditFormScreen from "@screens/profile/ProfileEditFormPage";
import { SCREENS } from "@shared-constants";
import { LightTheme } from "@theme/themes";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import TaskCreator from "@screens/addTask/CreateTask";
import AdminHomeScreen from "@screens/home/AdminHomeScreen";
import AttendanceSummaryScreen from "@screens/home/Adminattendancelist";
import AdminAttendanceSheet from "@screens/attendancesheet/AdminAttendanceSheet";
import Employeedurationlist from "@screens/home/Employeedurationlist";
import MapWithRoute from "@screens/attendancesheet/Mapview/mapview";
import AdminAttendanceClientlist from "@screens/home/Clientlist/Clientlist";
import AdminAttendancesheetlist from "@screens/home/Adminattendancelist";
import VideoPlayerFullScreen from "@screens/home/components/Video refrence/Videorefrence";
import EmbeddingScreen from "assets/FaceSreen/Facematchscreen";
import FaceMatchScreen from "@shared-components/registercamera/Registerface";
import LeaveRecordsScreen from "@screens/leaves/Leaverecordscreen";
import LeaveDetailScreen from "@screens/leavedetail/LeaveDetailScreen";
import LeaveRequestsScreen from "@screens/leaves/Leaveapproval";
import TeamScreen from "@screens/team/TeamScreen";
import EmployeeAllowanceForm from './Allowance/Allowance';
import NetworkStatusBar from "../../networkconnectivity";
import PasswordRecoveryScreen from "@screens/login/ForgotPassword/ForgotPassword";
import Toast from "react-native-toast-message";
import AttendanceRegularizationScreen from "@screens/Rgularisation/Regualrisation";
import CompOffAccrualScreen from "@screens/comoff/Compoff";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -10,
      justifyContent: 'center',
      alignItems: 'center',
      ...styles.shadow,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 70,
        height: 70,
        borderRadius: 55,
        backgroundColor: "rgb(29,91,65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
        margin: 10,
      }}
    >
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 35,
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 20,
        borderColor: "green",
        borderWidth: 2,
      }}>
        {children}
      </View>
    </View>
  </TouchableOpacity>
);

// Custom hook for responsive tab bar configuration
const useResponsiveTabBar = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');

  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 414;
  const isLargeDevice = width >= 414;

  const getResponsiveValue = () => {
    const baseTabBarHeight = isSmallDevice ? 60 : isMediumDevice ? 65 : 70;

    if (isSmallDevice) {
      return {
        tabBarHeight: baseTabBarHeight + insets.bottom,
        iconSize: 20,
        fontSize: 9,
        showLabels: false,
        horizontalPadding: width * 0.02,
        activeLineWidth: width * 0.12,
        activeBackgroundWidth: width * 0.12,
        bottomPadding: insets.bottom > 0 ? insets.bottom : 8,
      };
    } else if (isMediumDevice) {
      return {
        tabBarHeight: baseTabBarHeight + insets.bottom,
        iconSize: 22,
        fontSize: 10,
        showLabels: true,
        horizontalPadding: width * 0.03,
        activeLineWidth: width * 0.15,
        activeBackgroundWidth: width * 0.15,
        bottomPadding: insets.bottom > 0 ? insets.bottom : 8,
      };
    } else {
      return {
        tabBarHeight: baseTabBarHeight + insets.bottom,
        iconSize: 24,
        fontSize: 11,
        showLabels: true,
        horizontalPadding: width * 0.036,
        activeLineWidth: width * 0.18,
        activeBackgroundWidth: width * 0.18,
        bottomPadding: insets.bottom > 0 ? insets.bottom : 8,
      };
    }
  };

  return { ...getResponsiveValue(), insets };
};

const NavigationContent = () => {
  const { isLoggedIn, isOnboarded, isAdmin, isLoading } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const connectivityTimerRef = useRef(null);
  const prevConnectedRef = useRef(null);
  const isInitializedRef = useRef(false);
  const scheme = useColorScheme();
  const isDarkMode = scheme === "dark";
  const responsiveConfig = useResponsiveTabBar();

  const horizontalAnimation = {
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
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
      };
    },
  };

  useEffect(() => {

    return () => {
      isReadyRef.current = false;

    };
  }, []);

  const renderTabIcon = (route, focused, color, size) => {
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
        {focused && <View style={[styles.isActiveLine, { width: responsiveConfig.activeLineWidth }]} />}
        {focused && <View style={[styles.isActive, { width: responsiveConfig.activeBackgroundWidth }]} />}
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

  const renderTabNavigation = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) =>
            renderTabIcon(route, focused, color, size),
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
          tabBarShowLabel: responsiveConfig.showLabels,
          tabBarLabelStyle: {
            fontSize: responsiveConfig.fontSize,
            fontWeight: '600',
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
            paddingBottom: Platform.OS === 'ios' && responsiveConfig.insets.bottom > 0 ? 0 : 4,
          },
        })}
      >

        <Tab.Screen
          name={SCREENS.HOME}
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
          }}
        />
        <Tab.Screen
          name="ATTENDANCE"
          component={isAdmin ? AdminHomeScreen : AttendanceSheet}
          options={{
            tabBarLabel: "Attendance",
          }}
        />
        <Tab.Screen
          name="PAYSLIP"
          component={PaymentSlip}
          options={{
            tabBarLabel: "Payslip",
          }}
        />
        <Tab.Screen
          name={SCREENS.PROFILE}
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
          }}
        />
      </Tab.Navigator>
    );
  };

  const getInitialRouteName = () => {
    if (!isLoggedIn) {
      return SCREENS.LOGIN;
    }

    if (!isOnboarded) {
      return SCREENS.ONBOARDING;
    }

    return SCREENS.HOME;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgb(29,91,65)" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}
      theme={isDarkMode ? LightTheme : LightTheme}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRouteName()}
      >
        {!isOnboarded ? (
          <>
            <Stack.Screen
              name={SCREENS.ONBOARDING}
              component={OnboardingScreen}
              options={horizontalAnimation}
            />
          </>
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
            <Stack.Screen name={SCREENS.HOME} component={renderTabNavigation} />
            <Stack.Screen
              name={SCREENS.ADDTEAMMEMBER}
              options={horizontalAnimation}
            >
              {(props) => <AddTeamMemberScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name={SCREENS.DETAIL} options={horizontalAnimation}>
              {(props) => <DetailScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen
              name={SCREENS.TEAMMEMBERDETAIL}
              options={horizontalAnimation}
            >
              {(props) => <TeamMemberDetailScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="profile" component={ProfileEditFormScreen} />
            <Stack.Screen name="attendance" component={AttendanceSummaryScreen} />
            <Stack.Screen name="attendanceclient" component={AdminAttendanceClientlist} />
            <Stack.Screen name="adminclient" component={AdminAttendancesheetlist} />
            <Stack.Screen name="refrencevideo" component={VideoPlayerFullScreen} />
            <Stack.Screen name="atlist" component={AttendanceSheet} />
            <Stack.Screen name="adminsheetlist" component={AdminAttendanceSheet} />
            <Stack.Screen name="terms" component={TermsAndConditions} />
            <Stack.Screen name="privacy" component={PrivacyandPolicy} />
            <Stack.Screen name="tasklist" component={Appss} />
            <Stack.Screen name="compoff" component={CompOffAccrualScreen} />

            <Stack.Screen name="LEAVE" component={LeaveRecordsScreen} />
            <Stack.Screen name="LEAVEAPPROVAL" component={LeaveDetailScreen} />
            <Stack.Screen name="TeamMemberDetails" component={TeamScreen} />
            <Stack.Screen name="ALLOWANCE" component={EmployeeAllowanceForm} />
            <Stack.Screen name="Rgularisation" component={AttendanceRegularizationScreen} />
            <Stack.Screen name="LEAVEREQUESTS" component={LeaveRequestsScreen} />
            <Stack.Screen name="empduration" component={Employeedurationlist} />
            <Stack.Screen name="maproute" component={MapWithRoute} />
            <Stack.Screen name="login" component={FaceMatchScreen} />
            <Stack.Screen name="admin" component={AdminHomeScreen} />
            <Stack.Screen name="createtask" component={TaskCreator} />
            <Stack.Screen name="changepassword" component={ChangePassword} />
            <Stack.Screen name={SCREENS.ADDTASK} options={horizontalAnimation}>
              {(props) => <AddTaskScreen {...props} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>

      {/* Modal for quick actions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <SafeAreaView style={styles.modalSafeArea} edges={['bottom']}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { marginBottom: responsiveConfig.insets.bottom + 10 }]}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  navigationRef.current?.navigate("tasklist");
                }}
              >
                <Icon name="clipboard-check-outline" type="MaterialCommunityIcons" size={27} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  navigationRef.current?.navigate("createtask");
                }}
              >
                <Icon name="clipboard-list-outline" type="MaterialCommunityIcons" size={27} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <View>
                  <Icon
                    name="close-outline"
                    type={IconType.Ionicons}
                    size={18}
                    color="white"
                    style={{ textAlign: 'center' }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </NavigationContainer>
  );
};

// Main Navigation component wrapped with SafeAreaProvider
const Navigation = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showConnectivityStatus, setShowConnectivityStatus] = useState(false);
  const connectivityTimerRef = useRef(null);
  const prevConnectedRef = useRef(null);
  const isInitializedRef = useRef(false);

  const backPressCount = useRef(0);
  const backPressTimer = useRef(null);

  const handleConnectivityChange = (connected) => {
    console.log(`[App.js] 📡 Connectivity changed → ${connected}`);

    if (!isInitializedRef.current) {
      console.log('[App.js] ⏳ Not initialized yet, ignoring event');
      return;
    }

    const prev = prevConnectedRef.current;

    // No change
    if (prev === connected) {
      console.log('[App.js] ↔️ No change in connectivity');
      return;
    }

    // ─── WENT OFFLINE ──────────────────────────────────────────────────
    if (connected === false) {
      console.log('[App.js] 🔴 OFFLINE');
      setIsOnline(false);
      setShowConnectivityStatus(true);

      // Clear any pending timer
      if (connectivityTimerRef.current) {
        clearTimeout(connectivityTimerRef.current);
        connectivityTimerRef.current = null;
      }
    }
    // ─── BACK ONLINE ──────────────────────────────────────────────────
    else if (prev === false && connected === true) {
      console.log('[App.js] 🟢 BACK ONLINE');
      setIsOnline(true);
      setShowConnectivityStatus(true);

      // Clear any existing timer
      if (connectivityTimerRef.current) {
        clearTimeout(connectivityTimerRef.current);
      }

      // Auto-hide status banner after 3 seconds
      connectivityTimerRef.current = setTimeout(() => {
        console.log('[App.js] ⏱️ 3 second timer fired — hiding connectivity status');
        setShowConnectivityStatus(false);
        connectivityTimerRef.current = null;
      }, 3000); // 3 seconds
    }

    prevConnectedRef.current = connected;
    console.log(`[App.js] 📝 Updated prevConnected → ${connected}`);
  };
  useEffect(() => {

    NetInfo.fetch()
      .then((state) => {
        const connected = state.isConnected ?? true;
        console.log(`[App.js] ✅ NetInfo.fetch() → isConnected=${connected} | type=${state.type}`);

        prevConnectedRef.current = connected;
        isInitializedRef.current = true;

        // Show offline status immediately if app starts offline
        if (!connected) {
          console.log('[App.js] 🔴 App launched OFFLINE');
          setIsOnline(false);
          setShowConnectivityStatus(true);
        } else {
          console.log('[App.js] ✅ App launched ONLINE');
          setIsOnline(true);
          setShowConnectivityStatus(false);
        }
      })
      .catch((error) => {
        console.error('[App.js] ❌ NetInfo.fetch() failed:', error);
        prevConnectedRef.current = true;
        isInitializedRef.current = true;
        setIsOnline(true);
      });

    // Listen for connectivity changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      console.log(`[App.js] 📻 NetInfo event → isConnected=${connected} | type=${state.type}`);
      handleConnectivityChange(connected);
    });
  }, []);
  return (
    <SafeAreaProvider>

      <NetworkStatusBar
        isOnline={isOnline}
        showStatus={showConnectivityStatus}
      />

      <NavigationContent />


    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  isActive: {
    position: "absolute",
    height: '75%',
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
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    width: ScreenWidth * 0.53,
    height: ScreenWidth * 0.15,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "rgb(29,91,65)",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  shadow: {
    shadowColor: "#7F5DF0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

export default Navigation;