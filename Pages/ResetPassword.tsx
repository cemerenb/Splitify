import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { RootStackNavigatorParamsList } from "../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaxSpacer } from "../Utils/Spacers";
import { sendPasswordResetEmail } from "firebase/auth";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import validator from "validator";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
  const handleResetPassword = async () => {
    await sendPasswordResetEmail(FIREBASE_AUTH, email)
      .then(() => {
        Alert.alert(
          "Email Sent",
          "We sent you an email. Please don't forget to check spam folder",
          [{ text: "Okay", onPress: () => navigation.replace("Login") }],
          { cancelable: false }
        );
      })
      .catch((error: any) => {
        Alert.alert("An error occured. Please try ");
        console.log(error.message);
      });
  };
  return (
    <SafeAreaView
      style={{ backgroundColor: "white", flex: 1, paddingHorizontal: 20 }}
    >
      <View style={{ justifyContent: "space-evenly", flex: 1 }}>
        <View style={{ flex: 4 }}>
          <View style={{ flex: 1, alignItems: "center", marginBottom: 40 }}>
            <Image
              style={{ width: 140, height: 140 }}
              source={require("../assets/forget-b.png")}
            />
          </View>

          <View style={{ flex: 1, width: "100%" }}>
            <Text style={{ color: "black", fontSize: 50, fontWeight: "300" }}>
              Reset Password
            </Text>
            <Text style={{ fontWeight: "200", width: "70%" }}>
              We will send you an email if an account exist with this email
            </Text>
          </View>
          <MaxSpacer></MaxSpacer>
          <View style={{ flex: 1 }}>
            <View style={styles.inputStyle}>
              <TextInput
                style={styles.inputText}
                keyboardType="email-address"
                placeholder="Email"
                onChangeText={setEmail}
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                returnKeyType="next"
                onSubmitEditing={() => {
                  this.secondTextInput.focus();
                }}
              />
            </View>
          </View>
        </View>
        <View style={{ flex: 3, justifyContent: "center" }}>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                if (email.length < 1) {
                  Alert.alert("Email can't be empty");
                }
                if (email.length > 0 && !validator.isEmail(email)) {
                  Alert.alert("Email is bad formatted");
                }
                if (email.length > 0 && validator.isEmail(email)) {
                  handleResetPassword();
                }
              }}
              style={styles.button}
            >
              <Text style={{ fontSize: 20, color: "white" }}>Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(180,24,113)",
    height: 65,
    borderRadius: 10,
  },
  inputStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    height: 65,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  inputText: {
    flex: 1,
    color: "#333",
    height: 55,
    paddingVertical: 10,
    paddingRight: 10,
    fontSize: 18,
  },
});
