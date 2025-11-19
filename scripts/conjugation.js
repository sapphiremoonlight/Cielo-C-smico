let verbsData = [];

// Load verbs JSON once
fetch('verbs.json')
  .then(res => res.json())
  .then(data => {
    verbsData = data;
  });

function setupConjugation() {
    const verbInput = document.getElementById('verbSearch');
    const resultDiv = document.getElementById('verbResult');
    const youtubeDiv = document.getElementById('youtubeVideos');

    verbInput.addEventListener('input', () => {
        const query = verbInput.value.trim().toLowerCase();
        if (!query) {
            resultDiv.innerHTML = '';
            youtubeDiv.innerHTML = '';
            return;
        }

        const verb = verbsData.find(v => v.infinitive === query);

        if (!verb) {
            resultDiv.innerHTML = `<p>Verb not found.</p>`;
            youtubeDiv.innerHTML = '';
            return;
        }

        // Render conjugations
        let html = `<h3>${verb.infinitive} — ${verb.english}</h3>`;
        for (const [tense, forms] of Object.entries(verb.conjugations)) {
            html += `<h4>${tense.charAt(0).toUpperCase() + tense.slice(1)}</h4>`;
            html += "<table><tr><th>Yo</th><th>Tú</th><th>Él/Ella</th><th>Nosotros</th><th>Vosotros</th><th>Ellos</th></tr>";
            html += `<tr>${Object.values(forms).map(v => `<td>${v}</td>`).join("")}</tr></table>`;
        }
        resultDiv.innerHTML = html;

        // Show fixed embedded videos
        youtubeDiv.innerHTML = `
            <iframe src="https://www.youtube.com/embed/R4SiKCStHuU" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/lfFsbeKyBKY" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/Bzh9sBe2gGk" allowfullscreen></iframe>
        `;
    });
}

// Expose globally
window.setupConjugation = setupConjugation;
