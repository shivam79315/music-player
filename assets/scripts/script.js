class MusicPlayer {
    constructor() {
        this.header = document.querySelector('.header');
        this.songsList = document.querySelector('.list-body');
        this.searchInput = document.querySelector('#searchSong');

        const rootStyles = getComputedStyle(document.documentElement);

        this.themes = {
            dark: {
                '--dark': rootStyles.getPropertyValue('--light').trim(), 
                '--light': rootStyles.getPropertyValue('--dark').trim()
            },
            light: {
                '--dark': rootStyles.getPropertyValue('--dark').trim(),
                '--light': rootStyles.getPropertyValue('--light').trim()
            }
        };

        this.setupInitial();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const playPauseBtn = document.querySelector('.playPauseBtn');
        const playBtn = playPauseBtn.querySelector('.song-play-btn');
        const pauseBtn = playPauseBtn.querySelector('.song-pause-btn');

        document.addEventListener('click', (e) => {
            const checkbox = e.target.closest('.checkbox');
            if (checkbox) {
                const mode = checkbox.checked ? 'dark' : 'light';
                this.updateTheme(mode);
            }
            if (e.target.closest('.song-row')) {
                const song = JSON.parse(e.target.closest('.song-row').dataset.item);
                this.updateSongCard(song);
            }
            if (e.target.closest('.playPauseBtn')) {
                playBtn.classList.toggle('hidden');
                pauseBtn.classList.toggle('hidden');
            }
            if(e.target.closest('.song-play-btn')) {
                this._playSong();
            }
            if(e.target.closest('.song-pause-btn')) {
                this._pauseSong();
            }
        });

        document.addEventListener('input', (e) => {
            this._debounce(() => {
                this.filterSongs(e.target.value);
            }, 500);
        });
    }

    // to apply light dark mode in player 
    updateTheme(mode) {
        const selectedTheme = this.themes[mode];
        const root = document.documentElement;

        if (selectedTheme) {
            for (let key in selectedTheme) {
                root.style.setProperty(key, selectedTheme[key]);
            }
        } else {
            console.warn(`Theme "${mode}" not found.`);
        }
    }

    setupSongsList(songs) {
        songs.map((item, i) => {
            const songHTML = this._createSongRowHTML(item, i);
            this.songsList.insertAdjacentHTML('beforeend', songHTML);
        })

        this.createSongCard(songs[0]);
    }

    // fn to search and filter songs as per song search 
    filterSongs(searchInput) {
        const matchedSongs = songs.filter(item => item.title.toLowerCase().includes(searchInput.toLowerCase()));
        
        if (matchedSongs.length > 0) {
            this.songsList.innerHTML = '';
            this.setupSongsList(matchedSongs);
        } 
    }

    // create music card 
    createSongCard(song) {
        const musicCard = document.querySelector('.music-card');

        musicCard.innerHTML = "";

        musicCard.innerHTML = this._music_card_html(song);
    }

    // this fn updates currently playing song card 
    updateSongCard(song) {
        const musicCard = document.querySelector('.music-card');

        musicCard.innerHTML = "";

        musicCard.innerHTML = this._music_card_html(song);

        this._playSong();
    }

    // util. fn 
    _playSong() {
        const orgAud = document.querySelector('.audio-org');
        const playBtn = document.querySelector('.song-play-btn');
        const pauseBtn = document.querySelector('.song-pause-btn');
        playBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        orgAud.play();
    }

    _pauseSong() {
        const orgAud = document.querySelector('.audio-org');
        orgAud.pause();
    }

    _debounce(fn, delay) {
        if(this._debounceTimer) clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(fn, delay);
    }

    // dynamic html 
    _music_card_html(song) {
        return `
        <div class="song-info">
            <p><strong>${song.title}</strong> — <small>${song.genre}</small></p>
            <audio class="audio-org hidden" controls>
                <source src="${song.file}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        </div>

        <!-- Music Controls -->
        <div class="music-controls d-flex justify-content-center align-items-center gap-2">
            <i class="fas fa-random"></i>
            <i class="fas fa-backward"></i>
            <span class="playPauseBtn">
                <i class="fas fa-play song-play-btn"></i>
                <i class="fa-solid fa-pause song-pause-btn hidden"></i>
            </span>
            <i class="fas fa-forward"></i>
            <i class="fas fa-redo"></i>
        </div>
        `;
    }

    _createSongRowHTML(song, i) {
        const songStr = JSON.stringify(song).replace(/"/g, '&quot;');
        return `
        <div class="song-row d-flex justify-content-center align-items-center px-4" data-item="${songStr}">
            <span class="play-wrapper position-relative d-inline-block wd-1">
                <span class="track-number fs-4">${i}</span>
                <span class="play-btn text-center">
                    <i class="fa-solid fa-play"></i>
                </span>
            </span>
            <span class="wd-4 d-flex justify-content-start align-items-center gap-2"><img class="song-row-img" src="${song.image}" /><span>${song.title}</span></span>
            <span class="wd-2">${song.genre}</span>
            <span class="wd-1">3:58</span>
        </div>
        `;
    }

    // setup initial player
    setupInitial() {
        this.setupSongsList(songs);
    }

}

window.onload = function () {
    const player = new MusicPlayer();
};