// Global variables
let notes = [];
let currentEditId = null;

// Helper function to generate unique IDs for notes
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

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
        currentEditId = null;
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
            id: currentEditId ? currentEditId : generateId(), // Assign a unique ID or keep the existing one
            url: url || null,
            title,
            content,
            tags: tags.length > 0 ? tags : ['general']
        };

        if (currentEditId) {
            // Edit existing note
            const noteIndex = notes.findIndex(note => note.id === currentEditId);
            if (noteIndex > -1) {
                notes[noteIndex] = newNote;
            }
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
        const target = event.target;

        if (target.classList.contains('edit-note-btn')) {
            const noteId = target.dataset.id;
            const note = notes.find(note => note.id === noteId);
            if (note) {
                document.getElementById('urlInput').value = note.url || '';
                document.getElementById('titleInput').value = note.title;
                document.getElementById('noteInput').value = note.content;
                document.getElementById('tagInput').value = note.tags.join(', ');
                currentEditId = note.id;
                document.getElementById('noteForm').style.display = 'block';
            }
        }

        if (target.classList.contains('delete-note-btn')) {
            const noteId = target.dataset.id;
            notes = notes.filter(note => note.id !== noteId);  // Delete the note by its ID
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

    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';

        noteDiv.innerHTML = `
            <h4>${note.title}</h4>
            <p>${note.content}</p>
            ${note.url ? `<a href="${note.url}" target="_blank">${note.url}</a>` : ''}
            <p>Tags: ${note.tags.join(', ')}</p>
            <button class="edit-note-btn" data-id="${note.id}">Edit</button>
            <button class="delete-note-btn" data-id="${note.id}">Delete</button>
        `;

        notesContainer.appendChild(noteDiv);
    });
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
