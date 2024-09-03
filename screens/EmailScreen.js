// EmailScreen.js

import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import tw from "../lib/tailwind";
import useAuth from "../hooks/useAuth";
import { axiosBase } from "../services/BaseService"; // Import axios instance

const EmailScreen = ({ route }) => {
  const { auth } = useAuth();
  const { user } = route.params; // Destructure user details from route params
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendEmail = async () => {
    if (!subject || !message) {
      Alert.alert("Please fill in both the subject and message.");
      return;
    }

    // Construct email data to send to the backend
    const emailData = {
      email: user.email, // Recipient's email
      subject,
      message,
      senderEmail: auth.user.email, // Sender's email
      senderFirstName: auth.user.firstName, // Sender's first name
      senderLastName: auth.user.lastName, // Sender's last name
    };

    try {
      // Send the email data to the backend
      const response = await axiosBase.post("/emails/send-email", emailData, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      // Show success message
      Alert.alert("Success", "Email sent successfully!");

      // Clear form after sending
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to send email. Please try again later."
      );
    }
  };

  return (
    <View style={tw`flex-1 p-4 bg-white`}>
      <Text style={tw`text-xl font-bold mb-4`}>
        Send Email to {user.firstName} {user.lastName}
      </Text>

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <Button title="Send Email" onPress={handleSendEmail} />
    </View>
  );
};

export default EmailScreen;
