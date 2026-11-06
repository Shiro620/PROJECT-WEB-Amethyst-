const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const db = require('./db');

const app = express();
const PORT = 3000;

// Пути к директориям проекта
const ROOT_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const IMAGES_DIR = path.join(FRONTEND_DIR, 'images');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Настройка Multer для аудиофайлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Статические файлы
app.use(express.static(FRONTEND_DIR));
app.use(express.static(IMAGES_DIR));
app.use('/images', express.static(IMAGES_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.json());

// ==================== Умное извлечение тегов ====================

async function extractMetadata(filePath, originalFilename) {
    let title = originalFilename.replace(/\.[^/.]+$/, '').trim();
    let artist = 'Неизвестный исполнитель';
    let album = 'Локальный файл';
    let duration = 0;
    let cover = null;

    // 1. Чтение тегов ID3 / Vorbis
    try {
        const meta = await mm.parseFile(filePath);
        if (meta.common) {
            if (meta.common.title && meta.common.title.trim()) title = meta.common.title.trim();
            if (meta.common.artist && meta.common.artist.trim()) artist = meta.common.artist.trim();
            if (meta.common.album && meta.common.album.trim()) album = meta.common.album.trim();

            if (meta.common.picture && meta.common.picture.length > 0) {
                const pic = meta.common.picture[0];
                const ext = pic.format && pic.format.includes('png') ? '.png' : '.jpg';
                const coverName = 'cover-' + Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
                fs.writeFileSync(path.join(UPLOADS_DIR, coverName), pic.data);
                cover = coverName;
            }
        }
        if (meta.format && meta.format.duration) {
            duration = Math.round(meta.format.duration);
        }
    } catch (e) {
        // Ошибка чтения тегов, используем fallback
    }

    // 2. Определение из имени файла "Исполнитель — Название"
    if (artist === 'Неизвестный исполнитель' || !artist) {
        const m = title.match(/^([^-—_]+)\s*[-—]\s*(.+)$/);
        if (m && m[1].trim() && m[2].trim()) {
            artist = m[1].trim();
            title = m[2].trim();
        }
    }

    // 3. Сопоставление с каталогом базы данных
    try {
        const cleanTitle = title.toLowerCase().replace(/[^a-zа-я0-9]/gi, '');
        if (cleanTitle.length >= 3) {
            const catalog = await db.allAsync(`
                SELECT t.title as track_title, a.title as album_title, a.cover as album_cover, ar.name as artist_name
                FROM tracks t
                JOIN albums a ON a.id = t.album_id
                JOIN artists ar ON ar.id = a.artist_id
            `);
            for (const cat of catalog) {
                const catClean = cat.track_title.toLowerCase().replace(/[^a-zа-я0-9]/gi, '');
                if (cleanTitle === catClean || cleanTitle.includes(catClean) || catClean.includes(cleanTitle)) {
                    if (artist === 'Неизвестный исполнитель') artist = cat.artist_name;
                    if (album === 'Локальный файл') album = cat.album_title;
                    if (!cover && cat.album_cover) cover = cat.album_cover;
                    break;
                }
            }
        }
    } catch (e) {}

    return { title, artist, album, duration, cover };
}

// Автообогащение треков при запуске
async function enrichExistingTracks() {
    try {
        const tracks = await db.allAsync("SELECT * FROM user_tracks WHERE artist = 'Неизвестный исполнитель' OR duration IS NULL OR duration = 0");
        for (const t of tracks) {
            if (t.filepath && fs.existsSync(t.filepath)) {
                const meta = await extractMetadata(t.filepath, t.title || t.filename);
                await db.runAsync(
                    "UPDATE user_tracks SET title = ?, artist = ?, album = ?, duration = ?, cover = COALESCE(cover, ?) WHERE id = ?",
                    [meta.title, meta.artist, meta.album, meta.duration, meta.cover, t.id]
                );
            }
        }
    } catch (e) {}
}

// ==================== API: Артисты и Альбомы ====================

app.get('/api/artists', async (req, res) => {
    try {
        const artists = await db.allAsync(`
            SELECT a.*, COUNT(al.id) as albumCount 
            FROM artists a 
            LEFT JOIN albums al ON al.artist_id = a.id 
            GROUP BY a.id
        `);
        res.json(artists.map(a => ({ ...a, yearsActive: a.years_active })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/artists/:id', async (req, res) => {
    try {
        const rows = await db.allAsync("SELECT * FROM artists WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Артист не найден' });

        const artist = rows[0];
        const albums = await db.allAsync("SELECT * FROM albums WHERE artist_id = ?", [artist.id]);
        res.json({ ...artist, yearsActive: artist.years_active, albums });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/albums/:id', async (req, res) => {
    try {
        const rows = await db.allAsync("SELECT * FROM albums WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Альбом не найден' });

        const album = rows[0];
        const tracks = await db.allAsync("SELECT * FROM tracks WHERE album_id = ? ORDER BY number", [album.id]);
        res.json({ ...album, history: album.story, tracks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== API: Пользовательские треки ====================

app.get('/api/user-tracks', async (req, res) => {
    try {
        const tracks = await db.allAsync("SELECT * FROM user_tracks ORDER BY created_at DESC");
        res.json(tracks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user-tracks', upload.any(), async (req, res) => {
    try {
        if (!req.files || !req.files.length) {
            return res.status(400).json({ error: 'Файлы не были загружены' });
        }

        const savedTracks = [];
        for (const file of req.files) {
            let originalName = file.originalname;
            try {
                originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            } catch (e) {}

            const meta = await extractMetadata(file.path, originalName);
            const result = await db.runAsync(
                "INSERT INTO user_tracks (title, artist, album, filename, filepath, size, type, duration, cover) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [meta.title, meta.artist, meta.album, file.filename, file.path, file.size, file.mimetype, meta.duration, meta.cover]
            );

            savedTracks.push({
                id: result.lastID,
                title: meta.title,
                artist: meta.artist,
                album: meta.album,
                filename: file.filename,
                size: file.size,
                type: file.mimetype,
                duration: meta.duration,
                cover: meta.cover
            });
        }

        res.status(201).json({ message: `Загружено ${savedTracks.length} треков`, tracks: savedTracks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user-tracks/rescan', async (req, res) => {
    try {
        const allTracks = await db.allAsync("SELECT * FROM user_tracks");
        let updated = 0;
        for (const t of allTracks) {
            if (t.filepath && fs.existsSync(t.filepath)) {
                const meta = await extractMetadata(t.filepath, t.title || t.filename);
                await db.runAsync(
                    "UPDATE user_tracks SET title = ?, artist = ?, album = ?, duration = ?, cover = COALESCE(cover, ?) WHERE id = ?",
                    [meta.title, meta.artist, meta.album, meta.duration, meta.cover, t.id]
                );
                updated++;
            }
        }
        res.json({ message: `Успешно пересканировано ${updated} треков` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/user-tracks/:id', async (req, res) => {
    try {
        const rows = await db.allAsync("SELECT * FROM user_tracks WHERE id = ?", [req.params.id]);
        if (rows.length) {
            const tr = rows[0];
            if (tr.filepath) try { fs.unlinkSync(tr.filepath); } catch (e) {}
            if (tr.cover && tr.cover.startsWith('cover-')) {
                try { fs.unlinkSync(path.join(UPLOADS_DIR, tr.cover)); } catch (e) {}
            }
        }
        await db.runAsync("DELETE FROM user_tracks WHERE id = ?", [req.params.id]);
        res.json({ message: 'Трек удален' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/user-tracks', async (req, res) => {
    try {
        const tracks = await db.allAsync("SELECT * FROM user_tracks");
        for (const tr of tracks) {
            if (tr.filepath) try { fs.unlinkSync(tr.filepath); } catch (e) {}
            if (tr.cover && tr.cover.startsWith('cover-')) {
                try { fs.unlinkSync(path.join(UPLOADS_DIR, tr.cover)); } catch (e) {}
            }
        }
        await db.runAsync("DELETE FROM user_tracks");
        res.json({ message: 'Все треки удалены' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== Запуск сервера ====================

async function start() {
    try {
        await db.init();
        // Автоматическое наполнение каталога при первом запуске на новом компьютере
        const artistsCount = await db.allAsync("SELECT count(*) as count FROM artists");
        if (!artistsCount || artistsCount[0].count === 0) {
            console.log("⚡ База данных пуста. Автоматическое наполнение каталога исполнителей...");
            const seed = require('./seed');
            await seed();
        }
        await enrichExistingTracks();
        app.listen(PORT, () => {
            console.log(`✅ Сервер Amethyst Music запущен на http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Ошибка запуска сервера:', err);
    }
}

start();
