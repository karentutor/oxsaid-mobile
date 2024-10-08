import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../ui/Button";
import { Colors } from "../../constants/styles";

// Email Input Component without memo
const EmailInput = ({
  email,
  emailIsInvalid,
  updateEmailHandler,
  setEmailFocused,
}) => (
  <TextInput
    style={[styles.input, emailIsInvalid && styles.inputInvalid]}
    placeholder="Email Address"
    onChangeText={updateEmailHandler}
    value={email}
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    placeholderTextColor="gray"
    onFocus={() => setEmailFocused(true)}
    onBlur={() => setEmailFocused(false)}
  />
);

// Password Input Component without memo
const PasswordInput = ({
  password,
  passwordIsInvalid,
  updatePasswordHandler,
  setPasswordFocused,
}) => (
  <TextInput
    style={[styles.input, passwordIsInvalid && styles.inputInvalid]}
    placeholder="Password"
    onChangeText={updatePasswordHandler}
    value={password}
    secureTextEntry={true}
    autoCapitalize="none"
    autoCorrect={false}
    placeholderTextColor="gray"
    onFocus={() => setPasswordFocused(true)}
    onBlur={() => setPasswordFocused(false)}
  />
);

function AuthForm({ isLogin, onSubmit, credentialsInvalid = {} }) {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { email: emailIsInvalid = false, password: passwordIsInvalid = false } =
    credentialsInvalid;

  console.log("AuthForm rendered new");

  // Load stored email on mount
  useEffect(() => {
    const loadStoredEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        if (storedEmail) {
          setEnteredEmail(storedEmail);
        }
      } catch (error) {
        console.error("Failed to load email:", error);
      }
    };

    loadStoredEmail();
  }, []);

  const updateEmailHandler = (value) => {
    setEnteredEmail(value);
    try {
      AsyncStorage.setItem("email", value); // Persist email
    } catch (error) {
      console.error("Failed to save email:", error);
    }
  };

  const updatePasswordHandler = (value) => {
    setEnteredPassword(value); // Persist password state
  };

  const submitHandler = () => {
    if (!enteredEmail || !enteredPassword) {
      Alert.alert("Input Error", "Please fill in all fields.");
      return;
    }
    onSubmit({
      email: enteredEmail,
      password: enteredPassword,
    });
  };

  return (
    <View style={styles.form}>
      <EmailInput
        email={enteredEmail}
        emailIsInvalid={emailIsInvalid}
        updateEmailHandler={updateEmailHandler}
        setEmailFocused={setEmailFocused}
      />
      <PasswordInput
        password={enteredPassword}
        passwordIsInvalid={passwordIsInvalid}
        updatePasswordHandler={updatePasswordHandler}
        setPasswordFocused={setPasswordFocused}
      />
      <View style={styles.buttons}>
        <Button onPress={submitHandler}>
          {isLogin ? "Log In" : "Sign Up"}
        </Button>
      </View>
    </View>
  );
}

export default AuthForm; // Export without memo

const styles = StyleSheet.create({
  form: {
    marginTop: 20,
    padding: 16,
    width: "100%", // Changed from fixed width to percentage
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
    backgroundColor: "white",
  },
  inputInvalid: {
    borderColor: "red",
    backgroundColor: "#fdd",
  },
  buttons: {
    marginTop: 20,
  },
});
