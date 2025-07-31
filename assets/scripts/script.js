class MusicPlayer {
    constructor() {
        this.header = document.querySelector('.header');
        this.songsList = document.querySelector('.list-body');
        this.searchInput = document.querySelector('#searchSong');
        this.setupEventListeners();
        this.setupSongsList(songs);
    }

    setupEventListeners() {
       document.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-switch')) {
                this.updateTheme();
            }
            const songRow = e.target.closest('.song-row');
            if (songRow) {
            const song = JSON.parse(songRow.dataset.item);
            this.updateSongCard(song);
            }
        });

        document.addEventListener('input', (e) => {
            this._debounce(() => {
                this.filterSongs(e.target.value);
            }, 500);
        });
    }

    updateTheme() {
        const isDark = document.querySelector('.checkbox')?.checked;
        const root = document.documentElement;

        if (isDark) {
            root.style.setProperty('--dark', '#ECFAE5');   
            root.style.setProperty('--light', '#181C14');
        } else {
            root.style.setProperty('--dark', '#181C14');
            root.style.setProperty('--light', '#ECFAE5');
        }
    }

    setupSongsList(songs) {
        songs.map((item, i) => {
            const songHTML = this._createSongRowHTML(item, i);
            this.songsList.insertAdjacentHTML('beforeend', songHTML);
        })
    }

    filterSongs(searchInput) {
        const matchedSongs = songs.filter(item => item.title.toLowerCase().includes(searchInput.toLowerCase()));
        
        if (matchedSongs.length > 0) {
            this.songsList.innerHTML = '';
            this.setupSongsList(matchedSongs);
        } 
    }

    updateSongCard(song) {
        const songTitle = document.querySelector('.song-info');
        songTitle.innerHTML = `<p><strong>${song.title}</strong> — <small>${song.genre}</small></p>`;
    }

    // util. fn 
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

    _debounce(fn, delay) {
        if(this._debounceTimer) clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(fn, delay);
    }

}

window.onload = function () {
    const player = new MusicPlayer();
};