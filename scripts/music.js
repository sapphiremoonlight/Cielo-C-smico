// =======================================================
// SAFE MUSIC.JS — WORKS WITH TAB SYSTEM
// =======================================================

let songs = JSON.parse(localStorage.getItem("songs")) || [];
let currentSongIndex = -1;

// --------------------
// RUN ONLY WHEN MUSIC TAB LOADS
// --------------------
function setupMusic() {
    // Make sure DOM exists BEFORE running anything
    const container = document.getElementById("songsContainer");

    if (!container) {
        console.warn("Music tab not yet loaded.");
        return;
    }

    displaySongs();
}

// --------------------
// ADD SONG
// --------------------
function addSong() {
    const title = document.getElementById('songTitle')?.value;
    const artist = document.getElementById('songArtist')?.value;
    const albumCover = document.getElementById('albumCover')?.files[0];

    if (!title || !artist) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const reader = new FileReader();
    reader.onload = event => {
        const song = {
            title,
            artist,
            albumCover: event.target.result,
            id: Date.now(),
            theme: "",
            emotion: "",
            lyrics: "",
            structure: "",
            interpretation: ""
        };

        songs.push(song);
        localStorage.setItem("songs", JSON.stringify(songs));
        displaySongs();
        clearInputs();
    };

    if (albumCover) reader.readAsDataURL(albumCover);
}

// --------------------
// CLEAR INPUTS
// --------------------
function clearInputs() {
    const titleField = document.getElementById('songTitle');
    const artistField = document.getElementById('songArtist');
    const fileField = document.getElementById('albumCover');

    if (titleField) titleField.value = "";
    if (artistField) artistField.value = "";
    if (fileField) fileField.value = "";
}

// --------------------
// DISPLAY SONG CARDS
// --------------------
function displaySongs() {
    const container = document.getElementById("songsContainer");
    if (!container) return;

    container.innerHTML = "";

    songs.forEach((song, index) => {
        const card = document.createElement("div");
        card.classList.add("song-card");

        card.onclick = () => showSongDetails(index);

        card.innerHTML = `
            <img src="${song.albumCover}" alt="${song.title}">
            <p><strong>${song.title}</strong></p>
            <p>${song.artist}</p>

            <button class="edit-btn" data-index="${index}">Editar</button>
            <button class="delete-btn" data-index="${index}">Eliminar</button>
        `;

        container.appendChild(card);
    });

    // Attach Edit & Delete button events safely
    container.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            editSong(parseInt(btn.dataset.index));
        };
    });

    container.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            deleteSong(parseInt(btn.dataset.index));
        };
    });
}

// --------------------
// SHOW SONG DETAILS
// --------------------
function showSongDetails(index) {
    currentSongIndex = index;
    const song = songs[index];

    document.getElementById("songDetailsModal").style.display = "flex";

    document.getElementById("songDetails").innerHTML = `
        <p><strong>Título:</strong> ${song.title}</p>
        <p><strong>Artista:</strong> ${song.artist}</p>
        <p><strong>Portada del Álbum:</strong></p>
        <img src="${song.albumCover}" width="100">
    `;

    document.getElementById("theme").value = song.theme;
    document.getElementById("emotion").value = song.emotion;
    document.getElementById("lyrics").value = song.lyrics;
    document.getElementById("structure").value = song.structure;
    document.getElementById("interpretation").value = song.interpretation;
}

// --------------------
// SAVE SONG DETAILS
// --------------------
function saveSongDetails() {
    const song = songs[currentSongIndex];

    song.theme = document.getElementById("theme").value;
    song.emotion = document.getElementById("emotion").value;
    song.lyrics = document.getElementById("lyrics").value;
    song.structure = document.getElementById("structure").value;
    song.interpretation = document.getElementById("interpretation").value;

    localStorage.setItem("songs", JSON.stringify(songs));
    displaySongs();
    closeModal();
}

// --------------------
// EDIT SONG
// --------------------
function editSong(index) {
    showSongDetails(index);
}

// --------------------
// DELETE SONG
// --------------------
function deleteSong(index) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta canción?")) return;

    songs.splice(index, 1);
    localStorage.setItem("songs", JSON.stringify(songs));
    displaySongs();
}

// --------------------
// CLOSE MODAL
// --------------------
function closeModal() {
    document.getElementById("songDetailsModal").style.display = "none";
}

// --------------------
// FILTER SONGS
// --------------------
function filterSongs() {
    const text = document.getElementById("songFilter")?.value.toLowerCase();
    if (!text) return displaySongs();

    const filtered = songs.filter(s =>
        s.title.toLowerCase().includes(text) ||
        s.artist.toLowerCase().includes(text)
    );

    displayFilteredSongs(filtered);
}

function displayFilteredSongs(list) {
    const container = document.getElementById("songsContainer");
    if (!container) return;

    container.innerHTML = "";

    list.forEach((song, index) => {
        const card = document.createElement("div");
        card.classList.add("song-card");
        card.onclick = () => showSongDetails(index);

        card.innerHTML = `
            <img src="${song.albumCover}" alt="${song.title}">
            <p><strong>${song.title}</strong></p>
            <p>${song.artist}</p>
        `;

        container.appendChild(card);
    });
}

// Make available globally
window.setupMusic = setupMusic;
window.addSong = addSong;
window.saveSongDetails = saveSongDetails;
window.filterSongs = filterSongs;
window.closeModal = closeModal;
