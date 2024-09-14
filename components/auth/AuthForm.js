//notes - Tailwinds does not render this properly
import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import Button from "../ui/Button";
import { Colors } from "../../constants/styles";

function AuthForm({ isLogin, onSubmit, credentialsInvalid = {} }) {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { email: emailIsInvalid = false, password: passwordIsInvalid = false } =
    credentialsInvalid;

  // Load stored credentials on mount
  useEffect(() => {
    const loadStoredCredentials = async () => {
      const storedEmail = await AsyncStorage.getItem("email");
      const storedPassword = await AsyncStorage.getItem("password");

      if (storedEmail) {
        setEnteredEmail(storedEmail);
      }

      if (storedPassword) {
        setEnteredPassword(storedPassword);
      }
    };

    loadStoredCredentials();
  }, []);

  const updateEmailHandler = useCallback((value) => {
    setEnteredEmail(value);
    AsyncStorage.setItem("email", value); // Persist email
  }, []);

  const updatePasswordHandler = useCallback((value) => {
    setEnteredPassword(value);
    AsyncStorage.setItem("password", value); // Persist password
  }, []);

  const submitHandler = useCallback(() => {
    if (!enteredEmail || !enteredPassword) {
      Alert.alert("Input Error", "Please fill in all fields.");
      return;
    }
    onSubmit({
      email: enteredEmail,
      password: enteredPassword,
    });
  }, [enteredEmail, enteredPassword, onSubmit]);

  return (
    <View style={styles.form}>
      <TextInput
        style={[
          styles.input,
          emailIsInvalid && styles.inputInvalid,
          emailFocused && styles.inputFocused,
        ]}
        placeholder="Email Address"
        onChangeText={updateEmailHandler}
        value={enteredEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="gray"
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
      />
      <TextInput
        style={[
          styles.input,
          passwordIsInvalid && styles.inputInvalid,
          passwordFocused && styles.inputFocused,
        ]}
        placeholder="Password"
        onChangeText={updatePasswordHandler}
        value={enteredPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="gray"
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
      />
      <View style={styles.buttons}>
        <Button onPress={submitHandler}>
          {isLogin ? "Log In" : "Sign Up"}
        </Button>
      </View>
    </View>
  );
}

export default AuthForm;

const styles = StyleSheet.create({
  form: {
    marginTop: 20,
    padding: 16,
    width: 350, // Changed from "90%" to 350px
    maxWidth: 350,
    alignSelf: "center",
    backgroundColor: Colors.primary800,
    borderRadius: 8,
  },
  input: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "black",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    flex: 1, // Added to ensure the input takes full width
    backgroundColor: "white",
  },
  inputFocused: {
    borderColor: Colors.primary500,
  },
  inputInvalid: {
    borderColor: "red",
    backgroundColor: "#fdd",
  },
  buttons: {
    marginTop: 20,
  },
});
