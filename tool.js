// Selezione degli elementi DOM
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const tagSection = document.getElementById('tag-section');
const imageSection = document.getElementById('image-section');
const saveButton = document.getElementById('save-button');
const header = document.getElementById('headers');
let imageName = '';
let imageResolution = '';

// Aggiunta del pulsante per resettare l'immagine
const resetButton = document.createElement('button');
resetButton.id = 'reset-button';
resetButton.innerText = 'Change Image';
resetButton.style.display = 'none'; // Nascondi inizialmente
imageSection.appendChild(resetButton); // Inserisci il pulsante in #image-section

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');

    // Imposta la durata della GIF (esempio: 3000ms per 3 secondi)
    const gifDuration = 2000;

    setTimeout(() => {
        // Nascondi la schermata di apertura
        preloader.style.display = 'none';

        // Mostra il contenuto principale
        mainContent.style.opacity = 1;
    }, gifDuration);
});

document.addEventListener('DOMContentLoaded', () => {
    const errorScreen = document.getElementById('error-screen');
    const mainContent = document.getElementById('main-content');

    // Soglia di larghezza (es. 768px per dispositivi mobili)
    const widthThreshold = 768;

    function checkWindowSize() {
        if (window.innerWidth < widthThreshold) {
            // Mostra la schermata di errore
            errorScreen.style.display = 'flex';
            mainContent.classList.add('hidden');
        } else {
            // Mostra il contenuto principale
            errorScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
        }
    }

    // Controlla la dimensione della finestra al caricamento
    checkWindowSize();

    // Aggiungi un listener per rilevare cambiamenti nelle dimensioni della finestra
    window.addEventListener('resize', checkWindowSize);
});

// Gestione dello scroll per nascondere/mostrare l'header
let lastScrollTop = 0;
window.addEventListener('scroll', function () {
    const scrollTop = window.scrollY;

    if (scrollTop > lastScrollTop) {
        // L'utente scorre verso il basso: nascondi l'header
        header.classList.add('hide');
    } else {
        // L'utente scorre verso l'alto: mostra l'header
        header.classList.remove('hide');
    }

    lastScrollTop = scrollTop;
});

// Funzione per aggiornare la visibilità del pulsante Save
function updateSaveButtonVisibility() {
    if (tagSection.classList.contains('visible')) {
        saveButton.style.display = 'block';
    } else {
        saveButton.style.display = 'none';
    }
}

// Funzione per resettare l'immagine e lo stato iniziale
function resetImage() {
    // Reset delle variabili
    imageName = '';
    imageResolution = '';

    // Resetta l'input file
    imageInput.value = ''; // Questo consente di rilevare un nuovo evento change

    // Rimuovi l'anteprima immagine
    imagePreview.src = '';
    imagePreview.style.display = 'none';

    // Mostra di nuovo il bottone di upload
    document.getElementById('file-label').style.display = 'inline-block';

    // Nascondi la sezione tag e ripristina la larghezza piena della sezione immagine
    tagSection.classList.remove('visible');
    imageSection.classList.add('full-width');

    // Nascondi il pulsante di reset
    resetButton.style.display = 'none';

    // Aggiorna la visibilità del pulsante Save
    updateSaveButtonVisibility();

    // Rimuovi la classe .selected da tutti i tag
    document.querySelectorAll('.choice-chip.selected').forEach(tag => {
        tag.classList.remove('selected');
    });
}

// Aggiungi un evento al pulsante di reset
resetButton.addEventListener('click', resetImage);

// Gestione del caricamento e anteprima dell'immagine
imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        imageName = file.name;
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);

        // Calcola la risoluzione dell'immagine una volta caricata
        const img = new Image();
        img.onload = function () {
            imageResolution = `${img.width}x${img.height}`;
        };
        img.src = URL.createObjectURL(file);

        // Mostra la sezione dei tag e aggiorna la larghezza della sezione immagine
        setTimeout(() => {
            tagSection.classList.add('visible');
            imageSection.classList.remove('full-width');
            updateSaveButtonVisibility(); // Aggiorna visibilità pulsante Save
        }, 300);

        // Mostra il pulsante di reset
        resetButton.style.display = 'block';

        // Nascondi il bottone di upload
        document.getElementById('file-label').style.display = 'none';
    }
});

// Inizializzazione: Assicurati che l'immagine sia a piena larghezza quando non ci sono immagini
document.addEventListener('DOMContentLoaded', () => {
    tagSection.classList.remove('visible');
    imageSection.classList.add('full-width');
    updateSaveButtonVisibility(); // Nascondi il pulsante Save all'avvio

    // Collega il pulsante "Save Tags"
    saveButton.addEventListener('click', saveTags);
});

// Funzione per caricare i tag dal file JSON e creare le categorie
fetch('tags.json')
    .then(response => response.json())
    .then(data => {
        // Gestione delle macro-categorie dal file JSON
        for (const [macroCategory, tags] of Object.entries(data)) {
            createMacroCategory(macroCategory, tags);
        }

        // Aggiungi la macro-categoria "Others" vuota con solo la chip "+"
        createMacroCategory('Others', []);
    })
    .catch(error => console.error('Error loading tags:', error));

// Funzione per creare una macro-categoria con i suoi tag
function createMacroCategory(macroCategory, tags) {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('tag-category');

    // Crea una chip per la macro-categoria
    const macroChip = document.createElement('div');
    macroChip.classList.add('macro-chip');
    macroChip.innerText = macroCategory.replace(/_/g, ' ');
    categoryDiv.appendChild(macroChip);

    // Crea il contenitore per i tag
    const tagListDiv = document.createElement('div');
    tagListDiv.classList.add('tag-list');
    tags.forEach(tag => {
        const label = document.createElement('label');
        label.classList.add('choice-chip');
        label.classList.add(macroCategory); // Assegna la classe della macro-categoria
        label.innerText = tag;

        // Aggiunge e rimuove la classe `.selected`
        label.addEventListener('click', () => {
            label.classList.toggle('selected');
            console.log(`${tag} selected: ${label.classList.contains('selected')}`);
        });

        tagListDiv.appendChild(label);
    });

    // Aggiungi la chip "+" per aggiungere nuovi tag
    const addTagChip = document.createElement('div');
    addTagChip.classList.add('choice-chip', 'add-tag-chip'); // Classe per lo stile
    addTagChip.innerText = '+';
    addTagChip.title = 'Add a new tag';

    // Gestisce l'aggiunta di nuovi tag
    addTagChip.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter new tag';
        input.classList.add('new-tag-input');

        // Aggiungi l'input dopo la chip `+`
        tagListDiv.appendChild(input);
        input.focus();

        // Salva il nuovo tag quando l'utente preme Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                const newTag = input.value.trim();
                const newLabel = document.createElement('label');
                newLabel.classList.add('choice-chip');
                newLabel.classList.add(macroCategory);
                newLabel.innerText = newTag;

                // Aggiunge il comportamento di selezione
                newLabel.addEventListener('click', () => {
                    newLabel.classList.toggle('selected');
                    console.log(`${newTag} selected: ${newLabel.classList.contains('selected')}`);
                });

                // Aggiungi il nuovo tag e rimuovi l'input
                tagListDiv.insertBefore(newLabel, addTagChip);
                input.remove();
                console.log(`New tag added to ${macroCategory}: ${newTag}`);
            } else if (e.key === 'Escape') {
                // Se l'utente preme Esc, rimuovi l'input
                input.remove();
            }
        });
    });

    tagListDiv.appendChild(addTagChip);
    categoryDiv.appendChild(tagListDiv);
    tagSection.appendChild(categoryDiv);
}

// Funzione per salvare i tag selezionati
function saveTags() {
    const selectedTags = [];
    document.querySelectorAll('.choice-chip.selected').forEach(label => {
        selectedTags.push({
            tag: label.innerText,
            macroCategory: label.classList.contains('Others') ? 'Others' : label.classList[1] // Usa il secondo elemento della classe come categoria
        });
    });

    const outputData = {
        imageName: imageName,
        resolution: imageResolution,
        tags: selectedTags
    };

    const jsonString = JSON.stringify(outputData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${imageName ? imageName.split('.')[0] : 'untitled'}_tags.json`;
    link.click();

    console.log('Tags saved:', outputData);

    const confirmationScreen = document.getElementById('confirmation-screen');
    const mainContent = document.getElementById('main-content');

    confirmationScreen.style.display = 'flex';
    mainContent.classList.add('hidden');

    // Nascondi la schermata di conferma e torna al contenuto principale dopo 3 secondi
    setTimeout(() => {
        confirmationScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        resetMainContent();
    }, 3000); // Modifica 3000 per cambiare la durata (in millisecondi)
    
}

function resetMainContent() {
    // Reset delle variabili globali
    imageName = '';
    imageResolution = '';

    // Resetta l'input file
    const imageInput = document.getElementById('image-input');
    imageInput.value = '';

    // Nascondi l'anteprima immagine
    const imagePreview = document.getElementById('image-preview');
    imagePreview.src = '';
    imagePreview.style.display = 'none';

    // Mostra il bottone di upload immagine
    const fileLabel = document.getElementById('file-label');
    fileLabel.style.display = 'inline-block';

    // Nascondi la sezione tag
    const tagSection = document.getElementById('tag-section');
    tagSection.classList.remove('visible');

    // Ripristina la larghezza piena della sezione immagine
    const imageSection = document.getElementById('image-section');
    imageSection.classList.add('full-width');

    // Deseleziona tutti i tag
    document.querySelectorAll('.choice-chip.selected').forEach(tag => {
        tag.classList.remove('selected');
    });

    // Nascondi il pulsante di reset immagine
    const resetButton = document.getElementById('reset-button');
    resetButton.style.display = 'none';

        // Aggiorna la visibilità del pulsante Save
        updateSaveButtonVisibility();
}

