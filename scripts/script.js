// -----------------------------
// TAB LOADING
// -----------------------------
const tabContent = document.getElementById("tabContent");
const navBtns = document.querySelectorAll(".nav-btn");

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const tabName = btn.dataset.tab;

        fetch(`tabs/${tabName}.html`)
            .then(r => {
                if (!r.ok) throw new Error(`Failed to load tabs/${tabName}.html`);
                return r.text();
            })
            .then(html => {
                tabContent.innerHTML = html;
                tabContent.classList.add("fade-in");
                setTimeout(() => tabContent.classList.remove("fade-in"), 500);

                // Setup tab-specific functionality after loading
                if (tabName === "weekly") setupWeekly();
                if (tabName === "pathway") setupPathway();
                if (tabName === "conjugation") setupConjugation();
                if (tabName === "tests") setupTests();
                if (tabName === "flashcards") setupFlashcards();
                if (tabName === "music") setupMusic();
                if (tabName === "gamification") setupGamification();
            })
            .catch(err => {
                tabContent.innerHTML = `<p style="color:red;">${err}</p>`;
                console.error(err);
            });
    });
});

// -----------------------------
// Load initial active tab with setup
// -----------------------------
const activeBtn = document.querySelector(".nav-btn.active");
if (activeBtn) {
    const tabName = activeBtn.dataset.tab;

    fetch(`tabs/${tabName}.html`)
        .then(r => {
            if (!r.ok) throw new Error(`Failed to load tabs/${tabName}.html`);
            return r.text();
        })
        .then(html => {
            tabContent.innerHTML = html;
            tabContent.classList.add("fade-in");
            setTimeout(() => tabContent.classList.remove("fade-in"), 500);

            // Run tab-specific setup immediately
            if (tabName === "weekly") setupWeekly();      
            if (tabName === "pathway") setupPathway();    
            if (tabName === "conjugation") setupConjugation(); 
            if (tabName === "tests") setupTests();        
            if (tabName === "flashcards") setupFlashcards();
            if (tabName === "music") setupMusic();
            if (tabName === "gamification") setupGamification();
        })
        .catch(err => {
            tabContent.innerHTML = `<p style="color:red;">${err}</p>`;
            console.error(err);
        });
}


// -----------------------------
// THEME SWITCHING
// -----------------------------
const themeSelect = document.getElementById("themeSelect");
const savedTheme = localStorage.getItem("theme") || "emerald";

document.body.classList.add(`theme-${savedTheme}`);
themeSelect.value = savedTheme;

themeSelect.addEventListener("change", () => {
    document.body.classList.remove(`theme-${savedTheme}`);
    document.body.classList.add(`theme-${themeSelect.value}`);
    localStorage.setItem("theme", themeSelect.value);
});

// -----------------------------
// WEEKLY PLAN LOGIC
// -----------------------------
function setupWeekly() {
    const tasks = document.querySelectorAll(".weekly-task");

    tasks.forEach(task => {
        const saved = localStorage.getItem(task.dataset.id);
        if (saved === "true") task.checked = true;

        task.addEventListener("change", () => {
            localStorage.setItem(task.dataset.id, task.checked);
            updateWeeklyProgress();
        });
    });

    updateWeeklyProgress();
}

function updateWeeklyProgress() {
    const tasks = document.querySelectorAll(".weekly-task");
    const completed = [...tasks].filter(t => t.checked).length;
    const total = tasks.length;

    const percent = Math.round((completed / total) * 100);

    const bar = document.getElementById("weeklyProgressFill");
    const txt = document.getElementById("weeklyProgressText");

    if (bar && txt) {
        bar.style.width = percent + "%";
        txt.textContent = percent + "%";
    }
}

// -----------------------------
// 3-MONTH PATHWAY LOGIC
// -----------------------------
function setupPathway() {
    const tasks = document.querySelectorAll(".path-task");

    tasks.forEach(t => {
        const saved = localStorage.getItem(t.dataset.id);
        if (saved === "true") t.checked = true;

        t.addEventListener("change", () => {
            localStorage.setItem(t.dataset.id, t.checked);
            updatePathwayProgress();
        });
    });

    updatePathwayProgress();
}

function updatePathwayProgress() {
    const months = [1, 2, 3];
    let overallCompleted = 0;
    let overallTotal = 0;

    months.forEach(month => {
        const monthTasks = document.querySelectorAll(`.path-task[data-id^="m${month}"]`);
        const completed = [...monthTasks].filter(t => t.checked).length;
        const total = monthTasks.length;

        overallCompleted += completed;
        overallTotal += total;

        const percent = Math.round((completed / total) * 100);

        const bar = document.getElementById(`month${month}Fill`);
        const txt = document.getElementById(`month${month}Text`);

        if (bar && txt) {
            bar.style.width = percent + "%";
            txt.textContent = percent + "%";
        }
    });

    const overallPercent = Math.round((overallCompleted / overallTotal) * 100);
    const overallBar = document.getElementById("overallProgressFill");
    const overallTxt = document.getElementById("overallProgressText");

    if (overallBar && overallTxt) {
        overallBar.style.width = overallPercent + "%";
        overallTxt.textContent = overallPercent + "%";
    }
}

// -----------------------------
// FLASHCARDS LOGIC
// -----------------------------
function setupFlashcards() {
    let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [
        { front: "Hola", back: "Hello" },
        { front: "Gracias", back: "Thank you" },
        { front: "Adiós", back: "Goodbye" }
    ];

    let current = parseInt(localStorage.getItem("currentFlashcard")) || 0;

    const container = document.getElementById("flashcard");
    const prevBtn = document.getElementById("prevCard");
    const nextBtn = document.getElementById("nextCard");
    const flipBtn = document.getElementById("flipCard");
    const addBtn = document.getElementById("addCardBtn");
    const deleteBtn = document.getElementById("deleteCardBtn");
    const frontInput = document.getElementById("flashcardFront");
    const backInput = document.getElementById("flashcardBack");
    const flashcardList = document.getElementById("flashcardList"); // container for mini cards

    // Show main flashcard
    function showCard() {
        if (!container) return;

        if (flashcards.length === 0) {
            container.querySelector(".front").textContent = "No flashcards!";
            container.querySelector(".back").textContent = "";
            renderFlashcardList();
            localStorage.setItem("flashcards", JSON.stringify(flashcards));
            return;
        }

        container.querySelector(".front").textContent = flashcards[current].front;
        container.querySelector(".back").textContent = flashcards[current].back;
        container.classList.remove("flipped"); // reset flip
        localStorage.setItem("currentFlashcard", current);
        localStorage.setItem("flashcards", JSON.stringify(flashcards));
        renderFlashcardList();
    }

    // Render mini flashcards list
    function renderFlashcardList() {
        if (!flashcardList) return;
        flashcardList.innerHTML = "";

        flashcards.forEach((card, idx) => {
            const div = document.createElement("div");
            div.className = "mini-flashcard";
            div.innerHTML = `
                <div class="mini-front">${card.front}</div>
                <div class="mini-back">${card.back}</div>
            `;
            div.addEventListener("click", () => {
                div.classList.toggle("flipped"); // flip mini card
                current = idx;
                showCard(); // update main card
            });
            flashcardList.appendChild(div);
        });
    }

    // Flip main card
    function flipCard() {
        container.classList.toggle("flipped");
    }

    // Event listeners
    container.addEventListener("click", flipCard); // flip main card
    flipBtn?.addEventListener("click", flipCard);

    prevBtn?.addEventListener("click", () => {
        if (flashcards.length === 0) return;
        current = (current - 1 + flashcards.length) % flashcards.length;
        showCard();
    });

    nextBtn?.addEventListener("click", () => {
        if (flashcards.length === 0) return;
        current = (current + 1) % flashcards.length;
        showCard();
    });

    addBtn?.addEventListener("click", () => {
        if (!frontInput.value || !backInput.value) return;
        flashcards.push({ front: frontInput.value, back: backInput.value });
        frontInput.value = "";
        backInput.value = "";
        current = flashcards.length - 1; // show newly added card
        showCard();
    });

    deleteBtn?.addEventListener("click", () => {
        if (flashcards.length === 0) return;
        flashcards.splice(current, 1);
        if (current >= flashcards.length) current = flashcards.length - 1;
        showCard();
    });

    showCard();
}

// -----------------------------
// DASHBOARD LOGIC
// -----------------------------

function setupDashboard() {
    // Weekly Progress
    const weeklyTasks = document.querySelectorAll(".weekly-task");
    const weeklyCompleted = [...weeklyTasks].filter(t => t.checked).length;
    const weeklyPercent = weeklyTasks.length ? Math.round((weeklyCompleted / weeklyTasks.length) * 100) : 0;

    const weeklyBar = document.getElementById("weeklyProgressFill");
    const weeklyText = document.getElementById("weeklyProgressText");
    if (weeklyBar && weeklyText) {
        weeklyBar.style.width = weeklyPercent + "%";
        weeklyText.textContent = weeklyPercent + "%";
    }

    // Pathway Progress
    const overallBar = document.getElementById("overallProgressFill");
    const overallText = document.getElementById("overallProgressText");
    const overallCompleted = parseInt(localStorage.getItem("overallCompleted")) || 0;
    const overallTotal = parseInt(localStorage.getItem("overallTotal")) || 1;
    if (overallBar && overallText) {
        const overallPercent = Math.round((overallCompleted / overallTotal) * 100);
        overallBar.style.width = overallPercent + "%";
        overallText.textContent = overallPercent + "%";
    }

    // Flashcards
    const flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
    const flashcardCount = document.getElementById("flashcardCount");
    if (flashcardCount) flashcardCount.textContent = flashcards.length;

    // Tests
    const tests = JSON.parse(localStorage.getItem("tests")) || [];
    const testCount = document.getElementById("testCount");
    if (testCount) testCount.textContent = tests.length;

    // Gamification (already handled in setupGamification)
    setupGamification();
}

// -----------------------------
// GAMIFICATION LOGIC
// -----------------------------

function setupGamification() {
    const pointsEl = document.getElementById("points");
    const levelEl = document.getElementById("level");
    const streakEl = document.getElementById("streak");
    const badgeList = document.getElementById("badgeList");

    let points = parseInt(localStorage.getItem("points")) || 0;
    let level = parseInt(localStorage.getItem("level")) || 1;
    let streak = parseInt(localStorage.getItem("streak")) || 0;
    let badges = JSON.parse(localStorage.getItem("badges")) || [];

    function renderStats() {
        if (pointsEl) pointsEl.textContent = points;
        if (levelEl) levelEl.textContent = level;
        if (streakEl) streakEl.textContent = streak;
        if (badgeList) {
            badgeList.innerHTML = "";
            badges.forEach(b => {
                const div = document.createElement("div");
                div.className = "badge";
                div.textContent = b;
                badgeList.appendChild(div);
            });
        }
    }
    renderStats();
}

