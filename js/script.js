console.log('Lets write JavaScript');

let currentSong = new Audio()
let songs
let currFolder
let lastVolume = 0.5

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder

    // let a = await fetch("http://127.0.0.1:3000/songs/");
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response

    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split("%5C").pop()))

            // songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the library
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]

    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML =
            songUL.innerHTML +
            `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").replace(".mp3", "")}</div>
                    <div>Puskar</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`
    }

    // Attach an event listener to each song
    Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index])
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {

    // currentSong.src = "/%5Csongs%5C" + track
    currentSong.src = `/${currFolder}/` + track

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML =
        decodeURI(track).split("\\").pop().replace(".mp3", "")

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displaying albums")

    let a = await fetch(`/songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("%5Csongs%5C")) {
            let folder = decodeURIComponent(e.href).split("\\").pop().replace("/", "")

            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z"
                            stroke="#141B34"
                            fill="#000"
                            stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>

                <img src="/songs/${folder}/cover.png" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {

    // Get the list of all the songs
    await getSongs("songs/PlayList 1")
    playMusic(songs[0], true)

    displayAlbums()

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add an event listen to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent =
            (e.offsetX / e.target.getBoundingClientRect().width) * 100

        document.querySelector(".circle").style.left = percent + "%"

        currentSong.currentTime =
            ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    // Add an event listener to volume
    document.querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {

            console.log("Setting volume to", e.target.value, "/ 100")

            currentSong.volume = parseInt(e.target.value) / 100

            if (currentSong.volume > 0) {
                lastVolume = currentSong.volume
            }
        })

    // Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {

        if (e.target.src.includes("img/volume.svg")) {

            e.target.src =
                e.target.src.replace("img/volume.svg", "img/mute.svg")

            lastVolume = currentSong.volume
            currentSong.volume = 0;

            document.querySelector(".range")
                .getElementsByTagName("input")[0].value = 0;
        }
        else {

            e.target.src =
                e.target.src.replace("img/mute.svg", "img/volume.svg")

            currentSong.volume = lastVolume;

            document.querySelector(".range")
                .getElementsByTagName("input")[0].value =
                lastVolume * 100;
        }
    })

    // Attach an event listener to play, next, previous
    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    previous.addEventListener("click", () => {

        currentSong.pause()
        console.log("Previous clicked")

        let index =
            songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {

        currentSong.pause()
        console.log("Next clicked")

        let index =
            songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0])
        }
    })
}

main()