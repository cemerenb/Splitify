import React, { useContext, useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Modal,
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

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    // At least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/;
    return re.test(String(password));
  };
  // Function to handle sign up
  const signUp = async () => {
    setLoading(true);

    // Check if passwords match
    if (password === confirmPassword) {
      console.log(fullName.length);

      if (fullName.length == 0) {
        setErrorMessage("Please enter a full name");
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
            setModalVisible(true);
          }
        } catch (error: any) {
          console.log(error);

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
      }
    } else {
      setErrorMessage("Passwords do not match");
      setIsModalVisible(true);
      setLoading(false);
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,

        height: Dimensions.get("window").height * 1.5,
        backgroundColor: theme.background,
      }}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ height: Dimensions.get("window").height / 20 }}></View>
        <View
          style={{
            width: Dimensions.get("window").width,
            paddingHorizontal: 30,
            paddingTop: 10,
          }}
        >
          <Text style={[styles.header, { color: theme.text }]}>
            Sign Up to Splitify
          </Text>
        </View>
        <View style={{ height: Dimensions.get("window").height / 10 }}></View>
        <View style={styles.loginArea}>
          <View style={[styles.inputStyle, { backgroundColor: theme.primary }]}>
            <TextInput
              placeholderTextColor={theme.text}
              style={[
                styles.inputText,
                {
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 28,
                },
              ]}
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
              style={[
                styles.inputText,
                {
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 28,
                },
              ]}
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
              style={[
                styles.inputText,
                {
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 28,
                },
              ]}
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              autoComplete="password"
              secureTextEntry={!showPassword}
            />
            <MaterialCommunityIcons
              name={!showPassword ? "eye-off" : "eye"}
              size={Dimensions.get("window").width / 20}
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
              style={[
                styles.inputText,
                {
                  color: theme.text,
                  fontSize: Dimensions.get("window").width / 28,
                },
              ]}
              placeholder="Confirm Password"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              autoComplete="password"
              secureTextEntry={!showConfirmPassword}
            />
            <MaterialCommunityIcons
              name={!showConfirmPassword ? "eye-off" : "eye"}
              size={Dimensions.get("window").width / 20}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowConfirmPassword}
            />
          </View>
        </View>
        <View style={{ height: Dimensions.get("window").height / 10 }}></View>
        <View
          style={[styles.buttonContainer, { backgroundColor: theme.button }]}
        >
          <TouchableOpacity onPress={signUp} style={styles.button}>
            {loading ? (
              <View>
                <ActivityIndicator
                  size={"small"}
                  color={theme.buttonText}
                ></ActivityIndicator>
              </View>
            ) : (
              <Text
                style={{
                  fontSize: Dimensions.get("window").width / 24,
                  color: theme.buttonText,
                }}
              >
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: Dimensions.get("window").height / 20 }}></View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: Dimensions.get("window").width / 30,
              color: theme.text,
              paddingRight: 5,
            }}
          >
            Already have an account?
          </Text>
          <Text
            onPress={() => navigation.goBack()}
            style={{
              color: theme.button,
              margin: 5,
              fontSize: Dimensions.get("window").width / 30,
            }}
          >
            Login
          </Text>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setIsModalVisible(!isModalVisible);
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
                style={{
                  color: theme.text,
                  fontSize: 16,
                  paddingBottom: 40,
                  paddingHorizontal: 10,
                }}
              >
                {errorMessage}
              </Text>
              <View style={{ width: "100%", flexDirection: "row" }}>
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
                  <Text style={{ color: theme.text, fontSize: 18 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
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
                style={{
                  color: theme.text,
                  fontSize: 16,
                  paddingBottom: 40,
                  paddingHorizontal: 10,
                }}
              >
                We have sent an email for you to confirm your account. Don't
                forget to check your spam box.
              </Text>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                    setModalVisible(false);
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
                  <Text style={{ color: theme.text, fontSize: 18 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    fontSize: Dimensions.get("window").width / 8,
    paddingHorizontal: 10,
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
    height: Dimensions.get("window").height / 17,
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
    height: Dimensions.get("window").height / 17,
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
