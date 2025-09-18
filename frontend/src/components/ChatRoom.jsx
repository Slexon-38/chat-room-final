import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import MessageInput from './MessageInput.jsx';
import OnlineUsers from './OnlineUsers.jsx';
import MessageSearch from './MessageSearch.jsx';
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
  const [searchResults, setSearchResults] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
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

    // Read Receipt Listener
    socket.on('message-read', ({ messageId, username: readerUsername, readAt }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), readerUsername]
          };
        }
        return msg;
      }));
    });

    return () => {
      socket.emit('leave');
      socket.off('history');
      socket.off('message');
      socket.off('error');
      socket.off('user-list-update');
      socket.off('user-typing-update');
      socket.off('message-read');
      socket.disconnect();
    };
  }, [username, room, onLeave]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('chatFavorites') || '[]');
    setFavorites(new Set(savedFavorites));
  }, []);

  // Mark messages as read when they come into view
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.user !== username && msg.id && !(msg.readBy || []).includes(username)) {
        socket.emit('mark-as-read', { messageId: msg.id, username });
      }
    });
  }, [messages, username]);

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

  const handleSearch = async ({ query, startDate, endDate }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://chat-room-backend-iov4.onrender.com';
    
    try {
      const params = new URLSearchParams({
        room,
        limit: '100'
      });
      
      if (query) params.append('query', query);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`${backendUrl}/api/messages/search?${params.toString()}`);
      const searchResults = await response.json();
      
      if (query || startDate || endDate) {
        setSearchResults(searchResults);
        setIsSearchMode(true);
      } else {
        setSearchResults(null);
        setIsSearchMode(false);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const toggleFavorite = () => {
    const newFavorites = new Set(favorites);
    if (favorites.has(room)) {
      newFavorites.delete(room);
    } else {
      newFavorites.add(room);
    }
    setFavorites(newFavorites);
    localStorage.setItem('chatFavorites', JSON.stringify([...newFavorites]));
  };

  const displayMessages = isSearchMode ? searchResults : messages;

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen w-full justify-center items-center">
      <div className="flex w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-2xl">
        <OnlineUsers users={onlineUsers} />
        <div className="flex-1 flex flex-col">
          <div className="chat-header relative">
            <button
              onClick={onLeave}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 focus:outline-none hover:scale-110 transition-all"
              aria-label="ChatRoom verlassen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white font-semibold">ChatRoom: {room}</span>
            <button
              onClick={toggleFavorite}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-yellow-300 focus:outline-none transition-all"
              aria-label="Als Favorit markieren"
            >
              <svg className="w-6 h-6" fill={favorites.has(room) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
          
          <MessageSearch 
            onSearch={handleSearch} 
            currentRoom={room}
          />

          {isSearchMode && (
            <div className="bg-blue-50 px-4 py-2 border-b flex justify-between items-center">
              <span className="text-sm text-blue-700">
                Suchergebnisse ({searchResults?.length || 0} Nachrichten)
              </span>
              <button
                onClick={() => { setIsSearchMode(false); setSearchResults(null); }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Zurück zum Live-Chat
              </button>
            </div>
          )}

          <div className="chat-body">
            {displayMessages?.map((msg, idx) => (
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
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                    {msg.user === username && msg.readBy && msg.readBy.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>✓ {msg.readBy.length}</span>
                      </div>
                    )}
                  </div>
                </div>
                {msg.user === username && (
                  <div className="avatar self">{username.charAt(0).toUpperCase()}</div>
                )}
              </div>
            ))}
            {!isSearchMode && <div ref={messagesEndRef} />}
          </div>
          
          {!isSearchMode && (
            <div className="p-4 border-t">
              {typingUser && <div className="text-sm text-gray-500 italic mb-2">{typingUser} tippt...</div>}
              <MessageInput onSend={sendMessage} onTyping={handleTyping} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;