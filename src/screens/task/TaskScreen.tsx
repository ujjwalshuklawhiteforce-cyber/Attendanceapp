import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import createStyles from "./TaskScreen.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonButton } from "@screens/common/button/CommonButton";
import PercentageCircle from "./component/percentCircle/PercentageCircle";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import RNCalendarEvents from "react-native-calendar-events";
import { requestCalendarPermission } from "@services/event-emitter/permission";
import { ScreenWidth } from "@freakycoder/react-native-helpers";
import { postApi } from "@services/api.service";
import RNBounceable from "@freakycoder/react-native-bounceable";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import TaskCard from "./component/task-card/TaskCard";
import * as NavigationService from "react-navigation-helpers";
import { SCREENS } from "@shared-constants";

const routes = [
  { key: "all", title: "All" },
  { key: "todo", title: "Pending" },
  { key: "inprogress", title: "Progress" },
  { key: "completed", title: "Completed" },
];

const TaskScreen: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(true);

  // tab
  const [index, setIndex] = React.useState(0);
  const [setCalendars] = useState<any>();

  const [taskList, setTaskList] = useState<any>([]);

  const handleItemPress = () => {
    NavigationService.navigate(SCREENS.ADDTASK);
  };

  useEffect(() => {
    fetchTaskList();
  }, []);

  const fetchTaskList = async () => {
    const data = {
      user_id: 10,
    };

    const taskResponse: any = await postApi("/assigned-task-list", data);
    if (taskResponse?.status == true) {
      setTaskList(taskResponse?.data);
      console.log("all data",taskResponse)
      setLoading(false)
    }
  };

  const addEvent = async () => {
    if (await requestCalendarPermission()) {
      const availableCalendars = await RNCalendarEvents.findCalendars();
      setCalendars(availableCalendars);
      const endDate = new Date(new Date().setHours(new Date().getHours() + 1)); // End date 1 hour later
      try {
        const eventId = await RNCalendarEvents.saveEvent("Sample Event", {
          startDate: new Date().toISOString(),
          endDate: new Date(
            new Date().setHours(new Date().getHours() + 39)
          ).toISOString(), // End date 1 hour later
          notes: "This is a sample note for the event",
          calendarId: "1",
          alarms: [{ date: endDate.toISOString() }],
        });

        if (eventId) {
          Alert.alert(
            "Event Created",
            "The event has been added to your calendar."
          );
        }
      } catch (error) {
        console.error("Error creating event:", error);
        Alert.alert("Error", "There was an error creating the event.");
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderMoreButton = () => (
    <RNBounceable onPress={() => {
      handleItemPress()
    }}>
      {/* <View style={styles.addIconContainer}> */}
      <View>
        <Icon
          name="add-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.addIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <Text color={colors.titleSecond} style={styles.headerTitle}>
            Your Task
          </Text>
        </View>
        <View style={styles.iconButtonContainer}>{renderMoreButton()}</View>
      </View>
    </>
  );

  const renderTodayCard = () => (
    <View style={styles.todayCard}>
      <View style={styles.leftContent}>
        <Text style={styles.statusContent} color={colors.white}>
          You're today's task almost done!
        </Text>
        <CommonButton
          style={styles.viewTaskbtn}
          textColor={colors.taskCardbg}
          customStyle={{ backgroundColor: colors.white }}
          text="View Task"
          iconName=""
          onPress={addEvent}
        />
      </View>
      <View style={styles.percentContent}>
        <PercentageCircle
          percentage={90}
          radius={66}
          strokeWidth={14}
          filledColor={colors.white}
          unfilledColor={colors.taskCirclebg}
        />
      </View>
    </View>
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      labelStyle={{
        textTransform: "capitalize",
        fontWeight: "bold",
        fontSize: ScreenWidth * 0.028,
      }}
      style={styles.tabBarHeader}
      indicatorStyle={styles.tabBarHeaderIndicatorStyle}
      activeColor={colors.white}
      inactiveColor={colors.titleSecond}
    />
  );

  const AllTaskRoute = () => (
    <View style={styles.tabContainer}>
      {taskList.map((data: any) => (
        <TaskCard key={data.id} data={data} />
      ))}
    </View>
  );

  const TodoTaskRoute = () => (
    <View style={styles.tabContainer}>
      {taskList.map((data: any) => (
        (data.status === 0 && <TaskCard key={data.id} data={data} />)
      ))}
    </View>
  );

  const PendingTaskRoute = () => (
    <View style={styles.tabContainer}>
       {taskList.map((data: any) => (
        (data.status === 1 && <TaskCard key={data.id} data={data} />)
      ))}
    </View>
  );

  const CompletedTaskRoute = () => (
    <View style={styles.tabContainer}>
       {taskList.map((data: any) => (
        (data.status === 2 && <TaskCard key={data.id} data={data} />)
      ))}
    </View>
  );

  const renderScene = SceneMap({
    all: AllTaskRoute,
    todo: TodoTaskRoute,
    inprogress: PendingTaskRoute,
    completed: CompletedTaskRoute,
  });

  const renderTabs = () => (
    <View style={styles.marginTop}>
      <TabView
        navigationState={{ index, routes  }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        style={styles.tabSwitchTabView}
        lazy
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {/* <View style={styles.content}>{renderTodayCard()}</View> */}
      {/* <View>{renderTabs()}</View> */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {renderTabs()}
      </ScrollView>
      <View style={styles.button}>
        <CommonButton
          style={""}
          textColor={colors.white}
          customStyle={""}
          text="Assign Task"
          iconName=""
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
};

export default TaskScreen;