import React, { useLayoutEffect, Component , useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { IconButton, Appbar, Icon } from 'react-native-paper';
import { MinSpacer } from './Spacers';
import { FIREBASE_AUTH, FIRESTORE_DB } from './FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackNavigatorParamsList } from './App';
import * as SecureStore from 'expo-secure-store';
import { getDoc, doc, setDoc, updateDoc, addDoc, arrayUnion } from 'firebase/firestore';
import { Dimensions } from 'react-native';

export default function PersonalExpensEntry() {


    const [totalPrice, setTotalPrice] = useState('');
    const [note, setNote] = useState('');
    const handleAddExpense = async () => {
      try {
          let uid = FIREBASE_AUTH.currentUser.uid;
          const docRef = doc(FIRESTORE_DB, 'personal', uid);
          console.log("1");
          
          const userData = await getDoc(docRef);
          console.log("2");
          
          let expensesArray = userData.data()!.expenses || [];
          console.log(expensesArray);
          
          const newExpense = {
            date: new Date().toISOString(),
            timeStamp: Date.now(),
            total: parseFloat(totalPrice),
            note: note,
          };
          expensesArray.push(newExpense);
          console.log(expensesArray);
          
          setDoc(docRef,{expenses:expensesArray});
              
         
      } catch (error) {
          console.error('Error creating document: ', error);
          console.log('Failed to create document. Please try again.');
      }
  };
  
    const navigation = useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TextInput
            style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
            placeholder="Total Price"
            value={totalPrice}
            onChangeText={setTotalPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
            placeholder="Note"
            value={note}
            onChangeText={setNote}
          />
          <Button title="Add Expense" onPress={handleAddExpense} />
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addData: {
        justifyContent: 'center',
        borderRadius: 30,
        height: 100,
        width: Dimensions.get("window").width - 20,
        color: "red",
        backgroundColor: "red"
    }
});
