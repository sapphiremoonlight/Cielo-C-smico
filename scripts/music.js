let songs = JSON.parse(localStorage.getItem("songs")) || [];
let currentSongIndex = -1;  // Keeps track of the currently viewed song

// Add new song to localStorage
function addSong() {
    const title = document.getElementById('songTitle').value;
    const artist = document.getElementById('songArtist').value;
    const albumCover = document.getElementById('albumCover').files[0];

    if (title && artist) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const song = {
                title,
                artist,
                albumCover: event.target.result,
                id: Date.now(),
                theme: '',
                emotion: '',
                lyrics: '',
                structure: '',
                interpretation: ''
            };
            songs.push(song);
            localStorage.setItem("songs", JSON.stringify(songs));
            displaySongs();
            clearInputs();
        };
        if (albumCover) reader.readAsDataURL(albumCover);
    } else {
        alert("Por favor, complete todos los campos.");
    }
}

// Clear input fields after adding a song
function clearInputs() {
    document.getElementById('songTitle').value = '';
    document.getElementById('songArtist').value = '';
    document.getElementById('albumCover').value = '';
}

// Display songs from localStorage
function displaySongs() {
    const container = document.getElementById('songsContainer');
    container.innerHTML = '';  // Clear current list
    songs.forEach((song, index) => {
        const songDiv = document.createElement('div');
        songDiv.classList.add('song-card');
        songDiv.onclick = () => showSongDetails(index);
        songDiv.innerHTML = `
            <img src="${song.albumCover}" alt="${song.title}">
            <p><strong>${song.title}</strong></p>
            <p>${song.artist}</p>
            <button class="edit-btn" onclick="editSong(${index}, event)">Editar</button>
            <button class="delete-btn" onclick="deleteSong(${index}, event)">Eliminar</button>
        `;
        container.appendChild(songDiv);
    });
}

// Show details of the song when clicked
function showSongDetails(index) {
    currentSongIndex = index;
    const song = songs[index];
    document.getElementById('songDetailsModal').style.display = "flex";
    document.getElementById('songDetails').innerHTML = `
        <p><strong>Título:</strong> ${song.title}</p>
        <p><strong>Artista:</strong> ${song.artist}</p>
        <p><strong>Portada del Álbum:</strong></p>
        <img src="${song.albumCover}" width="100">
    `;
    // Prefill the form with the song details
    document.getElementById('theme').value = song.theme;
    document.getElementById('emotion').value = song.emotion;
    document.getElementById('lyrics').value = song.lyrics;
    document.getElementById('structure').value = song.structure;
    document.getElementById('interpretation').value = song.interpretation;
}

// Save answers from the detail form
function saveSongDetails() {
    const theme = document.getElementById('theme').value;
    const emotion = document.getElementById('emotion').value;
    const lyrics = document.getElementById('lyrics').value;
    const structure = document.getElementById('structure').value;
    const interpretation = document.getElementById('interpretation').value;

    // Update the song details in the local songs array
    const song = songs[currentSongIndex];
    song.theme = theme;
    song.emotion = emotion;
    song.lyrics = lyrics;
    song.structure = structure;
    song.interpretation = interpretation;

    // Save updated songs array to localStorage
    localStorage.setItem("songs", JSON.stringify(songs));

    // Re-render the songs list
    displaySongs();

    // Close the modal
    closeModal();
}

// Edit a song (triggered when "Editar" button is clicked)
function editSong(index, event) {
    event.stopPropagation(); // Prevent the card click event from firing
    currentSongIndex = index;

    const song = songs[index];

    // Open the modal and prefill the data
    document.getElementById('songDetailsModal').style.display = "flex";
    document.getElementById('songDetails').innerHTML = `
        <p><strong>Título:</strong> ${song.title}</p>
        <p><strong>Artista:</strong> ${song.artist}</p>
        <p><strong>Portada del Álbum:</strong></p>
        <img src="${song.albumCover}" width="100">
    `;
    document.getElementById('theme').value = song.theme;
    document.getElementById('emotion').value = song.emotion;
    document.getElementById('lyrics').value = song.lyrics;
    document.getElementById('structure').value = song.structure;
    document.getElementById('interpretation').value = song.interpretation;
}

// Delete a song (triggered when "Eliminar" button is clicked)
function deleteSong(index, event) {
    event.stopPropagation(); // Prevent the card click event from firing
    if (confirm("¿Estás seguro de que quieres eliminar esta canción?")) {
        // Remove the song from the array
        songs.splice(index, 1);

        // Save updated songs array to localStorage
        localStorage.setItem("songs", JSON.stringify(songs));

        // Re-render the songs list
        displaySongs();
    }
}

// Close the modal when the user clicks the "×"
function closeModal() {
    document.getElementById('songDetailsModal').style.display = "none";
}

// Filter songs based on search input
function filterSongs() {
    const filterText = document.getElementById('songFilter').value.toLowerCase();
    const filteredSongs = songs.filter(song => {
        return song.title.toLowerCase().includes(filterText) || song.artist.toLowerCase().includes(filterText);
    });
    displayFilteredSongs(filteredSongs);
}

// Display filtered songs
function displayFilteredSongs(filteredSongs) {
    const container = document.getElementById('songsContainer');
    container.innerHTML = '';  // Clear current list
    filteredSongs.forEach((song, index) => {
        const songDiv = document.createElement('div');
        songDiv.classList.add('song-card');
        songDiv.onclick = () => showSongDetails(index);
        songDiv.innerHTML = `
            <img src="${song.albumCover}" alt="${song.title}">
            <p><strong>${song.title}</strong></p>
            <p>${song.artist}</p>
            <button class="edit-btn" onclick="editSong(${index}, event)">Editar</button>
            <button class="delete-btn" onclick="deleteSong(${index}, event)">Eliminar</button>
        `;
        container.appendChild(songDiv);
    });
}

// Initial display of songs when the page loads
document.addEventListener('DOMContentLoaded', function() {
    displaySongs();
});