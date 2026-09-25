import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
import createStyles from "./TodayAttendance.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import type { ITodayAttendance } from "@services/models";
import Text from "@shared-components/text-wrapper/TextWrapper";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ITodayAttendanceProps {
  style?: CustomStyleProp;
  data: ITodayAttendance;
}

const TodayAttendance: React.FC<ITodayAttendanceProps> = ({ data }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderCalendar = () => (
    <View style={styles.attendanceCard}>
      <View style={styles.attendanceCardHeader}>
        <View style={styles.attendanceCardIcon}>
          <Icon
            name={data.iconType}
            type={IconType.Ionicons}
            style={styles.attendanceCardIconsize}
          />
        </View>
        <Text color={colors.titleSecond} style={styles.attendanceCardTitle}>
          {data.title}
        </Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeFont} color={colors.titleSecond}>
          {data.time}
        </Text>
      </View>
      <Text style={styles.timeSubtitle} color={colors.subtitleSecond}>
        {data.subtitle}
      </Text>
    </View>
  );

  return <View>{renderCalendar()}</View>;
};

export default TodayAttendance;
