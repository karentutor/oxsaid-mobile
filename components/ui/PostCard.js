import React, { useEffect } from "react";
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
            {/* Debug: Log the user picture */}
            {post.userPicturePath ? (
              <>
                <Image
                  source={{ uri: post.userPicturePath }}
                  style={styles.userImage}
                />
              </>
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

            {/* Right-side container holding both trash icon and group name */}
            <View style={styles.rightSideContainer}>
              {/* Delete button */}
              {post.userId === auth.user._id && (
                <>
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={styles.deleteButton}
                  >
                    <Icon name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </>
              )}

              {/* Group Name Title and Value */}
              {post.groupId?.name && (
                <View style={styles.groupNameSection}>
                  <Text style={styles.groupNameTitle}>Group Name</Text>
                  <Text style={styles.groupName}>{post.groupId.name}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.description}>{post.description}</Text>

          {/* Debug: Log if there is a post image */}
          {post.picturePath ? (
            <>
              <Image
                source={{ uri: post.picturePath }}
                style={styles.postImage}
                resizeMode="contain"
              />
            </>
          ) : (
            <Text>No post image</Text>
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
  rightSideContainer: {
    flexDirection: "column", // Ensures vertical alignment of trash icon and group name
    alignItems: "flex-end", // Align to the right
    justifyContent: "space-between",
  },
  deleteButton: {
    paddingBottom: 10,
  },
  groupNameSection: {
    alignItems: "flex-end", // Ensures the text is right aligned
  },
  groupNameTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4, // Adds space between title and group name
  },
  groupName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a2a40", // Dark navy color for group name
  },
});

export default PostCard;
