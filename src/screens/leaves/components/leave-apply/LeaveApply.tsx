import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Image, TouchableOpacity, View } from "react-native";
import createStyles from "./LeaveApply.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import type { ILeaveApply } from "@services/models";
import Text from "@shared-components/text-wrapper/TextWrapper";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { CommonButton } from "@screens/common/button/CommonButton";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ILeaveApplyProps {
  style?: CustomStyleProp;
  data: ILeaveApply;
  onPress: () => void;
}

const LeaveApply: React.FC<ILeaveApplyProps> = ({ data, onPress }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderLeave = () => (
    <RNBounceable onPress={onPress}>
      <View style={styles.LeaveApplyCard}>
        <View style={styles.LeaveApplyHeader}>
          <View style={styles.LeaveApplyImageContainer}>
            <Image
              resizeMode="cover"
              source={{ uri: data.profile_img }}
              style={styles.LeaveApplyImage}
            />
          </View>
          <View style={styles.LeaveApplyTextContainer}>
            <Text color={colors.titleSecond} style={styles.LeaveApplyNameText}>
              {data.name}
            </Text>
            <Text color={colors.titleSecond} style={styles.LeaveApplyDateText}>
              {data.date_from} - {data.date_to}
            </Text>
          </View>
        </View>
        <View style={styles.LeaveApplyButtons}>
          <CommonButton
            style={styles.Button}
            textColor={colors.white}
            customStyle={{ backgroundColor: colors.danger }}
            text="Reject"
            iconName="close-circle-outline"
            onPress={() => {}}
          />
          <CommonButton
            style={styles.Button}
            textColor={colors.white}
            customStyle={{ backgroundColor: colors.success }}
            text="Accept"
            iconName="checkmark-circle-outline"
            onPress={() => {}}
          />
        </View>
      </View>
    </RNBounceable>
  );

  return <View>{renderLeave()}</View>;
};

export default LeaveApply;
