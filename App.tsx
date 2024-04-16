import React, { useLayoutEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import Register from './Register';
import './FirebaseConfig'
import Home from './HomePage';
import PersonalExpenses from './PersonalExpensesEntry';

export type RootStackNavigatorParamsList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  PersonalExpenses: undefined;
};


const Stack = createStackNavigator<RootStackNavigatorParamsList>();

export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ gestureEnabled: false }}/>
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={Home} options={{ gestureEnabled: true, headerShown: false,
  headerLeft: () => <></>, }} />
        <Stack.Screen name="PersonalExpenses" component={PersonalExpenses} options={{ gestureEnabled: true, headerShown: true, headerTitleStyle:{color:"transparent"}
  }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
