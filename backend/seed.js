const db = require('./db');

async function seed() {
    console.log("⚡ Инициализация и наполнение базы данных Amethyst Music...");
    await db.init();

    await db.runAsync("DELETE FROM tracks");
    await db.runAsync("DELETE FROM albums");
    await db.runAsync("DELETE FROM artists");

    // ==================== 1. Lil Peep ====================
    const lilPeep = await db.runAsync(
        "INSERT INTO artists (name, genre, era, image, bio, years_active, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["Lil Peep", "emo rap", "modern", "Peep.jpg",
         "Lil Peep (настоящее имя — Густав Ар) — американский рэпер, певец и модель, ставший одним из основателей нового музыкального жанра «эмо-трэп». Его музыка сочетала элементы хип-хопа, эмо и постхардкора.",
         "2014-2017", "США"]
    );
    const peepId = lilPeep.lastID;

    // Альбомы Lil Peep
    const peepAlbums = [
        {
            title: "LIL PEEP; PART ONE", year: 2015, cover: "LIL PEEP; PART ONE.jpg", rating: "4.8",
            story: "Lil Peep; Part One — дебютный микстейп 2015 года, ознаменовавший начало карьеры артиста.",
            tracks: [
                [1, "Praying to the Sky", "3:59"], [2, "The Way I See Things", "2:13"], [3, "High School", "2:48"],
                [4, "Another Song", "2:09"], [5, "Five Degrees", "2:25"], [6, "Nothing to U", "2:27"],
                [7, "It's Me", "2:07"], [8, "Ghost Boy", "2:11"], [9, "Veins", "3:28"],
                [10, "Wanna Be", "2:13"], [11, "Shame on U", "1:51"]
            ]
        },
        {
            title: "Live Forever", year: 2015, cover: "Live Forever.jpg", rating: "4.7",
            story: "Live Forever — второй сольный микстейп американского рэпера Lil Peep, вышедший 2 декабря 2015 года.",
            tracks: [
                [1, "Angeldust", "1:51"], [2, "Mirror, Mirror", "1:42"], [3, "Pick Me Up", "2:49"],
                [4, "Nuts", "1:25"], [5, "Haunt U", "1:58"], [6, "Vibe", "1:53"],
                [7, "Live Forever", "2:40"], [8, "Flannel", "1:57"], [9, "2008", "1:43"],
                [10, "Give U the Moon", "2:19"]
            ]
        },
        {
            title: "Crybaby", year: 2016, cover: "Crybaby.jpg", rating: "4.9",
            story: "Crybaby — четвёртый микстейп Lil Peep, выпущенный 10 июня 2016 года. Одна из ключевых работ исполнителя.",
            tracks: [
                [1, "Crybaby", "4:07"], [2, "Lil Jeep", "3:23"], [3, "Yesterday", "1:52"],
                [4, "Absolute in Doubt", "3:47"], [5, "Ghost Girl", "2:53"], [6, "Big City Blues", "2:35"],
                [7, "Skyscrapers", "2:01"], [8, "Nineteen", "2:57"], [9, "White Tee", "2:12"],
                [10, "Driveway", "2:39"]
            ]
        },
        {
            title: "Hellboy", year: 2016, cover: "Hellboyjpg.jpg", rating: "4.9",
            story: "Hellboy — знаковый микстейп американского хип-хоп-исполнителя Lil Peep, выпущенный 25 сентября 2016 года.",
            tracks: [
                [1, "Hellboy", "2:57"], [2, "Drive-By", "2:55"], [3, "OMFG", "3:17"],
                [4, "The Song They Played", "2:15"], [5, "Fucked Up", "2:36"], [6, "Cobain", "2:30"],
                [7, "Gucci Mane", "2:18"], [8, "Interlude", "3:19"], [9, "Worlds Away", "2:06"],
                [10, "Red Drop Shawty", "2:45"], [11, "Girls", "4:00"], [12, "Nose Ring", "2:49"],
                [13, "We Think Too Much", "3:18"], [14, "The Last Thing I Wanna Do", "2:27"],
                [15, "Walk Away As the Door Slams", "2:40"], [16, "Move On, Be Strong", "2:01"]
            ]
        },
        {
            title: "CASTLES II", year: 2017, cover: "Castles2.jpg", rating: "4.9",
            story: "Castles 2 — совместный мини-альбом (EP) американских рэперов Lil Peep и Lil Tracy, вышедший 6 февраля 2017 года.",
            tracks: [
                [1, "Never Eat, Never Sleep", "2:18"], [2, "Dying Out West", "2:32"],
                [3, "Witchblades", "3:29"], [4, "Past the Castle Walls", "2:49"],
                [5, "Your Favorite Dress", "2:57"]
            ]
        },
        {
            title: "Come Over When You're Sober, Pt. 1", year: 2017, cover: "COWYS1.jpg", rating: "4.9",
            story: "Дебютный студийный альбом американского рэпера Lil Peep, выпущенный 15 августа 2017 года.",
            tracks: [
                [1, "Benz Truck (Гелик)", "2:39"], [2, "Save That Shit", "3:51"],
                [3, "Awful Things", "3:34"], [4, "U Said", "3:44"],
                [5, "Better Off (Dying)", "2:34"], [6, "The Brightside", "3:36"],
                [7, "Problems", "3:29"]
            ]
        },
        {
            title: "Come Over When You're Sober, Pt. 2", year: 2018, cover: "COWYS2.jpg", rating: "4.9",
            story: "Посмертный студийный альбом Lil Peep, выпущенный 9 ноября 2018 года.",
            tracks: [
                [1, "Broken Smile (My All)", "4:40"], [2, "Runaway", "3:12"],
                [3, "Sex With My Ex", "3:33"], [4, "Cry Alone", "2:48"],
                [5, "Leanin'", "3:26"], [6, "16 Lines", "4:04"],
                [7, "Life Is Beautiful", "3:27"], [8, "Hate Me", "3:00"],
                [9, "IDGAF", "3:34"], [10, "White Girl", "3:21"],
                [11, "Fingers", "3:02"], [12, "Falling Down", "3:16"],
                [13, "Sunlight On Your Skin", "3:20"]
            ]
        }
    ];

    for (const alb of peepAlbums) {
        const aRes = await db.runAsync(
            "INSERT INTO albums (artist_id, title, year, cover, rating, story) VALUES (?, ?, ?, ?, ?, ?)",
            [peepId, alb.title, alb.year, alb.cover, alb.rating, alb.story]
        );
        for (const tr of alb.tracks) {
            await db.runAsync("INSERT INTO tracks (album_id, number, title, duration) VALUES (?, ?, ?, ?)", [aRes.lastID, tr[0], tr[1], tr[2]]);
        }
    }
    console.log("  ✔ Lil Peep добавлен (7 альбомов)");

    // ==================== 2. GONE.Fludd ====================
    const goneFludd = await db.runAsync(
        "INSERT INTO artists (name, genre, era, image, bio, years_active, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["GONE.Fludd", "rap", "modern", "Gone Fludd.jpg",
         "GONE.Fludd — российский рэп-исполнитель (Александр Смирнов), известный уникальным стилем, энергичными ритмами и яркой подачей.",
         "2012-настоящее время", "Россия"]
    );
    const fluddId = goneFludd.lastID;

    const fluddAlbums = [
        {
            title: "BOYS DON'T CRY", year: 2018, cover: "BOYS DONT CRY.jpg", rating: "4.9",
            story: "Boys Don't Cry — прорывной альбом российского рэп-исполнителя GONE.Fludd 2018 года.",
            tracks: [
                [1, "BOYS DON'T CRY", "2:28"], [2, "КАК ДЕЛИШКИ", "3:24"], [3, "КУБИК ЛЬДА", "2:21"],
                [4, "FUGLY", "3:30"], [5, "СЕТИ", "2:21"], [6, "ЗНАЕШЬ МЕНЯ", "2:26"],
                [7, "В ЧЕМ ДЕЛО, ДОК", "1:30"], [8, "МАМБЛ", "2:37"], [9, "ONE LOVE", "2:34"],
                [10, "МУЛАБАР", "3:14"], [11, "SERIAL CHILLER", "3:54"], [12, "СЛАДОСТИ", "2:49"],
                [13, "СКВАД", "2:54"], [14, "LAME SHIT", "3:30"], [15, "ГОЛОС УЛИЦ", "2:35"],
                [16, "НА**Й ТО ДЕРЬМО", "2:58"]
            ]
        },
        {
            title: "СУПЕРЧУИТС", year: 2018, cover: "Chuits.png", rating: "4.9",
            story: "СУПЕРЧУИТС — продолжение альбома Boys Don't Cry с суперхитами «Сахарный человек» и «Дрипсэт».",
            tracks: [
                [1, "СУПЕРЧУИТС", "1:23"], [2, "БАНАНОВЫЙ СОК", "3:40"], [3, "ДАЙ ПЯТЬ!", "2:58"],
                [4, "ФРЕЙМДАТА", "2:03"], [5, "ДРИПСЭТ", "2:48"], [6, "САХАРНЫЙ ЧЕЛОВЕК", "2:46"],
                [7, "ПУСТОТА", "4:12"]
            ]
        },
        {
            title: "LIL CHILL", year: 2021, cover: "Lil.png", rating: "4.9",
            story: "Lil Chill — расслабляющий мини-альбом 2021 года.",
            tracks: [
                [1, "Радио «Шипучка»", "1:00"], [2, "СОК", "2:13"], [3, "Алло! (Скит)", "0:44"],
                [4, "UFO LUV", "3:34"], [5, "CHILL", "2:07"], [6, "XXX (Скит)", "0:24"],
                [7, "Делай Как Хочется", "2:25"], [8, "DREAM GARDEN", "2:05"],
                [9, "Доброго Времени Суток", "0:52"], [10, "Пацаны II", "3:38"]
            ]
        },
        {
            title: "DIGITAL FANTAZY", year: 2021, cover: "fantazy.png", rating: "4.9",
            story: "Digital Fantazy — EP с гиперпопом, олдскул-рэпом и трэпом.",
            tracks: [
                [1, "Атомы", "1:45"], [2, "Слеза Бандита", "2:19"], [3, "TRAXXXMANIA", "1:57"],
                [4, "Баланс", "2:06"], [5, "Большая Мама", "2:17"], [6, "Тени Хиросимы", "2:15"]
            ]
        },
        {
            title: "FLUDDALITY", year: 2024, cover: "FLUDDALITY.jpeg", rating: "4.9",
            story: "Fluddality — масштабный альбом 2024 года с экспериментальным звучанием.",
            tracks: [
                [1, "DODONPA", "2:00"], [2, "Лунный лик", "2:56"], [3, "Ути-Пути", "3:09"],
                [4, "Не Одиноко", "2:36"], [5, "Удлиненный магазин", "3:38"], [6, "Пепел запятых", "2:31"],
                [7, "Рэпую", "2:28"], [8, "Секвойя", "2:00"], [9, "Приятно познакомиться", "2:25"],
                [10, "Хороша Сейчас", "2:48"], [11, "ХУДРИЧ", "2:19"], [12, "Лого Бэквудс (Зонтик)", "2:09"],
                [13, "Передай L", "1:57"], [14, "Доспех Мертвеца", "2:10"], [15, "Шива", "1:35"]
            ]
        },
        {
            title: "VK Акустика", year: 2025, cover: "VK.jpg", rating: "4.9",
            story: "Акустический сборник лучших треков артиста с живым бэндом.",
            tracks: [
                [1, "Рапсодия Конца Света", "2:25"], [2, "Проснулся В Темноте", "2:53"],
                [3, "Вкус Яда", "3:20"], [4, "Сети", "2:15"], [5, "Boys Don't Cry", "1:48"],
                [6, "Не Одиноко", "2:34"], [7, "Пустота", "3:51"], [8, "Рядом С Тобой", "2:37"]
            ]
        }
    ];

    for (const alb of fluddAlbums) {
        const aRes = await db.runAsync(
            "INSERT INTO albums (artist_id, title, year, cover, rating, story) VALUES (?, ?, ?, ?, ?, ?)",
            [fluddId, alb.title, alb.year, alb.cover, alb.rating, alb.story]
        );
        for (const tr of alb.tracks) {
            await db.runAsync("INSERT INTO tracks (album_id, number, title, duration) VALUES (?, ?, ?, ?)", [aRes.lastID, tr[0], tr[1], tr[2]]);
        }
    }
    console.log("  ✔ GONE.Fludd добавлен (6 альбомов)");

    // ==================== 3. FRIENDLY THUG 52 NGG ====================
    const thug = await db.runAsync(
        "INSERT INTO artists (name, genre, era, image, bio, years_active, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["FRIENDLY THUG 52 NGG", "rap", "modern", "THUG.jpeg",
         "Friendly Thug 52 (настоящее имя — Александр Романов) — петербургский рэп-исполнитель, известный своим андеграундным стилем, сочетающим джи-фанк и трэп.",
         "2017-настоящее время", "Россия"]
    );
    const thugId = thug.lastID;

    const thugAlbums = [
        {
            title: "Cruiser Aurora", year: 2022, cover: "Aurora.jpg", rating: "5.0",
            story: "Cruiser Aurora — культовый микстейп 2022 года.",
            tracks: [
                [1, "Two Thousand Nineteen", "1:46"], [2, "Heart On The Corner", "2:23"],
                [3, "Calmer", "1:56"], [4, "Total Control", "2:41"],
                [5, "Local Club Star", "1:48"], [6, "Loyalty Above Money", "1:27"],
                [7, "Victor", "2:11"], [8, "Cruiser Aurora", "3:21"],
                [9, "Earth Walker 100", "3:02"]
            ]
        },
        {
            title: "Cristoforo Colombo", year: 2023, cover: "Colombo.jpg", rating: "5.0",
            story: "Cristoforo Colombo — релиз 2023 года, открывший новые горизонты в творчестве артиста.",
            tracks: [
                [1, "Intro", "1:27"], [2, "No Gletcher Gang", "2:19"], [3, "No Rats This Time", "2:40"],
                [4, "Legit Check", "2:38"], [5, "Corner Close Day", "2:34"],
                [6, "All My Members Are CEO", "1:39"], [7, "na Circus", "3:11"],
                [8, "Lost Angeles", "1:55"], [9, "Back To Back", "2:52"],
                [10, "Sold Out", "2:34"], [11, "Sladki Snov Rapper 2", "2:15"],
                [12, "October", "1:48"], [13, "After Paper Flow", "2:08"],
                [14, "Cristoforo Colombo", "1:35"]
            ]
        },
        {
            title: "Graf Monte-Cristo / Most Valuable Pirate", year: 2025, cover: "GMCMVP.png", rating: "5.0",
            story: "GMC / MVP — масштабный релиз 2025 года с мрачной атмосферой.",
            tracks: [
                [1, "Maestro", "2:30"], [2, "No Gletcher Gang 2", "1:57"], [3, "AIST", "2:13"],
                [4, "OCG", "2:21"], [5, "After Kilian Flow", "1:52"], [6, "Graf Monte-Cristo", "2:31"],
                [7, "Sorry Mama Ama Still Sniper", "1:59"], [8, "Not My Type", "2:18"],
                [9, "Most Valuable Pirate", "1:49"], [10, "No Coco Senior Please", "1:44"],
                [11, "Non Grata", "2:10"], [12, "Record Me / 4 Humble", "2:28"],
                [13, "Berliner", "1:51"], [14, "Skyscraper", "2:40"], [15, "2021", "2:08"],
                [16, "Eclipse", "1:49"], [17, "Junkie Kis2 3", "2:35"],
                [18, "From Day One / Miss You Again", "2:02"], [19, "Tom Sorry", "1:35"],
                [20, "Arrivederci 2", "2:02"]
            ]
        }
    ];

    for (const alb of thugAlbums) {
        const aRes = await db.runAsync(
            "INSERT INTO albums (artist_id, title, year, cover, rating, story) VALUES (?, ?, ?, ?, ?, ?)",
            [thugId, alb.title, alb.year, alb.cover, alb.rating, alb.story]
        );
        for (const tr of alb.tracks) {
            await db.runAsync("INSERT INTO tracks (album_id, number, title, duration) VALUES (?, ?, ?, ?)", [aRes.lastID, tr[0], tr[1], tr[2]]);
        }
    }
    console.log("  ✔ FRIENDLY THUG 52 NGG добавлен (3 альбома)");

    console.log("\n✅ База данных Amethyst Music успешно заполнена!");
}

module.exports = seed;

if (require.main === module) {
    seed().then(() => process.exit(0)).catch(err => {
        console.error("Ошибка сидирования:", err);
        process.exit(1);
    });
}
