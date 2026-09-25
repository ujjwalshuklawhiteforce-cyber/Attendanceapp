import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import type { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  TaskCard: ViewStyle;
  TaskCardHeader: ViewStyle;
  TaskCardDate: ViewStyle;
  TaskCardStatus: ViewStyle;
  TaskCardStatusText: TextStyle;
  TaskCardDateTitle: TextStyle;
  TaskCardDateText: TextStyle;
  TaskCardContent: ViewStyle;
  lineHR: ViewStyle;
  leaveDetailHeading: TextStyle;
  leaveDetailValue: TextStyle;
  marginRight: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      padding: ScreenWidth * 0.046,
      width: ScreenWidth * 0.9,
      backgroundColor: colors.white,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.04,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    TaskCard: {
      width: ScreenWidth * 0.9,
      backgroundColor: colors.white,
      borderRadius: ScreenWidth * 0.04,
      padding: ScreenWidth * 0.05,
      marginVertical: ScreenWidth * 0.02,
      elevation: 2,
    },

    TaskCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
    },

    TaskCardDate: {},

    TaskCardDateTitle: {
      marginBottom: ScreenWidth * 0.01,
    },

    TaskCardDateText: {
      fontWeight: "bold",
      fontSize: ScreenWidth * 0.036,
    },

    TaskCardStatus: {
      padding: ScreenWidth * 0.02,
      borderRadius: ScreenWidth * 0.02,
    },
    TaskCardStatusText: {
      textTransform: "capitalize",
      fontWeight: "normal",
    },

    TaskCardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
    },


    marginRight:{
      marginRight: ScreenWidth * 0.08
    },

    lineHR: {
      marginVertical: ScreenWidth * 0.028,
      width: "100%",
      height: ScreenWidth * 0.001,
      backgroundColor: colors.subtitle,
    },

    leaveDetailHeading: {
      // fontSize: ScreenWidth * 0.031,
    },

    leaveDetailValue: {
      fontSize: ScreenWidth * 0.038,
      fontWeight: "bold",
      marginTop: ScreenWidth * 0.01,
    },
  });
};
