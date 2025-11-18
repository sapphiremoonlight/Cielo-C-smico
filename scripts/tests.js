/* ----------------------------------------------------
   Load Tests from LocalStorage
---------------------------------------------------- */
let tests = JSON.parse(localStorage.getItem("tests")) || [];

// Save tests back to localStorage
function saveTests() {
    localStorage.setItem("tests", JSON.stringify(tests));
}

/* ----------------------------------------------------
   Render All Tests
---------------------------------------------------- */
function renderTests() {
    const container = document.getElementById("test-list-container");
    container.innerHTML = "";

    tests.forEach((test, index) => {
        const item = document.createElement("div");
        item.classList.add("test-item", "fade-in");

        item.innerHTML = `
            <h3>${test.title}</h3>
            <p>${test.subtitle || ""}</p>
            <p><strong>Type:</strong> ${test.type}</p>
            <p><strong>Questions:</strong> ${test.questionCount}</p>
            <p><strong>Timer:</strong> ${test.timer} min</p>

            <button class="edit-btn" data-index="${index}">✏️ Edit</button>
            <button class="delete-btn" data-index="${index}">🗑 Delete</button>
        `;

        container.appendChild(item);
    });
}

/* ----------------------------------------------------
   Create New Test
---------------------------------------------------- */
document.getElementById("create-test-btn").addEventListener("click", () => {
    const title = document.getElementById("test-title").value.trim();
    if (!title) {
        alert("Please enter a test title.");
        return;
    }

    const newTest = {
        title,
        subtitle: document.getElementById("test-subtitle").value,
        questionCount: document.getElementById("question-count").value,
        type: document.getElementById("test-type").value,
        timer: document.getElementById("test-timer").value,
        dateCreated: Date.now()
    };

    tests.push(newTest);
    saveTests();
    renderTests();

    highlightCreated();

    // Optional: clear fields
    document.getElementById("test-title").value = "";
    document.getElementById("test-subtitle").value = "";
    document.getElementById("test-timer").value = "";
});

/* ----------------------------------------------------
   Edit + Delete (Event Delegation)
---------------------------------------------------- */
document.getElementById("test-list-container").addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    /* ----- DELETE ----- */
    if (e.target.classList.contains("delete-btn")) {
        const confirmed = confirm("Are you sure you want to delete this test?");
        if (!confirmed) return;

        // Fade-out animation BEFORE removing
        const item = e.target.closest(".test-item");
        item.classList.add("fade-out");

        setTimeout(() => {
            tests.splice(index, 1);
            saveTests();
            renderTests();
        }, 300);

        return;
    }

    /* ----- EDIT ----- */
    if (e.target.classList.contains("edit-btn")) {
        const t = tests[index];

        document.getElementById("test-title").value = t.title;
        document.getElementById("test-subtitle").value = t.subtitle;
        document.getElementById("question-count").value = t.questionCount;
        document.getElementById("test-type").value = t.type;
        document.getElementById("test-timer").value = t.timer;

        // Remove old version (will be replaced on save)
        tests.splice(index, 1);
        saveTests();
        renderTests();

        highlightCreated();
    }
});

/* ----------------------------------------------------
   Animations
---------------------------------------------------- */

// Highlight newly created/edited items
function highlightCreated() {
    const items = document.querySelectorAll(".test-item");
    if (items.length === 0) return;

    const lastItem = items[items.length - 1];
    lastItem.classList.add("highlight");

    setTimeout(() => lastItem.classList.remove("highlight"), 1000);
}

/* ----------------------------------------------------
   Initial Render
---------------------------------------------------- */
renderTests();
