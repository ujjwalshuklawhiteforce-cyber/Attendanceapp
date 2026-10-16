
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, ActivityIndicator, Alert } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Icon from "react-native-vector-icons/Ionicons";
import { ScreenWidth } from "@freakycoder/react-native-helpers";
import { postApi } from "@services/api.service";
import * as NavigationService from "react-navigation-helpers";
import { SCREENS } from "@shared-constants";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';

// TaskList Component with API Data
const TaskList = ({ title, tasks }) => (
    <ScrollView style={styles.scrollView}>
        {tasks.length > 0 ? (
            tasks.map((task, i) => (
                <View key={i} style={styles.taskItem}>
                    <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle}> Task Id : {task.task_id}</Text>
                        <Text style={{  fontWeight:"bold",
                            color: task.status === 0 ? "#d48c85" : task.status === 1 ? "orange" : "#3e9c97", 
                            marginRight: 7 
                        }}>
                            {task.status === 0 ? "Pending" : task.status === 1 ? "Progress" : "Completed"}
                        </Text>
                    </View>
                    <View style={[styles.taskBody, { borderLeftColor: getBorderColor(task.status) }]}>
                        <Text style={styles.taskDescription}>{task.task_name}</Text>
                        <View style={styles.row}>
                        {/* <Icon name="location-outline" size={14} color="black" /> */}
                        <Text style={{color:"black" ,fontSize:13, fontWeight:700 ,}}>Created :</Text>
                            <Text style={{color:"black" ,fontSize:12}}>
                            {task.created_at.slice(0, 10)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.taskFooter}>
                        <View style={styles.row}>
                            {/* <Icon name="time-outline" size={20} color="red" /> */}
                            <Text style={{ color: "#d48c85", fontSize:13 ,fontWeight:800 }} >Dead-line :</Text>
                            <Text style={{ color: "black",fontSize:12 }}>20/02/205</Text>
                        </View>
                        <View style={styles.row}>
                            <Icon name="people-outline" size={20} color="black" />
                            {/* <Text style={{ color: "blue" }}> :</Text> */}
                            <Text style={{ color: "black" }}>{task.assigned_by}</Text>
                        </View>
                        {/* <View style={styles.row}>
                            <Icon name="chatbubble-outline" size={20} color="black" />
                            <Text style={{ color: "black" }}>{task.feedback}</Text>
                        </View> */}
                    </View>
                </View>
            ))
        ) : (
            <Text style={styles.noDataText}>No tasks available</Text>
        )}
    </ScrollView>
);

// Function to get border color based on task status
const getBorderColor = (status) => {
    switch (status) {
        case 0: return "#ed5e51"; // Pending
        case 1: return "orange"; // In Progress
        case 2: return "#3e9c97"; // Completed
        default: return "gray"; // Default
    }
};
  const handleItemPress = () => {
    Alert.alert("ef ")
  };

// Main Component
export default function Appss() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: "all", title: "Today" },
        { key: "pending", title: "Pending" },
        { key: "progress", title: "Progress" },
        { key: "completed", title: "Completed" },
    ]);
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch tasks from API
    const fetchTaskList = async () => {
        setLoading(true);
        const data = { user_id:  12213};
        const taskResponse = await postApi("/assigned-task-list", data);
        if (taskResponse?.status === true) {
            setTaskList(taskResponse.data);
            console.log("all data", taskResponse);
            await AsyncStorage.setItem('taskListLength', taskResponse.data.length.toString());
            
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTaskList();
    }, []);

    // Filter tasks based on status
    const getFilteredTasks = (status) => taskList.filter((task) => task.status === status);

    // Define screens for different tabs
    const renderScene = SceneMap({
        all: () => <TaskList title="All Task" tasks={taskList} />,
        pending: () => <TaskList title="Pending Task" tasks={getFilteredTasks(0)} />,
        progress: () => <TaskList title="Progress Task" tasks={getFilteredTasks(1)} />,
        completed: () => <TaskList title="Completed Task" tasks={getFilteredTasks(2)} />,
    });

    if (loading) {
        return <ActivityIndicator size="large" color="green" style={styles.loader} />;
    }

    return (
        < View style={{backgroundColor:"#f3f3f3",  height:"100%"}}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Your Task</Text>
                <TouchableOpacity style={{marginRight:30}} onPress={() => NavigationService.navigate(SCREENS.ADDTASK)}>
                    <View>
                        <Icon
                            name="add-outline"
                            color={"black"}
                            size={30}
                        />
                    </View>
                </TouchableOpacity>
            </View>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        style={styles.tabBar}
                        indicatorStyle={styles.indicator}
                        renderLabel={({ route, focused }) => (
                            <Text style={{ color: focused ? "green" : "gray", padding: 3 }}>{route.title}</Text>
                        )}
                    />
                )}
            />
        </ View>
    );
}

const styles = StyleSheet.create({
    scrollView: { flex: 1, padding: 10 },
    taskItem: {
        backgroundColor: "#fff",
        height: ScreenWidth * 0.34,
        width: ScreenWidth * 0.96,
        marginVertical: 9,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 10,
    },
    taskHeader: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 5, borderBottomWidth: 0.5, borderBottomColor: "#d7dadb" },
    taskBody: { borderLeftWidth: 3, marginLeft: 15, paddingLeft: 10 },
    taskTitle: { fontSize: 13, fontWeight: "bold", color: "#333" },
    taskDescription: { fontSize: 14, fontWeight:"700", color: "black", marginTop: 5 ,marginBottom:2 ,textTransform:"capitalize" },
    taskFooter: { flexDirection: "row", padding: 10, justifyContent: "space-between" },
    row: { flexDirection: "row", gap: 10 ,alignItems:"center", marginBottom:9  },
    header: { backgroundColor: "white", paddingTop:80, paddingLeft:20, color:"black",  paddingBottom:10, flexDirection:"row",justifyContent:"space-between"},
    headerText: { textTransform: "capitalize", fontSize: 18 ,color:"black",fontWeight:"bold"},
    tabBar: { backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#ddd" },
    indicator: { backgroundColor: "green", height: 3 },
    noDataText: { textAlign: "center", fontSize: 12, color: "gray", marginTop: 20 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
