// State Management
let notes = JSON.parse(localStorage.getItem('scrapbook-notes')) || [];

// DOM Elements
const wallView = document.getElementById('wall-view');
const editorView = document.getElementById('editor-view');
const notesGrid = document.getElementById('notes-grid');
const addNoteBtn = document.getElementById('add-note-btn');
const backBtn = document.getElementById('back-btn');
const submitBtn = document.getElementById('submit-btn');

// Input Elements
const titleInput = document.getElementById('title-input');
const poemInput = document.getElementById('poem-input');
const senderInput = document.getElementById('sender-input');

// Initialize
function init() {
    renderNotes();
    setupEventListeners();
    
    // Add default notes if empty (first time visit)
    if (notes.length === 0) {
        addDefaultNotes();
    }
}

function setupEventListeners() {
    addNoteBtn.addEventListener('click', () => switchView('editor'));
    backBtn.addEventListener('click', () => {
        clearInputs();
        switchView('wall');
    });
    submitBtn.addEventListener('click', handleAddNote);
}

function switchView(viewName) {
    if (viewName === 'editor') {
        wallView.classList.add('hidden');
        editorView.classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        editorView.classList.add('hidden');
        wallView.classList.remove('hidden');
    }
}

function renderNotes() {
    notesGrid.innerHTML = '';
    
    // Most recent notes first
    const sortedNotes = [...notes].reverse();
    
    sortedNotes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'sticky-note';
        
        // Use persistent rotation
        noteEl.style.transform = `rotate(${note.rotation || 0}deg)`;
        
        noteEl.innerHTML = `
            <div class="note-content">
                <p class="poem-title"><strong>${note.title || 'Untitled'}</strong></p>
                <p class="poem-text">${note.text}</p>
                <p class="poem-signature">${note.sender}</p>
            </div>
            <div class="note-footer">
                <span class="note-meta">${new Date(note.date).toLocaleDateString()}</span>
                <div class="vote-actions">
                    <button class="vote-btn up ${note.userVote === 'up' ? 'active' : ''}" onclick="handleVote('${note.id}', 'up')" title="Thumbs Up">
                        👍 <span class="vote-count">${note.upvotes || 0}</span>
                    </button>
                    <button class="vote-btn down ${note.userVote === 'down' ? 'active' : ''}" onclick="handleVote('${note.id}', 'down')" title="Thumbs Down">
                        👎 <span class="vote-count">${note.downvotes || 0}</span>
                    </button>
                </div>
            </div>
        `;
        notesGrid.appendChild(noteEl);
    });
}

function handleAddNote() {
    const title = titleInput.value.trim() || 'Untitled';
    const text = poemInput.value.trim();
    const sender = senderInput.value.trim() || 'Anonymous';
    
    if (!text) {
        alert("The card is empty! Please write something.");
        return;
    }
    
    const newNote = {
        id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000),
        title,
        text,
        sender,
        rotation: (Math.random() * 4 - 2).toFixed(1), // Store rotation once
        date: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0
    };
    
    notes.push(newNote);
    saveToLocalStorage();
    renderNotes();
    clearInputs();
    switchView('wall');
    
    console.log("Poem pinned to the wall.");
}

function handleVote(id, type) {
    notes = notes.map(note => {
        if (note.id === id) {
            const currentVote = note.userVote || null;
            let newUp = note.upvotes || 0;
            let newDown = note.downvotes || 0;
            let newUserVote = type;

            // Case 1: Undo current vote
            if (currentVote === type) {
                if (type === 'up') newUp = Math.max(0, newUp - 1);
                if (type === 'down') newDown = Math.max(0, newDown - 1);
                newUserVote = null;
            } 
            // Case 2: Change/Add vote
            else {
                // Remove old vote first
                if (currentVote === 'up') newUp = Math.max(0, newUp - 1);
                if (currentVote === 'down') newDown = Math.max(0, newDown - 1);
                
                // Add new vote
                if (type === 'up') newUp += 1;
                if (type === 'down') newDown += 1;
            }

            return { ...note, upvotes: newUp, downvotes: newDown, userVote: newUserVote };
        }
        return note;
    });
    
    saveToLocalStorage();
    renderNotes();
}

// Global scope for onclick attribute
window.handleVote = handleVote;

function saveToLocalStorage() {
    localStorage.setItem('scrapbook-notes', JSON.stringify(notes));
}

function clearInputs() {
    titleInput.value = '';
    poemInput.value = '';
    senderInput.value = '';
}

function addDefaultNotes() {
    const defaults = [
        {
            id: '1',
            title: 'Mist and Memory',
            text: 'I saw you in the mist,\nA ghost of what could be.\nA memory I never had,\nBut one I feel so deep.',
            sender: 'The Dreamer',
            rotation: -1.5,
            date: new Date().toISOString(),
            upvotes: 5,
            downvotes: 1
        },
        {
            id: '2',
            title: 'Loneliness of the Moon',
            text: 'How lonely it must be,\nTo watch the world while we sleep.\nI leave this note to say,\nI see you.',
            sender: 'Night Owl',
            rotation: 2.1,
            date: new Date().toISOString(),
            upvotes: 12,
            downvotes: 0
        }
    ];
    notes = defaults;
    saveToLocalStorage();
    renderNotes();
}

// Start the app
init();
