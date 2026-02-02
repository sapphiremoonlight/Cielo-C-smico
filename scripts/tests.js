// ===================== TESTS.JS (FULLY FIXED + ENHANCED) =====================

// GLOBAL STATE
let testList = [];
let editingTestId = null;

// -----------------------------
// SETUP
// -----------------------------
window.setupTests = function () {
    const createBtn = document.getElementById('createTest');
    const questionCountInput = document.getElementById('testQuestions');

    if (createBtn) createBtn.addEventListener('click', createTest);
    if (questionCountInput) questionCountInput.addEventListener('change', updateQuestionFields);

    loadTestsFromLocalStorage();
    createDefaultTestIfEmpty();
    displayTestList();
    updateQuestionFields();
};

// -----------------------------
// LOCAL STORAGE
// -----------------------------
function loadTestsFromLocalStorage() {
    const saved = localStorage.getItem('testList');
    testList = saved ? JSON.parse(saved) : [];
}

function saveTestsToLocalStorage() {
    localStorage.setItem('testList', JSON.stringify(testList));
}

// -----------------------------
// CREATE / EDIT TEST
// -----------------------------
function createTest() {
    const titleEl = document.getElementById('testTitle');
    const subtitleEl = document.getElementById('testSubtitle');
    const countEl = document.getElementById('testQuestions');
    const typeEl = document.getElementById('testType');

    const title = titleEl.value.trim();
    const subtitle = subtitleEl.value.trim();
    const count = parseInt(countEl.value);
    const type = typeEl.value;

    if (!title || !count) {
        alert('Please fill all required fields.');
        return;
    }

    const questions = [];

    for (let i = 1; i <= count; i++) {
        const questionText = document.getElementById(`question-text-${i}`).value.trim();

        if (type === 'multiple-choice') {
            const options = {
                A: document.getElementById(`answer-A-${i}`).value.trim(),
                B: document.getElementById(`answer-B-${i}`).value.trim(),
                C: document.getElementById(`answer-C-${i}`).value.trim(),
                D: document.getElementById(`answer-D-${i}`).value.trim()
            };
            const correctAnswer = document.querySelector(
                `input[name="correct-answer-${i}"]:checked`
            )?.value || '';

            questions.push({ questionText, options, correctAnswer });
        } else {
            const answer = document.getElementById(`answer-${i}`).value.trim();
            questions.push({ questionText, options: { answer } });
        }
    }

    const testData = {
        id: editingTestId || Date.now(),
        title,
        subtitle,
        questionCount: count,
        type,
        timer: 15,
        questions
    };

    if (editingTestId) {
        const index = testList.findIndex(t => t.id === editingTestId);
        testList[index] = testData;
        editingTestId = null;
    } else {
        testList.push(testData);
    }

    saveTestsToLocalStorage();
    displayTestList();

    titleEl.value = '';
    subtitleEl.value = '';
    countEl.value = 10;
    typeEl.value = 'multiple-choice';
    updateQuestionFields();

    alert('Test saved successfully ✅');
}

// -----------------------------
// DISPLAY TEST LIST
// -----------------------------
function displayTestList() {
    const container = document.getElementById('savedTests');
    if (!container) return;

    container.innerHTML = '';

    testList.forEach(test => {
        const div = document.createElement('div');
        div.className = 'test-item';

        div.innerHTML = `
            <h2>${test.title}</h2>
            <p>${test.subtitle || ''}</p>
            <p>Questions: ${test.questionCount}</p>
            <div>
                <button onclick="editTest(${test.id})">Edit</button>
                <button onclick="deleteTest(${test.id})">Delete</button>
                <button onclick="takeTest(${test.id})">Take Test</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// -----------------------------
// EDIT / DELETE
// -----------------------------
function editTest(id) {
    const test = testList.find(t => t.id === id);
    if (!test) return;

    editingTestId = id;

    document.getElementById('testTitle').value = test.title;
    document.getElementById('testSubtitle').value = test.subtitle;
    document.getElementById('testQuestions').value = test.questionCount;
    document.getElementById('testType').value = test.type;

    updateQuestionFields();

    test.questions.forEach((q, i) => {
        document.getElementById(`question-text-${i + 1}`).value = q.questionText;

        if (test.type === 'multiple-choice') {
            for (let opt in q.options) {
                document.getElementById(`answer-${opt}-${i + 1}`).value = q.options[opt];
            }
            document.querySelector(
                `input[name="correct-answer-${i + 1}"][value="${q.correctAnswer}"]`
            ).checked = true;
        } else {
            document.getElementById(`answer-${i + 1}`).value = q.options.answer;
        }
    });

    alert('Editing mode ✏️');
}

function deleteTest(id) {
    if (!confirm('Delete this test?')) return;
    testList = testList.filter(t => t.id !== id);
    saveTestsToLocalStorage();
    displayTestList();
}

// -----------------------------
// DYNAMIC QUESTIONS
// -----------------------------
function updateQuestionFields() {
    const count = parseInt(document.getElementById('testQuestions').value);
    const type = document.getElementById('testType').value;
    const form = document.getElementById('questionForm');

    form.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'question';

        if (type === 'multiple-choice') {
            div.innerHTML = `
                <h3>Question ${i}</h3>
                <input id="question-text-${i}" placeholder="Question text">
                ${['A','B','C','D'].map(opt => `
                    <div>
                        <input id="answer-${opt}-${i}" placeholder="Option ${opt}">
                        <input type="radio" name="correct-answer-${i}" value="${opt}"> Correct
                    </div>
                `).join('')}
            `;
        } else {
            div.innerHTML = `
                <h3>Question ${i}</h3>
                <input id="question-text-${i}" placeholder="Question">
                <input id="answer-${i}" placeholder="Correct answer">
            `;
        }
        form.appendChild(div);
    }
}

// -----------------------------
// TAKE TEST (FULL SCREEN UI)
// -----------------------------
function takeTest(testId) {
    const test = testList.find(t => t.id === testId);
    if (!test) return;

    document.getElementById('tests-tab').style.display = 'none';

    /* ================= OVERLAY ================= */
    const overlay = document.createElement('div');
    overlay.id = 'fullTest';
    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:#f1f8f4;
        overflow-y:auto;
        z-index:9999;
        font-family:'Segoe UI', Arial, sans-serif;
        padding:20px;
    `;

    const fecha = new Date().toLocaleDateString('es-ES', {
        weekday:'long',
        year:'numeric',
        month:'long',
        day:'numeric'
    });

    overlay.innerHTML = `
        <div style="max-width:900px;margin:0 auto;">
            
            <!-- STICKY HEADER -->
            <div id="testStickyHeader">
                <div class="test-title">${test.title}</div>
                <div class="progress-wrap">
                    <div id="progressText">Question 1 of ${test.questions.length}</div>
                    <div class="progress-bar">
                        <div id="progressFill"></div>
                    </div>
                </div>
            </div>

            <div class="test-card">
                <header style="text-align:center;margin-bottom:30px;">
                    <h3 style="color:#2e7d32;margin-top:0;">${test.subtitle || ''}</h3>
                    <p style="color:#c9a227;font-style:italic;">${fecha}</p>
                </header>

                <form id="takeTestForm"></form>

                <div class="btn-row">
                    <button id="submitTest" class="btn-primary">Submit Test</button>
                    <button id="exitTest" class="btn-secondary">Exit</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    /* ================= STYLES ================= */
    const style = document.createElement('style');
    style.textContent = `
        #testStickyHeader {
            position:sticky;
            top:0;
            background:#fff;
            padding:15px 20px;
            border-bottom:2px solid #e0e0e0;
            z-index:10;
        }

        .test-title {
            font-weight:700;
            color:#1b5e20;
            margin-bottom:6px;
        }

        .progress-bar {
            height:8px;
            background:#e8f5e9;
            border-radius:6px;
            overflow:hidden;
        }

        #progressFill {
            height:100%;
            width:0%;
            background:#c9a227;
            transition:width .3s ease;
        }

        .test-card {
            background:#fff;
            border-radius:14px;
            padding:30px;
            margin-top:20px;
            box-shadow:0 10px 30px rgba(0,0,0,.1);
        }

        .question-card {
            background:#f9fff9;
            border-left:6px solid #1b5e20;
            padding:18px;
            border-radius:10px;
            margin-bottom:20px;
        }

        label { display:block; margin:6px 0; cursor:pointer; }
        input[type="text"] { width:100%; padding:8px; border-radius:6px; border:1px solid #c9a227; }

        .btn-row {
            display:flex;
            justify-content:center;
            gap:15px;
            margin-top:30px;
            flex-wrap:wrap;
        }

        .btn-primary {
            background:#1b5e20;
            color:#fff;
            border:none;
            padding:12px 22px;
            border-radius:8px;
            font-size:16px;
            cursor:pointer;
        }

        .btn-secondary {
            background:#c9a227;
            color:#1b5e20;
            border:none;
            padding:12px 22px;
            border-radius:8px;
            font-size:16px;
            cursor:pointer;
        }

        .results-card {
            background:#fff;
            padding:40px;
            border-radius:16px;
            text-align:center;
            box-shadow:0 10px 30px rgba(0,0,0,.15);
        }
    `;
    document.head.appendChild(style);

    const form = document.getElementById('takeTestForm');

    /* ================= QUESTIONS ================= */
    test.questions.forEach((q, i) => {
        const card = document.createElement('div');
        card.className = 'question-card';

        if (test.type === 'multiple-choice') {
            card.innerHTML = `
                <p>${i + 1}. ${q.questionText}</p>
                ${Object.entries(q.options).map(([k, v]) => `
                    <label>
                        <input type="radio" name="q-${i}" value="${k}">
                        ${k}. ${v}
                    </label>
                `).join('')}
            `;
        }

        if (test.type === 'match') {
            card.innerHTML = `<p>${i + 1}. Match the following</p>`;
            q.rows.forEach((row, j) => {
                card.innerHTML += `
                    <div style="display:flex;gap:10px;margin-top:8px;">
                        <strong style="min-width:120px;">${row.left}</strong>
                        <input type="text" name="match-${i}-${j}" placeholder="Your answer">
                    </div>
                `;
            });
        }

        form.appendChild(card);
    });

    /* ================= PROGRESS ================= */
    function updateProgress() {
        const answered = form.querySelectorAll(
            'input:checked, input[type="text"]:not(:placeholder-shown)'
        ).length;
        const percent = Math.min((answered / test.questions.length) * 100, 100);
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent =
            `Answered ${answered} of ${test.questions.length}`;
    }

    /* ================= AUTO SAVE ================= */
    const storageKey = `test-${test.id}`;

    form.addEventListener('input', () => {
        const data = [...new FormData(form)];
        localStorage.setItem(storageKey, JSON.stringify(data));
        updateProgress();
    });

    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) {
        saved.forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;
            input.type === 'radio' ? input.checked = true : input.value = value;
        });
        updateProgress();
    }

    /* ================= SUBMIT ================= */
    document.getElementById('submitTest').onclick = e => {
        e.preventDefault();
        let score = 0;
        let total = test.questions.length;

        test.questions.forEach((q, i) => {
            const card = form.children[i];

            if (test.type === 'multiple-choice') {
                const selected = form.querySelector(`input[name="q-${i}"]:checked`)?.value;
                if (selected === q.correctAnswer) {
                    score++;
                    card.style.borderLeftColor = '#2e7d32';
                } else {
                    card.style.borderLeftColor = '#c9a227';
                    card.innerHTML += `<p><em>Correct answer: ${q.correctAnswer}</em></p>`;
                }
            }
        });

        showResults(score, total);
        localStorage.removeItem(storageKey);
    };

    /* ================= RESULTS ================= */
    function showResults(score, total) {
        overlay.innerHTML = `
            <div class="results-card">
                <h1>Results</h1>
                <p style="font-size:32px;color:#1b5e20;">${score} / ${total}</p>
                <p>${score / total >= 0.8 ? '🌟 Excellent work!' : '🌱 Keep practicing!'}</p>
                <button class="btn-primary" onclick="closeTest()">Done</button>
            </div>
        `;

        if (score / total >= 0.8 && window.confetti) {
            confetti({
                particleCount:120,
                spread:70,
                colors:['#1b5e20','#c9a227']
            });
        }
    }

    /* ================= EXIT ================= */
    document.getElementById('exitTest').onclick = () => {
        if (confirm('Exit the test? Your answers will be lost.')) closeTest();
    };

    function closeTest() {
        overlay.remove();
        document.getElementById('tests-tab').style.display = 'block';
    }
}

// -----------------------------
// DEFAULT TEST
// -----------------------------
function createDefaultTestIfEmpty() {
    if (testList.length > 0) return;
    if (testList.length) return;

    const defaultTest = {
    testList.push({
        id: Date.now(),
        title: "Spanish Vocabulary Quiz",
        subtitle: "Basic Spanish Vocabulary Practice",
        questionCount: 10,
        type: "multiple-choice",
        timer: 15,
        title: 'Spanish Vocabulary Quiz',
        subtitle: 'Basic Practice',
        questionCount: 2,
        type: 'multiple-choice',
        questions: [
            {
                questionText: 'What is the Spanish word for "apple"?',
                options: { A: "Manzana", B: "Banana", C: "Uva", D: "Naranja" },
                correctAnswer: "A"
            },
            {
                questionText: 'How do you say "dog" in Spanish?',
                options: { A: "Gato", B: "Perro", C: "Pez", D: "Pájaro" },
                correctAnswer: "B"
            },
            {
                questionText: 'What is the Spanish translation for "house"?',
                options: { A: "Casa", B: "Escuela", C: "Silla", D: "Ventana" },
                correctAnswer: "A"
                questionText: 'How do you say "hello"?',
                options: { A: 'Hola', B: 'Adiós', C: 'Gracias', D: 'Por favor' },
                correctAnswer: 'A'
            },
            {
                questionText: 'How do you say "thank you" in Spanish?',
                options: { A: "Gracias", B: "Por favor", C: "Adiós", D: "Hola" },
                correctAnswer: "A"
            },
            {
                questionText: 'What is the Spanish word for "book"?',
                options: { A: "Libro", B: "Mesa", C: "Coche", D: "Comida" },
                correctAnswer: "A"
            },
            {
                questionText: 'What is the Spanish word for "orange"?',
                options: { A: "Limón", B: "Uva", C: "Naranja", D: "Manzana" },
                correctAnswer: "C"
            },
            {
                questionText: 'How do you say "bookstore" in Spanish?',
                options: { A: "Biblioteca", B: "Librería", C: "Escuela", D: "Café" },
                correctAnswer: "B"
            },
            {
                questionText: 'What is the Spanish word for "friend"?',
                options: { A: "Amigo", B: "Hermano", C: "Madre", D: "Hija" },
                correctAnswer: "A"
            },
            {
                questionText: 'How do you say "food" in Spanish?',
                options: { A: "Comida", B: "Bebida", C: "Pan", D: "Verdura" },
                correctAnswer: "A"
            },
            {
                questionText: 'What is the Spanish translation for "school"?',
                options: { A: "Escuela", B: "Hospital", C: "Oficina", D: "Tienda" },
                correctAnswer: "A"
                questionText: 'How do you say "goodbye"?',
                options: { A: 'Hola', B: 'Adiós', C: 'Gracias', D: 'Buenos días' },
                correctAnswer: 'B'
            }
        ]
    };
    });

    testList.push(defaultTest);
    saveTestsToLocalStorage();
}
