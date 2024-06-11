import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Button,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";

import { useContext, useLayoutEffect, useState } from "react";
import { MaxSpacer, MidSpacer, MinSpacer } from "../Utils/Spacers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { FIREBASE_APP, FIREBASE_AUTH } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { ThemeContext } from "../Theme/ThemeContext";
import { sendEmailVerification } from "firebase/auth";

export default function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVerificateModalVisible, setIsVerificateModalVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [count, setCount] = useState(0);
  const { theme } = useContext(ThemeContext);
  const [processing, setProcessing] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    // At least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/;
    return re.test(String(password));
  };
  const signIn = async () => {
    setLoading(true);
    if (email.length == 0 || password.length == 0) {
      setErrorMessage("Email or password is empty.");
      setIsModalVisible(true);
      setLoading(false);
    } else if (!validateEmail(email)) {
      setErrorMessage("Invalid email format.");
      setIsModalVisible(true);
      setLoading(false);
    } else if (!validatePassword(password)) {
      setErrorMessage(
        "Password must be at least 6 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      setIsModalVisible(true);
      setLoading(false);
    } else {
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
    setLoading(false);
  };

  useLayoutEffect(() => {
    if (count == 0) {
      checkUser();
      setCount(1);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MaxSpacer></MaxSpacer>
      <Image
        style={{
          width: Dimensions.get("window").width * 0.7,
          height: Dimensions.get("window").width * 0.25,
          resizeMode: "stretch",
        }}
        source={require("../assets/logo-center.png")}
      />
      <MinSpacer></MinSpacer>
      <View style={styles.loginarea}>
        <View style={[styles.inputStyle, { backgroundColor: theme.primary }]}>
          <TextInput
            style={[
              styles.inputText,
              {
                color: theme.text,
                fontSize: Dimensions.get("window").width / 28,
              },
            ]}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={theme.text}
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
        <View style={[styles.inputStyle, { backgroundColor: theme.primary }]}>
          <TextInput
            ref={(input) => {
              this.secondTextInput = input;
            }}
            placeholderTextColor={theme.text}
            returnKeyType="done"
            style={[
              styles.inputText,
              {
                color: theme.text,
                fontSize: Dimensions.get("window").width / 28,
              },
            ]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />
          <MaterialCommunityIcons
            name={!showPassword ? "eye-off" : "eye"}
            size={Dimensions.get("window").width / 20}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>
        <View style={styles.forgotPassword}>
          <Text
            style={{
              color: theme.text,
              fontSize: Dimensions.get("window").width / 30,
            }}
            onPress={() => {
              navigation.navigate("ResetPassword");
            }}
          >
            Forgot Password
          </Text>
        </View>
      </View>
      <MinSpacer></MinSpacer>
      <View style={[styles.button, { backgroundColor: theme.button }]}>
        <TouchableOpacity
          onPress={signIn}
          style={[styles.button, { backgroundColor: theme.button }]}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: theme.button,
              }}
            >
              <ActivityIndicator size="small" color={theme.buttonText} />
            </View>
          ) : (
            <Text
              style={{
                fontSize: Dimensions.get("window").width / 24,
                color: theme.buttonText,
              }}
            >
              Login
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <Text></Text>
      <Text
        style={[
          styles.signUp,
          { color: theme.text, fontSize: Dimensions.get("window").width / 30 },
        ]}
      >
        Don't have an account?{" "}
        <Text
          onPress={onHandlePress}
          style={{
            color: theme.button,
            fontSize: Dimensions.get("window").width / 30,
          }}
        >
          Sign Up
        </Text>
      </Text>
      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <View
          style={{
            backgroundColor: "rgba(10,10,10,0.6)",
            flex: 1,
            height: Dimensions.get("window").height,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.primary,
              width: "80%",
              paddingTop: 50,
              borderRadius: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20, color: theme.text }}>
              {errorMessage}
            </Text>
            <MinSpacer />
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
              }}
              style={{
                width: "100%",
                height: 50,
                backgroundColor: theme.shadow,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.text, fontSize: 18 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVerificateModalVisible}
        onRequestClose={() => {
          setIsVerificateModalVisible(!isVerificateModalVisible);
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(10,10,10,0.6)",
            flex: 1,
            height: Dimensions.get("window").height,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.primary,
              width: "80%",
              paddingTop: 50,
              borderRadius: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: theme.text, fontSize: 14, paddingBottom: 40 }}
            >
              We have sent an email for you to confirm your account. Don't
              forget to check your spam box.
            </Text>
            <View style={{ width: "100%", flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => {
                  setProcessing(false);
                  setIsVerificateModalVisible(false);
                }}
                style={{
                  width: "50%",
                  height: 50,
                  backgroundColor: theme.shadow,
                  borderBottomLeftRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: theme.text, fontSize: 18 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    setProcessing(true);
                    await sendEmailVerification(FIREBASE_AUTH.currentUser!);
                    setProcessing(false);
                    setIsVerificateModalVisible(false);
                  } catch (error) {
                    setProcessing(false);
                    setIsVerificateModalVisible(false);
                    setProcessing(false);
                    setErrorMessage(error);
                    console.log(error);
                    Alert.alert("Too many request");
                  }
                }}
                style={{
                  borderBottomRightRadius: 20,
                  width: "50%",
                  height: 50,
                  backgroundColor: "rgb(253,60,74)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {processing ? (
                  <ActivityIndicator
                    size={"small"}
                    color={"white"}
                  ></ActivityIndicator>
                ) : (
                  <Text style={{ color: theme.text, fontSize: 18 }}>
                    Resend
                  </Text>
                )}
              </TouchableOpacity>
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
    height: 55,
    paddingVertical: 10,
    paddingRight: 10,
    fontSize: 18,
  },
  inputStyle: {
    borderColor: "grey",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: Dimensions.get("window").height / 15,
  },
  header: {
    fontSize: 80,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(180,24,113)",
    width: "80%",
    height: Dimensions.get("window").height / 15,
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
