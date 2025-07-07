const fetchBtn = document.getElementById('fetch-btn');
const urlInput = document.getElementById('url');
const fileInput = document.getElementById('file');
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

let rawLlmResponse = '';

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
            generateScenesBtn.textContent = 'Generate Ideas';
            generateScenesBtn.classList.remove('generating');
            generateScenesBtn.disabled = false;
            resultsSection.style.display = 'block';
        } catch (error) {
            console.error('Error generating scenes:', error);
            scenesDiv.innerHTML = '<p>Error generating scenes.</p>';
            generateScenesBtn.textContent = 'Generate Ideas';
            generateScenesBtn.classList.remove('generating');
            generateScenesBtn.disabled = false;
        }
    }
}

function displayScenes(scenes) {
    scenesDiv.innerHTML = '';
    for (const sceneKey in scenes) {
        const scene = scenes[sceneKey];
        const sceneElement = document.createElement('div');
        sceneElement.classList.add('scene');
        sceneElement.innerHTML = `
            <h3>${scene.title}</h3>
            <p><strong>Human-friendly text:</strong> ${scene.human_text}</p>
            <p><strong>Image prompt:</strong> <code>${scene.prompt}</code></p>
            <p><strong>Video prompt:</strong> <code>${scene.video_prompt}</code></p>
        `;
        scenesDiv.appendChild(sceneElement);
    }
}

function showSections() {
    contentSection.style.display = 'block';
    sceneSection.style.display = 'block';
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

generateScenesBtn.addEventListener('click', generateScenes);

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