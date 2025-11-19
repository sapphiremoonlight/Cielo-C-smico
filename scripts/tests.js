// ===================== TEST TAB JS =====================
function setupTests() {
    const createBtn = document.getElementById('createTest');
    const savedTestsDiv = document.getElementById('savedTests');
    const questionFormDiv = document.getElementById('questionForm');
    const questionEditor = document.getElementById('questionEditor');

    let tests = JSON.parse(localStorage.getItem('tests')) || [];
    let currentFormQuestions = [];

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
                    <button type='button' onclick='printTest(${index}, false)'>Print</button>
                    <button type='button' onclick='printTest(${index}, true)'>Print Answers</button>
                </div>`;
            savedTestsDiv.appendChild(div);
        });
    }

    function generateQuestionForm() {
        const type = document.getElementById('testType').value;
        const count = parseInt(document.getElementById('testQuestions').value) || 0;
        questionFormDiv.innerHTML = '';
        currentFormQuestions = [];

        for (let i = 0; i < count; i++) {
            const qDiv = document.createElement('div');
            qDiv.classList.add('question-card');
            let html = `<h4>Question ${i + 1}</h4>
                        <input placeholder="Question text" class="question-text" />`;

            if (type === 'multiple-choice') {
                html += ['A', 'B', 'C', 'D'].map((opt, idx) =>
                    `<div>
                        <input type="radio" name="correct-${i}" value="${idx}" /> 
                        <input placeholder="Option ${opt}" class="option-${opt}" />
                    </div>`).join('');
            } else if (type === 'match') {
                html += `<table>
                            <tr><th>Left</th><th>Right</th></tr>`;
                html += Array.from({ length: 4 }).map((_, idx) =>
                    `<tr>
                        <td><input placeholder="Left ${idx + 1}" class="left-${idx}" /></td>
                        <td><input placeholder="Right ${idx + 1}" class="right-${idx}" /></td>
                    </tr>`).join('');
                html += `</table>`;
            }

            qDiv.innerHTML = html;
            questionFormDiv.appendChild(qDiv);
            currentFormQuestions.push(qDiv);
        }
    }

    document.getElementById('testType').addEventListener('change', generateQuestionForm);
    document.getElementById('testQuestions').addEventListener('input', generateQuestionForm);

    createBtn.onclick = () => {
        const title = document.getElementById('testTitle').value;
        const subtitle = document.getElementById('testSubtitle').value;
        const unit = parseInt(document.getElementById('testUnit').value);
        const type = document.getElementById('testType').value;
        const questionsCount = parseInt(document.getElementById('testQuestions').value);

        if (!title || !unit || !questionsCount) return alert('Please fill all fields');

        const questions = currentFormQuestions.map((qDiv, idx) => {
            if (type === 'multiple-choice') {
                const questionText = qDiv.querySelector('.question-text').value;
                const options = ['A', 'B', 'C', 'D'].map(opt =>
                    qDiv.querySelector(`.option-${opt}`).value
                );
                const correct = qDiv.querySelector(`input[name="correct-${idx}"]:checked`);
                return { question: questionText, options, correct: correct ? parseInt(correct.value) : 0 };
            } else if (type === 'match') {
                const left = Array.from({ length: 4 }).map((_, i) => qDiv.querySelector(`.left-${i}`).value);
                const right = Array.from({ length: 4 }).map((_, i) => qDiv.querySelector(`.right-${i}`).value);
                return { matchLeft: left, matchRight: right };
            }
        });

        const newTest = { title, subtitle, unit, type, questionsCount, questions };
        tests.push(newTest);
        saveTests();
        questionFormDiv.innerHTML = '';
        alert('Test saved!');
    };

    // -------------------- TAKE TEST --------------------
    window.takeTest = (index) => {
        const test = tests[index];
        questionEditor.style.display = 'block';
        questionEditor.innerHTML = `<div id="takeTestContainer"><h2>${test.title}</h2><h4>${test.subtitle}</h4></div>`;

        const container = document.getElementById('takeTestContainer');
        let currentQ = 0;

        function renderQuestion(qIdx) {
            container.querySelectorAll('.user-question').forEach(e => e.remove());
            const q = test.questions[qIdx];
            const qDiv = document.createElement('div');
            qDiv.classList.add('user-question');
            let html = `<h3>Question ${qIdx + 1}</h3>`;

            if (test.type === 'multiple-choice') {
                html += `<p>${q.question}</p>` +
                    q.options.map((opt, idx) => `<label><input type="radio" name="ans-${qIdx}" value="${idx}" ${q.answer == idx ? 'checked' : ''} /> ${opt}</label>`).join('<br>');
            } else if (test.type === 'match') {
                html += '<table>' + Array.from({ length: 4 }).map((_, i) =>
                    `<tr><td>${q.matchLeft[i]}</td><td>
                        <input type="text" value="${q.answer && q.answer[i] ? q.answer[i] : ''}" class="match-input-${i}" />
                    </td></tr>`).join('') + '</table>';
            }

            qDiv.innerHTML = html;
            container.appendChild(qDiv);

            const navDiv = document.createElement('div');
            navDiv.style.marginTop = '1rem';
            navDiv.innerHTML = `<button id="prevQ">Back</button> <button id="nextQ">${qIdx === test.questions.length - 1 ? 'Finish' : 'Next'}</button>`;
            container.appendChild(navDiv);

            document.getElementById('prevQ').onclick = () => {
                saveAnswer(qIdx);
                if (currentQ > 0) { currentQ--; renderQuestion(currentQ); }
            };
            document.getElementById('nextQ').onclick = () => {
                saveAnswer(qIdx);
                if (currentQ < test.questions.length - 1) { currentQ++; renderQuestion(currentQ); }
                else { questionEditor.style.display = 'none'; alert('Test completed!'); saveTests(); }
            };
        }

        function saveAnswer(qIdx) {
            const q = test.questions[qIdx];
            if (test.type === 'multiple-choice') {
                const ans = container.querySelector(`input[name="ans-${qIdx}"]:checked`);
                if (ans) q.answer = parseInt(ans.value);
            } else if (test.type === 'match') {
                q.answer = Array.from({ length: 4 }).map((i, idx) => {
                    const val = container.querySelector(`.match-input-${idx}`).value;
                    return val;
                });
            }
        }

        renderQuestion(currentQ);
    };

    // -------------------- DELETE/EDIT --------------------
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

    // -------------------- GREEN PASTEL PDF --------------------
    window.printTest = async (index, includeAnswers = false) => {
        const { jsPDF } = window.jspdf;
        const test = tests[index];
        const doc = new jsPDF();

        // Load PNG logo
        const logo = await toBase64("logo.png");

        // Header
        doc.setFillColor(150, 200, 150);
        doc.rect(0, 0, 210, 30, "F");

        doc.addImage(logo, "PNG", 10, 4, 22, 22);

        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text(test.title, 105, 18, { align: "center" });

        doc.setFontSize(12);
        doc.text(test.subtitle, 105, 26, { align: "center" });

        doc.setTextColor(0, 70, 0);

        let y = 40;

        test.questions.forEach((q, i) => {
            if (y > 260) { doc.addPage(); y = 20; }

            doc.setFillColor(230, 255, 230);
            doc.roundedRect(8, y - 4, 194, 12, 3, 3, "F");

            doc.setFontSize(13);
            doc.text(`${i + 1}. ${q.question}`, 12, y + 4);
            y += 12;

            q.options.forEach((opt, idx) => {
                let isCorrect = includeAnswers && idx === q.correct;

                if (isCorrect) {
                    doc.setFillColor(210, 245, 210);
                    doc.rect(10, y - 5, 190, 8, "F");
                }

                doc.setTextColor(0, 90, 0);
                doc.text(`${["A", "B", "C", "D"][idx]}. ${opt}`, 14, y);

                if (isCorrect) {
                    doc.setTextColor(0, 140, 0);
                    doc.text("✔", 200, y);
                }

                doc.setTextColor(0, 70, 0);
                y += 8;
            });

            y += 6;
        });

        doc.save(`${test.title}.pdf`);
    };

    // Convert image to base64
    function toBase64(url) {
        return fetch(url)
            .then(res => res.blob())
            .then(blob => new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            }));
    }

    // Now safe to run
    renderTests();
}

// Make setupTests globally available
window.setupTests = setupTests;
