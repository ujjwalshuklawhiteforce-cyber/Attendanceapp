import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
import createStyles from "./LeaveDetailCard.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import type { ILeaveDetailCard } from "@services/models";
import Text from "@shared-components/text-wrapper/TextWrapper";
import RNBounceable from "@freakycoder/react-native-bounceable";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ILeaveDetailCardProps {
  style?: CustomStyleProp;
  data: ILeaveDetailCard;
  // onPress: () => void;
}

const LeaveDetailCard: React.FC<ILeaveDetailCardProps> = ({ data }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderLeave = () => (
    <RNBounceable>
      <View style={styles.leaveDetailCard}>
        <View style={styles.leaveDetailCardHeader}>
          <View style={styles.leaveDetailCardDate}>
            <Text
              color={colors.subtitleSecond}
              style={styles.leaveDetailCardDateTitle}
            >
              Date
            </Text>
            <Text
              color={colors.titleSecond}
              style={styles.leaveDetailCardDateText}
            >
              {data.date_from} - {data.date_to}
            </Text>
          </View>
          <View
            style={[
              styles.leaveDetailCardStatus,
              {
                backgroundColor:
                  data.status === "approved"
                    ? colors.bgSuccess
                    : data.status === "rejected"
                      ? colors.bgDanger
                      : colors.bgWarning,
              },
            ]}
          >
            <Text
              color={
                data.status === "approved"
                  ? colors.success
                  : data.status === "rejected"
                    ? colors.danger
                    : colors.warning
              }
              style={styles.leaveDetailCardStatusText}
            >
              {data.status}
            </Text>
          </View>
        </View>
        <View style={styles.lineHR} />
        <View style={styles.leaveDetailCardContent}>
          <View>
            <Text color={colors.subtitleSecond} style={styles.leaveDetailHeading}>
              Apply Days
            </Text>
            <Text color={colors.titleSecond} style={styles.leaveDetailValue}>
              {data.apply_days}
            </Text>
          </View>
          <View>
            <Text color={colors.subtitleSecond} style={styles.leaveDetailHeading}>
              Leave Balance
            </Text>
            <Text color={colors.titleSecond} style={styles.leaveDetailValue}>
              {data.leave_balance}
            </Text>
          </View>
          <View>
            <Text color={colors.subtitleSecond} style={styles.leaveDetailHeading}>
              Approved By
            </Text>
            <Text color={colors.titleSecond} style={styles.leaveDetailValue}>
              {data.approved_by}
            </Text>
          </View>
        </View>
      </View>
    </RNBounceable>
  );

  return <View>{renderLeave()}</View>;
};

export default LeaveDetailCard;
