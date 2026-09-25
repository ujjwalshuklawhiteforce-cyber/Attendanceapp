import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import { ExtendedTheme } from "@react-navigation/native";

interface Style {
  container: ViewStyle;
  header: ViewStyle;
  headerContainer: ViewStyle;
  addIconContainer: ViewStyle;
  addIcon: TextStyle;
  headerTitle: TextStyle;
  iconButtonContainer: ViewStyle;
  marginLeft: ViewStyle;
  leaveCardsContainer: ViewStyle;
  tabSwitchContainer: ViewStyle;
  tabSwitchTabView: ViewStyle;
  tabBarHeader: ViewStyle;
  tabBarHeaderIndicatorStyle: ViewStyle;
  tabContainer: ViewStyle;
  centeredView: ViewStyle;
  centeredHalfView: ViewStyle;
  modalFormView: ViewStyle;
  modalFilterView: ViewStyle;
  modalHeader: ViewStyle;
  modalContent: ViewStyle;
  modalIconFormContainer: ViewStyle;
  modalHeaderFormContainer: ViewStyle;
  modalIconFilterContainer: ViewStyle;
  modalHeaderFilterContainer: ViewStyle;
  filterStatus: ViewStyle;
  filterLeave: ViewStyle;
  filterTeamMember: ViewStyle;
  checkboxText: TextStyle;
  filterBoxTitleText: TextStyle;
  filterChecbox: ViewStyle;
  checkboxContainer: ViewStyle;
  lineHR: ViewStyle;
  dropdown: ViewStyle;
  label: TextStyle;
  placeholderStyle: TextStyle;
  selectedTextStyle: TextStyle;
  inputSearchStyle: TextStyle;
  inputField: ViewStyle;
  inputLabel: TextStyle;
  input: TextStyle;
  blurInput: ViewStyle;
  focusInput: ViewStyle;
  textArea: TextStyle;
  invalidInput: ViewStyle;
  validInput: ViewStyle;
  button: ViewStyle;
  buttonRow: ViewStyle;
  button50: ViewStyle;
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

    marginLeft: {
      marginLeft: ScreenWidth * 0.03,
    },

    header: {
      width: ScreenWidth * 0.9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: ScreenWidth * 0.02,
    },

    headerContainer: {},

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

    iconButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    leaveCardsContainer: {
      marginTop: ScreenWidth * 0.02,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: ScreenWidth * 0.05,
    },

    tabSwitchContainer: {
      marginTop: ScreenWidth * 0.04,
    },

    tabSwitchTabView: {
      width: ScreenWidth,
    },

    tabBarHeader: {
      marginHorizontal: ScreenWidth * 0.048,
      marginBottom: ScreenWidth * 0.04,
      backgroundColor: colors.tabHeader,
      borderRadius: ScreenWidth * 0.03,
      shadowColor: "transparent",
    },

    tabBarHeaderIndicatorStyle: {
      backgroundColor: colors.primary,
      height: "100%",
      borderRadius: ScreenWidth * 0.03,
    },

    tabContainer: {
      marginHorizontal: ScreenWidth * 0.048,
    },

    //  modal view
    centeredView: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.white,
      position: "relative",
    },

    centeredHalfView: {
      width: ScreenWidth,
      height: ScreenHeight,
      backgroundColor: colors.blackOverlay,
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },

    modalFormView: {
      width: ScreenWidth,
      height: ScreenHeight * 0.926,
      backgroundColor: colors.white,
      paddingTop: ScreenWidth * 0.04,
      paddingHorizontal: ScreenWidth * 0.05,
    },

    modalFilterView: {
      width: ScreenWidth,
      height: "auto",
      backgroundColor: colors.white,
      paddingTop: ScreenWidth * 0.06,
      paddingHorizontal: ScreenWidth * 0.08,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    modalContent: {
      position: "relative",
      marginVertical: ScreenWidth * 0.06,
    },

    modalIconFormContainer: {},

    modalHeaderFormContainer: {
      flex: 1,
      justifyContent: "center",
      marginRight: ScreenWidth * 0.09,
    },

    // filter
    modalHeaderFilterContainer: {},

    modalIconFilterContainer: {},

    filterBoxTitleText: {
      fontSize: ScreenWidth * 0.046,
      fontWeight: "bold",
      marginBottom: ScreenWidth * 0.04,
    },

    filterStatus: {
      flexDirection: "column",
    },

    filterChecbox: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    filterLeave: {},

    filterTeamMember: {},

    // common
    checkboxText: {
      fontSize: ScreenWidth * 0.04,
      fontWeight: "normal",
    },

    checkboxContainer: {
      marginVertical: ScreenWidth * 0.0,
      marginLeft: 0,
    },

    lineHR: {
      marginVertical: ScreenWidth * 0.028,
      width: "100%",
      height: ScreenWidth * 0.001,
      backgroundColor: colors.subtitle,
    },

    // common select box
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
      width: "100%",
    },

    buttonRow: {
      marginTop: ScreenWidth * 0.08,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    button50: {
      width: "48%",
    },
  });
};
