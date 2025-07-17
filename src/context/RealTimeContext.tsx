import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from '@/hooks/useAuth';
import Toast from 'react-native-toast-message';
import { axiosBase } from '@/services/BaseService';
import Constants from 'expo-constants';

interface RTContext {
  totalUnread: number;
  updateUnreadCount: (n: number) => void;
  chatList: any[];
  setChatList: React.Dispatch<React.SetStateAction<any[]>>;
}

export const RealTimeContext = createContext<RTContext>({
  totalUnread: 0,
  updateUnreadCount: () => {},
  chatList: [],
  setChatList: () => {},
});

export const RealTimeContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { auth } = useAuth();
  const socket = useSocket();
  const API_URL = Constants.expoConfig?.extra?.apiBaseUrl as string;

  const [totalUnread, setTotalUnread] = useState(0);
  const [chatList, setChatList] = useState<any[]>([]);

  const updateUnreadCount = (n: number) => setTotalUnread(n);

  /** 1 ▸ fetch once */
  const fetchUnread = useCallback(async () => {
    const userId = auth.user?._id;
    if (!userId) return;
    try {
      const { data } = await axiosBase.get<{ unreadCount: number }>(
        `${API_URL}/chats/unread-count/${userId}`
      );
      if (typeof data.unreadCount === 'number') setTotalUnread(data.unreadCount);
    } catch (e) {
      console.error(e);
    }
  }, [API_URL, auth.user?._id]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  /** 2 ▸ realtime */
  useEffect(() => {
    const userId = auth.user?._id;
    if (!socket || !userId) return;

    const onMsg  = () => fetchUnread();
    const onRead = ({ userId: uid }: any) => uid === userId && fetchUnread();
    const onFollow = ({ followedId, message }: any) => {
      if (followedId === userId) Toast.show({ type: 'success', text1: message });
    };

    socket.on('messageCreated', onMsg);
    socket.on('messagesRead',  onRead);
    socket.on('userFollowed',  onFollow);

    return () => {
      socket.off('messageCreated', onMsg);
      socket.off('messagesRead',  onRead);
      socket.off('userFollowed',  onFollow);
    };
  }, [socket, auth.user?._id, fetchUnread]);

  return (                                                    
    <RealTimeContext.Provider
      value={{ totalUnread, updateUnreadCount, chatList, setChatList }}
    >
      {children}
    </RealTimeContext.Provider>);
};
