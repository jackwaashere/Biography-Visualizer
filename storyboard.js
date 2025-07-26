let selectedScenes = [];
let currentSceneIndex = 0;

const storyboardTitle = document.getElementById('storyboard-title');
const storyboardImage = document.getElementById('storyboard-image');
const storyboardVideo = document.getElementById('storyboard-video');
const storyboardHumanText = document.getElementById('storyboard-human-text');
const sceneCounter = document.getElementById('scene-counter');
const prevSceneBtn = document.getElementById('prev-scene-btn');
const nextSceneBtn = document.getElementById('next-scene-btn');
const closeStoryboardBtn = document.querySelector('.close-storyboard-btn');
const storyboardOverlay = document.getElementById('storyboard-overlay');

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

prevSceneBtn.addEventListener('click', () => {
    currentSceneIndex = (currentSceneIndex - 1 + selectedScenes.length) % selectedScenes.length;
    displayCurrentStoryboardScene();
});

nextSceneBtn.addEventListener('click', () => {
    currentSceneIndex = (currentSceneIndex + 1) % selectedScenes.length;
    displayCurrentStoryboardScene();
});

closeStoryboardBtn.addEventListener('click', () => {
    window.close(); // Close the new tab
});

// Initialize storyboard with data passed from the opener window
window.addEventListener('DOMContentLoaded', async () => {
    const db = await openDB();
    const tx = db.transaction('storyboard', 'readonly');
    const store = tx.objectStore('storyboard');
    const scenesRequest = store.get('scenes');
    const indexRequest = store.get('index');

    scenesRequest.onsuccess = () => {
        selectedScenes = scenesRequest.result.data;
        indexRequest.onsuccess = () => {
            currentSceneIndex = indexRequest.result.data;
            displayCurrentStoryboardScene();
            storyboardOverlay.style.display = 'flex'; // Ensure overlay is visible
        };
    };
});

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