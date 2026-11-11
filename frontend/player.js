/**
 * Amethyst Music — Универсальный глобальный мини-плеер
 * Автоматически встраивается внизу экрана на всех страницах.
 */
(function () {
    // Стили мини-плеера
    const playerStyles = `
        /* Отступ для страниц, чтобы плеер не перекрывал контент */
        body {
            padding-bottom: 95px !important;
        }

        .amethyst-bottom-player,
        .burmalda-bottom-player {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 85px;
            background: rgba(18, 7, 26, 0.96);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid rgba(138, 43, 226, 0.35);
            box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.7);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #e0e0e0;
            user-select: none;
            transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease;
        }

        /* Полоса прогресса сверху мини-плеера */
        .bbp-progress-wrap {
            position: absolute;
            top: -4px;
            left: 0;
            right: 0;
            height: 5px;
            background: rgba(106, 13, 173, 0.25);
            cursor: pointer;
            transition: height 0.15s ease;
        }

        .bbp-progress-wrap:hover {
            height: 8px;
            top: -7px;
        }

        .bbp-progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #8a2be2, #da70d6);
            box-shadow: 0 0 10px rgba(218, 112, 214, 0.7);
            position: relative;
            transition: width 0.08s linear;
        }

        .bbp-progress-handle {
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%) scale(0);
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 8px rgba(218, 112, 214, 0.9);
            transition: transform 0.15s ease;
        }

        .bbp-progress-wrap:hover .bbp-progress-handle {
            transform: translateY(-50%) scale(1);
        }

        /* Основной контейнер */
        .bbp-container {
            max-width: 1350px;
            width: 100%;
            margin: 0 auto;
            padding: 0 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }

        /* Левая часть: трек */
        .bbp-track-box {
            display: flex;
            align-items: center;
            gap: 15px;
            width: 28%;
            min-width: 180px;
        }

        .bbp-cover {
            width: 52px;
            height: 52px;
            border-radius: 10px;
            background: linear-gradient(135deg, rgba(106, 13, 173, 0.4), rgba(40, 10, 50, 0.8));
            border: 1px solid rgba(138, 43, 226, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6em;
            color: #da70d6;
            flex-shrink: 0;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            transition: transform 0.3s ease;
        }

        .bbp-cover.playing {
            animation: bbpPulseCover 3s ease-in-out infinite alternate;
        }

        @keyframes bbpPulseCover {
            0% { box-shadow: 0 0 10px rgba(138, 43, 226, 0.4); }
            100% { box-shadow: 0 0 20px rgba(218, 112, 214, 0.8); }
        }

        .bbp-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .bbp-meta {
            min-width: 0;
            flex: 1;
        }

        .bbp-title {
            font-size: 0.95em;
            font-weight: 600;
            color: #f0f0f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
        }

        .bbp-artist {
            font-size: 0.82em;
            color: #da70d6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 2px;
        }

        /* Центральная часть: кнопки и таймер */
        .bbp-center-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            flex: 1;
            max-width: 480px;
        }

        .bbp-controls {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .bbp-btn {
            background: none;
            border: none;
            color: #b19cd9;
            cursor: pointer;
            padding: 6px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.15em;
            transition: all 0.2s ease;
            outline: none;
        }

        .bbp-btn:hover {
            color: #fff;
            transform: scale(1.15);
        }

        .bbp-btn.active {
            color: #da70d6;
            text-shadow: 0 0 8px rgba(218, 112, 214, 0.6);
        }

        .bbp-btn-play {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, #8a2be2, #da70d6);
            color: #fff;
            font-size: 1.25em;
            box-shadow: 0 4px 18px rgba(138, 43, 226, 0.5);
        }

        .bbp-btn-play:hover {
            transform: scale(1.12);
            box-shadow: 0 4px 24px rgba(218, 112, 214, 0.7);
        }

        .bbp-time-row {
            font-size: 0.76em;
            color: #8a7a9a;
            display: flex;
            gap: 6px;
            letter-spacing: 0.5px;
        }

        /* Правая часть: громкость и ссылки */
        .bbp-right-box {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
            width: 28%;
            min-width: 180px;
        }

        .bbp-volume-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .bbp-vol-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 85px;
            height: 4px;
            background: rgba(106, 13, 173, 0.35);
            border-radius: 2px;
            outline: none;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .bbp-vol-slider:hover {
            background: rgba(138, 43, 226, 0.6);
        }

        .bbp-vol-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #da70d6;
            cursor: pointer;
            box-shadow: 0 0 6px rgba(218, 112, 214, 0.8);
            transition: transform 0.15s ease;
        }

        .bbp-vol-slider::-webkit-slider-thumb:hover {
            transform: scale(1.3);
        }

        .bbp-link-btn {
            color: #b19cd9;
            text-decoration: none;
            padding: 6px 12px;
            border-radius: 15px;
            background: rgba(106, 13, 173, 0.2);
            border: 1px solid rgba(106, 13, 173, 0.35);
            font-size: 0.82em;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .bbp-link-btn:hover {
            background: rgba(138, 43, 226, 0.4);
            color: #fff;
            transform: translateY(-2px);
        }

        /* Адаптив для мобильных */
        @media (max-width: 768px) {
            body {
                padding-bottom: 80px !important;
            }
            .amethyst-bottom-player,
            .burmalda-bottom-player {
                height: 72px;
            }
            .bbp-container {
                padding: 0 12px;
                gap: 10px;
            }
            .bbp-right-box {
                display: none;
            }
            .bbp-track-box {
                width: 50%;
            }
            .bbp-cover {
                width: 44px;
                height: 44px;
            }
            .bbp-center-box {
                max-width: none;
            }
            .bbp-controls {
                gap: 10px;
            }
            .bbp-btn {
                font-size: 1em;
            }
            .bbp-btn-play {
                width: 36px;
                height: 36px;
                font-size: 1.1em;
            }
            .bbp-btn-extra {
                display: none;
            }
        }
    `;

    // Внедряем стили в head
    const styleEl = document.createElement('style');
    styleEl.id = 'amethystPlayerStyles';
    styleEl.textContent = playerStyles;
    document.head.appendChild(styleEl);

    // HTML-разметка плеера
    const playerHtml = `
        <div id="amethystBottomPlayer" class="amethyst-bottom-player burmalda-bottom-player">
            <!-- Полоса перемотки сверху -->
            <div class="bbp-progress-wrap" id="bbpProgressWrap" title="Перемотка">
                <div class="bbp-progress-fill" id="bbpProgressFill">
                    <div class="bbp-progress-handle"></div>
                </div>
            </div>

            <div class="bbp-container">
                <!-- Трек -->
                <div class="bbp-track-box">
                    <div class="bbp-cover" id="bbpCover">♪</div>
                    <div class="bbp-meta">
                        <div class="bbp-title" id="bbpTitle">Выберите трек</div>
                        <div class="bbp-artist" id="bbpArtist">Amethyst Music</div>
                    </div>
                </div>

                <!-- Управление -->
                <div class="bbp-center-box">
                    <div class="bbp-controls">
                        <button class="bbp-btn bbp-btn-extra" id="bbpShuffle" title="Случайный порядок (🔀)">🔀</button>
                        <button class="bbp-btn" id="bbpPrev" title="Предыдущий (⏮)">⏮</button>
                        <button class="bbp-btn bbp-btn-play" id="bbpPlay" title="Воспроизведение (Space)">▶</button>
                        <button class="bbp-btn" id="bbpNext" title="Следующий (⏭)">⏭</button>
                        <button class="bbp-btn bbp-btn-extra" id="bbpRepeat" title="Повтор трека (🔁)">🔁</button>
                    </div>
                    <div class="bbp-time-row">
                        <span id="bbpCurrentTime">0:00</span>
                        <span>/</span>
                        <span id="bbpTotalTime">0:00</span>
                    </div>
                </div>

                <!-- Громкость и ссылка -->
                <div class="bbp-right-box">
                    <div class="bbp-volume-wrap">
                        <button class="bbp-btn" id="bbpVolIcon" title="Звук (M)">🔊</button>
                        <input type="range" class="bbp-vol-slider" id="bbpVolSlider" min="0" max="1" step="0.01" value="0.7" title="Громкость">
                    </div>
                    <a href="music.html" class="bbp-link-btn" title="Перейти в библиотеку">
                        <span>📚</span> Библиотека
                    </a>
                </div>
            </div>
        </div>
    `;

    // Вставляем плеер после загрузки DOM
    function injectPlayerDOM() {
        if (document.getElementById('amethystBottomPlayer') || document.getElementById('burmaldaBottomPlayer')) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = playerHtml;
        document.body.appendChild(wrapper.firstElementChild);
        initPlayerLogic();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectPlayerDOM);
    } else {
        injectPlayerDOM();
    }

    // ==================== Логика аудиоплеера ====================

    let audio = null;
    let queue = [];
    let currentIndex = -1;
    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = 'none'; // 'none' | 'all' | 'one'
    let isDragging = false;

    // Вспомогательное форматирование времени
    function formatTime(sec) {
        if (!sec || isNaN(sec) || sec < 0) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function getCoverSrc(cover) {
        if (!cover) return '';
        if (cover.startsWith('http://') || cover.startsWith('https://')) return cover;
        if (cover.startsWith('cover-')) return `/uploads/${encodeURIComponent(cover)}`;
        return `/${encodeURIComponent(cover)}`;
    }

    // Сохранение и восстановление состояния
    function saveState() {
        if (currentIndex < 0 || !queue[currentIndex]) return;
        const state = {
            track: queue[currentIndex],
            index: currentIndex,
            time: audio ? audio.currentTime : 0,
            volume: audio ? audio.volume : 0.7,
            isShuffle: isShuffle,
            repeatMode: repeatMode
        };
        try {
            localStorage.setItem('amethyst_player_state', JSON.stringify(state));
        } catch (e) {}
    }

    function restoreState() {
        try {
            const raw = localStorage.getItem('amethyst_player_state') || localStorage.getItem('burmalda_player_state');
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function initPlayerLogic() {
        audio = new Audio();
        audio.volume = 0.7;

        // Элементы DOM
        const progressWrap = document.getElementById('bbpProgressWrap');
        const progressFill = document.getElementById('bbpProgressFill');
        const coverEl = document.getElementById('bbpCover');
        const titleEl = document.getElementById('bbpTitle');
        const artistEl = document.getElementById('bbpArtist');
        const currentTimeEl = document.getElementById('bbpCurrentTime');
        const totalTimeEl = document.getElementById('bbpTotalTime');
        const playBtn = document.getElementById('bbpPlay');
        const prevBtn = document.getElementById('bbpPrev');
        const nextBtn = document.getElementById('bbpNext');
        const shuffleBtn = document.getElementById('bbpShuffle');
        const repeatBtn = document.getElementById('bbpRepeat');
        const volSlider = document.getElementById('bbpVolSlider');
        const volIcon = document.getElementById('bbpVolIcon');

        // Обработчики аудио
        audio.addEventListener('timeupdate', () => {
            if (!isDragging && audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = pct + '%';
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        });

        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('ended', () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                playerAPI.next();
            }
        });

        audio.addEventListener('play', () => {
            isPlaying = true;
            playBtn.textContent = '❚❚';
            coverEl.classList.add('playing');
            // Оповестить внешние компоненты страницы
            window.dispatchEvent(new CustomEvent('amethyst:play', { detail: { track: queue[currentIndex] } }));
            window.dispatchEvent(new CustomEvent('burmalda:play', { detail: { track: queue[currentIndex] } }));
        });

        audio.addEventListener('pause', () => {
            isPlaying = false;
            playBtn.textContent = '▶';
            coverEl.classList.remove('playing');
            window.dispatchEvent(new CustomEvent('amethyst:pause', { detail: { track: queue[currentIndex] } }));
            window.dispatchEvent(new CustomEvent('burmalda:pause', { detail: { track: queue[currentIndex] } }));
        });

        // Перемотка прогресс-баром
        function handleSeek(e) {
            const rect = progressWrap.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            progressFill.style.width = (pos * 100) + '%';
            if (audio.duration) {
                audio.currentTime = pos * audio.duration;
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        }

        progressWrap.addEventListener('click', handleSeek);

        // Кнопки управления
        playBtn.addEventListener('click', () => {
            playerAPI.togglePlay();
        });

        prevBtn.addEventListener('click', () => {
            playerAPI.prev();
        });

        nextBtn.addEventListener('click', () => {
            playerAPI.next();
        });

        shuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            shuffleBtn.classList.toggle('active', isShuffle);
            saveState();
        });

        repeatBtn.addEventListener('click', () => {
            if (repeatMode === 'none') {
                repeatMode = 'all';
                repeatBtn.classList.add('active');
                repeatBtn.textContent = '🔁';
                repeatBtn.title = 'Повтор всех (🔁)';
            } else if (repeatMode === 'all') {
                repeatMode = 'one';
                repeatBtn.classList.add('active');
                repeatBtn.textContent = '🔂';
                repeatBtn.title = 'Повтор одного трека (🔂)';
            } else {
                repeatMode = 'none';
                repeatBtn.classList.remove('active');
                repeatBtn.textContent = '🔁';
                repeatBtn.title = 'Повтор выключен (🔁)';
            }
            saveState();
        });

        // Громкость
        volSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            audio.volume = val;
            updateVolIcon(val);
            saveState();
        });

        function updateVolIcon(val) {
            if (val <= 0.01) volIcon.textContent = '🔇';
            else if (val < 0.5) volIcon.textContent = '🔉';
            else volIcon.textContent = '🔊';
        }

        volIcon.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio._prevVol = audio.volume;
                audio.volume = 0;
                volSlider.value = 0;
            } else {
                audio.volume = audio._prevVol || 0.7;
                volSlider.value = audio.volume;
            }
            updateVolIcon(audio.volume);
        });

        // Горячие клавиши (Space, стрелки, M)
        window.addEventListener('keydown', (e) => {
            const tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;

            if (e.code === 'Space') {
                e.preventDefault();
                playerAPI.togglePlay();
            } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.altKey)) {
                e.preventDefault();
                playerAPI.next();
            } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.altKey)) {
                e.preventDefault();
                playerAPI.prev();
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                if (audio.duration) audio.currentTime = Math.max(0, audio.currentTime - 5);
            } else if (e.code === 'ArrowUp') {
                e.preventDefault();
                audio.volume = Math.min(1, audio.volume + 0.05);
                volSlider.value = audio.volume;
                updateVolIcon(audio.volume);
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                audio.volume = Math.max(0, audio.volume - 0.05);
                volSlider.value = audio.volume;
                updateVolIcon(audio.volume);
            } else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
                volIcon.click();
            }
        });

        // Периодическое автосохранение позиции
        setInterval(saveState, 3000);

        // Восстановление состояния при открытии страницы
        const saved = restoreState();
        if (saved && saved.track) {
            updateUI(saved.track);
            audio.volume = saved.volume !== undefined ? saved.volume : 0.7;
            volSlider.value = audio.volume;
            updateVolIcon(audio.volume);
            if (saved.isShuffle) {
                isShuffle = true;
                shuffleBtn.classList.add('active');
            }
            if (saved.repeatMode && saved.repeatMode !== 'none') {
                repeatMode = saved.repeatMode;
                repeatBtn.classList.add('active');
                if (repeatMode === 'one') repeatBtn.textContent = '🔂';
            }
        }

        // Авто-загрузка треков из базы, если очередь пустая
        fetch('/api/user-tracks')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    queue = data;
                    if (saved && saved.track) {
                        const idx = queue.findIndex(t => t.id === saved.track.id);
                        if (idx !== -1) currentIndex = idx;
                    }
                }
            })
            .catch(() => {});
    }

    // Обновление отображения текущего трека
    function updateUI(track) {
        const titleEl = document.getElementById('bbpTitle');
        const artistEl = document.getElementById('bbpArtist');
        const coverEl = document.getElementById('bbpCover');
        const totalTimeEl = document.getElementById('bbpTotalTime');

        if (!titleEl) return;

        titleEl.textContent = track.title || 'Без названия';
        artistEl.textContent = track.artist || 'Неизвестный исполнитель';
        if (track.duration) {
            totalTimeEl.textContent = formatTime(track.duration);
        }

        if (track.cover) {
            const src = getCoverSrc(track.cover);
            coverEl.innerHTML = `<img src="${src}" alt="cover" onerror="this.outerHTML='♪'">`;
        } else {
            coverEl.innerHTML = '♪';
        }
    }

    // ==================== Публичный API ====================
    const playerAPI = {
        // Запустить воспроизведение трека
        playTrack: function (track, trackList = null) {
            if (!audio) return;
            if (trackList && Array.isArray(trackList)) {
                queue = trackList;
            }
            if (queue.length > 0) {
                const idx = queue.findIndex(t => t.id === track.id || t.filename === track.filename);
                currentIndex = idx !== -1 ? idx : 0;
            }

            const fileUrl = track.url || `/uploads/${encodeURIComponent(track.filename)}`;
            audio.src = fileUrl;
            audio.play().catch(err => {
                console.warn('Автовоспроизведение заблокировано браузером до клика:', err);
            });

            updateUI(track);
            saveState();
        },

        // Переключить воспроизведение/паузу
        togglePlay: function () {
            if (!audio || !audio.src) {
                if (queue.length > 0) {
                    this.playTrack(queue[0]);
                }
                return;
            }
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        },

        // Следующий трек
        next: function () {
            if (!queue || queue.length === 0) return;
            if (isShuffle) {
                let nextIdx = Math.floor(Math.random() * queue.length);
                if (queue.length > 1 && nextIdx === currentIndex) {
                    nextIdx = (nextIdx + 1) % queue.length;
                }
                currentIndex = nextIdx;
            } else {
                currentIndex = (currentIndex + 1) % queue.length;
            }
            this.playTrack(queue[currentIndex]);
        },

        // Предыдущий трек
        prev: function () {
            if (!queue || queue.length === 0) return;
            if (audio && audio.currentTime > 3) {
                audio.currentTime = 0;
                return;
            }
            currentIndex = (currentIndex - 1 + queue.length) % queue.length;
            this.playTrack(queue[currentIndex]);
        },

        // Установить очередь
        setQueue: function (tracks) {
            queue = Array.isArray(tracks) ? tracks : [];
        },

        // Получить текущее состояние
        getCurrentTrack: function () {
            return queue[currentIndex] || null;
        },

        isPlaying: function () {
            return !!(audio && !audio.paused);
        }
    };

    window.AmethystPlayer = playerAPI;
    window.BurmaldaPlayer = playerAPI; // Обратная совместимость
})();
