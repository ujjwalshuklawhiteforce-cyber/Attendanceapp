import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  addIconContainer: ViewStyle;
  addIcon: TextStyle;
  header: ViewStyle;
  headerContainer: ViewStyle;
  headerTitle: TextStyle;
  iconButtonContainer: ViewStyle;
  contentContainer: ViewStyle;
  focusInput: ViewStyle;
  blurInput: ViewStyle;
  inputField: ViewStyle;
  input: TextStyle;
  shadowInput: ViewStyle;
  centeredView: ViewStyle;
  modalMemberView: ViewStyle;
  IconContainer: ViewStyle;
  iconSize: TextStyle;
  memberBoxText: TextStyle;
  bottomButton: ViewStyle;
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

    addIconContainer: {
      padding: ScreenWidth * 0.03,
      borderColor: colors.lightGray,
      borderWidth: ScreenWidth * 0.004,
      borderRadius: ScreenWidth * 0.04,
    },

    addIcon: {
      fontSize: ScreenWidth * 0.05,
      fontWeight: "bold",
    },

    header: {
      width: ScreenWidth * 0.9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: ScreenWidth * 0.04,
    },

    headerContainer: {},

    headerTitle: {
      fontSize: ScreenWidth * 0.05,
      fontWeight: "bold",
    },

    iconButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    contentContainer: {
      marginTop: ScreenWidth * 0.04,
      position: "relative",
    },

    focusInput: {
      borderColor: colors.primary,
    },

    blurInput: {
      borderColor: colors.lightGray,
    },

    inputField: {
      position: "relative",
      marginTop: ScreenWidth * 0.04,
    },

    input: {
      margin: 0,
      width: ScreenWidth * 0.9,
      height: ScreenWidth * 0.12,
      borderWidth: ScreenWidth * 0.003,
      borderRadius: ScreenWidth * 0.028,
      fontSize: ScreenWidth * 0.038,
      paddingHorizontal: ScreenWidth * 0.06,
    },

    shadowInput: {
      shadowColor: colors.blackOverlay,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 2,
      elevation: 8,
    },

    centeredView: {
      width: ScreenWidth,
      height: ScreenHeight,
      backgroundColor: colors.blackOverlay,
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },

    modalMemberView: {
      width: ScreenWidth,
      height: "auto",
      backgroundColor: colors.white,
      paddingTop: ScreenWidth * 0.06,
      paddingBottom: ScreenWidth * 0.04,
      paddingHorizontal: ScreenWidth * 0.08,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
    },

    IconContainer: {
      marginVertical: ScreenWidth * 0.03,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignContent: "center",
      alignItems: "center",
    },

    iconSize: {
      fontSize: ScreenWidth * 0.066,
    },

    memberBoxText: {
      fontSize: ScreenWidth * 0.035,
      marginLeft: ScreenWidth * 0.026,
      fontWeight: "normal",
    },

    bottomButton: {
      position: "absolute",
      bottom: ScreenHeight * 0.06,
      width: '90%',
    },
  });
};
