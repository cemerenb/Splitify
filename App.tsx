import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { MinSpacer } from './Spacers';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 



export default function App() {
  const [password, setPassword] = useState(''); 
  const [email, setEmail] = useState(''); 
  
  // State variable to track password visibility 
  const [showPassword, setShowPassword] = useState(false); 

  const toggleShowPassword = () => { 
    setShowPassword(!showPassword); 
  }; 

  return (
    <View style={styles.container}>
      <Text style={styles.header} >Welcome</Text>
      <View style={styles.loginarea}>
        
        
        <View style={styles.inputStyle}>
            <TextInput style={styles.inputText} placeholder='Email' onChangeText={setEmail} value={email}>
            </TextInput>
            
        </View>
        <MinSpacer></MinSpacer>
        <View style={styles.inputStyle}>
            <TextInput style={styles.inputText} secureTextEntry={!showPassword} 
                    value={password} 
                    onChangeText={setPassword}  placeholder='Password' >
            </TextInput>
            <MaterialCommunityIcons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#aaa"
                    style={styles.icon} 
                    onPress={toggleShowPassword} 
                /> 
                
        </View>
        <View style={styles.forgotPassword}>
        <Text onPress={()=>{}} >Forgot Password</Text>
        </View>
        </View>
      <View style={styles.button} >
        <TouchableOpacity style={styles.button}><Text style={{fontSize:22, color:"white"}}>Login</Text></TouchableOpacity>
    </View>
    <Text></Text>
      <Text style = {styles.signUp}>Dont have an account? <Text onPress={()=> {}} style = {{ color: 'purple' }}>Sign Up</Text></Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { 
    textAlign:'center',
    marginLeft: 10, 
}, 
forgotPassword:{
    paddingVertical:15,
   
    alignSelf:'flex-end'
},
loginarea:{
    width:"80%",
},

inputText:{
    flex: 1, 
    color: '#333', 
    paddingVertical: 10, 
    paddingRight: 10, 
    fontSize: 18, 
},
inputStyle:{
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#f3f3f3', 
    borderRadius: 8, 
    paddingHorizontal: 14, 
},
  header:{
    fontSize:80
},
button:{
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"#f59e5f",
  width:"80%",
  height:50,
  borderRadius:20,
},
  signUp:{
    fontSize:16
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});
