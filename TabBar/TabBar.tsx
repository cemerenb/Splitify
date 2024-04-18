import React from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  BottomTabBar,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { CurvedBottomBarExpo } from "react-native-curved-bottom-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import Profile from "../Profile";
import Home from "../HomePage";
import PersonalExpensEntry from "../PersonalExpensesEntry";
import PersonalExpensesEntry from "../PersonalExpensesEntry";

const BottomBar = createBottomTabNavigator();

type Props = {
  barColor: string;
};

const renderTabBar = ({ routeName, selectedTab, navigate }) => {
  const renderIcon = (routeName, selectedTab) => {
    let icon = "";

    switch (routeName) {
      case "title1":
        icon = "ios-home-outline";
        break;
      case "title2":
        icon = "settings-outline";
        break;
    }

    return (
      <Ionicons
        name={routeName == "title1" ? "home-outline" : "person-outline"}
        size={25}
        color={routeName === selectedTab ? "rgb(222, 110, 235)" : "gray"}
      />
    );
  };
  return (
    <TouchableOpacity
      onPress={() => navigate(routeName)}
      style={styles.tabbarItem}
    >
      {renderIcon(routeName, selectedTab)}
    </TouchableOpacity>
  );
};
export const TabBar: React.FC<Props> = ({ barColor }) => (
  <CurvedBottomBarExpo.Navigator
    type="DOWN"
    style={styles.bottomBar}
    shadowStyle={styles.shawdow}
    height={75}
    circleWidth={60}
    bgColor="white"
    initialRouteName="title1"
    screenOptions={{ headerShown: false }}
    borderTopLeftRight
    renderCircle={({ selectedTab, navigate }) => (
      <Animated.View style={styles.btnCircleUp}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigate("AddExpense");
          }}
        >
          <Ionicons name={"add-sharp"} color={"white"} size={35} />
        </TouchableOpacity>
      </Animated.View>
    )}
    tabBar={renderTabBar}
  >
    <CurvedBottomBarExpo.Screen
      name="title1"
      position="LEFT"
      component={Home}
    />

    <CurvedBottomBarExpo.Screen
      name="title2"
      component={Profile}
      position="RIGHT"
    />
  </CurvedBottomBarExpo.Navigator>
);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  shawdow: {
    shadowColor: "#DDDDDD",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  button: {
    flex: 1,
    justifyContent: "center",
  },
  bottomBar: {},
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(222, 110, 235)",
    bottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  imgCircle: {
    width: 30,
    height: 30,
    tintColor: "gray",
  },
  tabbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 30,
    height: 30,
  },
  screen1: {
    flex: 1,
    backgroundColor: "#BFEFFF",
  },
  screen2: {
    flex: 1,
    backgroundColor: "#FFEBCD",
  },
});
