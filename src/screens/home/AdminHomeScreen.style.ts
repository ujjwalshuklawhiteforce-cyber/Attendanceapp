import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  header: ViewStyle;
  notificationIconContainer: ViewStyle;
  profileDetailContainer: ViewStyle;
  notificationIcon: TextStyle;
  profilePicImageStyle: ImageStyle;
  profileInfo: ViewStyle;
  profileInfoTitle: TextStyle;
  profileInfoSubTitle: TextStyle;
  calendarListContainer: ViewStyle;
  calendarListFlatlist: ViewStyle;
  attendanceContent: ViewStyle;
  attendanceContentTotalAttSec: ViewStyle;
  attendanceContentTotalAttTitle: TextStyle;
  attendanceCardsContainer: ViewStyle;
  activityContent: ViewStyle;
  activityContentContainer: ViewStyle;
  activityContentCardsContainer: ViewStyle;
  renderContent: ViewStyle;
  slideButton: ViewStyle;
  scrollViewHeight: ViewStyle;
  slideContainer: ViewStyle;
  cameraContainer: ViewStyle;
  camera: ViewStyle;
  buttonContainer: ViewStyle;
  locationIcon: TextStyle;
  camButton: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.white,
      position: "relative",
    },

    header: {
      width: ScreenWidth * 0.9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: ScreenWidth * 0.04,
      // paddingHorizontal: ScreenWidth * 0.006,
    },

    notificationIconContainer: {
      padding: ScreenWidth * 0.03,
      borderColor: colors.lightGray,
      borderWidth: ScreenWidth * 0.004,
      borderRadius: ScreenWidth * 0.5,
    },

    profileDetailContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },

    notificationIcon: {
      fontSize: ScreenWidth * 0.06,
    },

    profilePicImageStyle: {
      width: ScreenWidth * 0.12,
      height: ScreenWidth * 0.12,
      borderRadius: ScreenWidth * 0.5,
    },

    profileInfo: {
      paddingLeft: ScreenWidth * 0.04,
    },

    profileInfoTitle: {
      fontSize: ScreenWidth * 0.046,
      fontWeight: "bold",
    },

    profileInfoSubTitle: {
      fontSize: ScreenWidth * 0.036,
      fontWeight: "normal",
    },

    calendarListContainer: {
      marginVertical: ScreenWidth * 0.05,
      height: ScreenHeight * 0.076,
      paddingLeft: ScreenWidth * 0.05,
    },

    calendarListFlatlist: {
      // paddingHorizontal: ScreenWidth * 0.006,
    },

    attendanceContent: {
      width: ScreenWidth,
      backgroundColor: colors.maiBbackground,
      borderTopLeftRadius: ScreenWidth * 0.08,
      borderTopRightRadius: ScreenWidth * 0.08,
      padding: ScreenWidth * 0.05,
    },

    attendanceContentTotalAttSec: {},

    attendanceContentTotalAttTitle: {
      fontSize: ScreenWidth * 0.042,
      fontFamily: fonts.lexend.black,
      fontWeight: "bold",
      alignContent: "center",
    },

    attendanceCardsContainer: {
      marginTop: ScreenWidth * 0.02,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    activityContent: {
      marginTop: ScreenWidth * 0.06,
    },

    activityContentContainer: {},
    activityContentCardsContainer: {
      marginTop: ScreenWidth * 0.02,
    },

    renderContent: {
      position: "absolute",
      bottom: ScreenHeight * 0.046,
      width: ScreenWidth,
      paddingHorizontal: ScreenWidth * 0.1,
    },

    slideButton: {
      backgroundColor: colors.white,
    },

    slideContainer: {},

    scrollViewHeight: {
      paddingBottom: ScreenWidth * 0.3,
    },

    camera: {
      position: "absolute",
      width: ScreenWidth,
      height: ScreenHeight,
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    },

    cameraContainer: {
      position: "absolute",
      top: 0,
      right: 0,
      width: ScreenWidth,
      height: ScreenHeight,
      zIndex: 9,
    },

    camButton: {
      height: 80,
      width: 80,
      borderRadius: 40,
      //ADD backgroundColor COLOR GREY
      backgroundColor: "#B2BEB5",

      alignSelf: "center",
      borderWidth: 4,
      borderColor: "white",
      zIndex: 9999,
    },

    buttonContainer: {
      backgroundColor: "rgba(0,0,0,0.2)",
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      width: ScreenWidth,
      bottom: ScreenHeight * 0.02,
      padding: 20,
      zIndex: 9999,
    },

    locationIcon: {
      fontSize: ScreenWidth * 0.04
    }
  });
};
