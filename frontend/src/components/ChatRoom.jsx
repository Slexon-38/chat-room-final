import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import MessageInput from './MessageInput.jsx';
import OnlineUsers from './OnlineUsers.jsx';
import { showDesktopNotification, initializeNotifications } from '../utils/notificationManager.js';

// Socket.IO-Verbindung - konfiguriert für lokale Entwicklung und Produktion
const getSocketUrl = () => {
  // Für lokale Entwicklung
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  // Für Produktion - verwende Backend URL
  return import.meta.env.VITE_BACKEND_URL || 'https://chat-room-backend-iov4.onrender.com';
};

const socket = io(getSocketUrl());

function ChatRoom({ username, room, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialisiere Benachrichtigungen beim ersten Laden
    initializeNotifications();
    
    socket.connect();
    socket.emit('join', { username, room });

    socket.on('history', (history) => setMessages(history));
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      // Feature: Desktop-Benachrichtigung anzeigen, wenn die Nachricht nicht vom aktuellen Benutzer ist
      if (msg.user !== username) {
        showDesktopNotification(msg.user, msg.text, room);
      }
    });
    socket.on('error', (error) => {
      alert(error.message);
      onLeave();
    });

    // Feature-Listener
    socket.on('user-list-update', (users) => setOnlineUsers(users));
    socket.on('user-typing-update', ({ username: typingUsername, isTyping }) => {
      if (isTyping) {
        setTypingUser(typingUsername);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      socket.emit('leave');
      socket.off('history');
      socket.off('message');
      socket.off('error');
      socket.off('user-list-update');
      socket.off('user-typing-update');
      socket.disconnect();
    };
  }, [username, room, onLeave]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text) return;
    socket.emit('message', { room, text });
    // "Tippt"-Status beenden
    socket.emit('typing', { room, isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = () => {
    // "Tippt"-Status senden
    socket.emit('typing', { room, isTyping: true });
    // Nach 3s den Status zurücksetzen
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { room, isTyping: false });
    }, 3000);
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen w-full justify-center items-center">
      <div className="flex w-full max-w-4xl h-[90vh] bg-white rounded-xl shadow-2xl">
        <OnlineUsers users={onlineUsers} />
        <div className="flex-1 flex flex-col">
          <div className="chat-header">
            <button
              onClick={onLeave}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 focus:outline-none hover:scale-110 transition-all"
              aria-label="ChatRoom verlassen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            ChatRoom: {room}
          </div>
          <div className="chat-body">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 flex items-end message ${msg.user === username ? 'justify-end' : 'justify-start'}`}
              >
                {msg.user !== username && (
                  <div className="avatar other">{msg.user.charAt(0).toUpperCase()}</div>
                )}
                <div className={`chat-bubble ${msg.user === username ? 'self' : 'other'}`}>
                  <strong className="block">{msg.user}:</strong>
                  <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                  <span className="text-xs text-gray-500 mt-1 block text-right">{formatTimestamp(msg.timestamp)}</span>
                </div>
                {msg.user === username && (
                  <div className="avatar self">{username.charAt(0).toUpperCase()}</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            {typingUser && <div className="text-sm text-gray-500 italic mb-2">{typingUser} tippt...</div>}
            <MessageInput onSend={sendMessage} onTyping={handleTyping} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;