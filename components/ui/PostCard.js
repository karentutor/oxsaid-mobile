// PostCard.js

import React from "react";
import {
  Alert,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "twrnc";
import useAuth from "../../hooks/useAuth";

const PostCard = ({ post, onDelete }) => {
  const { auth } = useAuth();

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(post._id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.shadowContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.userInfoContainer}>
            {post.userPicturePath ? (
              <Image
                source={{ uri: post.userPicturePath }}
                style={styles.userImage}
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.userName}>
                {post.firstName} {post.lastName}
              </Text>
              <Text style={styles.userLocation}>{post.location}</Text>
            </View>

            {post.userId === auth.user._id && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
              >
                <Icon name="trash" size={20} color="red" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.description}>{post.description}</Text>

          {post.picturePath && (
            <Image
              source={{ uri: post.picturePath }}
              style={styles.postImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#ebf8ff", // Set background color to light blue
  },
  shadowContainer: {
    borderRadius: 10,
    backgroundColor: "#ebf8ff", // Ensure the background color matches
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, // Reduce opacity for a gentler shadow
        shadowRadius: 3, // Reduce radius for a softer blur
      },
      android: {
        elevation: 2, // Lower elevation for a subtler shadow
      },
    }),
  },
  contentContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 16,
    borderRadius: 10,
    backgroundColor: "transparent", // Ensure content does not have its own background
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, // Reduce opacity for a gentler shadow
        shadowRadius: 2, // Reduce radius for a softer blur
      },
      android: {
        elevation: 2, // Lower elevation for a subtler shadow
      },
    }),
  },
  noImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 12,
    color: "#555555",
  },
  textContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userLocation: {
    fontSize: 14,
    color: "#666666",
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    height: 192,
    borderRadius: 10,
  },
  deleteButton: {
    padding: 8,
  },
});

export default PostCard;
