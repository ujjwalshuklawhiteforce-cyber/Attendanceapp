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
  todayCard: ViewStyle;
  content: ViewStyle;
  leftContent: ViewStyle;
  percentContent: ViewStyle;
  statusContent: TextStyle;
  viewTaskbtn: ViewStyle;
  tabBarHeader: ViewStyle;
  tabBarHeaderIndicatorStyle: ViewStyle;
  tabContainer: ViewStyle;
  tabSwitchTabView: ViewStyle;
  marginTop: ViewStyle;
  iconButtonContainer: ViewStyle;
  inputField: ViewStyle;
  inputLabel: TextStyle;
  selectInputLabel: TextStyle;
  input: TextStyle;
  blurInput: ViewStyle;
  focusInput: ViewStyle;
  textArea: TextStyle;
  invalidInput: ViewStyle;
  loadingContainer: ViewStyle;
  validInput: ViewStyle;
  button: ViewStyle;
  dropdown: ViewStyle;
  label: TextStyle;
  placeholderStyle: TextStyle;
  selectedTextStyle: TextStyle;
  inputSearchStyle: TextStyle;
  parentField: ViewStyle;
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

    content: {
      paddingHorizontal: ScreenWidth * 0.08,
      marginTop: ScreenWidth * 0.06,
    },

    todayCard: {
      backgroundColor: colors.taskCardbg,
      width: ScreenWidth * 0.9,
      borderRadius: ScreenWidth * 0.06,
      flexDirection: "row",
      flexWrap: "wrap",
      padding: ScreenWidth * 0.06,
      justifyContent: "space-between",
      alignItems: "center",
    },

    leftContent: {
      width: "48%",
    },

    statusContent: {
      fontSize: ScreenWidth * 0.04,
      lineHeight: ScreenWidth * 0.06,
    },

    percentContent: {},

    viewTaskbtn: {
      width: ScreenWidth * 0.3,
      padding: 0,
      marginTop: ScreenWidth * 0.06,
    },

    iconButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    // tab

    tabBarHeaderIndicatorStyle: {
      backgroundColor: colors.taskCardbg,
      height: "100%",
      borderRadius: ScreenWidth * 0.03,
    },

    tabBarHeader: {
      marginHorizontal: ScreenWidth * 0.048,
      marginBottom: ScreenWidth * 0.04,
      backgroundColor: colors.tabHeader,
      borderRadius: ScreenWidth * 0.03,
      shadowColor: "transparent",
    },

    tabContainer: {
      marginHorizontal: ScreenWidth * 0.048,
    },

    tabSwitchTabView: {
      width: ScreenWidth,
    },

    marginTop: {
      marginTop: ScreenWidth * 0.06,
    },

    // input
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

    textArea: {
      textAlignVertical: "top",
    },

    button: {
      position: "absolute",
      top: ScreenHeight * 0.74,
      width: "90%",
      backgroundColor:"rgb(29,91,65)"
    },

    buttonRow: {
      marginTop: ScreenWidth * 0.08,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    button50: {
      width: "48%",
    },

    dropdown: {
      width: "100%",
      height: ScreenWidth * 0.16,
      borderColor: colors.blackOverlay,
      borderWidth: ScreenWidth * 0.003,
      borderRadius: ScreenWidth * 0.028,
      paddingHorizontal: ScreenWidth * 0.04,
      zIndex: 99,
    },

    label: {
      position: "absolute",
      backgroundColor: "white",
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },

    placeholderStyle: {
      fontSize: ScreenWidth * 0.04,
    },

    selectedTextStyle: {
      fontSize: ScreenWidth * 0.04,
    },

    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },

    parentField: {
      position: "relative",
    },

    selectInputLabel: {
      fontSize: ScreenWidth * 0.036,
      marginBottom: ScreenWidth * 0.03
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
