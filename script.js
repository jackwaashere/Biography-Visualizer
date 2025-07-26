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
const popupVideo = document.getElementById('popup-video');
const progressBarContainer = document.querySelector('.progress-bar-container');
const progressBar = document.querySelector('.progress-bar');
const generateVideoBtn = document.getElementById('generate-video-btn');
const playVideoBtn = document.getElementById('play-video-btn');
const downloadVideoBtn = document.getElementById('download-video-btn');
const closeBtn = document.querySelector('.close-btn');
const downloadBtn = document.getElementById('download-btn');
const ghibliStyleCheckbox = document.getElementById('ghibli-style');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const generateStoryboardBtn = document.getElementById('generate-storyboard-btn');
const closeStoryboardBtn = document.querySelector('.close-storyboard-btn');
const prevSceneBtn = document.getElementById('prev-scene-btn');
const nextSceneBtn = document.getElementById('next-scene-btn');
const loadBtn = document.getElementById('load-btn');
const storyboardOverlay = document.getElementById('storyboard-overlay');
const storyboardTitle = document.getElementById('storyboard-title');
const storyboardImage = document.getElementById('storyboard-image');
const storyboardHumanText = document.getElementById('storyboard-human-text');
const sceneCounter = document.getElementById('scene-counter');
const loadInput = document.getElementById('load-input');
const generationControls = document.getElementById('generation-controls');
const styleOptions = document.getElementById('style-options');
const openStoryboardTabBtn = document.getElementById('open-storyboard-tab-btn');
const rawLlmSection = document.querySelector('.raw-llm-section');
const storyboardVideo = document.getElementById('storyboard-video');

let rawLlmResponse = '';
let subjectImageBase64 = '';

let selectedScenes = [];
let currentSceneIndex = 0;

// Event listener for image selection/deselection
scenesDiv.addEventListener('change', (e) => {
    if (e.target.type === 'radio' && e.target.name.startsWith('scene-image-')) {
        const sceneKey = e.target.dataset.sceneKey;
        const sceneElement = e.target.closest('.scene');
        const humanText = sceneElement.querySelector('p').textContent;
        const title = sceneElement.querySelector('h3').textContent;
        const imageUrl = e.target.nextElementSibling.querySelector('img').src;

        // Remove existing entry for this sceneKey if it exists
        selectedScenes = selectedScenes.filter(scene => scene.sceneKey !== sceneKey);

        // Add the newly selected image
        selectedScenes.push({
            sceneKey,
            title,
            humanText,
            imageUrl
        });
        // Sort selectedScenes by their original order in the DOM
        selectedScenes.sort((a, b) => {
            const aIndex = Array.from(scenesDiv.children).indexOf(document.querySelector(`[data-scene-key="${a.sceneKey}"]`).closest('.scene'));
            const bIndex = Array.from(scenesDiv.children).indexOf(document.querySelector(`[data-scene-key="${b.sceneKey}"]`).closest('.scene'));
            return aIndex - bIndex;
        });
    }
});

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
                <button class="generate-img-btn btn-base btn-green" data-scene-key="${sceneKey}">Generate Image</button>
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
    popupVideo.pause();
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

async function downloadVideo(base64, filename) {
    const blob = await (await fetch(base64)).blob();
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
                <input type="radio" id="${imageId}" name="scene-image-${sceneKey}" data-scene-key="${sceneKey}" checked>
                <label for="${imageId}"><img src="${newImageUrl}" class="thumbnail"></label>
            `;
            sceneImagesContainer.appendChild(imageContainer);

            // Add event listener for deselection
            const newRadio = imageContainer.querySelector(`#${imageId}`);
            newRadio.addEventListener('click', (event) => {
                if (newRadio.checked && newRadio.dataset.alreadyChecked) {
                    newRadio.checked = false;
                    delete newRadio.dataset.alreadyChecked;
                    // Remove this scene from selectedScenes if deselected
                    selectedScenes = selectedScenes.filter(scene => scene.sceneKey !== sceneKey);
                } else if (newRadio.checked) {
                    newRadio.dataset.alreadyChecked = 'true';
                }
            });

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
        const sceneKey = sceneElement.querySelector('.generate-img-btn').dataset.sceneKey;
        const sceneNumber = sceneElement.dataset.sceneNumber;
        const sceneTitle = sceneElement.dataset.sceneTitle;

        popupImg.src = e.target.src;
        popupImg.style.display = 'block';
        popupVideo.style.display = 'none';
        popupVideo.src = '';

        downloadBtn.onclick = () => downloadImage(popupImg.src, `scene${sceneNumber}-${sceneTitle.replace(/\s+/g, '-').toLowerCase()}.png`);
        
        imagePopup.dataset.sceneKey = sceneKey;
        imagePopup.style.display = 'flex';

        playVideoBtn.disabled = true;
        downloadVideoBtn.disabled = true;
        generateVideoBtn.disabled = false;

        const sceneData = JSON.parse(rawLlmResponse).scenes[sceneKey];
        if (sceneData.video_base64) {
            playVideoBtn.disabled = false;
            downloadVideoBtn.disabled = false;
        }
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



// Event listener for image selection/deselection
scenesDiv.addEventListener('change', (e) => {
    if (e.target.type === 'radio' && e.target.name.startsWith('scene-image-')) {
        const sceneKey = e.target.dataset.sceneKey;
        const sceneElement = e.target.closest('.scene');
        const humanText = sceneElement.querySelector('p').textContent;
        const title = sceneElement.querySelector('h3').textContent;
        const imageUrl = e.target.nextElementSibling.querySelector('img').src;

        // Remove existing entry for this sceneKey if it exists
        selectedScenes = selectedScenes.filter(scene => scene.sceneKey !== sceneKey);

        // Add the newly selected image
        selectedScenes.push({
            sceneKey,
            title,
            humanText,
            imageUrl
        });
        // Sort selectedScenes by their original order in the DOM
        selectedScenes.sort((a, b) => {
            const aIndex = Array.from(scenesDiv.children).indexOf(document.querySelector(`[data-scene-key="${a.sceneKey}"]`).closest('.scene'));
            const bIndex = Array.from(scenesDiv.children).indexOf(document.querySelector(`[data-scene-key="${b.sceneKey}"]`).closest('.scene'));
            return aIndex - bIndex;
        });
    }
});

function generateStoryboard() {
    const scenesWithSelectedImages = [];
    document.querySelectorAll('.scene').forEach(sceneElement => {
        const selectedRadio = sceneElement.querySelector('input[type="radio"]:checked');
        if (selectedRadio) {
            const sceneKey = selectedRadio.dataset.sceneKey;
            const title = sceneElement.querySelector('h3').textContent;
            const humanText = sceneElement.querySelector('p').textContent;
            const imageUrl = selectedRadio.nextElementSibling.querySelector('img').src;
            const sceneData = JSON.parse(rawLlmResponse).scenes[sceneKey];
            const video_base64 = sceneData.video_base64 || null;

            scenesWithSelectedImages.push({
                sceneKey,
                title,
                humanText,
                imageUrl,
                video_base64
            });
        }
    });

    selectedScenes = scenesWithSelectedImages;

    if (selectedScenes.length > 0) {
        currentSceneIndex = 0;
        displayCurrentStoryboardScene();
        return true;
    } else {
        alert('Please select at least one image to generate a storyboard.');
        return false;
    }
}

generateStoryboardBtn.addEventListener('click', () => {
    if (generateStoryboard()) {
        storyboardOverlay.style.display = 'flex';
    }
});

closeStoryboardBtn.addEventListener('click', () => {
    storyboardOverlay.style.display = 'none';
});

prevSceneBtn.addEventListener('click', () => {
    currentSceneIndex = (currentSceneIndex - 1 + selectedScenes.length) % selectedScenes.length;
    displayCurrentStoryboardScene();
});

nextSceneBtn.addEventListener('click', () => {
    currentSceneIndex = (currentSceneIndex + 1) % selectedScenes.length;
    displayCurrentStoryboardScene();
});

function displayCurrentStoryboardScene() {
    if (selectedScenes.length > 0) {
        const currentScene = selectedScenes[currentSceneIndex];
        storyboardTitle.textContent = currentScene.title;
        storyboardHumanText.textContent = currentScene.humanText;
        sceneCounter.textContent = `${currentSceneIndex + 1} / ${selectedScenes.length}`;

        if (currentScene.video_base64) {
            storyboardImage.style.display = 'none';
            storyboardVideo.style.display = 'block';
            storyboardVideo.src = currentScene.video_base64;
            storyboardVideo.play();
        } else {
            storyboardVideo.style.display = 'none';
            storyboardImage.style.display = 'block';
            storyboardImage.src = currentScene.imageUrl;
            storyboardVideo.pause();
        }
    }
}

saveSessionBtn.addEventListener('click', async () => {
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
        let selectedImage = null;
        for (const imageElement of imageElements) {
            const radioInput = imageElement.closest('label').previousElementSibling;
            if (radioInput && radioInput.checked) {
                selectedImage = await getBase64Image(imageElement);
            }
            imagePromises.push(getBase64Image(imageElement));
        }
        const sceneData = JSON.parse(rawLlmResponse).scenes[sceneKey];
        if (sceneData.video_base64) {
            scenes[sceneKey].video_base64 = sceneData.video_base64;
        }

        promises.push(Promise.all(imagePromises).then(images => {
            scenes[sceneKey].images = images;
            scenes[sceneKey].selectedImage = selectedImage; // Store selected image
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
            contentDiv.classList.remove('show');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.textContent = 'Show';
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
                    const imageId = `image-${sceneKey.replace(/\s+/g, '-')}-${Date.now()}`;

                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('scene-image-item');
                    imageContainer.innerHTML = `
                        <input type="radio" id="${imageId}" name="scene-image-${sceneKey}" data-scene-key="${sceneKey}" ${imageBase64 === data.scenes[sceneKey].selectedImage ? 'checked' : ''}>
                        <label for="${imageId}"><img src="${imageBase64}" class="thumbnail"></label>
                    `;
                    sceneImagesContainer.appendChild(imageContainer);

                    // Add event listener for deselection on loaded images
                    const loadedRadio = imageContainer.querySelector(`#${imageId}`);
                    loadedRadio.addEventListener('click', (event) => {
                        if (loadedRadio.checked && loadedRadio.dataset.alreadyChecked) {
                            loadedRadio.checked = false;
                            delete loadedRadio.dataset.alreadyChecked;
                            // Remove this scene from selectedScenes if deselected
                            selectedScenes = selectedScenes.filter(scene => scene.sceneKey !== sceneKey);
                        } else if (loadedRadio.checked) {
                            loadedRadio.dataset.alreadyChecked = 'true';
                        }
                    });
                }
                if (data.scenes[sceneKey].video_base64) {
                    const sceneData = JSON.parse(rawLlmResponse).scenes[sceneKey];
                    sceneData.video_base64 = data.scenes[sceneKey].video_base64;
                    rawLlmResponse = JSON.stringify(JSON.parse(rawLlmResponse), null, 2);
                }
            }

            showSections();
            resultsSection.style.display = 'block';
        };
        reader.readAsText(file);
    }
});

openStoryboardTabBtn.addEventListener('click', async () => {
    if (generateStoryboard()) {
        await saveStoryboardToDB(selectedScenes, currentSceneIndex);
        window.open('storyboard.html', '_blank');
    }
});

async function saveStoryboardToDB(scenes, index) {
    const db = await openDB();
    const tx = db.transaction('storyboard', 'readwrite');
    const store = tx.objectStore('storyboard');
    await store.put({ id: 'scenes', data: scenes });
    await store.put({ id: 'index', data: index });
    await tx.done;
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('storyboardDB', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('storyboard', { keyPath: 'id' });
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

generateVideoBtn.addEventListener('click', async () => {
    const sceneKey = imagePopup.dataset.sceneKey;
    const scenesData = JSON.parse(rawLlmResponse);
    const videoPrompt = scenesData.scenes[sceneKey].video_prompt;
    const imageUrl = popupImg.src;

    generateVideoBtn.disabled = true;
    progressBarContainer.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 600);

    try {
        const response = await fetch('/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: videoPrompt,
                image_url: imageUrl,
            })
        });
        const data = await response.json();
        const videoUrl = data.video.url;

        const videoResponse = await fetch(videoUrl);
        const videoBlob = await videoResponse.blob();
        const reader = new FileReader();
        reader.readAsDataURL(videoBlob);
        reader.onloadend = () => {
            const base64data = reader.result;
            scenesData.scenes[sceneKey].video_base64 = base64data;
            rawLlmResponse = JSON.stringify(scenesData, null, 2);

            popupVideo.src = base64data;
            playVideoBtn.disabled = false;
            downloadVideoBtn.disabled = false;
            progressBarContainer.style.display = 'none';
            progressBar.style.width = '0%';
        };
    } catch (error) {
        console.error('Error generating video:', error);
        clearInterval(interval);
        progressBarContainer.style.display = 'none';
        progressBar.style.width = '0%';
        generateVideoBtn.disabled = false;
    }
});

playVideoBtn.addEventListener('click', () => {
    const sceneKey = imagePopup.dataset.sceneKey;
    const sceneData = JSON.parse(rawLlmResponse).scenes[sceneKey];
    popupVideo.src = sceneData.video_base64;
    popupImg.style.display = 'none';
    popupVideo.style.display = 'block';
    popupVideo.play();
});

downloadVideoBtn.addEventListener('click', () => {
    const sceneKey = imagePopup.dataset.sceneKey;
    const sceneData = JSON.parse(rawLlmResponse).scenes[sceneKey];
    const sceneElement = document.querySelector(`[data-scene-key="${sceneKey}"]`).closest('.scene');
    const sceneNumber = sceneElement.dataset.sceneNumber;
    const sceneTitle = sceneElement.dataset.sceneTitle;
    const filename = `scene${sceneNumber}-${sceneTitle.replace(/\s+/g, '-').toLowerCase()}.mp4`;
    downloadVideo(sceneData.video_base64, filename);
});
