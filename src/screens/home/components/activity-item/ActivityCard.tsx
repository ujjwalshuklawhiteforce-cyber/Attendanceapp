import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
import createStyles from "./ActivityCard.style";
// import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import type { activityData } from "@services/models";
import Text from "@shared-components/text-wrapper/TextWrapper";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface IActivityCardProps {
  style?: CustomStyleProp;
  data: activityData;
}

const ActivityCard: React.FC<IActivityCardProps> = ({ data }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderCard = () => (
    <View style={styles.activityCard}>
      <View style={styles.activityLeftCard}>
        <View style={styles.activityLeftCardIcon}>
          <Icon
            name={data.iconType}
            type={IconType.Ionicons}
            style={styles.activityCardIconsize}
          />
        </View>
        <View style={styles.activityLeftCardText}>
          <Text
            style={styles.activityLeftCardTextTitle}
            color={colors.titleSecond}
          >
            {data.title}
          </Text>
          <Text
            style={styles.activityLeftCardTextDate}
            color={colors.subtitleSecond}
          >
            {data.date}
          </Text>
        </View>
      </View>
      <View style={styles.activityRightCard}>
        <View style={styles.activityLeftCardText}>
          <Text
            style={styles.activityLeftCardTextTitle}
            color={colors.titleSecond}
          >
            {data.time}
          </Text>
          <Text
            style={styles.activityLeftCardTextDate}
            color={colors.subtitleSecond}
          >
            {data.subtitle}
          </Text>
        </View>
      </View>
    </View>
  );

  return <View>{renderCard()}</View>;
};

export default ActivityCard;
