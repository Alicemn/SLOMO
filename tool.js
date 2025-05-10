// Selezione degli elementi DOM
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const tagSection = document.getElementById('tag-section');
const imageSection = document.getElementById('image-section');
const saveButton = document.getElementById('save-button');
const header = document.getElementById('headers');
// Selezione overlay per visualizzazione tag sull'immagine
const imageTagOverlay = document.getElementById('image-tag-overlay');

let imageName = '';
let imageResolution = '';

// Aggiunta del pulsante per resettare l'immagine
const resetButton = document.createElement('button');
resetButton.id = 'reset-button';
resetButton.innerText = 'Change Image';
resetButton.style.display = 'none'; // Nascondi inizialmente
imageSection.appendChild(resetButton); // Inserisci il pulsante in #image-section

// FUNZIONE: crea o aggiorna i tag in overlay sull'immagine
function updateImageOverlay() {
    if (!imageTagOverlay) return;
    // Pulisci overlay esistente
    imageTagOverlay.innerHTML = '';
    // Per ogni chip selezionata, aggiungi un badge
    document.querySelectorAll('.choice-chip.selected').forEach(label => {
        // crea il badge
        const span = document.createElement('span');
        // copia TUTTE le classi dalla label (macroCategory + choice-chip + selected)
        label.classList.forEach(c => span.classList.add(c));
        // aggiungi soltanto la classe che serve per il posizionamento overlay
        span.classList.add('image-tag');
        span.innerText = label.innerText;
        imageTagOverlay.appendChild(span);
      });
}

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');

    // Imposta la durata della GIF (2 secondi)
    const gifDuration = 2000;

    setTimeout(() => {
        preloader.style.display = 'none';
        mainContent.style.opacity = 1;
    }, gifDuration);

    // Inizializzazione: nascondi tag e overlay, imposta larghezza piena
    tagSection.classList.remove('visible');
    imageSection.classList.add('full-width');
    updateSaveButtonVisibility();
    saveButton.addEventListener('click', saveTags);
});

document.addEventListener('DOMContentLoaded', () => {
    const errorScreen = document.getElementById('error-screen');
    const mainContent = document.getElementById('main-content');
    const widthThreshold = 768;

    function checkWindowSize() {
        if (window.innerWidth < widthThreshold) {
            errorScreen.style.display = 'flex';
            mainContent.classList.add('hidden');
        } else {
            errorScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
        }
    }

    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
});

// Gestione scroll per nascondere/mostrare l'header
let lastScrollTop = 0;
window.addEventListener('scroll', function () {
    const scrollTop = window.scrollY;
    if (scrollTop > lastScrollTop) {
        header.classList.add('hide');
    } else {
        header.classList.remove('hide');
    }
    lastScrollTop = scrollTop;
});

// Funzione per aggiornare la visibilità del pulsante Save
function updateSaveButtonVisibility() {
    saveButton.style.display = tagSection.classList.contains('visible') ? 'block' : 'none';
}

// Funzione per resettare l'immagine e lo stato iniziale
function resetImage() {
    imageName = '';
    imageResolution = '';
    imageInput.value = '';
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    document.getElementById('file-label').style.display = 'inline-block';
    tagSection.classList.remove('visible');
    imageSection.classList.add('full-width');
    resetButton.style.display = 'none';
    updateSaveButtonVisibility();

    // Deseleziona tutti i tag e pulisci overlay
    document.querySelectorAll('.choice-chip.selected').forEach(tag => tag.classList.remove('selected'));
    if (imageTagOverlay) imageTagOverlay.innerHTML = '';
}
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

        // Calcola la risoluzione
        const img = new Image();
        img.onload = function () {
            imageResolution = `${img.width}x${img.height}`;
        };
        img.src = URL.createObjectURL(file);

        // Mostra sezione tag e overlay
        setTimeout(() => {
            tagSection.classList.add('visible');
            imageSection.classList.remove('full-width');
            updateSaveButtonVisibility();
        }, 300);

        resetButton.style.display = 'block';
        document.getElementById('file-label').style.display = 'none';
    }
});

// Caricamento dei tag da tags.json e creazione delle categorie
fetch('tags.json')
    .then(response => response.json())
    .then(data => {
        for (const [macroCategory, tags] of Object.entries(data)) {
            createMacroCategory(macroCategory, tags);
        }
        createMacroCategory('Others', []);
    })
    .catch(error => console.error('Error loading tags:', error));

// Creazione di macro-categoria e relative chip
function createMacroCategory(macroCategory, tags) {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('tag-category');

    const macroChip = document.createElement('div');
    macroChip.classList.add('macro-chip');
    macroChip.innerText = macroCategory.replace(/_/g, ' ');
    categoryDiv.appendChild(macroChip);

    const tagListDiv = document.createElement('div');
    tagListDiv.classList.add('tag-list');

    tags.forEach(tag => {
        const label = document.createElement('label');
        label.classList.add('choice-chip', macroCategory);
        label.innerText = tag;
        // Qui aggiungiamo updateImageOverlay()
        label.addEventListener('click', () => {
            label.classList.toggle('selected');
            updateImageOverlay();
            console.log(`${tag} selected: ${label.classList.contains('selected')}`);
        });
        tagListDiv.appendChild(label);
    });

    const addTagChip = document.createElement('div');
    addTagChip.classList.add('choice-chip', 'add-tag-chip');
    addTagChip.innerText = '+';
    addTagChip.title = 'Add a new tag';

    addTagChip.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter new tag';
        input.classList.add('new-tag-input');
        tagListDiv.appendChild(input);
        input.focus();

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                const newTag = input.value.trim();
                const newLabel = document.createElement('label');
                newLabel.classList.add('choice-chip', macroCategory);
                newLabel.innerText = newTag;
                // Anche qui, bindiamo updateImageOverlay()
                newLabel.addEventListener('click', () => {
                    newLabel.classList.toggle('selected');
                    updateImageOverlay();
                    console.log(`${newTag} selected: ${newLabel.classList.contains('selected')}`);
                });
                tagListDiv.insertBefore(newLabel, addTagChip);
                input.remove();
                console.log(`New tag added to ${macroCategory}: ${newTag}`);
            } else if (e.key === 'Escape') {
                input.remove();
            }
        });
    });

    tagListDiv.appendChild(addTagChip);
    categoryDiv.appendChild(tagListDiv);
    tagSection.appendChild(categoryDiv);
}

// Salvataggio dei tag selezionati in JSON
function saveTags() {
    const selectedTags = [];
    document.querySelectorAll('.choice-chip.selected').forEach(label => {
        selectedTags.push({
            tag: label.innerText,
            macroCategory: label.classList.contains('Others') ? 'Others' : label.classList[1]
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

    setTimeout(() => {
        confirmationScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        resetMainContent();
    }, 3000);
}

function resetMainContent() {
    imageName = '';
    imageResolution = '';
    const imageInput = document.getElementById('image-input');
    imageInput.value = '';
    const imagePreview = document.getElementById('image-preview');
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    const fileLabel = document.getElementById('file-label');
    fileLabel.style.display = 'inline-block';
    const tagSection = document.getElementById('tag-section');
    tagSection.classList.remove('visible');
    const imageSection = document.getElementById('image-section');
    imageSection.classList.add('full-width');
    // Deseleziona tutti i tag
  document.querySelectorAll('.choice-chip.selected')
  .forEach(tag => tag.classList.remove('selected'));

// **NUOVO**: svuota l'overlay dei badge
if (imageTagOverlay) imageTagOverlay.innerHTML = '';

// Nascondi il pulsante di reset immagine
const resetButton = document.getElementById('reset-button');
resetButton.style.display = 'none';

// Aggiorna la visibilità del pulsante Save
updateSaveButtonVisibility();
}
