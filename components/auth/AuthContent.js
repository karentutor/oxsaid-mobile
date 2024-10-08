import { useState } from "react";
import { Alert, StyleSheet, View, ScrollView } from "react-native";
import AuthForm from "./AuthForm";
import { Colors } from "../../constants/styles";

function AuthContent({ isLogin, onAuthenticate }) {
  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
  });

  function submitHandler(credentials) {
    let { email, password } = credentials;

    email = email.trim();
    password = password.trim();

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;

    if (!emailIsValid || !passwordIsValid) {
      Alert.alert("Invalid input", "Please check your entered credentials.");
      setCredentialsInvalid({
        email: !emailIsValid,
        password: !passwordIsValid,
      });
      return;
    }

    onAuthenticate({ email, password });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.authContent}>
        <AuthForm
          isLogin={isLogin}
          onSubmit={submitHandler}
          credentialsInvalid={credentialsInvalid}
        />
      </ScrollView>
    </View>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContent: {
    marginTop: -10,
    marginHorizontal: 50,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 8,
    backgroundColor: Colors.primary800,
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    width: "130%",
    alignSelf: "center",
  },
});
