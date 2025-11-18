// Initialize an empty array to store test data
let testList = []; // Stores all created tests

// Function to run after the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    setupTests(); // This will run once the DOM is fully loaded
    loadTestsFromLocalStorage(); // Load previously saved tests from localStorage
});

// Function to setup event listeners for tests
function setupTests() {
    // Event listener for the "Create Test" button
    document.getElementById('create-test-btn').addEventListener('click', createTest);
    document.getElementById('question-count').addEventListener('change', updateQuestionFields);
}

// Function to load tests from localStorage
function loadTestsFromLocalStorage() {
    const savedTests = localStorage.getItem('testList');
    if (savedTests) {
        testList = JSON.parse(savedTests); // Load the saved tests into the testList
        displayTestList(); // Display the saved tests on the page
    }
}

// Function to create a new test
function createTest() {
    const testTitle = document.getElementById('test-title').value;
    const testSubtitle = document.getElementById('test-subtitle').value;
    const questionCount = document.getElementById('question-count').value;
    const testType = document.getElementById('test-type').value;
    const testTimer = document.getElementById('test-timer').value;

    // Validate that the test title and question count are provided
    if (!testTitle || !questionCount) {
        alert("Please fill in the required fields.");
        return;
    }

    // Create a test object
    const newTest = {
        id: Date.now(), // Unique ID based on current time
        title: testTitle,
        subtitle: testSubtitle,
        questionCount: questionCount,
        type: testType,
        timer: testTimer,
        questions: [] // This will store questions and answers
    };

    // Add the new test to the test list
    testList.push(newTest);

    // Save the test list to localStorage
    localStorage.setItem('testList', JSON.stringify(testList));

    // Clear input fields
    document.getElementById('test-title').value = '';
    document.getElementById('test-subtitle').value = '';
    document.getElementById('test-timer').value = '';
    document.getElementById('question-count').value = '10';
    document.getElementById('test-type').value = 'multiple-choice';

    // Clear question fields and reset question count
    updateQuestionFields();

    // Refresh the test list display
    displayTestList();

    alert('Test created successfully!');

    // Add the download button dynamically after the test is created
    displayDownloadButton(newTest);
}

// Function to display the "Download Test Template" button
function displayDownloadButton(test) {
    const testItemDiv = document.querySelector(`.test-item[data-test-id="${test.id}"]`);

    // Create the download button if it doesn't exist already
    if (!testItemDiv.querySelector('.download-test-btn')) {
        const downloadButton = document.createElement('button');
        downloadButton.classList.add('download-test-btn');
        downloadButton.textContent = 'Download Test Template (PDF)';
        downloadButton.onclick = () => downloadTestPDF(test);
        testItemDiv.appendChild(downloadButton);
    }
}

// Function to download the test as a PDF
function downloadTestPDF(test) {
    const { jsPDF } = window.jspdf;  // jsPDF object from the library
    
    // Initialize PDF document
    const doc = new jsPDF();

    // Add Test Title and Subtitle
    doc.setFontSize(18);
    doc.text(test.title, 70, 20);
    doc.setFontSize(14);
    doc.text(test.subtitle || '', 70, 30);

    // Add questions to the PDF
    doc.setFontSize(12);
    doc.text('Questions:', 10, 40);
    let yPosition = 50;

    for (let i = 1; i <= test.questionCount; i++) {
        const questionText = document.getElementById(`question-text-${i}`).value;
        const optionA = document.getElementById(`answer-A-${i}`).value;
        const optionB = document.getElementById(`answer-B-${i}`).value;
        const optionC = document.getElementById(`answer-C-${i}`).value;
        const optionD = document.getElementById(`answer-D-${i}`).value;
        const correctAnswer = document.querySelector(`input[name="correct-answer-${i}"]:checked`) ? document.querySelector(`input[name="correct-answer-${i}"]:checked`).value : '';

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
            doc.text(`Answer: ${questionText}`, 10, yPosition); // For written test, just show the answer (no multiple choice)
        }

        yPosition += 15;  // Add space after each question
    }

    // Save the PDF to a file
    doc.save(`${test.title.replace(/\s+/g, '_')}_test_template.pdf`);
}

// Function to dynamically generate question input fields
function updateQuestionFields() {
    const questionCount = parseInt(document.getElementById('question-count').value);
    const testType = document.getElementById('test-type').value;
    const questionListDiv = document.getElementById('question-list');

    // Clear existing question fields
    questionListDiv.innerHTML = '';

    // Create new fields based on the question count
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

// Function to display the test list (sorted and filtered)
function displayTestList() {
    const testListDiv = document.getElementById('test-list');
    const searchTerm = document.getElementById('search-tests').value.toLowerCase();
    const sortOption = document.getElementById('sort-options').value;

    // Filter and sort the test list
    let filteredTests = testList.filter(test => test.title.toLowerCase().includes(searchTerm));

    if (sortOption === 'alpha-asc') {
        filteredTests.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'alpha-desc') {
        filteredTests.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === 'date-asc') {
        filteredTests.sort((a, b) => a.id - b.id);
    } else if (sortOption === 'date-desc') {
        filteredTests.sort((a, b) => b.id - a.id);
    } else if (sortOption === 'type') {
        filteredTests.sort((a, b) => a.type.localeCompare(b.type));
    }

    // Clear and repopulate the test list
    testListDiv.innerHTML = '';
    filteredTests.forEach(test => {
        const testItemDiv = document.createElement('div');
        testItemDiv.classList.add('test-item');
        testItemDiv.setAttribute('data-test-id', test.id);  // Add the test ID for reference

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

        // Show the download button after the test is created
        displayDownloadButton(test);
    });
}