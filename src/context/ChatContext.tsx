import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import { axiosBase } from '@/services/BaseService';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';

/* ---------- public types ---------- */
export type ChatMeta = {
  _id: string;
  partnerId: string;
  isGroupChat: boolean;
  groupName?: string;
  partnerName: string;
  latest: string;
  unread: number;
};

export type Message = {
  _id: string;
  chatId: string;
  senderId: string;
  text: string;
  mine: boolean;
  time: string;
};

/* ---------- internal state ---------- */
type State = {
  chats: ChatMeta[];
  messages: Record<string, Message[]>;
};

type Action =
  | { type: 'SET_CHATS'; chats: ChatMeta[] }
  | { type: 'ADD_CHAT'; chat: ChatMeta }
  | { type: 'SET_MESSAGES'; chatId: string; msgs: Message[] }
  | { type: 'ADD_MESSAGE'; chatId: string; msg: Message }
  | { type: 'MARK_READ'; chatId: string };

const ChatContext = createContext<
  | (State & {
      socket: Socket | null;
      getOrCreate(partnerId: string, partnerName: string): Promise<string>;
      send(chatId: string, text: string): Promise<void>;
      refreshChats(): Promise<void>;
      loadMessages(chatId: string): Promise<void>;
      markRead(chatId: string): Promise<void>;
    })
  | undefined
>(undefined);

/* ---------- reducer ---------- */
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.chats };

    case 'ADD_CHAT':
      return { ...state, chats: [action.chat, ...state.chats] };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.chatId]: action.msgs },
      };

    case 'ADD_MESSAGE': {
      const msgs = state.messages[action.chatId] ?? [];
      if (msgs.some((m) => m._id === action.msg._id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chatId]: [...msgs, action.msg],
        },
        chats: state.chats.map((c) =>
          c._id === action.chatId
            ? { ...c, latest: action.msg.text, unread: c.unread + (action.msg.mine ? 0 : 1) }
            : c,
        ),
      };
    }

    case 'MARK_READ':
      return {
        ...state,
        chats: state.chats.map((c) =>
          c._id === action.chatId ? { ...c, unread: 0 } : c,
        ),
      };

    default:
      return state;
  }
};

/* ---------- provider ---------- */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const socket = useSocket();
  const [state, dispatch] = useReducer(reducer, { chats: [], messages: {} });

  const listenersBound = React.useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket || !auth.accessToken) return;
    if (listenersBound.current === socket) return;
    listenersBound.current = socket;

    socket.on('chatCreated', ({ chat }) => insertChatFromServer(chat));

    const handleMessageCreated = (payload: any) => {
      const raw = payload.message ?? payload;
      const cid =
        payload.chatId ??
        raw.chatId ??
        (typeof raw.chatId === 'object' ? raw.chatId.toString() : undefined);
      if (!cid) return;
      insertMessageFromServer(cid, raw);
    };
    socket.on('messageCreated', handleMessageCreated);

    return () => {
      socket.off('chatCreated');
      socket.off('messageCreated', handleMessageCreated);
      listenersBound.current = null;
    };
  }, [socket, auth.accessToken]);

const adaptChat = (chat: any): ChatMeta => {
  const me = auth.user!._id;

  // pick the other participant regardless of shape
  const rawPartner =
    chat.participants.find((p: any) =>
      typeof p === 'string' ? p !== me : p._id !== me,
    ) ?? {};

  const partnerId =
    typeof rawPartner === 'string'
      ? rawPartner
      : rawPartner._id ?? '';

  const partnerName =
    chat.isGroupChat
      ? chat.groupName
      : typeof rawPartner === 'string'
        ? '(unknown)'
        : `${rawPartner.firstName ?? ''} ${rawPartner.lastName ?? ''}`.trim();

  return {
    _id: chat._id,
    partnerId,                       // never empty now
    isGroupChat: chat.isGroupChat,
    groupName: chat.groupName,
    partnerName,
    latest: chat.latestMessage?.content ?? '',
    unread: chat.unreadCount ?? 0,
  };
};



  // const adaptChat = (chat: any): ChatMeta => {
  //   const partner =
  //     chat.participants.find((p: any) => p._id !== auth.user!._id) || {};
  //   return {
  //     _id: chat._id,
  //     partnerId: partner._id ?? '',
  //     isGroupChat: chat.isGroupChat,
  //     groupName: chat.groupName,
  //     partnerName: chat.isGroupChat
  //       ? chat.groupName
  //       : `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim(),
  //     latest: chat.latestMessage?.content ?? '',
  //     unread: chat.unreadCount ?? 0,
  //   };
  // };

const refreshChats = async () => {
  if (!auth.accessToken) return;
  try {
    const { data } = await axiosBase.get(`/chats/user/${auth.user!._id}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      timeout: 20000,                         // optional: lift or lower
    });
    dispatch({ type: 'SET_CHATS', chats: data.chats.map(adaptChat) });
  } catch (err) {
    console.error('[refreshChats] failed', err);
    Toast.show({ type: 'error', text1: 'Cannot load chat list.' });
  }
};

  useEffect(() => {
    refreshChats();
  }, [auth.accessToken]);

const loadMessages = async (chatId: string) => {
  if (!auth.accessToken) return;
  try {
    const { data } = await axiosBase.get(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      timeout: 20000,
    });
    /* ...dispatch... */
  } catch (err) {
    console.error('[loadMessages] failed', err);
    Toast.show({ type: 'error', text1: 'Cannot load chat history.' });
  }
};


  const getOrCreate = async (partnerId: string, partnerName: string) => {
    const found = state.chats.find(
      (c) => !c.isGroupChat && c.partnerId === partnerId,
    );
    if (found) return found._id;

    const { data } = await axiosBase.post(
      '/chats',
      { fromId: auth.user!._id, toIds: [partnerId] },
      { headers: { Authorization: `Bearer ${auth.accessToken}` } },
    );
    const meta = adaptChat(data);
    dispatch({ type: 'ADD_CHAT', chat: meta });
    return meta._id;
  };

const send = async (chatId: string, text: string) => {
  if (!auth.accessToken) return;
  try {
    const { data } = await axiosBase.post(
      `/chats/${chatId}/messages`,
      { content: text },
      { headers: { Authorization: `Bearer ${auth.accessToken}` }, timeout: 15000 },
    );
    /* ...dispatch... */
  } catch (err) {
    console.error('[send] failed', err);
    Toast.show({ type: 'error', text1: 'Message not sent.' });
  }
};


  const insertChatFromServer = (doc: any) => {
    const meta = adaptChat(doc);
    dispatch({ type: 'ADD_CHAT', chat: meta });
  };

  const insertMessageFromServer = (chatId: string, doc: any) => {
    const m: Message = {
      _id: doc._id,
      chatId,
      senderId: doc.senderId,
      text: doc.content,
      mine: doc.senderId === auth.user!._id,
      time: new Date(doc.createdAt).toLocaleTimeString().slice(0, 5),
    };
    dispatch({ type: 'ADD_MESSAGE', chatId, msg: m });
  };

  const markRead = async (chatId: string) => {
    dispatch({ type: 'MARK_READ', chatId });
    try {
      await axiosBase.patch(
        `/chats/${chatId}/messages/read`,
        {},
        { headers: { Authorization: `Bearer ${auth.accessToken}` } },
      );
      socket?.emit('markMessagesAsRead', {
        chatId,
        userId: auth.user!._id,
      });
    } catch {}
  };

  const value = useMemo(
    () => ({
      ...state,
      socket,
      getOrCreate,
      send,
      refreshChats,
      loadMessages,
      markRead,
    }),
    [state, socket],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be within ChatProvider');
  return ctx;
}
