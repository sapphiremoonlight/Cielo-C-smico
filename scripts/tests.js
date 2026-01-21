// =====================
// TESTS DATA
// =====================
let tests = JSON.parse(localStorage.getItem("tests")) || [];
window.tests = tests; // expose globally for print + dashboard


// =====================
// PDF PRINTING
// =====================
window.printTest = async (index, includeAnswers = false) => {
    const { jsPDF } = window.jspdf;
    const test = tests[index];
    if (!test) return;

    const doc = new jsPDF();
    const logo = await toBase64("logo.png");

    // Header
    doc.setFillColor(150, 200, 150);
    doc.rect(0, 0, 210, 30, "F");
    doc.addImage(logo, "PNG", 10, 4, 22, 22);

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(test.title, 105, 18, { align: "center" });

    doc.setFontSize(12);
    doc.text(test.subtitle || "", 105, 26, { align: "center" });

    // Questions
    doc.setTextColor(0, 70, 0);
    let y = 40;

    test.questions.forEach((q, i) => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFillColor(230, 255, 230);
        doc.roundedRect(8, y - 4, 194, 12, 3, 3, "F");
        doc.setFontSize(13);
        doc.text(`${i + 1}. ${q.question || "Match the columns"}`, 12, y + 4);
        y += 12;

        // Multiple choice
        if (test.type === "multiple-choice") {
            q.options.forEach((opt, idx) => {
                const isCorrect = includeAnswers && idx === q.correct;

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
        }

        // Match
        else if (test.type === "match") {
            q.matchLeft.forEach((left, j) => {
                doc.text(
                    `${left} → ${includeAnswers ? q.matchRight[j] : "_____"}`,
                    12,
                    y
                );
                y += 8;
            });
        }

        // Written
        else if (test.type === "written") {
            doc.text(
                includeAnswers && q.answer
                    ? `Answer: ${q.answer}`
                    : "Answer: ______",
                12,
                y
            );
            y += 10;
        }

        y += 6;
    });

    // Page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(255, 255, 255);
        doc.ellipse(105, 285, 20, 10, 0, 180, "F");

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Page ${i}`, 105, 287, { align: "center" });
    }

    doc.save(`${test.title}.pdf`);
};


// =====================
// HELPERS
// =====================
function toBase64(url) {
    return fetch(url)
        .then(res => res.blob())
        .then(blob => new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        }));
}


// =====================
// TEST TAB INIT
// =====================
function setupTests() {
    // refresh local copy in case dashboard or other tab changed it
    tests = JSON.parse(localStorage.getItem("tests")) || [];
    window.tests = tests;

    renderTests();
}

window.setupTests = setupTests;
