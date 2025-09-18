const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database Connection - Unterstützt sowohl einzelne Variablen als auch DATABASE_URL
let sequelize;

if (process.env.DATABASE_URL) {
  // Für Render.com und andere Cloud-Anbieter mit DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else if (process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD) {
  // Für lokale Entwicklung mit PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false,
    }
  );
} else {
  // Fallback für lokale Entwicklung - Mock-Implementierung
  console.log('⚠️ Keine Datenbank konfiguriert - verwende In-Memory Fallback');
  
  // Simple In-Memory Mock-Implementierung
  const mockData = {
    users: new Map(),
    messages: [],
    favorites: new Map(),
  };

  const mockSequelize = {
    authenticate: () => Promise.resolve(),
    sync: () => Promise.resolve(),
  };

  const mockUser = {
    findOrCreate: ({ where, defaults }) => {
      const { username } = where;
      if (!mockData.users.has(username)) {
        mockData.users.set(username, { username, ...defaults });
      }
      return Promise.resolve([mockData.users.get(username), !mockData.users.has(username)]);
    },
    findOne: ({ where }) => {
      const user = mockData.users.get(where.username);
      return Promise.resolve(user || null);
    },
    create: (data) => {
      mockData.users.set(data.username, data);
      return Promise.resolve(data);
    }
  };

  const mockMessage = {
    findAll: ({ where, order, limit }) => {
      let filtered = mockData.messages.filter(msg => {
        let isMatch = true;
        if (where.room && msg.room !== where.room) isMatch = false;
        // if (where.author && msg.author !== where.author) isMatch = false; // Temporär auskommentiert
        if (where.content && where.content[Symbol.for('iLike')]) {
          const searchTerm = where.content[Symbol.for('iLike')].replace(/%/g, '');
          if (!msg.content.toLowerCase().includes(searchTerm.toLowerCase())) {
            isMatch = false;
          }
        }
        return isMatch;
      });
      
      if (order && order[0][1] === 'DESC') {
        filtered = filtered.reverse();
      }
      
      if (limit) {
        filtered = filtered.slice(0, limit);
      }
      
      return Promise.resolve(filtered.map(msg => ({
        ...msg,
        createdAt: new Date(msg.timestamp || Date.now())
      })));
    },
    create: (data) => {
      const message = { ...data, createdAt: new Date() };
      mockData.messages.push(message);
      return Promise.resolve(message);
    }
  };

  const mockFavorite = {
    findOrCreate: ({ where, defaults }) => {
      const key = `${where.username}:${where.room}`;
      const favorites = mockData.favorites.get(where.username) || [];
      const exists = favorites.includes(where.room);
      
      if (!exists) {
        favorites.push(where.room);
        mockData.favorites.set(where.username, favorites);
      }
      
      return Promise.resolve([defaults, !exists]);
    },
    destroy: ({ where }) => {
      const favorites = mockData.favorites.get(where.username) || [];
      const index = favorites.indexOf(where.room);
      if (index > -1) {
        favorites.splice(index, 1);
        mockData.favorites.set(where.username, favorites);
        return Promise.resolve(1);
      }
      return Promise.resolve(0);
    },
    findAll: ({ where }) => {
      const favorites = mockData.favorites.get(where.username) || [];
      return Promise.resolve(favorites.map(room => ({ room })));
    }
  };

  module.exports = {
    sequelize: mockSequelize,
    connectDB: async () => {
      console.log('✅ Mock database initialized successfully.');
    },
    User: mockUser,
    Message: mockMessage,
    Favorite: mockFavorite,
  };
  
  return;
}

// Define Models
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Erstmal optional für Rückwärtskompatibilität
  },
});

const Favorite = sequelize.define('Favorite', {
  room: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const ReadReceipt = sequelize.define('ReadReceipt', {
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Message,
      key: 'id'
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  readAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Relationships
User.hasMany(Message, { foreignKey: 'author', sourceKey: 'username' });
Message.belongsTo(User, { foreignKey: 'author', targetKey: 'username' });
Message.hasMany(ReadReceipt, { foreignKey: 'messageId' });
ReadReceipt.belongsTo(Message, { foreignKey: 'messageId' });
User.hasMany(Favorite, { foreignKey: 'username', sourceKey: 'username' });
Favorite.belongsTo(User, { foreignKey: 'username', targetKey: 'username' });

// Sync database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection has been established successfully.');
    await sequelize.sync({ alter: true }); // Use alter to update schema without dropping data
    console.log('✅ Database & tables synced!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  User,
  Message,
  Favorite,
  ReadReceipt,
};
