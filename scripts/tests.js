// ===================== TESTS.JS (Fully Fixed) =====================

// Initialize an empty array to store test data
let testList = [];

// -----------------------------
// SETUP TESTS
// -----------------------------
window.setupTests = function setupTests() {
    const createBtn = document.getElementById('createTest');
    const questionCountInput = document.getElementById('testQuestions');

    if (createBtn) createBtn.addEventListener('click', createTest);
    if (questionCountInput) questionCountInput.addEventListener('change', updateQuestionFields);

    loadTestsFromLocalStorage();
    createDefaultTestIfEmpty(); // 👈 ADD THIS
    displayTestList();
    updateQuestionFields();
};

// -----------------------------
// LOCAL STORAGE
// -----------------------------
function loadTestsFromLocalStorage() {
    const savedTests = localStorage.getItem('testList');
    if (savedTests) {
        testList = JSON.parse(savedTests);
        displayTestList();
    }
}

function saveTestsToLocalStorage() {
    localStorage.setItem('testList', JSON.stringify(testList));
}

// -----------------------------
// CREATE TEST
// -----------------------------
function createTest() {
    const testTitleEl = document.getElementById('testTitle');
    const testSubtitleEl = document.getElementById('testSubtitle');
    const questionCountEl = document.getElementById('testQuestions');
    const testTypeEl = document.getElementById('testType');
    const questionListDiv = document.getElementById('questionForm');

    if (!testTitleEl || !questionCountEl || !testTypeEl || !questionListDiv) {
        alert('Test tab not loaded yet!');
        return;
    }

    const testTitle = testTitleEl.value.trim();
    const testSubtitle = testSubtitleEl?.value.trim() || '';
    const questionCount = parseInt(questionCountEl.value);
    const testType = testTypeEl.value;

    if (!testTitle || !questionCount) {
        alert("Please fill in the required fields.");
        return;
    }

    // Collect questions
    const questions = [];
    for (let i = 1; i <= questionCount; i++) {
        const questionText = document.getElementById(`question-text-${i}`)?.value.trim() || '';
        let options = null;
        let correctAnswer = null;

        if (testType === 'multiple-choice') {
            options = {
                A: document.getElementById(`answer-A-${i}`)?.value.trim() || '',
                B: document.getElementById(`answer-B-${i}`)?.value.trim() || '',
                C: document.getElementById(`answer-C-${i}`)?.value.trim() || '',
                D: document.getElementById(`answer-D-${i}`)?.value.trim() || ''
            };
            correctAnswer = document.querySelector(`input[name="correct-answer-${i}"]:checked`)?.value || '';
        } else {
            options = { answer: document.getElementById(`answer-${i}`)?.value.trim() || '' };
        }

        questions.push({ questionText, options, correctAnswer });
    }

    const newTest = {
        id: Date.now(),
        title: testTitle,
        subtitle: testSubtitle,
        questionCount,
        type: testType,
        questions
    };

    testList.push(newTest);
    saveTestsToLocalStorage();

    // Clear inputs
    testTitleEl.value = '';
    if (testSubtitleEl) testSubtitleEl.value = '';
    questionCountEl.value = '10';
    if (testTypeEl) testTypeEl.value = 'multiple-choice';
    updateQuestionFields();

    displayTestList();

    alert('Test created successfully!');
}

// -----------------------------
// DISPLAY TEST LIST
// -----------------------------
function displayTestList() {
    const testListDiv = document.getElementById('savedTests');
    if (!testListDiv) return;

    testListDiv.innerHTML = '';

    testList.forEach(test => {
        const testItemDiv = document.createElement('div');
        testItemDiv.classList.add('test-item');
        testItemDiv.setAttribute('data-test-id', test.id);

        testItemDiv.innerHTML = `
            <div class="test-details">
                <h2>${test.title}</h2>
                <p>Subtitle: ${test.subtitle || 'N/A'}</p>
                <p>Questions: ${test.questionCount}</p>
                <p>Type: ${test.type}</p>
            </div>
            <div class="test-actions">
                <button class="edit-test-btn" onclick="editTest(${test.id})">Edit</button>
                <button class="delete-test-btn" onclick="deleteTest(${test.id})">Delete</button>
                <button class="take-test-btn" onclick="takeTest(${test.id})">Take Test</button>
                <button class="download-test-btn" onclick="downloadTestPDF(${test.id})">Download PDF</button>
            </div>
        `;

        testListDiv.appendChild(testItemDiv);
    });
}

// -----------------------------
// DOWNLOAD PDF
// -----------------------------
function downloadTestPDF(testId) {
    const test = testList.find(t => t.id === testId);
    if (!test) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(test.title, 20, 20);
    doc.setFontSize(14);
    doc.text(test.subtitle || '', 20, 30);

    doc.setFontSize(12);
    doc.text('Questions:', 10, 40);
    let y = 50;

    for (let i = 0; i < test.questionCount; i++) {
        const q = test.questions[i];
        doc.text(`${i + 1}. ${q.questionText}`, 10, y);
        y += 10;

        if (test.type === 'multiple-choice') {
            doc.text(`A) ${q.options.A}${q.correctAnswer === 'A' ? ' (Correct)' : ''}`, 10, y); y += 7;
            doc.text(`B) ${q.options.B}${q.correctAnswer === 'B' ? ' (Correct)' : ''}`, 10, y); y += 7;
            doc.text(`C) ${q.options.C}${q.correctAnswer === 'C' ? ' (Correct)' : ''}`, 10, y); y += 7;
            doc.text(`D) ${q.options.D}${q.correctAnswer === 'D' ? ' (Correct)' : ''}`, 10, y); y += 10;
        } else {
            doc.text(`Answer: ${q.options.answer}`, 10, y); y += 10;
        }
    }

    doc.save(`${test.title.replace(/\s+/g, '_')}_test.pdf`);
}

// -----------------------------
// DYNAMIC QUESTION FIELDS
// -----------------------------
function updateQuestionFields() {
    const questionCountEl = document.getElementById('testQuestions');
    const testTypeEl = document.getElementById('testType');
    const questionListDiv = document.getElementById('questionForm');

    if (!questionCountEl || !testTypeEl || !questionListDiv) return;

    const count = parseInt(questionCountEl.value) || 5;
    const type = testTypeEl.value;

    questionListDiv.innerHTML = '';

    if (type === 'multiple-choice') {
        for (let i = 1; i <= count; i++) {
            const qDiv = document.createElement('div');
            qDiv.classList.add('question');
            qDiv.innerHTML = `
                <h3>Question ${i}</h3>
                <input type="text" id="question-text-${i}" placeholder="Enter question text">
                <div>
                    <input type="text" id="answer-A-${i}" placeholder="Option A">
                    <input type="radio" name="correct-answer-${i}" value="A"> Correct
                </div>
                <div>
                    <input type="text" id="answer-B-${i}" placeholder="Option B">
                    <input type="radio" name="correct-answer-${i}" value="B"> Correct
                </div>
                <div>
                    <input type="text" id="answer-C-${i}" placeholder="Option C">
                    <input type="radio" name="correct-answer-${i}" value="C"> Correct
                </div>
                <div>
                    <input type="text" id="answer-D-${i}" placeholder="Option D">
                    <input type="radio" name="correct-answer-${i}" value="D"> Correct
                </div>
            `;
            questionListDiv.appendChild(qDiv);
        }
    } else if (type === 'match') {
        const qDiv = document.createElement('div');
        qDiv.classList.add('question');
        qDiv.innerHTML = `<h3>Match-the-Column Question</h3>
                          <p>Enter left and right words for each row:</p>`;

        for (let i = 1; i <= count; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('match-row');
            rowDiv.innerHTML = `
                <input type="text" id="match-left-${i}" placeholder="Left word ${i}">
                <input type="text" id="match-right-${i}" placeholder="Right word ${i}">
            `;
            qDiv.appendChild(rowDiv);
        }
        questionListDiv.appendChild(qDiv);
    }
}

// -----------------------------
// PLACEHOLDER FUNCTIONS
// -----------------------------
function editTest(id) {
    alert('Edit Test functionality coming soon for test ID: ' + id);
}

function deleteTest(id) {
    if (!confirm('Are you sure you want to delete this test?')) return;
    testList = testList.filter(t => t.id !== id);
    saveTestsToLocalStorage();
    displayTestList();
}

function takeTest(testId) {
    const test = testList.find(t => t.id === testId);
    if (!test) return;

    // Hide the test tab content
    document.getElementById('tests-tab').style.display = 'none';

    // Create full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'fullTest';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.overflowY = 'auto';
    overlay.style.background = '#f0f4f3';
    overlay.style.padding = '40px 20px';
    overlay.style.zIndex = 9999;
    overlay.style.fontFamily = 'Arial, sans-serif';

    // Get current date in Spanish
    const date = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaEsp = date.toLocaleDateString('es-ES', opciones);

    overlay.innerHTML = `
        <div style="text-align:center; margin-bottom:30px;">
            <h1 style="margin-bottom:5px; color:#1b5e20;">${test.title}</h1>
            <h3 style="margin-top:0; color:#2e7d32;">${test.subtitle || ''}</h3>
            <p style="color:#4caf50; font-style:italic;">${fechaEsp}</p>
        </div>
        <form id="takeTestForm" style="max-width:800px; margin:0 auto;"></form>
        <div style="text-align:center; margin-top:30px;">
            <button id="submitTest" style="
                padding:10px 20px; margin-right:10px;
                background:#2e7d32; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:16px;
            ">Submit Test</button>
            <button id="exitTest" style="
                padding:10px 20px;
                background:#9e9e9e; color:white; border:none; border-radius:8px;
                cursor:pointer; font-size:16px;
            ">Exit Test</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const form = document.getElementById('takeTestForm');

    // Render questions
    test.questions.forEach((q, i) => {
        const qDiv = document.createElement('div');
        qDiv.classList.add('question-card');
        qDiv.style.background = '#e8f5e9';
        qDiv.style.border = '2px solid #1b5e20';
        qDiv.style.borderRadius = '10px';
        qDiv.style.padding = '15px';
        qDiv.style.marginBottom = '20px';
        qDiv.style.color = '#1b5e20';

        if (test.type === 'multiple-choice') {
            qDiv.innerHTML = `<p style="font-weight:bold;">${i + 1}. ${q.questionText}</p>`;
            for (let option in q.options) {
                qDiv.innerHTML += `
                    <div style="margin:5px 0;">
                        <input type="radio" name="q-${i}" value="${option}" id="q-${i}-${option}">
                        <label for="q-${i}-${option}">${option}: ${q.options[option]}</label>
                    </div>
                `;
            }
        } else if (test.type === 'match') {
            qDiv.innerHTML = `<p style="font-weight:bold;">${i + 1}. Match the following:</p>`;
            q.rows.forEach((row, j) => {
                qDiv.innerHTML += `
                    <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
                        <span style="min-width:150px; font-weight:bold;">${row.left}</span>
                        <input type="text" name="match-${i}-${j}" placeholder="Right word" style="
                            flex:1; padding:6px; border:1px solid #1b5e20; border-radius:6px;
                        ">
                    </div>
                `;
            });
        }

        form.appendChild(qDiv);
    });

    // Submit handler
    document.getElementById('submitTest').addEventListener('click', (e) => {
        e.preventDefault();
        let score = 0;

        if (test.type === 'multiple-choice') {
            test.questions.forEach((q, i) => {
                const selected = document.querySelector(`input[name="q-${i}"]:checked`)?.value;
                if (selected === q.correctAnswer) score++;
            });
            alert(`You scored ${score} out of ${test.questionCount}`);
        } else if (test.type === 'match') {
            let correct = 0;
            test.questions.forEach((q, i) => {
                q.rows.forEach((row, j) => {
                    const ans = document.querySelector(`input[name="match-${i}-${j}"]`)?.value.trim();
                    if (ans.toLowerCase() === row.right.toLowerCase()) correct++;
                });
            });
            alert(`You matched ${correct} out of ${test.questions[0].rows.length} correctly`);
        }

        overlay.remove();
        document.getElementById('tests-tab').style.display = 'block';
    });

    // Exit handler
    document.getElementById('exitTest').addEventListener('click', () => {
        overlay.remove();
        document.getElementById('tests-tab').style.display = 'block';
    });
}

// THIS IS THE TEMPLATET EST
function createDefaultTestIfEmpty() {
    if (testList.length > 0) return;

    const defaultTest = {
        id: Date.now(),
        title: "Spanish Vocabulary Quiz",
        subtitle: "Basic Spanish Vocabulary Practice",
        questionCount: 10,
        type: "multiple-choice",
        timer: 15,
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
            }
        ]
    };

    testList.push(defaultTest);
    saveTestsToLocalStorage();
}
