import type { ExtendedTheme } from "@react-navigation/native";
import { DefaultTheme } from "@react-navigation/native";

export const palette = {
  primary: "#3085FE",
  secondary: "#ff6a00",
  background: "rgba(48, 133, 254, 0.05)",
  maiBbackground: "#f7f7f7",
  white: "#ffffff",
  black: "#101317",
  button: "#1c1e21",
  shadow: "#757575",
  lightGray: "#f1f1f1",
  text: "#b8b9be",
  borderColor: "#d0d7de",
  borderColorDark: "#333942",
  placeholder: "#a1a1a1",
  danger: "#ff7f74",
  bgDanger: "#fff9f8",
  title: "rgb(102, 102, 102)",
  titleSecond: "#1f2125",
  subtitle: "#ACAFB5",
  subtitleSecond: "#696c6e",
  tabHeader: "#f7f7f7",
  separator: "rgb(194, 194, 195)",
  highlight: "rgb(199, 198, 203)",
  blackOverlay: "rgba(0,0,0,0.6)",
  iconWhite: "#fff",
  iconBlack: "#101214",
  dynamicWhite: "#fff",
  dynamicBlack: "#1c1e21",
  dynamicBackground: "#fff",
  transparent: "transparent",
  calpyse: "#2b7488",
  success: "#4ac5bd",
  bgSuccess: "#f6fcfb",
  warning: "#8aa726",
  bgWarning: "#fafdf5",
  line: "#f7f7f8",
  taskCardbg: "#5F33E0",
  taskCirclebg: "#8763FE",
};

export const LightTheme: ExtendedTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...palette,
  },
};

export const DarkTheme: ExtendedTheme = {
  ...DefaultTheme,
  colors: {
    ...LightTheme.colors,
    background: palette.black,
    foreground: palette.white,
    text: palette.white,
    tabBar: palette.black,
    iconWhite: palette.black,
    iconBlack: palette.white,
    dynamicBackground: palette.dynamicBlack,
    shadow: palette.transparent,
    borderColor: palette.borderColorDark,
  },
};
