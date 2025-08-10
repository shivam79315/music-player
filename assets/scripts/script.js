class MusicPlayer {
    constructor() {
        this.header = document.querySelector('.header');
        this.songsList = document.querySelector('.list-body');
        this.searchInput = document.querySelector('#searchSong');
        this.playListContainer = document.querySelector('.play-list-container');

        const rootStyles = getComputedStyle(document.documentElement);
        this.currentSong;

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
        this.input = document.querySelector('#playListName');

        document.addEventListener('click', (e) => {
            const checkbox = e.target.closest('.checkbox');
            if (checkbox) {
                const mode = checkbox.checked ? 'dark' : 'light';
                this.updateTheme(mode);
            } else if(e.target.closest('.add-play-list')) {
                const song = JSON.parse(e.target.closest('.song-row').dataset.item || e.target.closest('.music-card').dataset.item);
                this._addToPlayList(song);
            } else if (e.target.closest('.song-row')) {
                const song = JSON.parse(e.target.closest('.song-row').dataset.item);
                this.updateSongCard(song);
            } else if (e.target.closest('.playPauseBtn')) {
                playBtn.classList.toggle('hidden');
                pauseBtn.classList.toggle('hidden');

                // play, pause, previous, next song
                if (e.target.closest('.song-play-btn')) {
                    this._playSong();
                } else if (e.target.closest('.song-pause-btn')) {
                    this._pauseSong();
                } 
            } else if(e.target.closest('.play-next')) {
                this._playNextSong();
            } else if(e.target.closest('.play-previous')) {
                this._playPreviousSong();
            } else if(e.target.closest('.create-pl-btn')) {
                this._handlePlayList();
            }
        });

        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const value = this.input.value.trim();

                if (!value) {
                    this.input.focus();
                } else {
                    this._createPlayList(value);
                    this.input.value = "";
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            this._playListEvent(e);
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
        const songStr = JSON.stringify(song).replace(/"/g, '&quot;');
        
        musicCard.dataset.item = songStr;
        musicCard.innerHTML = "";
        musicCard.innerHTML = this._music_card_html(song);

        this.currentSong = song;
    }

    // this fn updates currently playing song card 
    updateSongCard(song) {
        const musicCard = document.querySelector('.music-card');
        const songStr = JSON.stringify(song).replace(/"/g, '&quot;');
        
        musicCard.dataset.item = songStr;
        musicCard.innerHTML = "";
        musicCard.innerHTML = this._music_card_html(song);

        this._playSong();

        this.currentSong = song;
    }

    showPlayLists = () => {
        const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
        this.playListContainer.innerHTML = playlists.map((item, _) => {
            return this._playListHTML(item);
        }).join('');
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
        const playBtn = document.querySelector('.song-play-btn');
        const pauseBtn = document.querySelector('.song-pause-btn');
        playBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        orgAud.pause();
    }

    _playNextSong() {
        const currentIndex = songs.findIndex(song => song.id === this.currentSong.id);

        // Check if it's the last song
        if (currentIndex === songs.length - 1) {
            alert("This is the last song.");
            return; 
        }

        const nextSong = songs[currentIndex + 1];
        this.this.currentSong = nextSong;

        this.updateSongCard(nextSong);
        this._playSong(nextSong);
    }

    _playPreviousSong() {
        const currentIndex = songs.findIndex(song => song.id === this.currentSong.id);

        if(currentIndex === 0) {
            alert("This is the last song.");
            return;
        }

        const prevSong = songs[currentIndex - 1];
        this.currentSong = prevSong;

        this.updateSongCard(prevSong);
        this._playSong(prevSong);
    }


    _debounce(fn, delay) {
        if(this._debounceTimer) clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(fn, delay);
    }

    // dynamic html 
    _music_card_html(song) {
        return `
        <div class="card-left flex-shrink-0">
            <img class="song-row-img" src="${song.image}" />
        </div>
        <div class="card-right d-flex align-items-center flex-column flex-grow-1">
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
                <i class="fas fa-backward play-previous"></i>
                <span class="playPauseBtn">
                    <i class="fas fa-play song-play-btn"></i>
                    <i class="fa-solid fa-pause song-pause-btn hidden"></i>
                </span>
                <i class="fas fa-forward play-next"></i>
                <i class="fas fa-redo"></i>
            </div>
        </div>
        <div class="add-play-list flex-shrink-1">
            <i class="fa-solid fa-plus"></i>
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
            <span class="wd-3 d-flex justify-content-start align-items-center gap-2"><img class="song-row-img" src="${song.image}" /><span>${song.title}</span></span>
            <span class="wd-2">${song.genre}</span>
            <span class="wd-1">3:58</span>
            <span class="wd-1 add-play-list"><i class="fa-solid fa-plus"></i></span>
        </div>
        `;
    }

    _playListHTML = (list) => {
        return `<li class="list-group-item d-flex justify-content-between align-items-center p-2">
            ${list.name}
            <span class="badge bg-primary rounded-pill">${list.songs.length}</span>
        </li>`;
    }

    _addToPlayList = (song) => {
        this.selectedSong = song;

        const playLists = JSON.parse(localStorage.getItem('playlists')) || [];

        const playlistList = document.getElementById("playlistList");
        playlistList.innerHTML = "";

        if(playLists.length == 0) {
            playlistList.innerHTML = `<li class="list-group-item text-muted">No playlists found</li>`;
        } else {
            playLists.forEach((playlist, index) => {
                const li = document.createElement("li");
                li.className = "list-group-item list-group-item-action";
                li.style.cursor = "pointer";
                li.textContent = playlist.name;

                li.addEventListener("click", () => {
                    this._saveSongToPlaylist(index, this.selectedSong);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('playlistModal'));
                    modal.hide();
                });

                playlistList.appendChild(li)
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('playlistModal'));
        modal.show();   
    }

    _saveSongToPlaylist = (playlistIndex, song) => {
        let playlists = JSON.parse(localStorage.getItem("playlists")) || [];

        // Prevent duplicate songs
        const exists = playlists[playlistIndex].songs.some(s => s.id === song.id);
        if (exists) {
            alert("Song already exists in this playlist!");
            return;
        }

        playlists[playlistIndex].songs.push(song);
        localStorage.setItem("playlists", JSON.stringify(playlists));

        alert(`Song added to ${playlists[playlistIndex].name}`);
    };

    _handlePlayList = () => {
        if (!this.input) return;

        this.input.focus();

        // Clean old listener (avoid duplicates)
        this.input.removeEventListener("keydown", this._playListEvent);
        this.input.addEventListener("keydown", this._playListEvent);

        clearTimeout(this.playlistTimeout);
        this.playlistTimeout = setTimeout(() => {
            this.input.removeEventListener("keydown", this._playListEvent);
        }, 15000);
    };

    _playListEvent = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = this.input.value.trim();

            if (!value) {
                this.input.focus();
            } else {
                this._createPlayList(value);
                this.input.value = "";
            }

            // Remove listener & timeout after enter
            this.input.removeEventListener("keydown", this._playListEvent);
            clearTimeout(this.playlistTimeout);
        }
    };


    _createPlayList = (listName) => {
        const playlistsKey = "playlists";

        let playlists = JSON.parse(localStorage.getItem(playlistsKey)) || [];

        const exists = playlists.some(pl => pl.name.toLowerCase() === listName.toLowerCase());

        if (exists) {
            alert("Playlist already exists...");
            return;
        }

        playlists.push({ name: listName, songs: [] });

        localStorage.setItem(playlistsKey, JSON.stringify(playlists));

        alert("Playlist created successfully...");

    }

    // setup initial player
    setupInitial() {
        this.setupSongsList(songs);
        this.showPlayLists();
    }

}

window.onload = function () {
    const player = new MusicPlayer();
};