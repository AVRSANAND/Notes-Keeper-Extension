// Global variables
let notes = [];
let currentEditIndex = null;

// Load notes when the extension is opened
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['notes'], function (result) {
        if (result.notes) {
            notes = result.notes;
            renderNotes(notes);
            renderTags(notes);
        }
    });

    // Add new note button click handler
    document.getElementById('addNoteButton').addEventListener('click', function () {
        clearForm();
        currentEditIndex = null;
        document.getElementById('noteForm').style.display = 'block';
    });

    // Save note button click handler
    document.getElementById('saveNoteButton').addEventListener('click', function () {
        const url = document.getElementById('urlInput').value;
        const title = document.getElementById('titleInput').value;
        const content = document.getElementById('noteInput').value;
        const tags = document.getElementById('tagInput').value.split(',').map(tag => tag.trim());

        if (!title || !content) {
            alert('Title and content are required.');
            return;
        }

        const newNote = {
            url: url || null,
            title,
            content,
            tags: tags.length > 0 ? tags : ['general']
        };

        if (currentEditIndex !== null) {
            // Edit existing note
            notes[currentEditIndex] = newNote;
        } else {
            // Add new note
            notes.push(newNote);
        }

        // Save notes to chrome.storage.local
        chrome.storage.local.set({ notes }, function () {
            renderNotes(notes);
            renderTags(notes);
            clearForm();
            document.getElementById('noteForm').style.display = 'none';
        });
    });

    // Event delegation for edit and delete buttons
    document.getElementById('notesContainer').addEventListener('click', function (event) {
        const index = parseInt(event.target.dataset.index);

        if (event.target.classList.contains('edit-note-btn')) {
            const note = notes[index];
            document.getElementById('urlInput').value = note.url || '';
            document.getElementById('titleInput').value = note.title;
            document.getElementById('noteInput').value = note.content;
            document.getElementById('tagInput').value = note.tags.join(', ');
            currentEditIndex = index;
            document.getElementById('noteForm').style.display = 'block';
        }

        if (event.target.classList.contains('delete-note-btn')) {
            notes.splice(index, 1);
            chrome.storage.local.set({ notes }, function () {
                renderNotes(notes);
                renderTags(notes);
            });
        }
    });
});


// Render notes in the notes container
function renderNotes(notes, filtered = false) {
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = '';

    if (filtered) {
        notes.forEach((note, index) => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note';

            noteDiv.innerHTML = `
                <h4>${note.title}</h4>
                <p>${note.content}</p>
                ${note.url ? `<a href="${note.url}" target="_blank">${note.url}</a>` : ''}
                <p>Tags: ${note.tags.join(', ')}</p>
                <button class="edit-note-btn" data-index="${index}">Edit</button>
                <button class="delete-note-btn" data-index="${index}">Delete</button>
            `;

            notesContainer.appendChild(noteDiv);
        });
    } else {
        // Display only the latest note
        if (notes.length > 0) {
            const latestNote = notes[notes.length - 1];
            const latestNoteDiv = document.createElement('div');
            latestNoteDiv.className = 'note';

            latestNoteDiv.innerHTML = `
                <h4>${latestNote.title}</h4>
                <p>${latestNote.content}</p>
                ${latestNote.url ? `<a href="${latestNote.url}" target="_blank">${latestNote.url}</a>` : ''}
                <p>Tags: ${latestNote.tags.join(', ')}</p>
                <button class="edit-note-btn" data-index="${notes.length - 1}">Edit</button>
                <button class="delete-note-btn" data-index="${notes.length - 1}">Delete</button>
            `;

            notesContainer.appendChild(latestNoteDiv);
        }
    }
}

// Render tags in the available tags container
function renderTags(notes) {
    const tagsContainer = document.getElementById('availableTags');
    tagsContainer.innerHTML = '';

    const allTags = [...new Set(notes.flatMap(note => note.tags))];
    allTags.forEach(tag => {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'tag';
        tagDiv.textContent = tag;
        tagDiv.addEventListener('click', function () {
            filterNotesByTag(tag);
        });
        tagsContainer.appendChild(tagDiv);
    });
}

// Filter notes by tag
function filterNotesByTag(tag) {
    const filteredNotes = notes.filter(note => note.tags.includes(tag));
    renderNotes(filteredNotes, true);  // Render filtered notes
}

// Clear form fields
function clearForm() {
    document.getElementById('urlInput').value = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('noteInput').value = '';
    document.getElementById('tagInput').value = '';
}

// Initial load
chrome.storage.local.get(['notes'], function (result) {
    if (result.notes) {
        notes = result.notes;
        renderNotes(notes);
        renderTags(notes);
    }
});
