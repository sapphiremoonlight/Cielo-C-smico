// -----------------------------
// GAMIFICATION SETUP
// -----------------------------
async function setupGamification() {
    // XP & Level System
    const playerLevelEl = document.getElementById("player-level");
    const playerXpEl = document.getElementById("player-xp");
    const xpNeededEl = document.getElementById("xp-needed");
    const xpFillEl = document.querySelector(".xp-fill");
    const gainXpBtn = document.getElementById("gainXpBtn");

    // Load XP/Level from localStorage or defaults
    let playerLevel = parseInt(localStorage.getItem("playerLevel")) || 1;
    let playerXp = parseInt(localStorage.getItem("playerXp")) || 0;
    let xpNeeded = parseInt(localStorage.getItem("xpNeeded")) || 100;

    function updateXpDisplay() {
        playerLevelEl.textContent = playerLevel;
        playerXpEl.textContent = playerXp;
        xpNeededEl.textContent = xpNeeded;
        xpFillEl.style.width = `${(playerXp / xpNeeded) * 100}%`;

        // Save to localStorage
        localStorage.setItem("playerLevel", playerLevel);
        localStorage.setItem("playerXp", playerXp);
        localStorage.setItem("xpNeeded", xpNeeded);
    }

    function gainXp(amount = 20) {
        playerXp += amount;
        while (playerXp >= xpNeeded) {
            playerXp -= xpNeeded;
            playerLevel++;
            xpNeeded = Math.floor(xpNeeded * 1.5);
        }
        updateXpDisplay();
    }

    gainXpBtn.addEventListener("click", () => gainXp());
    updateXpDisplay();

    // Spanish Quiz System (verbs.json)
    const quizQuestionEl = document.getElementById("quiz-question");
    const quizOptionsEl = document.getElementById("quiz-options");
    const quizFeedbackEl = document.getElementById("quiz-feedback");
    const nextQuestionBtn = document.getElementById("next-question-btn");

    let verbs = [];
    try {
        const response = await fetch("verbs.json");
        verbs = await response.json();
    } catch (err) {
        quizQuestionEl.textContent = "Failed to load verbs.json 😢";
        console.error(err);
        return;
    }

    const tenses = ["present", "past", "future"];
    const pronouns = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"];

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    let currentQuestion = null;

    function generateQuestion() {
        const verb = verbs[getRandomInt(verbs.length)];
        const tense = tenses[getRandomInt(tenses.length)];
        const pronoun = pronouns[getRandomInt(pronouns.length)];
        const correctAnswer = verb.conjugations[tense][pronoun];

        let options = [correctAnswer];
        while (options.length < 4) {
            const randomVerb = verbs[getRandomInt(verbs.length)];
            const randomTense = tenses[getRandomInt(tenses.length)];
            const randomPronoun = pronouns[getRandomInt(pronouns.length)];
            const wrongAnswer = randomVerb.conjugations[randomTense][randomPronoun];
            if (!options.includes(wrongAnswer)) options.push(wrongAnswer);
        }

        options.sort(() => Math.random() - 0.5);
        currentQuestion = { correctAnswer, verb, tense, pronoun, options };
        displayQuestion();
    }

    function displayQuestion() {
        const { verb, tense, pronoun, options } = currentQuestion;
        quizQuestionEl.textContent = `Conjugate "${verb.infinitive}" for "${pronoun}" in ${tense} tense:`;

        quizOptionsEl.innerHTML = "";
        options.forEach(option => {
            const btn = document.createElement("button");
            btn.textContent = option;
            btn.addEventListener("click", () => checkAnswer(option));
            quizOptionsEl.appendChild(btn);
        });

        quizFeedbackEl.textContent = "";
    }

    function checkAnswer(selected) {
        if (!currentQuestion) return;
        if (selected === currentQuestion.correctAnswer) {
            quizFeedbackEl.textContent = "✅ Correct!";
            gainXp(30); // XP reward
        } else {
            quizFeedbackEl.textContent = `❌ Wrong! Correct: ${currentQuestion.correctAnswer}`;
        }
        quizOptionsEl.querySelectorAll("button").forEach(btn => btn.disabled = true);
    }

    nextQuestionBtn.addEventListener("click", generateQuestion);
}
