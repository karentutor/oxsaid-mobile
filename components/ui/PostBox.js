import React, { useState } from "react";
import {
  View,
  TextInput,
  Image,
  Button,
  TouchableOpacity,
  Text,
  ScrollView,
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
    <View style={tw`w-full mb-4`}>
      {/* Scrollable Input Area */}
      <View
        style={[
          tw`w-full rounded-lg shadow-sm p-4 relative`,
          {
            borderColor: "gray",
            borderWidth: 1, // Explicit border width for consistency
          },
        ]}
      >
        <ScrollView nestedScrollEnabled={true}>
          <TextInput
            style={tw`text-base h-16`} // h-16 makes it 3 lines high
            placeholder="What's on your mind?"
            multiline={true}
            numberOfLines={3}
            value={postText}
            onChangeText={setPostText}
          />

          {/* Selected Image Preview Below Input Field */}
          {selectedImage && (
            <View style={tw`w-full mt-2`}>
              <Image
                source={{ uri: selectedImage }}
                style={tw`w-full h-48 rounded-lg`}
                resizeMode="contain"
              />
            </View>
          )}
        </ScrollView>

        {/* Photo Upload Icon */}
        <View style={tw`absolute bottom-2 left-2`}>
          <TouchableOpacity onPress={handleImagePick}>
            <Icon name="photo" size={30} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Post and Cancel Buttons Under Input Area */}
      <View style={tw`flex-row justify-between mt-2`}>
        {/* Cancel Button on the Left */}
        <TouchableOpacity style={tw`px-4 py-2`} onPress={handleCancel}>
          <Text style={tw`text-red-500`}>Cancel</Text>
        </TouchableOpacity>

        {/* Post Button on the Right */}
        <Button title="Post" onPress={handlePostSubmit} />
      </View>
    </View>
  );
};

export default PostBox;
