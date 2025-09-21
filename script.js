document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesList = document.getElementById('notes-list');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const adviceContainer = document.getElementById('advice-container');
    const adviceText = document.getElementById('advice-text');

    const loadNotes = () => {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notesList.innerHTML = '';
        notes.forEach(note => renderNote(note.text, note.completed));
    };

    const saveNotes = () => {
        const notes = Array.from(notesList.children).map(li => ({
            text: li.querySelector('.note-text').textContent,
            completed: li.classList.contains('completed')
        }));
        localStorage.setItem('notes', JSON.stringify(notes));
    };

    const renderNote = (text, completed) => {
        const li = document.createElement('li');
        if (completed) {
            li.classList.add('completed');
        }

        const checklistBtn = document.createElement('span');
        checklistBtn.classList.add('checklist-btn');

        const noteSpan = document.createElement('span');
        noteSpan.textContent = text;
        noteSpan.classList.add('note-text');
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.classList.add('delete-btn');

        li.appendChild(checklistBtn);
        li.appendChild(noteSpan);
        li.appendChild(deleteBtn);
        notesList.appendChild(li);

        checklistBtn.addEventListener('click', () => {
            li.classList.toggle('completed');
            saveNotes();
            if (li.classList.contains('completed')) {
                fetchRandomAdvice();
            } else {
                hideAdvice();
            }
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            li.remove();
            saveNotes();
            hideAdvice();
        });
    };

    const addNote = () => {
        const noteText = noteInput.value.trim();
        if (noteText) {
            renderNote(noteText, false);
            saveNotes();
            noteInput.value = '';
        }
    };

    const fetchRandomAdvice = async () => {
        try {
            const response = await fetch('https://api.adviceslip.com/advice');
            const data = await response.json();
            const advice = data.slip.advice;

            const translationResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(advice)}&langpair=en|pt-br`);
            const translationData = await translationResponse.json();
            const translatedAdvice = translationData.responseData.translatedText;
            
            showAdvice(translatedAdvice);
        } catch (error) {
            console.error('Erro ao buscar ou traduzir o conselho:', error);
            showAdvice('Erro ao carregar o conselho. Tente novamente mais tarde.');
        }
    };
    
    const showAdvice = (text) => {
        adviceText.textContent = text;
        adviceContainer.classList.remove('hidden');
        adviceContainer.classList.add('visible');
    };

    const hideAdvice = () => {
        adviceContainer.classList.remove('visible');
        setTimeout(() => {
            adviceContainer.classList.add('hidden');
        }, 500);
    };

    addNoteBtn.addEventListener('click', addNote);
    noteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNote();
        }
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Tem certeza de que deseja limpar todas as notas?')) {
            localStorage.removeItem('notes');
            notesList.innerHTML = '';
            hideAdvice();
        }
    });

    loadNotes();
});