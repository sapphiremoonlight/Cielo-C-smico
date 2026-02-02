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
function takeTest(id) {
    const test = testList.find(t => t.id === id);
    if (!test) return;

    document.getElementById('tests-tab').style.display = 'none';

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.background = 'linear-gradient(135deg, #e8f5e9, #c8e6c9)';
    overlay.style.padding = '30px';
    overlay.style.overflowY = 'auto';
    overlay.style.zIndex = 9999;

    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.innerHTML = `
        <h1>${test.title}</h1>
        <p>${test.subtitle || ''}</p>
    `;

    const timerEl = document.createElement('div');
    let timeLeft = test.timer;
    timerEl.innerText = `⏱ ${timeLeft}:00`;
    timerEl.style.fontWeight = 'bold';
    timerEl.style.textAlign = 'center';

    overlay.append(header, timerEl);

    const form = document.createElement('form');
    overlay.appendChild(form);

    const progress = document.createElement('div');
    progress.innerText = `Answered 0 of ${test.questionCount}`;
    progress.style.textAlign = 'center';
    overlay.appendChild(progress);

    test.questions.forEach((q, i) => {
        const card = document.createElement('div');
        card.style.background = '#fff';
        card.style.padding = '15px';
        card.style.margin = '20px 0';
        card.style.borderRadius = '12px';
        card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';

        card.innerHTML = `<p><b>${i + 1}. ${q.questionText}</b></p>`;

        for (let opt in q.options) {
            card.innerHTML += `
                <div>
                    <input type="radio" name="q-${i}" value="${opt}">
                    ${opt}: ${q.options[opt]}
                </div>
            `;
        }
        form.appendChild(card);
    });

    const submitBtn = document.createElement('button');
    submitBtn.innerText = 'Submit Test';
    submitBtn.onclick = e => {
        e.preventDefault();
        let score = 0;
        test.questions.forEach((q, i) => {
            const selected = document.querySelector(`input[name="q-${i}"]:checked`)?.value;
            if (selected === q.correctAnswer) score++;
        });
        alert(`Score: ${score}/${test.questionCount}`);
        overlay.remove();
        document.getElementById('tests-tab').style.display = 'block';
    };

    overlay.appendChild(submitBtn);
    document.body.appendChild(overlay);

    const interval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = `⏱ ${timeLeft}:00`;
        if (timeLeft <= 0) {
            clearInterval(interval);
            submitBtn.click();
        }
    }, 60000);
}

// -----------------------------
// DEFAULT TEST
// -----------------------------
function createDefaultTestIfEmpty() {
    if (testList.length) return;

    testList.push({
        id: Date.now(),
        title: 'Spanish Vocabulary Quiz',
        subtitle: 'Basic Practice',
        questionCount: 3,
        type: 'multiple-choice',
        timer: 15,
        questions: [
            { questionText: 'Apple?', options: { A:'Manzana',B:'Uva',C:'Pera',D:'Pan' }, correctAnswer:'A' },
            { questionText: 'Dog?', options: { A:'Gato',B:'Perro',C:'Pez',D:'Ave' }, correctAnswer:'B' },
            { questionText: 'House?', options: { A:'Mesa',B:'Casa',C:'Libro',D:'Agua' }, correctAnswer:'B' }
        ]
    });

    saveTestsToLocalStorage();
}
