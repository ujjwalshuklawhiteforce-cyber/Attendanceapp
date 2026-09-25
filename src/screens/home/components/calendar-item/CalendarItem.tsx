import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
import createStyles from "./CalendarItem.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import type { ICalendarItem } from "@services/models";
import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ICalendarItemProps {
  style?: CustomStyleProp;
  data: ICalendarItem;
  isActive: boolean;
}

const CalendarItem: React.FC<ICalendarItemProps> = ({ data, isActive }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { date, day } = data;
  
  const renderCalendar = () => (
    <View style={[isActive == true ? styles.activeCalendar : styles.calendarContainer]}>
      <Text
        color={isActive == true ? colors.white : colors.titleSecond}
        style={styles.dateFont}
      >
        {date}
      </Text>
      <Text
        color={isActive == true ? colors.white : colors.title}
        style={styles.dayFont}
      >
        {day}
      </Text>
    </View>
  );

  return (
    <View>{renderCalendar()}</View>
    // <RNBounceable style={[styles.container, style]} onPress={onPress}>
    //   {renderHeader()}
    //   <View style={styles.contentContainer}>
    //     {renderLanguage()}
    //     {renderStar()}
    //     {renderFork()}
    //   </View>
    // </RNBounceable>
  );
};

export default CalendarItem;
