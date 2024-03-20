import React, { useLayoutEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import Register from './Register';
import './FirebaseConfig'
import * as SecureStore from 'expo-secure-store';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import Home from './HomePage';

export type RootStackNavigatorParamsList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
