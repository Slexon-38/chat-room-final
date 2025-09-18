import { useState } from 'react';

function MessageSearch({ onSearch, onExport, currentRoom }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({
      query: searchQuery,
      startDate,
      endDate
    });
  };

  const handleExport = () => {
    const params = new URLSearchParams({
      room: currentRoom,
      format: 'txt'
    });
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    // Direkt zum Backend-Export-Endpoint
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://chat-room-backend-iov4.onrender.com';
    window.open(`${backendUrl}/api/messages/export?${params.toString()}`, '_blank');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    onSearch({ query: '', startDate: '', endDate: '' });
  };

  return (
    <div className="bg-white border-b p-4 space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Nachrichten durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
        >
          Suchen
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all"
        >
          Filter
        </button>
      </form>

      {showAdvanced && (
        <div className="bg-gray-50 p-3 rounded-md space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Von Datum:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bis Datum:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Chat Exportieren
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all"
            >
              Filter löschen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageSearch;