/* FEATURES
Core Features:

Log Entry Form:

Users can write about their language learning progress in different categories:

What I learned today: Users can record what they've learned, such as new words, grammar, or concepts.

Daily Reflection: Users can reflect on how they felt about their learning session (e.g., motivation, challenges).

Vocabulary & Grammar: Users can jot down new words or grammar points they've encountered.

Goals for Tomorrow: Users can set their learning goals for the next day.

Save Logs:

Button to save the log entries (including the current date) to localStorage (so data persists across page reloads).

Display Logs:

Saved logs are displayed on the page in a list format with:

Date of entry: Each log should show the date when it was saved.

The four sections of the log (What I learned, Daily Reflection, Vocabulary/Grammar, Goals for Tomorrow).

Edit button: To modify an existing log entry.

Delete button: To remove an existing log entry.

Edit Logs:

When users click Edit, the existing log data should populate the input fields so they can update it.

After editing, the user can save the modified log, replacing the old one in localStorage.

Delete Logs:

Users can delete individual logs by clicking the Delete button.

Deleting should update the localStorage and remove the log from the displayed list.

Filter/Search Logs:

A search bar (filter) to search through logs by keywords. Users can filter logs based on:

The content of What I learned today.

Daily Reflection.

Vocabulary & Grammar.

Goals for Tomorrow.

The filtered logs should be displayed dynamically as the user types.

LocalStorage Persistence:

Logs should be saved in localStorage, so they persist even if the page is reloaded or if the browser is closed and reopened.

Clear Form after Saving:

After saving a new log, the form fields should be cleared, allowing the user to quickly add a new entry.

Optional Features (Advanced):

Log Entry Date Formatting:

Each log should have its date formatted in a user-friendly way (e.g., MM/DD/YYYY or a more readable format like September 18, 2025).

Confirm Deletion:

When deleting a log, you can optionally prompt the user with a confirmation dialog (e.g., "Are you sure you want to delete this log?").

Edit History:

You could keep track of the last time a log was edited and display that information next to the entry, although this may require additional logic.

Sort Logs by Date:

Logs can be sorted by date, showing the most recent entries at the top or bottom.

Mobile-Friendly Design:

Ensure the log tab is responsive, so it works well on mobile devices too (e.g., with appropriately sized text areas and buttons).
*/

// -----------------------------
//          DAILY LOGS  
// -----------------------------

function getLogs() {
    // Get logs from localStorage or return an empty array if none exist
    return JSON.parse(localStorage.getItem("logs")) || [];
}

// Function to save logs to local storage
function saveLogs(logs) {
    localStorage.setItem("logs", JSON.stringify(logs));
}

// Save a new log entry
document.getElementById("saveLog").addEventListener("click", function() {
    const date = new Date().toLocaleDateString();
    const log = {
        date: date,
        learnedToday: document.getElementById("learnedToday").value,
        dailyReflection: document.getElementById("dailyReflection").value,
        vocabularyGrammar: document.getElementById("vocabularyGrammar").value,
        goalsTomorrow: document.getElementById("goalsTomorrow").value,
    };

    // Get current logs, push the new one, then save
    const logs = getLogs();
    logs.push(log);
    saveLogs(logs);

    // Debugging: Check if logs are saved
    console.log("Logs saved: ", logs);

    // Re-display logs and clear the form
    displayLogs();
    clearForm();
});

// Clear the input fields after saving
function clearForm() {
    document.getElementById("learnedToday").value = '';
    document.getElementById("dailyReflection").value = '';
    document.getElementById("vocabularyGrammar").value = '';
    document.getElementById("goalsTomorrow").value = '';
}

// Display logs on the page
function displayLogs() {
    const logs = getLogs();  // Get logs from localStorage
    const logsList = document.getElementById("logsList");
    logsList.innerHTML = '';  // Clear current logs displayed

    // Check if we have any logs
    if (logs.length === 0) {
        logsList.innerHTML = '<p>No logs found!</p>';
        return;
    }

    // Loop through and display each log entry
    logs.forEach((log, index) => {
        const logDiv = document.createElement("div");
        logDiv.classList.add("log-item");

        logDiv.innerHTML = `
            <div>
                <p><strong>Date:</strong> ${log.date}</p>
                <p><strong>What I learned today:</strong> ${log.learnedToday}</p>
                <p><strong>Daily Reflection:</strong> ${log.dailyReflection}</p>
                <p><strong>Vocabulary & Grammar:</strong> ${log.vocabularyGrammar}</p>
                <p><strong>Goals for Tomorrow:</strong> ${log.goalsTomorrow}</p>
                <button onclick="editLog(${index})">Edit</button>
                <button onclick="deleteLog(${index})">Delete</button>
            </div>
        `;
        logsList.appendChild(logDiv);
    });
}

// Edit a log entry
function editLog(index) {
    const logs = getLogs();
    const log = logs[index];

    document.getElementById("learnedToday").value = log.learnedToday;
    document.getElementById("dailyReflection").value = log.dailyReflection;
    document.getElementById("vocabularyGrammar").value = log.vocabularyGrammar;
    document.getElementById("goalsTomorrow").value = log.goalsTomorrow;

    // Optionally, delete the old log to allow re-saving
    deleteLog(index);
}

// Delete a log entry
function deleteLog(index) {
    const logs = getLogs();
    logs.splice(index, 1);  // Remove log at the specified index
    saveLogs(logs);  // Save the updated logs
    displayLogs();  // Re-display the logs
}

// Initially display all logs when the page loads
window.onload = function() {
    displayLogs();
};


