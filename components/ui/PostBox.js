// PostBox.js

import React, { useState } from "react";
import {
  View,
  Platform,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";

const PostBox = ({ onPost, onCancel }) => {
  const [postText, setPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      setSelectedImage(null);
    }
  };

  const handlePostSubmit = () => {
    if (!postText && !selectedImage) {
      Alert.alert("Please add some text or an image to post.");
      return;
    }
    onPost({ text: postText, image: selectedImage });
    setPostText("");
    setSelectedImage(null);
  };

  const handleCancel = () => {
    setPostText("");
    setSelectedImage(null);
    onCancel();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ScrollView nestedScrollEnabled={true}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            multiline={true}
            numberOfLines={3}
            value={postText}
            onChangeText={setPostText}
          />

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            <Icon name="photo" size={30} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Button title="Post" onPress={handlePostSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
    marginTop: 16,
  },
  card: {
    width: "100%",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.1,
    borderColor: "gray",
    backgroundColor: "#FEFCE8",
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  input: {
    height: 64, // Approximately three lines high
    fontSize: 16,
  },
  imageContainer: {
    width: "100%",
    marginTop: 8,
  },
  image: {
    width: "100%",
    height: 192,
    borderRadius: 8,
  },
  iconContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: "#EF4444", // Tailwind's red-500
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default PostBox;
