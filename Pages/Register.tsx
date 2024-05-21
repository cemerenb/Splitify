import React, { useContext, useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  updateCurrentUser,
  updateProfile,
} from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackNavigatorParamsList } from "../App";
import { doc, setDoc } from "firebase/firestore";
import { MaxSpacer, MidSpacer, MinSpacer } from "../Utils/Spacers";
import { ThemeContext } from "../Theme/ThemeContext";
import Modal from "react-native-modal";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompletedVisible, setIsCompletedVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const passwordFieldRef = useRef<TextInput>(null); // Ref for the password field
  const { theme } = useContext(ThemeContext);

  const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();

  // Function to toggle password visibility
  const toggleShowPassword = () => setShowPassword(!showPassword);

  // Function to toggle confirm password visibility
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Function to handle sign up
  const signUp = async () => {
    setLoading(true);

    // Check if passwords match
    if (password === confirmPassword) {
      try {
        // Create user with email and password
        const response = await createUserWithEmailAndPassword(
          FIREBASE_AUTH,
          email,
          password
        );
        await updateProfile(FIREBASE_AUTH.currentUser, {
          displayName: fullName,
        });
        if (response) {
          console.log(FIREBASE_AUTH.currentUser);
          console.log(FIREBASE_AUTH.currentUser.displayName);

          // Send email verification
          sendEmailVerification(FIREBASE_AUTH.currentUser!);
          // Create document in Firestore
          createDocument(FIREBASE_AUTH.currentUser!.uid);
        }

        setIsCompletedVisible(true);
      } catch (error: any) {
        // Set error message based on error code
        switch (error.code) {
          case "auth/email-already-in-use":
            setErrorMessage("Email already in use");
            break;
          case "auth/missing-email":
            setErrorMessage("Please enter an email");
            break;
          case "auth/invalid-email":
            setErrorMessage("Please enter a valid email");
            break;
          case "auth/missing-password":
            setErrorMessage("Please enter a valid password");
            break;
          default:
            setErrorMessage("An error occurred");
            break;
        }
        setIsModalVisible(true);
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage("Passwords do not match");
      setIsModalVisible(true);
    }
  };

  // Function to create document in Firestore
  const createDocument = async (uid: string) => {
    try {
      const docRef = doc(FIRESTORE_DB, "personal", uid);
      const nameDocRef = doc(FIRESTORE_DB, "users", uid);

      const data = {
        expenses: [],
        groups: [],
      };
      const nameData = {
        name: fullName,
      };
      await setDoc(docRef, data);
      await setDoc(nameDocRef, nameData);
      console.log("Document created successfully!");
    } catch (error) {
      console.error("Error creating document: ", error);
      console.log("Failed to create document. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, height: Dimensions.get("window").height * 1.5 }}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.header, { color: theme.text }]}>
          Sign Up to Splitify
        </Text>
        <View style={styles.loginArea}>
          <View style={[styles.inputStyle, { backgroundColor: theme.primary }]}>
            <TextInput
              placeholderTextColor={theme.text}
              style={[styles.inputText, { color: theme.text }]}
              placeholder="Full Name"
              onChangeText={setFullName}
              value={fullName}
              autoComplete="name"
              autoCapitalize="words"
              keyboardType="default"
              returnKeyType="next"
              onSubmitEditing={() => {
                this.secondTextInput.focus();
              }}
            />
          </View>
          <MidSpacer></MidSpacer>
          <View style={[styles.inputStyle, { backgroundColor: theme.primary }]}>
            <TextInput
              ref={(input) => {
                this.secondTextInput = input;
              }}
              returnKeyType="next"
              onSubmitEditing={() => {
                this.thirdTextInput.focus();
              }}
              placeholderTextColor={theme.text}
              style={[styles.inputText, { color: theme.text }]}
              placeholder="Email"
              onChangeText={setEmail}
              value={email}
              autoComplete="email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <MidSpacer></MidSpacer>
          <View style={[styles.inputStyle, { backgroundColor: theme.primary }]}>
            <TextInput
              ref={(input) => {
                this.thirdTextInput = input;
              }}
              returnKeyType="next"
              onSubmitEditing={() => {
                this.fourthTextInput.focus();
              }}
              placeholderTextColor={theme.text}
              style={[styles.inputText, { color: theme.text }]}
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              autoComplete="password"
              secureTextEntry={!showPassword}
            />
            <MaterialCommunityIcons
              name={!showPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowPassword}
            />
          </View>
          <MinSpacer />
          <View style={[styles.inputStyle, { backgroundColor: theme.primary }]}>
            <TextInput
              ref={(input) => {
                this.fourthTextInput = input;
              }}
              placeholderTextColor={theme.text}
              returnKeyType="done"
              style={[styles.inputText, { color: theme.text }]}
              placeholder="Confirm Password"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              autoComplete="password"
              secureTextEntry={!showConfirmPassword}
            />
            <MaterialCommunityIcons
              name={!showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowConfirmPassword}
            />
          </View>
        </View>
        <View
          style={[styles.buttonContainer, { backgroundColor: theme.button }]}
        >
          <TouchableOpacity onPress={signUp} style={styles.button}>
            <Text style={{ fontSize: 22, color: theme.buttonText }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 16, color: theme.text, paddingRight: 5 }}>
          Already have an account?
          <Text
            onPress={() => navigation.goBack()}
            style={{ color: theme.button, marginLeft: 5 }}
          >
            Login
          </Text>
        </Text>

        <Modal isVisible={isModalVisible} backdropOpacity={0.2}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <MinSpacer />
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </View>
        </Modal>
        <Modal isVisible={isCompletedVisible} backdropOpacity={0.2}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.modalText, { color: theme.text }]}>
              We have sent an email for you to confirm your account. Don't
              forget to check your spam box.
            </Text>
            <MinSpacer />
            <Button title="Login" onPress={() => navigation.goBack()} />
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  header: {
    fontSize: 60,
    fontWeight: "300",
  },
  loginArea: {
    width: "80%",
  },
  inputStyle: {
    borderColor: "grey",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
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
  icon: {
    textAlign: "center",
    marginLeft: 10,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    height: 55,
    borderRadius: 10,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },

  modalContent: {
    height: 200,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    alignContent: "stretch",
  },
  modalText: {
    fontSize: 20,
  },
});
