// Initialize an empty array to store test data
let testList = []; // Stores all created tests

// -----------------------------
// SETUP TESTS
// -----------------------------
window.setupTests = function setupTests() {
    const createBtn = document.getElementById('create-test-btn');
    const questionCountInput = document.getElementById('question-count');
    if (createBtn) createBtn.addEventListener('click', createTest);
    if (questionCountInput) questionCountInput.addEventListener('change', updateQuestionFields);

    loadTestsFromLocalStorage(); // Load previously saved tests
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
    const testTitleEl = document.getElementById('test-title');
    const testSubtitleEl = document.getElementById('test-subtitle');
    const questionCountEl = document.getElementById('question-count');
    const testTypeEl = document.getElementById('test-type');
    const testTimerEl = document.getElementById('test-timer');

    if (!testTitleEl || !questionCountEl || !testTypeEl || !testTimerEl) {
        alert('Test tab not loaded yet!');
        return;
    }

    const testTitle = testTitleEl.value.trim();
    const testSubtitle = testSubtitleEl?.value.trim() || '';
    const questionCount = parseInt(questionCountEl.value);
    const testType = testTypeEl.value;
    const testTimer = testTimerEl.value;

    if (!testTitle || !questionCount) {
        alert("Please fill in the required fields.");
        return;
    }

    const newTest = {
        id: Date.now(),
        title: testTitle,
        subtitle: testSubtitle,
        questionCount,
        type: testType,
        timer: testTimer,
        questions: []
    };

    testList.push(newTest);
    saveTestsToLocalStorage();

    // Clear inputs
    testTitleEl.value = '';
    if (testSubtitleEl) testSubtitleEl.value = '';
    if (testTimerEl) testTimerEl.value = '';
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
    const testListDiv = document.getElementById('test-list');
    const searchInput = document.getElementById('search-tests');
    const sortSelect = document.getElementById('sort-options');

    if (!testListDiv) return;

    const searchTerm = searchInput?.value.toLowerCase() || '';
    const sortOption = sortSelect?.value || '';

    let filteredTests = testList.filter(t => t.title.toLowerCase().includes(searchTerm));

    // Sorting
    if (sortOption === 'alpha-asc') filteredTests.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === 'alpha-desc') filteredTests.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortOption === 'date-asc') filteredTests.sort((a, b) => a.id - b.id);
    else if (sortOption === 'date-desc') filteredTests.sort((a, b) => b.id - a.id);
    else if (sortOption === 'type') filteredTests.sort((a, b) => a.type.localeCompare(b.type));

    testListDiv.innerHTML = '';

    filteredTests.forEach(test => {
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
            </div>
        `;

        testListDiv.appendChild(testItemDiv);
        displayDownloadButton(test);
    });
}

// -----------------------------
// DISPLAY DOWNLOAD BUTTON
// -----------------------------
function displayDownloadButton(test) {
    const testItemDiv = document.querySelector(`.test-item[data-test-id="${test.id}"]`);
    if (!testItemDiv) return;

    if (!testItemDiv.querySelector('.download-test-btn')) {
        const downloadButton = document.createElement('button');
        downloadButton.classList.add('download-test-btn');
        downloadButton.textContent = 'Download Test Template (PDF)';
        downloadButton.onclick = () => downloadTestPDF(test);
        testItemDiv.appendChild(downloadButton);
    }
}

// -----------------------------
// DOWNLOAD PDF
// -----------------------------
function downloadTestPDF(test) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(test.title, 70, 20);
    doc.setFontSize(14);
    doc.text(test.subtitle || '', 70, 30);

    doc.setFontSize(12);
    doc.text('Questions:', 10, 40);
    let yPosition = 50;

    for (let i = 1; i <= test.questionCount; i++) {
        const questionText = document.getElementById(`question-text-${i}`)?.value || '';
        const optionA = document.getElementById(`answer-A-${i}`)?.value || '';
        const optionB = document.getElementById(`answer-B-${i}`)?.value || '';
        const optionC = document.getElementById(`answer-C-${i}`)?.value || '';
        const optionD = document.getElementById(`answer-D-${i}`)?.value || '';
        const correctAnswer = document.querySelector(`input[name="correct-answer-${i}"]:checked`)?.value || '';

        doc.text(`${i}. ${questionText}`, 10, yPosition);
        yPosition += 10;

        if (test.type === 'multiple-choice') {
            doc.text(`A) ${optionA}${correctAnswer === 'A' ? ' (Correct)' : ''}`, 10, yPosition);
            yPosition += 7;
            doc.text(`B) ${optionB}${correctAnswer === 'B' ? ' (Correct)' : ''}`, 10, yPosition);
            yPosition += 7;
            doc.text(`C) ${optionC}${correctAnswer === 'C' ? ' (Correct)' : ''}`, 10, yPosition);
            yPosition += 7;
            doc.text(`D) ${optionD}${correctAnswer === 'D' ? ' (Correct)' : ''}`, 10, yPosition);
        } else {
            doc.text(`Answer: ${questionText}`, 10, yPosition);
        }

        yPosition += 15;
    }

    doc.save(`${test.title.replace(/\s+/g, '_')}_test_template.pdf`);
}

// -----------------------------
// DYNAMIC QUESTION FIELDS
// -----------------------------
function updateQuestionFields() {
    const questionCountEl = document.getElementById('question-count');
    const testTypeEl = document.getElementById('test-type');
    const questionListDiv = document.getElementById('question-list');

    if (!questionCountEl || !testTypeEl || !questionListDiv) return;

    const questionCount = parseInt(questionCountEl.value);
    const testType = testTypeEl.value;

    questionListDiv.innerHTML = '';

    for (let i = 1; i <= questionCount; i++) {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.innerHTML = `
            <h2>Question ${i}</h2>
            <div class="input-group">
                <label for="question-text-${i}">Question Text</label>
                <input type="text" id="question-text-${i}" placeholder="Enter question text" required>
            </div>
        `;

        if (testType === 'multiple-choice') {
            questionDiv.innerHTML += `
                <div class="input-group">
                    <label for="answer-A-${i}">Option A</label>
                    <input type="text" id="answer-A-${i}" placeholder="Enter Option A" required>
                    <input type="radio" name="correct-answer-${i}" value="A"> Correct
                </div>
                <div class="input-group">
                    <label for="answer-B-${i}">Option B</label>
                    <input type="text" id="answer-B-${i}" placeholder="Enter Option B" required>
                    <input type="radio" name="correct-answer-${i}" value="B"> Correct
                </div>
                <div class="input-group">
                    <label for="answer-C-${i}">Option C</label>
                    <input type="text" id="answer-C-${i}" placeholder="Enter Option C" required>
                    <input type="radio" name="correct-answer-${i}" value="C"> Correct
                </div>
                <div class="input-group">
                    <label for="answer-D-${i}">Option D</label>
                    <input type="text" id="answer-D-${i}" placeholder="Enter Option D" required>
                    <input type="radio" name="correct-answer-${i}" value="D"> Correct
                </div>
            `;
        } else {
            questionDiv.innerHTML += `
                <div class="input-group">
                    <label for="answer-${i}">Answer</label>
                    <input type="text" id="answer-${i}" placeholder="Enter written answer" required>
                </div>
            `;
        }

        questionListDiv.appendChild(questionDiv);
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

function takeTest(id) {
    alert('Take Test functionality coming soon for test ID: ' + id);
}
