import { useState } from 'react';

function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://chat-room-backend-iov4.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !password) {
      setError('Bitte Username und Passwort eingeben');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentifizierung fehlgeschlagen');
      }

      // Speichere User-Daten
      const userData = {
        username: data.username,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('chatUser', JSON.stringify(userData));
      
      // Lade Favoriten für diesen User
      const favoritesResponse = await fetch(`${backendUrl}/api/favorites/${username}`);
      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        localStorage.setItem('userFavorites', JSON.stringify(favorites));
      }

      onLogin(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl mb-6 text-center font-bold text-gray-800">
          {isLogin ? 'Anmelden' : 'Registrieren'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-3 w-full rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 w-full rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-500 text-white p-3 w-full rounded-md hover:bg-blue-600 transition-all mt-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Wird verarbeitet...' : (isLogin ? 'Anmelden' : 'Registrieren')}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={switchMode}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            disabled={loading}
          >
            {isLogin 
              ? 'Noch kein Account? Hier registrieren' 
              : 'Bereits registriert? Hier anmelden'
            }
          </button>
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>💡 Tipp: Nach der Registrierung kannst du Räume als Favoriten markieren!</p>
        </div>
      </form>
    </div>
  );
}

export default AuthForm;