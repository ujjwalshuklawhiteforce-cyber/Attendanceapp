import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  imageSize: ImageStyle;
  content: ViewStyle;
  contentPadding: ViewStyle;
  heading: TextStyle;
  subHeading: TextStyle;
  button: ViewStyle;
  panigationContainer: ViewStyle;
  paginationDotContainer: ViewStyle;
  paginationDot: ViewStyle;
  buttonContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: 'rgb(29,91,65)',
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },

    imageSize: {
      width: ScreenWidth,
      height: ScreenHeight * 0.83,
    },

    content: {
      position: "absolute",
      width: ScreenWidth,
      height: ScreenHeight * 0.35,
      backgroundColor: colors.white,
      zIndex: 9,
      bottom: 0,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
      justifyContent: "center",
      alignItems: "center",
    },

    contentPadding: {},

    heading: {
      width: ScreenWidth,
      fontSize: ScreenWidth * 0.07,
      fontWeight: "bold",
      color: colors.black,
      textAlign: "center",
      paddingLeft: ScreenWidth * 0.1,
      paddingRight: ScreenWidth * 0.1,
      letterSpacing: 0.4,
      // lineHeight: 38,
    },

    subHeading: {
      width: ScreenWidth,
      fontSize: ScreenWidth * 0.036,
      fontWeight: "normal",
      color: colors.subtitle,
      textAlign: "center",
      paddingTop: ScreenWidth * 0.04,
      paddingLeft: ScreenWidth * 0.1,
      paddingRight: ScreenWidth * 0.1,
      paddingBottom: ScreenWidth * 0.16,
      letterSpacing: 0.4,
      lineHeight: 20,
    },

    buttonContainer: {
      position: "absolute",
      bottom: ScreenWidth * 0.06,
    },

    button: {
      // marginTop: 30,
      width: ScreenWidth * 0.8,
      backgroundColor: "rgb(29,91,65)",
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
      // backgroundColor: colors.primary,
      backgroundColor:'rgb(29,91,65)',
      width: 10,
      height: 6,
      borderRadius: 100,
      marginHorizontal: 6,
    },
  });
};
