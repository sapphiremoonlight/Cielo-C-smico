// Holds all tests
let testList = [];

document.addEventListener('DOMContentLoaded', () => {
    setupTests();
    loadTestsFromLocalStorage();
});

// Set up listeners
function setupTests() {
    document.getElementById('create-test-btn').addEventListener('click', createTest);
    document.getElementById('question-count').addEventListener('change', updateQuestionFields);

    // refresh filtering on input
    document.getElementById('search-tests').addEventListener('input', displayTestList);
    document.getElementById('sort-options').addEventListener('change', displayTestList);
}

// Load saved tests
function loadTestsFromLocalStorage() {
    const saved = localStorage.getItem('testList');
    if (saved) {
        testList = JSON.parse(saved);
        displayTestList();
    }
}

// Create a test
function createTest() {
    const title = document.getElementById('test-title').value;
    const subtitle = document.getElementById('test-subtitle').value;
    const questionCount = document.getElementById('question-count').value;
    const type = document.getElementById('test-type').value;
    const timer = document.getElementById('test-timer').value;

    if (!title || !questionCount) {
        alert("Please fill in the required fields.");
        return;
    }

    const newTest = {
        id: Date.now(),
        title,
        subtitle,
        questionCount,
        type,
        timer,
        questions: []
    };

    testList.push(newTest);
    localStorage.setItem('testList', JSON.stringify(testList));

    displayTestList();
    updateQuestionFields();

    document.getElementById('test-title').value = '';
    document.getElementById('test-subtitle').value = '';
    document.getElementById('test-timer').value = '';
    document.getElementById('question-count').value = 10;
    document.getElementById('test-type').value = 'multiple-choice';

    alert("Test created!");
}

// Generate question inputs
function updateQuestionFields() {
    const questionCount = parseInt(document.getElementById('question-count').value);
    const type = document.getElementById('test-type').value;
    const wrapper = document.getElementById('question-list');

    wrapper.innerHTML = '';

    for (let i = 1; i <= questionCount; i++) {
        let div = document.createElement('div');
        div.classList.add('question');

        div.innerHTML = `
            <h2>Question ${i}</h2>
            <div class="input-group">
                <label>Question Text</label>
                <input type="text" id="question-text-${i}">
            </div>
        `;

        if (type === "multiple-choice") {
            div.innerHTML += `
                <div class="input-group"><label>A</label><input id="answer-A-${i}"><input type="radio" name="correct-answer-${i}" value="A"> Correct</div>
                <div class="input-group"><label>B</label><input id="answer-B-${i}"><input type="radio" name="correct-answer-${i}" value="B"> Correct</div>
                <div class="input-group"><label>C</label><input id="answer-C-${i}"><input type="radio" name="correct-answer-${i}" value="C"> Correct</div>
                <div class="input-group"><label>D</label><input id="answer-D-${i}"><input type="radio" name="correct-answer-${i}" value="D"> Correct</div>
            `;
        } else {
            div.innerHTML += `
                <div class="input-group">
                    <label>Answer</label>
                    <input id="answer-${i}">
                </div>
            `;
        }

        wrapper.appendChild(div);
    }
}

// Display tests properly
function displayTestList() {
    const container = document.getElementById('test-list-container');
    const search = document.getElementById('search-tests').value.toLowerCase();
    const sort = document.getElementById('sort-options').value;

    let list = testList.filter(t => t.title.toLowerCase().includes(search));

    if (sort === 'alpha-asc') list.sort((a,b)=>a.title.localeCompare(b.title));
    if (sort === 'alpha-desc') list.sort((a,b)=>b.title.localeCompare(a.title));
    if (sort === 'date-asc') list.sort((a,b)=>a.id - b.id);
    if (sort === 'date-desc') list.sort((a,b)=>b.id - a.id);
    if (sort === 'type') list.sort((a,b)=>a.type.localeCompare(b.type));

    container.innerHTML = "";

    list.forEach(test => {
        const div = document.createElement('div');
        div.classList.add('test-item');
        div.dataset.testId = test.id;

        div.innerHTML = `
            <div class="test-details">
                <h2>${test.title}</h2>
                <p>Subtitle: ${test.subtitle || "N/A"}</p>
                <p>Questions: ${test.questionCount}</p>
                <p>Type: ${test.type}</p>
            </div>

            <div class="test-actions">
                <button onclick="editTest(${test.id})">Edit</button>
                <button onclick="deleteTest(${test.id})">Delete</button>
                <button onclick="takeTest(${test.id})">Take Test</button>
            </div>
        `;

        container.appendChild(div);
    });
}
