import React, { useLayoutEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {  Button, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { MinSpacer } from './Spacers';
import { FIREBASE_AUTH, FIRESTORE_DB } from './FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackNavigatorParamsList } from './App';
import * as SecureStore from 'expo-secure-store';
import { getDoc, doc, setDoc } from 'firebase/firestore';


export default function Home() {

    const [count, setCount] = useState(0);
    const [setup, setSetup] = useState(false);

    const createDocument = async (uid) => {
        try {
          const docref = doc(FIRESTORE_DB,'personal',uid);
          const data = {
            cem: "cem",
            eren: 2
          }
          setDoc(docref,data);
          
          console.log('Document created successfully!');
        } catch (error) {
          console.error('Error creating document: ', error);
          console.log('Failed to create document. Please try again.');
        }
      };
    useLayoutEffect(() => {
        if (count == 0) {
          checkIfDocumentExists(FIREBASE_AUTH.currentUser.uid);
          setCount(1);
        }
      }, []);
    const checkIfDocumentExists = async (uid) => {
        try {
          const docRef = doc(FIRESTORE_DB, 'users', uid); 
          const docSnap = await getDoc(docRef);
          console.log(uid);
          
          console.log(docSnap.exists());
           
        } catch (error) {
            console.log(uid);
          console.error('Error checking document existence:', error);
          console.log(false);
          
        }
      };
    const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
    const signOut = async () => {
        try {
          await SecureStore.deleteItemAsync("email");
          await SecureStore.deleteItemAsync("password");
          await FIREBASE_AUTH.signOut();
          navigation.replace("Login");
        } catch (error) {
          console.error("Error signing out:", error);
        }
      };
        return (
            <View style={styles.container}>
                <IconButton style={{alignSelf:"flex-end"}} icon="logout" iconColor="black" size={30}  onPress={() => signOut()}/>
                <Text style={styles.header}>Sign Up to Splitify</Text>
                <View style={styles.loginarea}>
                    <MinSpacer />
                    <MinSpacer />
                </View>  
                <Text></Text>
                <Text style={styles.signUp}>
                    Already have an account?  
                    <Text onPress={navigation.goBack} style={{ color: 'purple' }}> Login</Text>
                </Text>

                <StatusBar style="auto" />
               
            </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    loginarea: {
        width: "80%",
    },
    inputText: {
        flex: 1, 
        color: '#333', 
        paddingVertical: 10, 
        paddingRight: 10, 
        fontSize: 18, 
    },
    inputStyle: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f3f3f3', 
        borderRadius: 8, 
        paddingHorizontal: 14, 
    },
    icon: { 
        textAlign:'center',
        marginLeft: 10, 
    }, 
    button: {
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#f59e5f",
        width:"80%",
        height:50,
        borderRadius:20,
    },
    signUp: {
        fontSize:16
    },
});
