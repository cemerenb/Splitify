import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import { TabBar } from "./TabBar/TabBar";
import PersonalExpensEntry from "./Pages/PersonalExpensesEntry";
import ExpenseEntry from "./Pages/ExpensDetails";
import Groups from "./Pages/Groups";
import CreateGroup from "./Pages/CreateGroup";
import ResetPassword from "./Pages/ResetPassword";
import AllExpenses from "./Pages/AllExpenses";
import GroupPage from "./Pages/GroupPage";
import Members from "./Pages/Members";
import JoinGroup from "./Pages/JoinGroup";
import JoinPage from "./Pages/JoinGroup";

export type RootStackNavigatorParamsList = {
  Login: undefined;
  Register: undefined;
  TabBar: undefined;
  Groups: undefined;
  AddExpense: undefined;
  ExpenseEntry: undefined;
  CreateGroup: undefined;
  ResetPassword: undefined;
  AllExpenses: undefined;
  GroupPage: undefined;
  Members: undefined;
  JoinPage: undefined;
};

const Stack = createStackNavigator<RootStackNavigatorParamsList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ gestureEnabled: false, headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ gestureEnabled: false, headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{
            gestureEnabled: false,
            headerShown: true,
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="AllExpenses"
          component={AllExpenses}
          options={{
            gestureEnabled: false,
            headerShown: false,
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="GroupPage"
          component={GroupPage}
          options={{
            gestureEnabled: false,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="JoinPage"
          component={JoinPage}
          options={{
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
              backgroundColor: "#FF964F",
              borderColor: "transparent",
            },
            gestureEnabled: false,
            headerBackTitle: "Back",
            headerBackTitleStyle: { fontWeight: "500" },
            headerTintColor: "white",
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="Members"
          component={Members}
          options={{
            gestureEnabled: false,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ExpenseEntry"
          component={ExpenseEntry}
          options={{
            headerShown: false,
            headerTransparent: true,
            headerTintColor: "white",
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroup}
          options={{
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
              backgroundColor: "rgb(0,168,107)",
              borderColor: "transparent",
            },
            gestureEnabled: false,
            headerBackTitle: "Back",
            headerBackTitleStyle: { fontWeight: "500" },
            headerTintColor: "white",
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="Groups"
          component={Groups}
          options={{
            gestureEnabled: false,
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AddExpense"
          component={PersonalExpensEntry}
          options={{
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
              backgroundColor: "rgb(253,60,74)",
              borderColor: "transparent",
            },
            gestureEnabled: false,
            headerBackTitle: "Back",
            headerBackTitleStyle: { fontWeight: "500" },
            headerTintColor: "white",
            headerTitle: "Expense",
            headerTitleStyle: {
              fontSize: 20,
              color: "white",
            },
          }}
        />
        <Stack.Screen
          name="TabBar"
          component={TabBar}
          options={{
            gestureEnabled: true,
            headerShown: false,
            headerLeft: () => null, // Remove the back button
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const RootApp: React.FC = () => <App />;

export default RootApp;
