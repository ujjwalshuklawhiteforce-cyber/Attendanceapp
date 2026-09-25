import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";
import { green, red } from "react-native-reanimated/lib/typescript/reanimated2/Colors";
import { color } from "@rneui/base";

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
  activityCard: ViewStyle;
  activityLeftCard: ViewStyle;
  activityRightCard: ViewStyle;
  activityLeftCardIcon: ViewStyle;
  activityCardIconsize: TextStyle;
  activityLeftCardText: ViewStyle;
  activityLeftCardTextTitle: TextStyle;
  activityLeftCardTextDate: TextStyle;
  // modal..................
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalContentcheckin:ViewStyle;
  modalImageContainer: ViewStyle;
  modalImage: ImageStyle;
  modalHeading: TextStyle;
  modalHeadingContainer: ViewStyle;
  modalSubHeading: TextStyle;
  modalSubHeading2: TextStyle;
  modalButtonContainer: ViewStyle;
  modalButton: ViewStyle;
}
// card........
interface Style {
  container: ViewStyle;
  attendanceCard: ViewStyle;
  attendanceCard1: ViewStyle;
  attendanceCard2: ViewStyle;
  attendanceCard3: ViewStyle;
  attendanceCardHeader: ViewStyle;
  attendanceCardIcon: ViewStyle;
  attendanceCardIconsize: TextStyle;
  attendanceCardTitle: TextStyle;
  timeContainer: ViewStyle;
  timeFont: TextStyle;
  timeSubtitle: TextStyle;
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
      // height:ScreenHeight*1,
      overflow:"scroll"
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
      width: ScreenWidth * 0.13,
      height: ScreenWidth * 0.13,
      borderRadius: ScreenWidth * 0.5,
    },

    profileInfo: {
      paddingLeft: ScreenWidth * 0.04,
    },

    profileInfoTitle: {
      fontSize: ScreenWidth * 0.046,
      fontWeight: "bold",
      textTransform:"capitalize",
    },

    profileInfoSubTitle: {
      fontSize: ScreenWidth * 0.036,
      fontWeight: "normal",

    },

    calendarListContainer: {
      marginVertical: ScreenWidth * 0.05,
      height: ScreenHeight * 0.076,
      // paddingLeft: ScreenWidth * 0.04,
      
    },

    calendarListFlatlist: {
      // borderWidth: ScreenWidth * 0.006 ,
      // borderColor:"red"
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
// ..............
activityCard: {
  padding: ScreenWidth * 0.046,
  width: ScreenWidth * 0.9,
  backgroundColor: colors.white,
  marginVertical: ScreenWidth * 0.016,
  borderRadius: ScreenWidth * 0.04,
  flexDirection: "row",
  justifyContent: "space-between",
},

activityLeftCard: {
  flexDirection: "row",
},

activityLeftCardText: {
  marginLeft: ScreenWidth * 0.04,
},

activityLeftCardTextTitle: {
  fontSize: ScreenWidth * 0.04,
  fontWeight: "bold",
},

activityLeftCardTextDate: {
  marginTop: ScreenWidth * 0.006,
  fontSize: ScreenWidth * 0.026,
},

activityRightCard: {},

activityLeftCardIcon: {
  width: ScreenWidth * 0.1,
  height: ScreenWidth * 0.1,
  backgroundColor: "rgb(250 245 255)",
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
},
activityCardIconsize: {
  fontSize: ScreenWidth * 0.06,
  color: colors.primary,
},

    renderContent: {
      position: "absolute",
      bottom: ScreenHeight * 0.046,
      width: ScreenWidth,
      paddingHorizontal: ScreenWidth * 0.1,
    },

    slideButton: {
      backgroundColor: colors.white,
      borderColor:"gray",
      borderWidth:1
    },

    slideContainer: { backgroundColor:"orange"},

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
    modalContainer: {
      width: ScreenWidth,
      height: ScreenHeight,
      backgroundColor: colors.blackOverlay,
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },

    modalContent: {
      backgroundColor: colors.white,
      width: ScreenWidth,
      height: ScreenHeight * 0.44,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
      alignItems: "center",
      justifyContent: "center",
    },
    modalContentcheckin: {
      backgroundColor: colors.white,
      width: ScreenWidth,
      height: ScreenHeight * 0.34,
      borderTopLeftRadius: ScreenWidth * 0.04,
      borderTopRightRadius: ScreenWidth * 0.04,
      alignItems: "center",
      justifyContent: "space-between",
      flexDirection:"column"
    },
    modalImageContainer: {
      width: ScreenWidth * 0.3,
      height: ScreenWidth * 0.3,
      backgroundColor: colors.lightGray,
      borderRadius: 100,
    },

    modalImage: {
      width: ScreenWidth * 0.3,
      height: ScreenWidth * 0.3,
      borderRadius: 100,
      flex: 1,
    },

    modalHeading: {
      fontFamily: fonts.lexend.medium,
      fontSize: ScreenWidth * 0.06,
      letterSpacing: 0.6,
    },

    modalHeadingContainer: {
      marginTop: ScreenWidth * 0.06,
      width: ScreenWidth,
      alignContent: "center",
      alignItems: "center",
    },

    modalSubHeading: {
      marginTop: ScreenWidth * 0.02,
      letterSpacing: 0.4,
      fontSize: ScreenWidth * 0.036,
      alignItems: "center",
      textAlign: "center",
      color:"black"
    },
  

    modalButtonContainer: {
      marginTop: ScreenWidth * 0.06,
    },

    modalButton: {
      width: ScreenWidth * 0.8,
      // backgroundColor: colors.primary,
      backgroundColor:"rgb(29,91,65)",
      paddingVertical: ScreenWidth * 0.04,
      paddingHorizontal: ScreenWidth * 0.06,
      borderRadius: 10,
      alignItems: "center",
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
    },
    // Card.....
    attendanceCard: {
      width: ScreenWidth * 0.43,
      height: ScreenWidth * 0.4,
      backgroundColor: "rgb(220 252 231)",
       borderColor:"rgb(34,197,94)",
       borderWidth:1,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.05,
      padding: ScreenWidth * 0.04,
    
    
    },

    attendanceCardHeader: {
      flexDirection: "row",
      alignContent: "center",
      alignItems: "center",
    
    },
    attendanceCardIcon: {
      width: ScreenWidth * 0.1,
      height: ScreenWidth * 0.1,
      // backgroundColor: "#EAF3FF",
      backgroundColor:"white",
      borderRadius: ScreenWidth * 0.03,
      justifyContent: "center",
      alignContent: "center",
      alignItems: "center",
    },
    attendanceCardIconsize: {
      color: colors.primary,
      fontSize: ScreenWidth * 0.06,
    },
    attendanceCardTitle: {
      fontSize: ScreenWidth * 0.038,
      marginLeft: ScreenWidth * 0.02,
      fontWeight: "800",
      color:"black"
    },

    timeContainer: {
      marginVertical: ScreenWidth * 0.02,
    },

    timeFont: {
      fontSize: ScreenWidth * 0.056,
      fontWeight: "bold",
    },

    timeSubtitle: {
      fontSize: ScreenWidth * 0.032,
      fontWeight: "800",
    },
    attendanceCard1:{
      width: ScreenWidth * 0.43,
      height: ScreenWidth * 0.4,
      backgroundColor: "#F6EBEA",
       borderColor:"red",
       borderWidth:1,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.05,
      padding: ScreenWidth * 0.04,
    
    
    }
    ,
    attendanceCard2:{
      width: ScreenWidth * 0.43,
      height: ScreenWidth * 0.4,
      backgroundColor: "rgb(250 245 255)",
       borderColor:"rgb(88 28 135)",
       borderWidth:1,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.05,
      padding: ScreenWidth * 0.04,
    
    
    }
    ,attendanceCard3:{
      width: ScreenWidth * 0.43,
      height: ScreenWidth * 0.4,
      backgroundColor: "rgb(239 246 255)",
       borderColor:"rgb(37 99 235)",
       borderWidth:1,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.05,
      padding: ScreenWidth * 0.04,
    
    
    }
    ,  modalSubHeading2:{
      color:"green",
      fontWeight:"bold"
    },
    
    
  });
};
// ............................
