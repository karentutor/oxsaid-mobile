import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  Alert,
  View,
  Image,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  ActivityIndicator,
} from "react-native";
// Removed AsyncStorage import
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/styles"; // Ensure this path is correct
import { login } from "../utils/auth"; // Adjust the path as necessary
import { AuthContext } from "../context/auth-context"; // Import AuthContext

function LoginScreen() {
  // Initialize AuthContext
  const authCtx = useContext(AuthContext);

  // State variables for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for input validation
  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
  });

  // State for loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for managing input focus
  const passwordRef = useRef(null);

  // Optionally, load stored email on mount (if you decide to persist email)
  useEffect(() => {
    const loadStoredEmail = async () => {
      try {
        // If you decide to store email, uncomment and adjust accordingly
        // const storedEmail = await AsyncStorage.getItem("email");
        // if (storedEmail) {
        //   setEmail(storedEmail);
        // }
      } catch (error) {
        // Handle error silently or notify the user if necessary
      }
    };

    loadStoredEmail();
  }, []);

  // Optionally, persist email when it changes
  useEffect(() => {
    const saveEmail = async () => {
      try {
        // If you decide to store email, uncomment and adjust accordingly
        // await AsyncStorage.setItem("email", email);
      } catch (error) {
        // Handle error silently or notify the user if necessary
      }
    };

    saveEmail();
  }, [email]);

  // Remove password storage effect
  // useEffect(() => {
  //   const savePassword = async () => {
  //     try {
  //       await AsyncStorage.setItem("password", password);
  //     } catch (error) {
  //       console.log("Error saving password:", error);
  //     }
  //   };

  //   savePassword();
  // }, [password]);

  // Handle form submission
  const loginHandler = useCallback(async () => {
    // Trim inputs
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validate inputs
    const emailIsValid = trimmedEmail.includes("@");
    const passwordIsValid = trimmedPassword.length > 6;

    if (!emailIsValid || !passwordIsValid) {
      Alert.alert("Invalid input", "Please check your entered credentials.");
      setCredentialsInvalid({
        email: !emailIsValid,
        password: !passwordIsValid,
      });
      return;
    }

    // Reset validation states and error message
    setCredentialsInvalid({
      email: false,
      password: false,
    });
    setError("");

    setIsLoading(true);

    try {
      // Call the login function from utils/auth.js
      const { token, user } = await login(trimmedEmail, trimmedPassword);

      // Optionally, store the token and user information securely
      // Replace AsyncStorage with a secure storage solution

      // Example using React Native Keychain (you need to install and set it up)
      // import * as Keychain from 'react-native-keychain';
      // await Keychain.setGenericPassword(token, JSON.stringify(user));

      // For demonstration, we'll proceed without storing

      Alert.alert("Login Successful", `Welcome, ${user.name || trimmedEmail}!`);

      // Authenticate in AuthContext
      authCtx.authenticate(token, user);
      // No need to navigate, as NavigationContainer will switch to AuthenticatedStack
    } catch (authError) {
      // Handle authentication errors
      let errorMessage = "Authentication failed. Please try again.";

      if (
        authError.response &&
        authError.response.data &&
        authError.response.data.msg
      ) {
        errorMessage = authError.response.data.msg;
      } else if (authError.message) {
        errorMessage = authError.message;
      }

      setError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, authCtx]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.inner}>
          {/* Logo Image */}
          <Image
            source={require("../assets/oxsaid-logo-cropped.png")} // Ensure the path is correct
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                credentialsInvalid.email && styles.inputInvalid,
              ]}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              autoCompleteType="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus the password field when done with email
                if (passwordRef.current) {
                  passwordRef.current.focus();
                }
              }}
              blurOnSubmit={false}
            />
            {credentialsInvalid.email && (
              <Text style={styles.errorText}>Please enter a valid email.</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                credentialsInvalid.password && styles.inputInvalid,
              ]}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCompleteType="password"
              textContentType="password"
              ref={passwordRef}
              returnKeyType="done"
              onSubmitEditing={loginHandler}
            />
            {credentialsInvalid.password && (
              <Text style={styles.errorText}>
                Password must be at least 7 characters.
              </Text>
            )}
          </View>

          {/* Display Authentication Error */}
          {error ? <Text style={styles.authErrorText}>{error}</Text> : null}

          {/* Login Button or Loading Indicator */}
          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
              <Button title="Login" onPress={loginHandler} color="#4CAF50" />
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Adjust as needed
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 5,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
  },
  inputInvalid: {
    borderColor: "red",
    backgroundColor: "#fdd",
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginLeft: 5,
  },
  authErrorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default LoginScreen;
