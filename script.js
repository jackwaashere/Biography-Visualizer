const fetchBtn = document.getElementById('fetch-btn');
const urlInput = document.getElementById('url');
const fileInput = document.getElementById('file');
const subjectImageInput = document.getElementById('subject-image');
const contentSection = document.querySelector('.content-section');
const sceneSection = document.querySelector('.scene-section');
const resultsSection = document.querySelector('.results-section');
const toggleBtn = document.getElementById('toggle-btn');
const contentDiv = document.getElementById('content');
const biographyText = document.getElementById('biography-text');
const generateScenesBtn = document.getElementById('generate-scenes-btn');
const toggleScenesBtn = document.getElementById('toggle-scenes-btn');
const scenesDiv = document.getElementById('scenes');
const toggleRawLlmBtn = document.getElementById('toggle-raw-llm-btn');
const rawLlmResponseDiv = document.getElementById('raw-llm-response');
const imagePopup = document.getElementById('image-popup');
const popupImg = document.getElementById('popup-img');
const closeBtn = document.querySelector('.close-btn');
const downloadBtn = document.getElementById('download-btn');
const ghibliStyleCheckbox = document.getElementById('ghibli-style');

let rawLlmResponse = '';
let subjectImageBase64 = '';

async function generateScenes() {
    const text = biographyText.textContent;
    if (text) {
        try {
            generateScenesBtn.textContent = 'Generating...';
            generateScenesBtn.classList.add('generating');
            generateScenesBtn.disabled = true;

            const response = await fetch('/generate-scenes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ biographyText: text })
            });
            const data = await response.json();
            rawLlmResponse = JSON.stringify(data, null, 2);
            displayScenes(data.scenes);
            generateScenesBtn.textContent = 'Generate Scene Ideas';
            generateScenesBtn.classList.remove('generating');
            generateScenesBtn.disabled = false;
            resultsSection.style.display = 'block';
        } catch (error) {
            console.error('Error generating scenes:', error);
            scenesDiv.innerHTML = '<p>Error generating scenes.</p>';
            generateScenesBtn.textContent = 'Generate Scene Ideas';
            generateScenesBtn.classList.remove('generating');
            generateScenesBtn.disabled = false;
        }
    }
}

function displayScenes(scenes) {
    scenesDiv.innerHTML = '';
    let sceneCount = 1;
    for (const sceneKey in scenes) {
        const scene = scenes[sceneKey];
        const sceneElement = document.createElement('div');
        sceneElement.classList.add('scene');
        sceneElement.dataset.sceneNumber = sceneCount++;
        sceneElement.dataset.sceneTitle = scene.title;
        sceneElement.innerHTML = `
            <div class="scene-content">
                <h3>${scene.title}</h3>
                <p>${scene.human_text}</p>
                <button class="generate-img-btn" data-scene-key="${sceneKey}">Generate Image</button>
            </div>
            <div class="scene-images"></div>
        `;
        scenesDiv.appendChild(sceneElement);
    }
}

function showSections() {
    contentSection.style.display = 'block';
    sceneSection.style.display = 'block';
}

function closePopup() {
    imagePopup.style.display = 'none';
}

async function downloadImage(url, filename) {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function getBase64Image(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    return dataURL;
}

fetchBtn.addEventListener('click', async () => {
    const url = urlInput.value;
    if (url) {
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            biographyText.textContent = doc.body.innerText;
            showSections();
        } catch (error) {
            console.error('Error fetching URL:', error);
            biographyText.textContent = 'Error fetching URL.';
        }
    }
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            biographyText.textContent = e.target.result;
            showSections();
        };
        reader.readAsText(file);
    }
});

subjectImageInput.addEventListener('change', () => {
    const file = subjectImageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            subjectImageBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

generateScenesBtn.addEventListener('click', generateScenes);

scenesDiv.addEventListener('click', async (e) => {
    if (e.target.classList.contains('generate-img-btn')) {
        const sceneKey = e.target.dataset.sceneKey;
        const sceneElement = e.target.closest('.scene');
        
        const scenesData = JSON.parse(rawLlmResponse);
        const originalPrompt = scenesData.scenes[sceneKey].prompt;

        const generateImgBtn = e.target;
        const sceneImagesContainer = sceneElement.querySelector('.scene-images');

        let promptForApi = originalPrompt;
        let imageUrlForApi = subjectImageBase64;
        const isGhibliGenerationRequest = ghibliStyleCheckbox.checked;

        if (isGhibliGenerationRequest) {
            const selectedImageElement = sceneElement.querySelector('input[type="radio"]:checked + label > img');
            if (selectedImageElement) {
                const selectedImageContainer = selectedImageElement.closest('.scene-image-item');
                const isSelectedImageGhibli = selectedImageContainer && selectedImageContainer.dataset.isGhibli === 'true';

                if (isSelectedImageGhibli) {
                    promptForApi += ' strong ghibli style';
                } else {
                    promptForApi = 'ghibli style';
                    imageUrlForApi = selectedImageElement.src;
                }
            } else {
                promptForApi += ' strong ghibli style';
            }
        }

        try {
            generateImgBtn.textContent = 'Generating...';
            generateImgBtn.classList.add('generating');
            generateImgBtn.disabled = true;

            const response = await fetch('/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    prompt: promptForApi,
                    image_url: imageUrlForApi
                })
            });
            const data = await response.json();
            const newImageUrl = data.imageUrl;
            const imageId = `image-${sceneKey}-${Date.now()}`;

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('scene-image-item');
            
            if (isGhibliGenerationRequest) {
                imageContainer.dataset.isGhibli = 'true';
            }

            imageContainer.innerHTML = `
                <input type="radio" id="${imageId}" name="scene-image-${sceneKey}" checked>
                <label for="${imageId}"><img src="${newImageUrl}" class="thumbnail"></label>
            `;
            sceneImagesContainer.appendChild(imageContainer);

        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            generateImgBtn.textContent = 'Generate Image';
            generateImgBtn.classList.remove('generating');
            generateImgBtn.disabled = false;
        }
    }

    if (e.target.classList.contains('thumbnail')) {
        const sceneElement = e.target.closest('.scene');
        const sceneNumber = sceneElement.dataset.sceneNumber;
        const sceneTitle = sceneElement.dataset.sceneTitle;
        const filename = `scene${sceneNumber}-${sceneTitle.replace(/\s+/g, '-').toLowerCase()}.png`;

        popupImg.src = e.target.src;
        downloadBtn.onclick = () => downloadImage(e.target.src, filename);
        imagePopup.style.display = 'flex';
    }
});

closeBtn.addEventListener('click', closePopup);
imagePopup.addEventListener('click', (e) => {
    if (e.target === imagePopup) {
        closePopup();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePopup();
    }
});

toggleBtn.addEventListener('click', () => {
    if (contentDiv.style.display === 'none' || contentDiv.style.display === '') {
        contentDiv.style.display = 'block';
        toggleBtn.textContent = 'Hide Text Content';
    } else {
        contentDiv.style.display = 'none';
        toggleBtn.textContent = 'Toggle to Display Text Content';
    }
});

toggleScenesBtn.addEventListener('click', () => {
    if (scenesDiv.style.display === 'none' || scenesDiv.style.display === '') {
        scenesDiv.style.display = 'block';
        toggleScenesBtn.textContent = 'Hide Scene Ideas';
    } else {
        scenesDiv.style.display = 'none';
        toggleScenesBtn.textContent = 'Toggle to Display Scene Ideas';
    }
});

toggleRawLlmBtn.addEventListener('click', () => {
    if (rawLlmResponseDiv.style.display === 'none' || rawLlmResponseDiv.style.display === '') {
        rawLlmResponseDiv.textContent = rawLlmResponse;
        rawLlmResponseDiv.style.display = 'block';
        toggleRawLlmBtn.textContent = 'Hide Raw LLM Response';
    } else {
        rawLlmResponseDiv.style.display = 'none';
        toggleRawLlmBtn.textContent = 'Toggle Raw LLM Response';
    }
});
