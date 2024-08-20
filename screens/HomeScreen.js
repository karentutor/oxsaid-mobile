import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import useAuth from "../hooks/useAuth";

function WelcomeScreen() {
  const [fetchedMessage, setFetchedMessage] = useState("");
  const { auth } = useAuth();
  const { access_token, user } = auth;

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>Home!</Text>
      <Text>{user ? JSON.stringify(user) : "No User ID"}</Text>
      <Text>{fetchedMessage}</Text>
    </View>
  );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
