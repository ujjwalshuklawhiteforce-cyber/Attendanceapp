import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { ScrollView } from "react-native";
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
import createStyles from "./TaskCard.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
// import type { ITaskCard } from "@services/models";
import Text from "@shared-components/text-wrapper/TextWrapper";
import RNBounceable from "@freakycoder/react-native-bounceable";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ITaskCardProps {
  style?: CustomStyleProp;
  data: any;
  // onPress: () => void;
}



const TaskCard: React.FC<ITaskCardProps> = ({ data }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const truncate = (text:any,maxLength:any) => {
    if (text?.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

  const renderLeave = () => (
    <RNBounceable>
      <View style={styles.TaskCard}>
        <View style={styles.TaskCardHeader}>
          <View style={styles.TaskCardDate}>
            <Text
              color={colors.subtitleSecond}
              style={styles.TaskCardDateTitle}
            >
              Date
            </Text>
            <Text color={colors.titleSecond} style={styles.TaskCardDateText}>
              {data.task_name}
            </Text>
          </View>
          <View
            style={[
              styles.TaskCardStatus,
              {
                backgroundColor:
                  data.status === 2
                    ? colors.bgSuccess
                    : data.status === 0
                      ? colors.bgDanger
                      : colors.bgWarning,
              },
            ]}
          >
            <Text
              color={
                data.status === 2
                  ? colors.success
                  : data.status === 0
                    ? colors.danger
                    : colors.warning
              }
              style={styles.TaskCardStatusText}
            >
              {data.status === 2
                ? "Completed"
                : data.status === 1
                  ? "Progress"
                  : "Pending"}
            </Text>
          </View>
        </View>
        <View style={styles.lineHR} />
        <View style={styles.TaskCardContent}>
          <View>
            <Text
              color={colors.subtitleSecond}
              style={styles.leaveDetailHeading}
            >
              Location
            </Text>
            <Text color={colors.titleSecond} style={styles.leaveDetailValue}>
              {truncate(data.place || "N/A", 6)}
            </Text>
          </View>
          <View>
            <Text
              color={colors.subtitleSecond}
              style={styles.leaveDetailHeading}
            >
              Feedback
            </Text>
            <Text color={colors.titleSecond} style={styles.leaveDetailValue}>
            {truncate(data.feedback || "N/A", 5)}
            </Text>
          </View>
          <View>
            <Text
              color={colors.subtitleSecond}
              style={styles.leaveDetailHeading}
            >
              Approved By
            </Text>
            <Text color={colors.titleSecond} style={styles.leaveDetailValue}>
              {data.assigned_by}
            </Text>
          </View>
        </View>
      </View>
    </RNBounceable>
  );

  return <View>{renderLeave()}</View>;
};

export default TaskCard;
