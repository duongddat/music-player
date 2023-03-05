const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYLIST_SONG'
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'Nói thương nhau đi',
            singer: 'Bích Phương',
            path: './asset/music/song1.mp3',
            image: './asset/img/song1.jpg'
        },
        {
            name: ' Chạnh Lòng Thương Cô',
            singer: 'Orrin Remix',
            path: './asset/music/song2.mp3',
            image: './asset/img/song2.jpg'
        },
        {
            name: 'Monster',
            singer: 'Gumi',
            path: './asset/music/song3.mp3',
            image: './asset/img/song3.jpg'
        },
        {
            name: 'Đế Vương',
            singer: 'Đình Dũng',
            path: './asset/music/song5.mp3',
            image: './asset/img/song5.jpg'
        },
        {
            name: 'Gate Heaven Remix',
            singer: 'DJ',
            path: './asset/music/songn.mp3',
            image: './asset/img/songn.jpg'
        }
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active':''}" data-index=${index}>
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop; 
            // Lấy độ dài bị cuộn
            const newCdWidth = cdWidth - scrollTop;
            
            //Set tốc độ kéo (vì lúc kéo nhận giá trị âm)
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
                // _this.isPlaying = false
                // player.classList.remove('playing')
            } else {
                audio.play()
                // _this.isPlaying = true
                // player.classList.add('playing')
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause() 
        }

        // Khi tiếng độ bài hát thay đổi (check tg)
        audio.ontimeupdate = function() {
            // Tính phần trăm bài hát
            // console.log((audio.currentTime / audio.duration)*100);
            if(audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration)*100)
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.onchange = function(e) {
            // console.log((audio.duration / 100) * e.target.value)
            const seekTime = (audio.duration / 100) * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            //Xử lý render màu
            _this.render()

            //Xử lý kéo khi active
            _this.scrollToActive()
        }
        // Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            //Xử lý render màu
            _this.render()

            //Xử lý kéo khi active
            _this.scrollToActive()
        },
        //Xử lý bật/ tắt random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active', _this.isRandom)
            _this.setConfig('isRandom', _this.isRandom)
        }

        // Xử lý lặp lại một song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active', _this.isRepeat)
            _this.setConfig('isRepeat', _this.isRepeat)
        }

        //Xử lý khi next song khi audio end
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Xử lý lắng nghe click vào playlist song
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            // Xử lý khi click vào song (không chon song có active)
            if (songNode || e.target.closest('.option')) {
                 //Xử lý khi click vào song
                 if(songNode) {
                    // songNode.getAttribute('data-index')
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                 } //Xử lý khi click vào song option 
                 else {

                 }
                 
            }
        }

    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        // console.log([heading, cdThumb, audio]);
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while ((newIndex === this.currentIndex)) 
       this.currentIndex = newIndex
       this.loadCurrentSong()
    },
    scrollToActive: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        //Lắng nghe/ xử lý các sự kiện (DOM events)
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của button repeat & random
        // Display the initial state of the repeat & random button
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
}

app.start();