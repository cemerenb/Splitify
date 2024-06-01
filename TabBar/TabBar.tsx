import React, { useContext } from "react";
import {
  Animated,
  Dimensions,
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
import Profile from "../Pages/Profile";
import Home from "../Pages/HomePage";
import PersonalExpensEntry from "../Pages/PersonalExpensesEntry";
import PersonalExpensesEntry from "../Pages/PersonalExpensesEntry";
import Groups from "../Pages/Groups";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../Theme/ThemeContext";

const BottomBar = createBottomTabNavigator();

type Props = {
  barColor: string;
};

const renderTabBar = ({ routeName, selectedTab, navigate }) => {
  const renderIcon = (routeName, selectedTab) => {
    return (
      <Ionicons
        name={
          routeName == "homepage"
            ? "home-outline"
            : routeName == "profile"
            ? "person-outline"
            : routeName == "groups"
            ? "grid-outline"
            : "bar-chart"
        }
        size={25}
        color={routeName === selectedTab ? "#C43762" : "gray"}
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
export const TabBar: React.FC<Props> = ({}) => (
  <CurvedBottomBarExpo.Navigator
    type="DOWN"
    style={styles.bottomBar}
    shadowStyle={[
      {
        shadowColor: useContext(ThemeContext).theme.bottomBar,
      },
    ]}
    height={75}
    circleWidth={60}
    bgColor={useContext(ThemeContext).theme.bottomBar}
    initialRouteName="homepage"
    screenOptions={{ headerShown: false }}
    borderTopLeftRight
    renderCircle={({ selectedTab, navigate }) => (
      <Animated.View style={styles.btnCircleUp}>
        <LinearGradient
          colors={["rgba(130, 67, 255, 1)", "rgba(221, 50, 52, 1)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 200,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigate("AddExpense");
            }}
          >
            <Ionicons name={"add-sharp"} color={"white"} size={35} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    )}
    tabBar={renderTabBar}
  >
    <CurvedBottomBarExpo.Screen
      name="homepage"
      position="LEFT"
      component={Home}
    />
    <CurvedBottomBarExpo.Screen
      name="groups"
      position="RIGHT"
      component={Groups}
    />
  </CurvedBottomBarExpo.Navigator>
);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 5,
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
