/* ------------------------------------------------------------------
 * ChatContext ‑ unified real‑time chat state for the Expo app
 * – relies on the *shared* socket provided by SocketContext
 * – guarantees that every socket event is handled only once
 * – deduplicates messages in the reducer
 * ----------------------------------------------------------------- */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { axiosBase } from '@/services/BaseService';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext'; // ① reuse shared socket

/* ---------- public types ---------- */
export type ChatMeta = {
  _id: string;
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
  messages: Record<string, Message[]>; // chatId → messages
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

/* ---------- reducer (now dedupes messages) ---------- */
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
      if (msgs.some((m) => m._id === action.msg._id)) {
        /* duplicate payload → ignore */
        return state;
      }
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chatId]: [...msgs, action.msg],
        },
        chats: state.chats.map((c) =>
          c._id === action.chatId
            ? {
                ...c,
                latest: action.msg.text,
                unread: c.unread + (action.msg.mine ? 0 : 1),
              }
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

/* ------------------------------------------------------------------
 * Provider
 * ----------------------------------------------------------------- */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const socket = useSocket();                  // shared socket instance
  const [state, dispatch] = useReducer(reducer, {
    chats: [],
    messages: {},
  });

  /* ------------ attach listeners once per socket ------------ */
  const listenersBound = React.useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket || !auth.accessToken) return;
    if (listenersBound.current === socket) return; // already attached
    listenersBound.current = socket;

    /* 1) ensure user is registered */
    const register = () =>
      socket.emit('registerUser', {
        userId: auth.user!._id,
        firstName: auth.user!.firstName,
        lastName: auth.user!.lastName,
      });
    if (socket.connected) register();
    socket.on('connect', register);

    /* 2) chatCreated */
    socket.on('chatCreated', ({ chat }) => insertChatFromServer(chat));

    /* 3) messageCreated */
    function handleMessageCreated(payload: any) {
      const raw = payload.message ?? payload;
      const cid =
        payload.chatId ??
        raw.chatId ??
        (typeof raw.chatId === 'object' ? raw.chatId.toString() : undefined);
      if (!cid) return;
      insertMessageFromServer(cid, raw);
    }
    socket.on('messageCreated', handleMessageCreated);

    /* 4) optional debug */
    socket.onAny((event, p) => {
      if (event !== 'ping' && event !== 'pong')
        console.log('⇢ event', event, JSON.stringify(p)?.slice(0, 120));
    });

    /* cleanup if socket gets replaced */
    return () => {
      socket.off('connect', register);
      socket.off('chatCreated');
      socket.off('messageCreated', handleMessageCreated);
      socket.offAny();
      listenersBound.current = null;
    };
  }, [socket, auth.accessToken]);

  /* ------------ helpers ------------ */
  const adaptChat = (chat: any): ChatMeta => {
    const partner =
      chat.participants.find((p: any) => p._id !== auth.user!._id) || {};
    return {
      _id: chat._id,
      isGroupChat: chat.isGroupChat,
      groupName: chat.groupName,
      partnerName: chat.isGroupChat
        ? chat.groupName
        : `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim(),
      latest: chat.latestMessage?.content ?? '',
      unread: chat.unreadCount ?? 0,
    };
  };

  const refreshChats = async () => {
    if (!auth.accessToken) return;
    const { data } = await axiosBase.get(`/chats/user/${auth.user!._id}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    dispatch({ type: 'SET_CHATS', chats: data.chats.map(adaptChat) });
  };

  useEffect(() => {
    refreshChats();
  }, [auth.accessToken]);

  const loadMessages = async (chatId: string) => {
    if (!auth.accessToken) return;
    const { data } = await axiosBase.get(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const msgs: Message[] = (data.messages ?? []).map((m: any) => ({
      _id: m._id,
      chatId: m.chatId,
      senderId: m.senderId._id ?? m.senderId,
      text: m.content,
      mine: (m.senderId._id ?? m.senderId) === auth.user!._id,
      time: new Date(m.createdAt).toLocaleTimeString().slice(0, 5),
    }));
    dispatch({ type: 'SET_MESSAGES', chatId, msgs });
  };

  const getOrCreate = async (partnerId: string, partnerName: string) => {
    const found = state.chats.find(
      (c) => !c.isGroupChat && c.partnerName === partnerName,
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
    const { data } = await axiosBase.post(
      `/chats/${chatId}/messages`,
      { content: text },
      { headers: { Authorization: `Bearer ${auth.accessToken}` } },
    );
    const m: Message = {
      _id: data.newMessage._id,
      chatId,
      senderId: auth.user!._id,
      text,
      mine: true,
      time: new Date(data.newMessage.createdAt).toLocaleTimeString().slice(0, 5),
    };
    dispatch({ type: 'ADD_MESSAGE', chatId, msg: m });
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
    } catch {/* ignore */}
  };

  /* ------------ exposed value ------------ */
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

/* ---------- helper hook ---------- */
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be within ChatProvider');
  return ctx;
}
