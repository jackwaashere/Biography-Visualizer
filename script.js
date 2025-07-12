const fetchBtn = document.getElementById('fetch-btn');
const urlInput = document.getElementById('url');
const fileInput = document.getElementById('file');
const subjectImageInput = document.getElementById('subject-image');
const subjectImagePreview = document.getElementById('subject-image-preview');
const contentSection = document.querySelector('.content-section');
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
const generationControls = document.getElementById('generation-controls');
const styleOptions = document.getElementById('style-options');
const rawLlmSection = document.querySelector('.raw-llm-section');

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
    styleOptions.style.display = 'block';
    rawLlmSection.style.display = 'block';
    resultsSection.style.display = 'block';
}

function showSections() {
    contentSection.style.display = 'block';
    generationControls.style.display = 'block';
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

async function getBase64Image(img) {
    try {
        // Fetch the image as a blob to bypass CORS restrictions on canvas
        const response = await fetch(img.src);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create a new image element and load the blob URL
        return new Promise((resolve, reject) => {
            const imageForCanvas = new Image();
            imageForCanvas.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = imageForCanvas.width;
                canvas.height = imageForCanvas.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(imageForCanvas, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                
                // Clean up the temporary blob URL
                URL.revokeObjectURL(url);
                resolve(dataURL);
            };
            imageForCanvas.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            };
            imageForCanvas.src = url;
        });
    } catch (error) {
        console.error('Failed to fetch image for getBase64Image:', error);
        return Promise.reject(error);
    }
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
            subjectImagePreview.src = e.target.result;
            subjectImagePreview.style.display = 'block';
            subjectImagePreview.dataset.filename = file.name;
        };
        reader.readAsDataURL(file);
    } else {
        subjectImageBase64 = '';
        subjectImagePreview.src = '';
        subjectImagePreview.style.display = 'none';
        subjectImagePreview.removeAttribute('data-filename');
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
        downloadBtn.onclick = () => downloadImage(popupImg.src, `scene${sceneNumber}-${sceneTitle.replace(/\s+/g, '-').toLowerCase()}.png`);
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
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    contentDiv.classList.toggle('show');
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    toggleBtn.textContent = isExpanded ? 'Show' : 'Hide';
});

toggleScenesBtn.addEventListener('click', () => {
    const isExpanded = toggleScenesBtn.getAttribute('aria-expanded') === 'true';
    scenesDiv.classList.toggle('show');
    toggleScenesBtn.setAttribute('aria-expanded', !isExpanded);
    toggleScenesBtn.textContent = isExpanded ? 'Show' : 'Hide';
});

toggleRawLlmBtn.addEventListener('click', () => {
    const isExpanded = toggleRawLlmBtn.getAttribute('aria-expanded') === 'true';
    rawLlmResponseDiv.classList.toggle('show');
    rawLlmResponseDiv.textContent = rawLlmResponse;
    toggleRawLlmBtn.setAttribute('aria-expanded', !isExpanded);
    toggleRawLlmBtn.textContent = isExpanded ? 'Show' : 'Hide';
});

const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const loadInput = document.getElementById('load-input');

saveBtn.addEventListener('click', async () => {
    const biography_content = biographyText.textContent;
    const reference_image = subjectImageBase64;
    const llm_response = JSON.parse(rawLlmResponse);
    const scenes = {};

    const sceneElements = document.querySelectorAll('.scene');
    const promises = [];

    for (const sceneElement of sceneElements) {
        const sceneKey = sceneElement.querySelector('.generate-img-btn').dataset.sceneKey;
        scenes[sceneKey] = {};
        const imageElements = sceneElement.querySelectorAll('.thumbnail');
        const imagePromises = [];
        for (const imageElement of imageElements) {
            imagePromises.push(getBase64Image(imageElement));
        }
        promises.push(Promise.all(imagePromises).then(images => {
            scenes[sceneKey].images = images;
        }));
    }

    await Promise.all(promises);

    const data = {
        biography_content,
        reference_image,
        llm_response,
        scenes
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biography_session.json';
    a.click();
    URL.revokeObjectURL(url);
});

loadBtn.addEventListener('click', () => {
    loadInput.click();
});

loadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            biographyText.textContent = data.biography_content;
            subjectImageBase64 = data.reference_image;
            if (subjectImageBase64) {
                subjectImagePreview.src = subjectImageBase64;
                subjectImagePreview.style.display = 'block';
                subjectImagePreview.dataset.filename = 'loaded_image.png'; // Placeholder filename
            } else {
                subjectImagePreview.src = '';
                subjectImagePreview.style.display = 'none';
                subjectImagePreview.removeAttribute('data-filename');
            }
            rawLlmResponse = JSON.stringify(data.llm_response, null, 2);
            displayScenes(data.llm_response.scenes);

            for (const sceneKey in data.scenes) {
                const sceneElement = document.querySelector(`[data-scene-key="${sceneKey}"]`).closest('.scene');
                const sceneImagesContainer = sceneElement.querySelector('.scene-images');
                sceneImagesContainer.innerHTML = '';
                for (const imageBase64 of data.scenes[sceneKey].images) {
                    const imageId = `image-${sceneKey}-${Date.now()}`;
                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('scene-image-item');
                    imageContainer.innerHTML = `
                        <input type="radio" id="${imageId}" name="scene-image-${sceneKey}" checked>
                        <label for="${imageId}"><img src="${imageBase64}" class="thumbnail"></label>
                    `;
                    sceneImagesContainer.appendChild(imageContainer);
                }
            }

            showSections();
            resultsSection.style.display = 'block';
        };
        reader.readAsText(file);
    }
});
