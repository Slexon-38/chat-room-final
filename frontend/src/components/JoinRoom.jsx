import { useState, useEffect } from 'react';

function JoinRoom({ onJoin, user }) {
  const [username] = useState(user?.username || '');
  const [room, setRoom] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Lade Favoriten für den eingeloggten User vom Backend
    const loadFavorites = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://chat-room-backend-iov4.onrender.com';
        const response = await fetch(`${backendUrl}/api/favorites/${username}`);
        
        if (response.ok) {
          const userFavorites = await response.json();
          setFavorites(userFavorites);
          localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
        } else {
          // Fallback zu localStorage
          const savedFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
          setFavorites(savedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        // Fallback zu localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        setFavorites(savedFavorites);
      }
    };

    if (username) {
      loadFavorites();
    }
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && room) {
      onJoin(username, room);
    } else {
      console.error('Username or room missing');
    }
  };

  const joinFavoriteRoom = (favoriteRoom) => {
    setRoom(favoriteRoom);
    onJoin(username, favoriteRoom);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Willkommen, {username}!</h2>
        <p className="text-gray-600">Wähle einen Raum zum Chatten</p>
      </div>

      {favorites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Deine Favoriten
          </h3>
          <div className="space-y-2">
            {favorites.map((favRoom) => (
              <button
                key={favRoom}
                onClick={() => joinFavoriteRoom(favRoom)}
                className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-all flex items-center justify-between"
              >
                <span className="font-medium text-gray-800">{favRoom}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 text-center">Oder tritt einem neuen Raum bei:</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Room-ID eingeben..."
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="border p-3 mb-4 w-full rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-3 w-full rounded-md hover:bg-blue-600 transition-all font-semibold"
        >
          Raum beitreten
        </button>
      </form>
    </div>
  );
}

export default JoinRoom;
