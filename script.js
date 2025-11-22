document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note');
    const notesList = document.getElementById('notes-list');

    const assignmentInput = document.getElementById('assignment-input');
    const assignmentDueDate = document.getElementById('assignment-due-date');
    const assignmentFile = document.getElementById('assignment-file');
    const addAssignmentBtn = document.getElementById('add-assignment');
    const assignmentsList = document.getElementById('assignments-list');
    const filesList = document.getElementById('files-list');

    const reminderInput = document.getElementById('reminder-input');
    const reminderTime = document.getElementById('reminder-time');
    const addReminderBtn = document.getElementById('add-reminder');
    const remindersList = document.getElementById('reminders-list');

    // Load data from localStorage
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    let uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

    // --- Render Functions ---
    const renderNotes = () => {
        notesList.innerHTML = '';
        notes.forEach((note, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${note}</span><button class="delete-btn" data-index="${index}">हटाएं</button>`;
            notesList.appendChild(li);
        });
    };

    const renderAssignments = () => {
        assignmentsList.innerHTML = '';
        assignments.forEach((assignment, index) => {
            const li = document.createElement('li');
            const fileInfo = assignment.fileName ? ` - <em>File: ${assignment.fileName}</em>` : '';
            li.innerHTML = `<span>${assignment.text} - <strong>Due:</strong> ${assignment.dueDate}${fileInfo}</span><button class="delete-btn" data-index="${index}">हटाएं</button>`;
            assignmentsList.appendChild(li);
        });
    };

    const renderReminders = () => {
        remindersList.innerHTML = '';
        reminders.forEach((reminder, index) => {
            const li = document.createElement('li');
            const formattedTime = new Date(reminder.time).toLocaleString();
            li.innerHTML = `<span>${reminder.text} - <strong>Time:</strong> ${formattedTime}</span><button class="delete-btn" data-index="${index}">हटाएं</button>`;
            remindersList.appendChild(li);
        });
    };

    const renderFiles = () => {
        filesList.innerHTML = '';
        uploadedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            const fileSize = (file.size / 1024).toFixed(2); // Convert to KB
            li.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${fileSize} KB)</span>
                </div>
                <div class="file-actions">
                    <button class="view-btn" data-index="${index}">देखें</button>
                    <button class="delete-btn" data-index="${index}">हटाएं</button>
                </div>
            `;
            filesList.appendChild(li);
        });
    };

    // --- File Handling Functions ---
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const viewFile = (fileData) => {
        const link = document.createElement('a');
        link.href = fileData.data;
        link.download = fileData.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Event Listeners for Adding Items ---
    addNoteBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        if (noteText) {
            notes.push(noteText);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
            noteInput.value = '';
        }
    });

    addAssignmentBtn.addEventListener('click', async() => {
        const assignmentText = assignmentInput.value.trim();
        const dueDate = assignmentDueDate.value;
        const file = assignmentFile.files[0];

        if (assignmentText && dueDate) {
            let fileName = '';

            // Handle file upload if selected
            if (file) {
                try {
                    const base64Data = await convertFileToBase64(file);
                    const fileInfo = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        data: base64Data
                    };

                    uploadedFiles.push(fileInfo);
                    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
                    fileName = file.name;
                    renderFiles();

                    // Clear file input
                    assignmentFile.value = '';
                } catch (error) {
                    alert('फाइल अपलोड करने में समस्या हुई। कृपया पुनः प्रयास करें।');
                    return;
                }
            }

            assignments.push({
                text: assignmentText,
                dueDate: dueDate,
                fileName: fileName
            });
            localStorage.setItem('assignments', JSON.stringify(assignments));
            renderAssignments();
            assignmentInput.value = '';
            assignmentDueDate.value = '';
        }
    });

    addReminderBtn.addEventListener('click', () => {
        const reminderText = reminderInput.value.trim();
        const time = reminderTime.value;
        if (reminderText && time) {
            reminders.push({ text: reminderText, time: time });
            localStorage.setItem('reminders', JSON.stringify(reminders));
            renderReminders();
            reminderInput.value = '';
            reminderTime.value = '';
        }
    });

    // --- Event Listeners for Deleting Items ---
    notesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
        }
    });

    assignmentsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            assignments.splice(index, 1);
            localStorage.setItem('assignments', JSON.stringify(assignments));
            renderAssignments();
        }
    });

    remindersList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            reminders.splice(index, 1);
            localStorage.setItem('reminders', JSON.stringify(reminders));
            renderReminders();
        }
    });

    // --- File List Event Listeners ---
    filesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            uploadedFiles.splice(index, 1);
            localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
            renderFiles();
        } else if (e.target.classList.contains('view-btn')) {
            const index = e.target.getAttribute('data-index');
            const fileData = uploadedFiles[index];
            viewFile(fileData);
        }
    });

    // --- Reminder Notifications ---
    const checkReminders = () => {
        const now = new Date();
        reminders.forEach((reminder, index) => {
            const reminderDateTime = new Date(reminder.time);
            if (reminderDateTime <= now) {
                // Show notification
                new Notification('रिमाइंडर!', {
                    body: reminder.text,
                    icon: 'icon.png' // Optional: Add an icon
                });
                // Remove the reminder after notifying
                reminders.splice(index, 1);
                localStorage.setItem('reminders', JSON.stringify(reminders));
                renderReminders();
            }
        });
    };

    // Ask for notification permission
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Check for reminders every second
    setInterval(checkReminders, 1000);

    // Initial render
    renderNotes();
    renderAssignments();
    renderReminders();
    renderFiles();
});