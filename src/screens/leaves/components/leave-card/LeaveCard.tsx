import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
import createStyles from "./LeaveCard.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import type { ILeaveCard } from "@services/models";
import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ILeaveCardProps {
  style?: CustomStyleProp;
  data: ILeaveCard;
}

const LeaveCard: React.FC<ILeaveCardProps> = ({ data }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderLeave = () => (
    <View
      style={[
        styles.leaveCard,
        { backgroundColor: data.bgColor, borderColor: data.borderColor },
      ]}
    >
      <Text style={styles.cardTitle} color={colors.titleSecond}>
        {data.title}
      </Text>
      <Text style={styles.cardDays} color={data.borderColor}>
        {data.days}
      </Text>
    </View>
  );

  return <View>{renderLeave()}</View>;
};

export default LeaveCard;
