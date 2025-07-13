let selectedScenes = [];
let currentSceneIndex = 0;

const storyboardTitle = document.getElementById('storyboard-title');
const storyboardImage = document.getElementById('storyboard-image');
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
        storyboardImage.src = currentScene.imageUrl;
        storyboardHumanText.textContent = currentScene.humanText;
        sceneCounter.textContent = `${currentSceneIndex + 1} / ${selectedScenes.length}`;
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
window.addEventListener('DOMContentLoaded', () => {
    const storedScenes = localStorage.getItem('storyboardSelectedScenes');
    const storedIndex = localStorage.getItem('storyboardCurrentSceneIndex');

    if (storedScenes && storedIndex !== null) {
        selectedScenes = JSON.parse(storedScenes);
        currentSceneIndex = parseInt(storedIndex);
        displayCurrentStoryboardScene();
        storyboardOverlay.style.display = 'flex'; // Ensure overlay is visible

        // Clear localStorage after use
        localStorage.removeItem('storyboardSelectedScenes');
        localStorage.removeItem('storyboardCurrentSceneIndex');
    }
});