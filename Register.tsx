import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MinSpacer } from './Spacers';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { sendEmailVerification } from 'firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { FIREBASE_AUTH, FIRESTORE_DB } from './FirebaseConfig';
import Modal from "react-native-modal";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackNavigatorParamsList } from './App';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [password, setPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [email, setEmail] = useState(''); 
    const [showPassword, setShowPassword] = useState(false); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    const [loading, setLoading] = useState(false); 
    const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
    const [isCompletedVisible, setIsCompletedVisible] = useState(false); // State for modal visibility
    const [errorMessage, setErrorMessage] = useState("");
    const auth = FIREBASE_AUTH;
    const passwordfield = useRef();
    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 

    const toggleShowConfirmPassword = () => { 
        setShowConfirmPassword(!showConfirmPassword); 
    };
    const createDocument = async (uid) => {
        try {
          const docref = doc(FIRESTORE_DB,'personal',uid);
          
          const data = {
            date:new Date().toISOString(),
            dateMS: new Date().getTime(),
            total: 0,
            procceced: false,
          }
          setDoc(docref,data);
          
          console.log('Document created successfully!');
        } catch (error) {
          console.error('Error creating document: ', error);
          console.log('Failed to create document. Please try again.');
        }
      };
    const navigation =
    useNavigation<StackNavigationProp<RootStackNavigatorParamsList>>();
    const signUp = async () => {
        setLoading(true);
        if (password === confirmPassword) {
            try {
                const response = await createUserWithEmailAndPassword(auth, email, password);
                if (response) {
                    sendEmailVerification(auth.currentUser);
                    createDocument(auth.currentUser.uid);
                }
                
                

                setIsCompletedVisible(true);
            } catch (error) {
                console.log(error.code);
                if ("auth/email-already-in-use" == error.code) {
                    setErrorMessage("Email already in use");
                    setIsModalVisible(true);
                    console.log(errorMessage);
                    
                }
                else if ("auth/missing-email" == error.code) {
                    setErrorMessage("Please enter an email");
                    setIsModalVisible(true);
                    console.log(errorMessage);
                    
                }
                else if ("auth/invalid-email" == error.code) {
                    setErrorMessage("Please enter an valid email");
                    setIsModalVisible(true);
                    console.log(errorMessage);
                    
                }
                if ("auth/missing-password" == error.code) {
                    setErrorMessage("Please enter an valid password");
                    setIsModalVisible(true);
                    console.log(errorMessage);
                    
                }
                
                 
            } finally {
                setLoading(false);
            }
        } else {
            setErrorMessage("Passwords do not match");  
          setIsModalVisible(true)
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Sign Up to Splitify</Text>
            <View style={styles.loginarea}>
                <View style={styles.inputStyle}>
                    <TextInput style={styles.inputText} placeholder='Email' returnKeyType="next" onChangeText={setEmail} inputMode='email' autoComplete='email' value={email} />
                </View>
                <MinSpacer />
                <View style={styles.inputStyle}>
                    <TextInput autoComplete='new-password' style={styles.inputText} ref={passwordfield} secureTextEntry={!showPassword} 
                        value={password} 
                        onChangeText={setPassword}  placeholder='Password' />
                    <MaterialCommunityIcons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#aaa"
                        style={styles.icon} 
                        onPress={toggleShowPassword} 
                    /> 
                </View>
                <MinSpacer />
                <View style={styles.inputStyle}>
                    <TextInput style={styles.inputText} autoComplete='new-password' secureTextEntry={!showConfirmPassword} 
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword}  placeholder='Confirm Password' />
                    <MaterialCommunityIcons 
                        name={showConfirmPassword ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#aaa"
                        style={styles.icon} 
                        onPress={toggleShowConfirmPassword} 
                    /> 
                </View>
            </View>
            <View style={styles.button} >
                <TouchableOpacity onPress={signUp} style={styles.button}><Text style={{fontSize:22, color:"white"}}>Sign Up</Text></TouchableOpacity>
            </View>
        
            <Text></Text>
            <Text style={styles.signUp}>
                Already have an account?  
                <Text onPress={navigation.goBack} style={{ color: 'purple' }}> Login</Text>
            </Text>
            <StatusBar style="auto" />

            {/* Modal */}
            <Modal isVisible={isModalVisible} backdropOpacity={0.2}>
              <View style={{height:200, padding:20,}} >
                <View style={{backgroundColor:'white', padding:50, borderRadius:20, alignItems:'center', alignContent:'stretch' }}>
                    <Text style={{fontSize:20}}>{errorMessage}</Text>
                    <MinSpacer></MinSpacer>
                    <Button title="Close" onPress={() => setIsModalVisible(false)} />
                </View>

              </View>
            </Modal>
            <Modal isVisible={isCompletedVisible} backdropOpacity={0.2}>
              <View style={{padding:0,}} >
                <View style={{backgroundColor:'white', padding:50, borderRadius:20, alignItems:'center', alignContent:'stretch' }}>
                    <Text style={{fontSize:20}}>We have sent an email for you to confirm your account. Don't forget to check your spam box.</Text>
                    <MinSpacer></MinSpacer>
                    <Button title="Login" onPress={navigation.goBack} />
                </View>

              </View>
            </Modal>
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
