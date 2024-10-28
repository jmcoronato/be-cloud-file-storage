import pkg from 'bcryptjs';
const { hash } = pkg;
import sqlite3 from 'sqlite3'

// Crear una base de datos local
const db = new sqlite3.Database(`${import.meta.dirname}/local_database.db`);

// Inicializar las tablas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS file (
      id TEXT PRIMARY KEY,
      name TEXT,
      user_id INTEGER,
      size INTEGER,
      shared_url TEXT,
      uploaded_date TEXT,
      service TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)  -- Relación con users
    )
  `);

  const insertUser = async (username, password, role) => {
    try {
      // Verificar si el usuario ya existe
      db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
          console.error('Error checking user existence:', err);
          return;
        }

        if (!row) { // Si el usuario no existe, insertar
          const hashedPassword = await hash(password, 10);
          db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err) => {
            if (err)
              console.error(`Error inserting user ${username}:`, err);
            else
              console.log(`User ${username} inserted successfully.`);
          });
        }
      });
    } catch (error) {
      console.error('Error initializing users:', error);
    }
  };

  // Insertar usuarios iniciales
  const initUsers = async () => {
    await insertUser('admin', 'adminpassword', 'admin');
    await insertUser('user1', 'userpassword1', 'user');
    await insertUser('user2', 'userpassword2', 'user');
  };

  initUsers();
});

export default db;
