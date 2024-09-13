import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { axiosBase } from "../services/BaseService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import ChatListItem from "../components/ui/ChatListItem";
import { updateBadgeCount } from "../utils/notifications"; // Assuming this function is in a utility file

const ChatListScreen = () => {
  const { auth } = useAuth();
  const [chatList, setChatList] = useState([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        try {
          const response = await axiosBase.get(`/chats/${auth.user._id}`);

          if (response.data && response.data.length > 0) {
            const chatsByUser = response.data.reduce((acc, chat) => {
              const otherUser =
                chat.fromId._id === auth.user._id ? chat.toId : chat.fromId;
              const userId = otherUser._id;

              if (!acc[userId]) {
                acc[userId] = {
                  user: otherUser,
                  hasUnread: !chat.isRead, // Check if the chat has unread messages
                };
              } else if (!chat.isRead) {
                acc[userId].hasUnread = true;
              }

              return acc;
            }, {});

            const chatList = Object.values(chatsByUser);
            setChatList(chatList);

            // **New code**: Count unread chats and update badge count
            const unreadCount = chatList.filter(
              (chat) => chat.hasUnread
            ).length;
            updateBadgeCount(unreadCount); // Update the badge count with the number of unread chats
          } else {
            console.log("No chats found for this user.");
            setChatList([]);
            updateBadgeCount(0); // **New code**: Reset badge count if no chats are found
          }
        } catch (error) {
          console.error("Error fetching chat list:", error);
          setChatList([]); // Clear chat list on error
          updateBadgeCount(0); // **New code**: Reset badge count on error
        }
      };

      fetchChats();
    }, [auth.user._id])
  );

  const handlePress = (user, hasUnread) => {
    navigation.navigate("ChatScreen", { user, new: hasUnread }); // Pass unread status
  };

  const handleStartChat = () => {
    navigation.navigate("User Search"); // Navigate to UserSearchScreen to start a new chat
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {chatList.length > 0 ? (
        <FlatList
          data={chatList}
          keyExtractor={(item) => item.user._id.toString()}
          renderItem={({ item }) => (
            <ChatListItem
              user={item.user}
              hasUnread={item.hasUnread}
              onPress={handlePress} // Pass the user and unread status
            />
          )}
        />
      ) : (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            No chats found. Would you like to start one?
          </Text>
          <Button title="Start a New Chat" onPress={handleStartChat} />
        </View>
      )}
    </View>
  );
};

export default ChatListScreen;

// import React, { useState, useCallback } from "react";
// import { View, Text, FlatList, Button } from "react-native"; // Import Button from react-native
// import { axiosBase } from "../services/BaseService";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import useAuth from "../hooks/useAuth";
// import ChatListItem from "../components/ui/ChatListItem";

// const ChatListScreen = () => {
//   const { auth } = useAuth();
//   const [chatList, setChatList] = useState([]);
//   const navigation = useNavigation();

//   useFocusEffect(
//     useCallback(() => {
//       const fetchChats = async () => {
//         try {
//           const response = await axiosBase.get(`/chats/${auth.user._id}`);

//           if (response.data && response.data.length > 0) {
//             const chatsByUser = response.data.reduce((acc, chat) => {
//               const otherUser =
//                 chat.fromId._id === auth.user._id ? chat.toId : chat.fromId;
//               const userId = otherUser._id;

//               if (!acc[userId]) {
//                 acc[userId] = {
//                   user: otherUser,
//                   hasUnread: !chat.isRead, // Check if there is any unread message
//                 };
//               } else if (!chat.isRead) {
//                 acc[userId].hasUnread = true;
//               }

//               return acc;
//             }, {});

//             const chatList = Object.values(chatsByUser);
//             setChatList(chatList);

//             // **New code**: Count unread chats and update badge count
//             const unreadCount = chatList.filter(
//               (chat) => chat.hasUnread
//             ).length;
//             updateBadgeCount(unreadCount); // Update the badge count with the number of unread chats
//           } else {
//             console.log("No chats found for this user.");
//             setChatList([]);
//             updateBadgeCount(0); // **New code**: Reset badge count if no chats are found
//           }
//         } catch (error) {
//           console.error("Error fetching chat list:", error);
//           setChatList([]); // Clear chat list on error
//           updateBadgeCount(0); // **New code**: Reset badge count on error
//         }
//       };

//       fetchChats();
//     }, [auth.user._id])
//   );

//   // useFocusEffect(
//   //   useCallback(() => {
//   //     const fetchChats = async () => {
//   //       try {
//   //         const response = await axiosBase.get(`/chats/${auth.user._id}`);

//   //         if (response.data && response.data.length > 0) {
//   //           const chatsByUser = response.data.reduce((acc, chat) => {
//   //             const otherUser =
//   //               chat.fromId._id === auth.user._id ? chat.toId : chat.fromId;
//   //             const userId = otherUser._id;

//   //             if (!acc[userId]) {
//   //               acc[userId] = {
//   //                 user: otherUser,
//   //                 hasUnread: !chat.isRead, // Check if there is any unread message
//   //               };
//   //             } else if (!chat.isRead) {
//   //               acc[userId].hasUnread = true;
//   //             }

//   //             return acc;
//   //           }, {});

//   //           setChatList(Object.values(chatsByUser));
//   //         } else {
//   //           console.log("No chats found for this user.");
//   //           setChatList([]);
//   //         }
//   //       } catch (error) {
//   //         // console.error("Error fetching chat list:", error);
//   //         setChatList([]); // Clear chat list on error
//   //       }
//   //     };

//   //     fetchChats();
//   //   }, [auth.user._id])
//   // );

//   const handlePress = (user, hasUnread) => {
//     navigation.navigate("ChatScreen", { user, new: hasUnread }); // Pass unread status
//   };

//   const handleStartChat = () => {
//     navigation.navigate("User Search"); // Navigate to UserSearchScreen to start a new chat
//   };

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       {chatList.length > 0 ? (
//         <FlatList
//           data={chatList}
//           keyExtractor={(item) => item.user._id.toString()}
//           renderItem={({ item }) => (
//             <ChatListItem
//               user={item.user}
//               hasUnread={item.hasUnread}
//               onPress={handlePress} // Pass the user and unread status
//             />
//           )}
//         />
//       ) : (
//         <View
//           style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
//         >
//           <Text style={{ fontSize: 18, marginBottom: 20 }}>
//             No chats found. Would you like to start one?
//           </Text>
//           <Button title="Start a New Chat" onPress={handleStartChat} />
//         </View>
//       )}
//     </View>
//   );
// };

// export default ChatListScreen;
