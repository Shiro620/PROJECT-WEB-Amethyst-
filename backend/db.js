const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'amethyst.db');
const db = new sqlite3.Database(dbPath);

// Промисифицированные обертки для SQLite
db.runAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

db.allAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

// Инициализация структуры базы данных
db.init = async () => {
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS artists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            genre TEXT,
            era TEXT,
            image TEXT,
            bio TEXT,
            years_active TEXT,
            country TEXT
        )
    `);

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS albums (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artist_id INTEGER,
            title TEXT NOT NULL,
            year INTEGER,
            cover TEXT,
            rating TEXT,
            story TEXT,
            FOREIGN KEY(artist_id) REFERENCES artists(id)
        )
    `);

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            album_id INTEGER,
            number INTEGER,
            title TEXT NOT NULL,
            duration TEXT,
            FOREIGN KEY(album_id) REFERENCES albums(id)
        )
    `);

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS user_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            artist TEXT DEFAULT 'Неизвестный исполнитель',
            album TEXT DEFAULT 'Локальный файл',
            filename TEXT,
            filepath TEXT,
            size INTEGER,
            type TEXT,
            duration REAL,
            cover TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Проверка колонки cover для существующих БД
    const cols = await db.allAsync(`PRAGMA table_info(user_tracks)`);
    if (!cols.some(c => c.name === 'cover')) {
        await db.runAsync(`ALTER TABLE user_tracks ADD COLUMN cover TEXT`);
    }
};

module.exports = db;
