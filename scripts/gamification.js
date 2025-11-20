document.addEventListener("DOMContentLoaded", () => {
    // ----------- XP & Level System -----------
    const playerLevelEl = document.getElementById("player-level");
    const playerXpEl = document.getElementById("player-xp");
    const xpNeededEl = document.getElementById("xp-needed");
    const xpFillEl = document.querySelector(".xp-fill");
    const gainXpBtn = document.getElementById("gainXpBtn");

    let playerLevel = 1;
    let playerXp = 0;
    let xpNeeded = 100;

    function updateXpDisplay() {
        playerLevelEl.textContent = playerLevel;
        playerXpEl.textContent = playerXp;
        xpNeededEl.textContent = xpNeeded;
        xpFillEl.style.width = `${(playerXp / xpNeeded) * 100}%`;
    }

    function gainXp(amount = 20) {
        playerXp += amount;
        while (playerXp >= xpNeeded) {
            playerXp -= xpNeeded;
            playerLevel++;
            xpNeeded = Math.floor(xpNeeded * 1.5); // Increase XP needed per level
        }
        updateXpDisplay();
    }

    gainXpBtn.addEventListener("click", () => {
        gainXp();
    });

    updateXpDisplay();

    // ----------- Quiz System -----------
    const quizQuestionEl = document.getElementById("quiz-question");
    const quizOptionsEl = document.getElementById("quiz-options");
    const quizFeedbackEl = document.getElementById("quiz-feedback");
    const nextQuestionBtn = document.getElementById("next-question-btn");

    const quizzes = [
        {
            question: "What is the capital of France?",
            options: ["Paris", "London", "Berlin", "Rome"],
            answer: "Paris"
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            answer: "Mars"
        },
        {
            question: "2 + 2 equals?",
            options: ["3", "4", "5", "22"],
            answer: "4"
        }
    ];

    let currentQuizIndex = -1;

    function showNextQuestion() {
        currentQuizIndex++;
        if (currentQuizIndex >= quizzes.length) {
            quizQuestionEl.textContent = "Quiz completed! 🎉";
            quizOptionsEl.innerHTML = "";
            nextQuestionBtn.disabled = true;
            return;
        }

        const quiz = quizzes[currentQuizIndex];
        quizQuestionEl.textContent = quiz.question;
        quizOptionsEl.innerHTML = "";

        quiz.options.forEach(option => {
            const btn = document.createElement("button");
            btn.textContent = option;
            btn.addEventListener("click", () => checkAnswer(option));
            quizOptionsEl.appendChild(btn);
        });

        quizFeedbackEl.textContent = "";
    }

    function checkAnswer(selected) {
        const correct = quizzes[currentQuizIndex].answer;
        if (selected === correct) {
            quizFeedbackEl.textContent = "✅ Correct!";
            gainXp(30); // Reward XP for correct answer
        } else {
            quizFeedbackEl.textContent = `❌ Wrong! Correct answer: ${correct}`;
        }
        // Disable buttons after answering
        const buttons = quizOptionsEl.querySelectorAll("button");
        buttons.forEach(btn => btn.disabled = true);
    }

    nextQuestionBtn.addEventListener("click", showNextQuestion);
});
