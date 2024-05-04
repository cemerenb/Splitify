import React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import * as SecureStore from "expo-secure-store";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { TouchableOpacity } from "react-native-gesture-handler";

function Profile() {
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
      <TouchableOpacity
        onPress={() => {
          signOut();
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderRadius: 100,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderColor: "white",
          }}
        >
          <Text style={{ color: "white", fontSize: 25 }}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#818CF8",
    alignItems: "center",
    justifyContent: "center",
  },
});
