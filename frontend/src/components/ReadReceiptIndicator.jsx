import { useState } from 'react';

function ReadReceiptIndicator({ message, currentUsername, onlineUsers }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Nur für eigene Nachrichten anzeigen
  if (message.user !== currentUsername) {
    return null;
  }

  const readBy = message.readBy || [];
  const totalUsers = onlineUsers.length;
  const readCount = readBy.length;

  // Status bestimmen:
  // 1 Haken = Gesendet
  // 2 graue Haken = An alle zugestellt 
  // 2 blaue Haken = Von allen gelesen
  
  const getStatus = () => {
    if (readCount === 0) {
      return 'sent'; // 1 Haken
    } else if (readCount < totalUsers - 1) { // -1 weil man sich selbst nicht mitzählt
      return 'delivered'; // 2 graue Haken
    } else {
      return 'read'; // 2 blaue Haken
    }
  };

  const status = getStatus();

  const renderCheckmarks = () => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex -space-x-1">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex -space-x-1">
            <svg className="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case 'sent':
        return 'Gesendet';
      case 'delivered':
        return `Zugestellt an ${readCount} von ${totalUsers - 1} Personen`;
      case 'read':
        return `Gelesen von: ${readBy.join(', ')}`;
      default:
        return '';
    }
  };

  return (
    <div 
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      {renderCheckmarks()}
      
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50">
          {getTooltipText()}
          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}

export default ReadReceiptIndicator;