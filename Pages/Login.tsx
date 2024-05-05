import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Button,
  Image,
  Dimensions,
} from "react-native";
import { useLayoutEffect, useState } from "react";
import { MaxSpacer, MidSpacer, MinSpacer } from "../Utils/Spacers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "@firebase/auth";
import Modal from "react-native-modal";
import { FIREBASE_APP, FIREBASE_AUTH } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import * as SecureStore from "expo-secure-store";
import React from "react";
import Svg from "react-native-svg";

export default function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVerificateModalVisible, setIsVerificateModalVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [count, setCount] = useState(0);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      if (response) {
        if (!FIREBASE_AUTH.currentUser.emailVerified) {
          setIsVerificateModalVisible(true);
        }
        if (FIREBASE_AUTH.currentUser!.emailVerified) {
          await SecureStore.setItemAsync("email", email);
          await SecureStore.setItemAsync("password", password);
          navigation.replace("TabBar");
        }
      }
    } catch (error) {
      console.error("Error while signing in:", error);
      setErrorMessage("Error signing in. Please check your credentials.");
      setIsModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  const onHandlePress = () => {
    navigation.navigate("Register");
  };

  const checkUser = async () => {
    try {
      const email = await SecureStore.getItemAsync("email");
      const password = await SecureStore.getItemAsync("password");

      if (email && password) {
        const response = await signInWithEmailAndPassword(
          FIREBASE_AUTH,
          email,
          password
        );

        if (response && response.user.uid.length > 0) {
          navigation.replace("TabBar");
        }
      }
    } catch (error) {
      console.error("Error while checking user:", error);
    }
  };

  useLayoutEffect(() => {
    if (count == 0) {
      checkUser();
      setCount(1);
    }
  }, []);

  return (
    <View style={styles.container}>
      <MaxSpacer></MaxSpacer>
      <Image
        style={{
          width: "70%",
          height: "12%",
          resizeMode: "stretch",
        }}
        source={require("../assets/logo-center.png")}
      />
      <MinSpacer></MinSpacer>
      <View style={styles.loginarea}>
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
        <MinSpacer />
        <View style={styles.inputStyle}>
          <TextInput
            ref={(input) => {
              this.secondTextInput = input;
            }}
            returnKeyType="done"
            style={styles.inputText}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />
          <MaterialCommunityIcons
            name={!showPassword ? "eye-off" : "eye"}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>
        <View style={styles.forgotPassword}>
          <Text
            onPress={() => {
              navigation.navigate("ResetPassword");
            }}
          >
            Forgot Password
          </Text>
        </View>
      </View>
      <MinSpacer></MinSpacer>
      <View style={styles.button}>
        <TouchableOpacity onPress={signIn} style={styles.button}>
          <Text style={{ fontSize: 20, color: "white" }}>Login</Text>
        </TouchableOpacity>
      </View>
      <Text></Text>
      <Text style={styles.signUp}>
        Don't have an account?{" "}
        <Text onPress={onHandlePress} style={{ color: "rgb(180,24,113)" }}>
          Sign Up
        </Text>
      </Text>
      <StatusBar style="auto" />
      <Modal isVisible={isModalVisible} backdropOpacity={0.2}>
        <View style={{ height: 200, padding: 20 }}>
          <View
            style={{
              backgroundColor: "white",
              padding: 50,
              borderRadius: 20,
              alignItems: "center",
              alignContent: "stretch",
            }}
          >
            <Text style={{ fontSize: 20 }}>{errorMessage}</Text>
            <MinSpacer />
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal isVisible={isVerificateModalVisible} backdropOpacity={0.2}>
        <View style={{ height: 200, padding: 20 }}>
          <View
            style={{
              backgroundColor: "white",
              padding: 50,
              borderRadius: 20,
              alignItems: "center",
              alignContent: "stretch",
            }}
          >
            <Text style={{ fontSize: 20 }}>
              We have sent an email for you to confirm your account. Don't
              forget to check your spam box.
            </Text>
            <MinSpacer />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignSelf: "stretch",
              }}
            >
              <Button title="Resend" onPress={() => setIsModalVisible(false)} />
              <Button
                title="Close"
                onPress={() => setIsVerificateModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: "center",
    marginLeft: 10,
  },
  forgotPassword: {
    paddingVertical: 15,
    alignSelf: "flex-end",
  },
  loginarea: {
    width: "80%",
  },
  inputText: {
    flex: 1,
    color: "#333",
    height: 55,
    paddingVertical: 10,
    paddingRight: 10,
    fontSize: 18,
  },
  inputStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  header: {
    fontSize: 80,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(180,24,113)",
    width: "80%",
    height: 55,
    borderRadius: 10,
  },
  signUp: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
