import { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm.jsx';
import JoinRoom from './components/JoinRoom.jsx';
import ChatRoom from './components/ChatRoom.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [inRoom, setInRoom] = useState(false);
  const [room, setRoom] = useState('');

  // Check für gespeicherte Login-Session
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Prüfe ob Session noch gültig ist (z.B. nicht älter als 7 Tage)
        const loginTime = new Date(userData.loginTime);
        const now = new Date();
        const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 7) {
          setUser(userData);
        } else {
          // Session abgelaufen
          localStorage.removeItem('chatUser');
          localStorage.removeItem('userFavorites');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('chatUser');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatUser');
    localStorage.removeItem('userFavorites');
    setUser(null);
    setInRoom(false);
    setRoom('');
  };

  const handleJoin = (username, roomName) => {
    if (!username || !roomName) return;
    setRoom(roomName);
    setInRoom(true);
  };

  const handleLeave = () => {
    setInRoom(false);
    setRoom('');
  };

  // Wenn nicht eingeloggt, zeige Login-Form
  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  // Wenn eingeloggt aber nicht in einem Raum, zeige Raum-Auswahl
  if (!inRoom) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <div className="absolute top-4 right-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all"
          >
            Abmelden
          </button>
        </div>
        <JoinRoom onJoin={handleJoin} user={user} />
      </div>
    );
  }

  // Wenn in einem Raum, zeige Chat
  return (
    <div className="h-screen bg-gray-200 relative">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all shadow-lg"
        >
          Abmelden
        </button>
      </div>
      <div className="flex justify-center items-center h-screen">
        <ChatRoom username={user.username} room={room} onLeave={handleLeave} />
      </div>
    </div>
  );
}

export default App;
