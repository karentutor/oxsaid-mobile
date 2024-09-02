import React, { useState, useCallback } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import Button from "../ui/Button";

function AuthForm({ isLogin, onSubmit, credentialsInvalid }) {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");

  const { email: emailIsInvalid, password: passwordIsInvalid } =
    credentialsInvalid;

  // Using useCallback to memoize the function references
  const updateEmailHandler = useCallback((value) => {
    setEnteredEmail(value);
  }, []);

  const updatePasswordHandler = useCallback((value) => {
    setEnteredPassword(value);
  }, []);

  const submitHandler = useCallback(() => {
    onSubmit({
      email: enteredEmail,
      password: enteredPassword,
    });
  }, [enteredEmail, enteredPassword, onSubmit]);

  console.log("AuthForm component re-rendered");

  return (
    <View style={styles.form}>
      <TextInput
        style={[styles.input, emailIsInvalid && styles.inputInvalid]}
        placeholder="Email Address"
        onChangeText={updateEmailHandler}
        value={enteredEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={[styles.input, passwordIsInvalid && styles.inputInvalid]}
        placeholder="Password"
        onChangeText={updatePasswordHandler}
        value={enteredPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
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
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    width: "100%",
  },
  inputInvalid: {
    borderColor: "red",
    backgroundColor: "#fdd",
  },
  buttons: {
    marginTop: 24,
  },
});

// import { View, Text, TextInput, StyleSheet } from "react-native";

// import { Colors } from "../../constants/styles";

// function Input({
//   label,
//   keyboardType,
//   secure,
//   onUpdateValue,
//   value,
//   isInvalid,
// }) {
//   return (
//     <View style={styles.inputContainer}>
//       <Text style={[styles.label, isInvalid && styles.labelInvalid]}>
//         {label}
//       </Text>
//       <TextInput
//         style={[styles.input, isInvalid && styles.inputInvalid]}
//         autoCapitalize={false}
//         // autoCapitalize="none"
//         keyboardType={keyboardType}
//         secureTextEntry={secure}
//         onChangeText={onUpdateValue}
//         value={value}
//       />
//     </View>
//   );
// }

// export default Input;

// const styles = StyleSheet.create({
//   inputContainer: {
//     marginVertical: 8,
//   },
//   label: {
//     color: "white",
//     marginBottom: 4,
//   },
//   labelInvalid: {
//     color: Colors.error500,
//   },
//   input: {
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     backgroundColor: Colors.primary100,
//     borderRadius: 4,
//     fontSize: 16,
//   },
//   inputInvalid: {
//     backgroundColor: Colors.error100,
//   },
// });
