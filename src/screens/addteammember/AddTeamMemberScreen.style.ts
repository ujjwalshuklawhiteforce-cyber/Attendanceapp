import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  header: ViewStyle;
  headerContainer: ViewStyle;
  headerTitle: TextStyle;
  addIconContainer: ViewStyle;
  addIcon: TextStyle;
  contentContainer: TextStyle;
  itemContainer: ViewStyle;
  itemTitle: TextStyle;
  itemValue: TextStyle;
  inputField: ViewStyle;
  inputLabel: TextStyle;
  input: TextStyle;
  blurInput: ViewStyle;
  focusInput: ViewStyle;
  validInput: ViewStyle;
  invalidInput: ViewStyle;
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
      paddingTop: ScreenWidth * 0.02,
    },

    headerContainer: {
      flex: 1,
      justifyContent: "center",
      marginRight: ScreenWidth * 0.09,
    },

    headerTitle: {
      fontSize: ScreenWidth * 0.05,
      fontWeight: "bold",
    },

    addIconContainer: {
      padding: ScreenWidth * 0.03,
      borderColor: colors.lightGray,
      borderWidth: ScreenWidth * 0.004,
      borderRadius: ScreenWidth * 0.04,
    },

    addIcon: {
      fontSize: ScreenWidth * 0.04,
      fontWeight: "bold",
    },

    contentContainer: {
      width: ScreenWidth,
      padding: ScreenWidth * 0.06,
    },

    itemContainer: {
      borderBottomColor: colors.line,
      borderBottomWidth: ScreenWidth * 0.002,
      marginBottom: ScreenWidth * 0.04,
    },

    itemTitle: {
      paddingBottom: ScreenWidth * 0.01,
      fontSize: ScreenWidth * 0.032, 
    },

    itemValue: {
      paddingBottom: ScreenWidth * 0.03,
      fontSize: ScreenWidth * 0.042, 
    },

    inputField: {
      position: "relative",
      marginBottom: ScreenWidth * 0.04,
    },

    inputLabel: {
      position: "absolute",
      left: 0,
      paddingHorizontal: ScreenWidth * 0.04,
      paddingVertical: ScreenWidth * 0.03,
      fontSize: ScreenWidth * 0.028,
    },

    input: {
      margin: 0,
      width: ScreenWidth * 0.9,
      // height: ScreenWidth * 0.14,
      borderWidth: ScreenWidth * 0.003,
      borderRadius: ScreenWidth * 0.028,
      fontSize: ScreenWidth * 0.038,
      paddingHorizontal: ScreenWidth * 0.04,
      paddingTop: ScreenWidth * 0.062,
      zIndex: 99,
    },

    blurInput: {
      borderColor: colors.blackOverlay,
    },

    focusInput: {
      borderColor: colors.primary,
    },

    validInput: {
      borderColor: colors.success,
    },

    invalidInput: {
      borderColor: colors.danger,
    },
  });
};
