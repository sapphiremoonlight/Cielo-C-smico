// ===================== TEST TAB JS =====================

function setupTests() {
const createBtn = document.getElementById('createTest');
const savedTestsDiv = document.getElementById('savedTests');
const questionEditor = document.getElementById('questionEditor');


let tests = JSON.parse(localStorage.getItem('tests')) || [];

function saveTests() {
    localStorage.setItem('tests', JSON.stringify(tests));
    renderTests();
}

function renderTests() {
    savedTestsDiv.innerHTML = '';
    tests.forEach((test, index) => {
        const div = document.createElement('div');
        div.classList.add('test-item');
        div.innerHTML = `
            <span>${test.title} (Unit ${test.unit})</span>
            <div>
                <button type='button' onclick='editTest(${index})'>Edit</button>
                <button type='button' onclick='takeTest(${index})'>Take</button>
                <button type='button' onclick='deleteTest(${index})'>Delete</button>
            </div>`;
        savedTestsDiv.appendChild(div);
    });
}

createBtn.onclick = () => {
    const title = document.getElementById('testTitle').value;
    const subtitle = document.getElementById('testSubtitle').value;
    const unit = parseInt(document.getElementById('testUnit').value);
    const type = document.getElementById('testType').value;
    const questionsCount = parseInt(document.getElementById('testQuestions').value);

    if (!title || !unit || !questionsCount) return alert('Please fill all fields');

    const newTest = { title, subtitle, unit, type, questionsCount, questions: [] };
    tests.push(newTest);
    saveTests();
};

window.deleteTest = (index) => {
    if (confirm('Delete this test?')) {
        tests.splice(index, 1);
        saveTests();
    }
};

window.editTest = (index) => {
    const test = tests[index];
    const title = prompt('Edit title', test.title);
    if (title) test.title = title;
    saveTests();
};

window.takeTest = (index) => {
    const test = tests[index];
    questionEditor.style.display = 'block';
    questionEditor.innerHTML = `<h3>${test.title}</h3>`;
    test.questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.classList.add('question-card');
        div.innerHTML = `<label>Q${i+1}: ${q.question}</label><input type='text' value='${q.answer || ''}' />`;
        questionEditor.appendChild(div);
    });
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Answers';
    submitBtn.onclick = () => {
        const inputs = questionEditor.querySelectorAll('input');
        inputs.forEach((input, i) => { test.questions[i].answer = input.value; });
        saveTests();
        alert('Answers saved!');
    };
    questionEditor.appendChild(submitBtn);
};

renderTests();

}

// Call setupTests globally in case the tab is already loaded
window.setupTests = setupTests;
