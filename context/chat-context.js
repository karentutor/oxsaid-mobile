import React, { createContext, useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ChatContext = createContext();

const ChatContextProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const loadChatData = async () => {
      try {
        const storedUnreadMessages = await AsyncStorage.getItem(
          "unreadMessages"
        );
        if (storedUnreadMessages) {
          setUnreadMessages(JSON.parse(storedUnreadMessages));
        }
      } catch (error) {
        console.error("Failed to load chat data:", error);
      }
    };

    loadChatData();
  }, []);

  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      path: "/ws/socket.io/",
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    newSocket.on("receive-message", (data) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === data.conversation._id
            ? {
                ...chat,
                messages: [...chat.messages, data.newMessage],
              }
            : chat
        )
      );

      setUnreadMessages((prevUnread) => {
        if (data.conversation._id !== currentChat?._id) {
          const updatedUnread = {
            ...prevUnread,
            [data.conversation._id]:
              (prevUnread[data.conversation._id] || 0) + 1,
          };

          AsyncStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));
          return updatedUnread;
        }
        return prevUnread;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentChat]);

  const markAsRead = async (conversationId) => {
    setUnreadMessages((prevUnread) => {
      const updatedUnread = { ...prevUnread };
      delete updatedUnread[conversationId];

      AsyncStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));
      return updatedUnread;
    });

    if (socket) {
      socket.emit("mark-as-read", {
        conversationId,
        userId: currentChat?.userId,
      });
    }
  };

  const value = useMemo(
    () => ({
      chats,
      setChats,
      currentChat,
      setCurrentChat,
      unreadMessages,
      markAsRead,
      socket,
    }),
    [chats, currentChat, unreadMessages, socket]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
