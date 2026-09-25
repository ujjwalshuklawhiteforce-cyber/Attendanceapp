import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import type { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  activeCalendar: ViewStyle;
  calendarContainer: ViewStyle;
  sunCalendarContainer: ViewStyle;
  noneStyle: ViewStyle;
  dateFont: TextStyle;
  dayFont: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderRadius: 8,
      width: ScreenWidth * 0.9,
      borderColor: colors.borderColor,
      backgroundColor: colors.dynamicBackground,
    },

    calendarContainer: {
      borderColor: "#DEF9E4",
      borderWidth: ScreenWidth * 0.005,
      width: ScreenWidth * 0.156,
      height: ScreenHeight * 0.074,
      borderRadius: ScreenWidth * 0.02,
      marginHorizontal: ScreenWidth * 0.02,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white,
    },

    sunCalendarContainer:{
      borderColor: colors.lightGray,
      borderWidth: ScreenWidth * 0.004,
      width: ScreenWidth * 0.126,
      height: ScreenHeight * 0.074,
      borderRadius: ScreenWidth * 0.02,
      marginHorizontal: ScreenWidth * 0.02,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.danger,
    },
    activeCalendar: {
      borderColor: "#DEF9E4",
      borderWidth: ScreenWidth * 0.005,
      width: ScreenWidth * 0.156,
      height: ScreenHeight * 0.074,
      borderRadius: ScreenWidth * 0.02,
      marginHorizontal: ScreenWidth * 0.02,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#21423C",
    },

    dateFont: {
      fontFamily: fonts.lexend.black,
      fontSize: ScreenHeight * 0.023,
      fontWeight: "bold",
    },

    dayFont: {
      fontFamily: fonts.lexend.medium,
      fontSize: ScreenHeight * 0.012,
      fontWeight: "600",
    },

    noneStyle:{}
  });
};
