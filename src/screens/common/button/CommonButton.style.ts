import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  button: ViewStyle;
  panigationContainer: ViewStyle;
  paginationDotContainer: ViewStyle;
  paginationDot: ViewStyle;
  buttonContainer: ViewStyle;
  textSize: TextStyle;
  ButtonTextIcon: TextStyle;
  ButtonTextContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    buttonContainer: {
      position: "absolute",
      bottom: ScreenWidth * 0.06,
    },

    button: {
      // marginTop: 30,
      width: "100%",
      backgroundColor: colors.primary,
      paddingVertical: ScreenWidth * 0.04,
      paddingHorizontal: ScreenWidth * 0.06,
      borderRadius: 10,
      alignItems: "center",
    },

    panigationContainer: {
      position: "absolute",
      bottom: ScreenWidth * 0.67,
      right: 0,
      left: 0,
      width: ScreenWidth,
      zIndex: 99,
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: ScreenWidth * 0.02,
    },
    paginationDotContainer: {
      flexDirection: "row",
    },

    paginationDot: {
      backgroundColor: colors.primary,
      // backgroundColor:'red',
      width: 10,
      height: 6,
      borderRadius: 100,
      marginHorizontal: 6,
    },

    textSize: {
      fontSize: ScreenWidth * 0.036,
    },

    ButtonTextIcon: {
      fontSize: ScreenHeight * 0.022,
      color: colors.white,
      marginRight: ScreenWidth * 0.012,
    },

    ButtonTextContainer: {
      flexDirection: "row",
      alignContent: "center",
      alignItems: "center",
    },
  });
};
