# Biography Scene Generator User Manual

## 1. Introduction

The Biography Scene Generator is a web-based application designed to help users visualize biographical text by breaking it down into distinct scenes and generating corresponding images. It leverages large language models (LLMs) to interpret text and image generation capabilities to create visual representations, allowing for a unique storytelling experience.

**Key Features at a Glance:**
*   Input biography text from a URL or local file.
*   Optionally provide a reference image for character consistency.
*   Generate scene ideas from the biography using an LLM.
*   Generate multiple image options for each scene.
*   Apply a "Ghibli style" to generated images.
*   Select preferred images for each scene to build a cohesive storyboard.
*   View the complete storyboard in an interactive overlay or a new browser tab.
*   Save and load your entire session, including biography, LLM responses, and selected images.
*   Inspect the raw LLM response for detailed insights.

## 2. Getting Started

To use the Biography Scene Generator, simply open the `index.html` file in your web browser. No installation or complex setup is required beyond having a modern web browser.

## 3. Core Workflow

The typical workflow for using the Biography Scene Generator involves a few simple steps:

1.  **Provide Biography Text:** Start by inputting the biography text, either by fetching it from a public URL or by uploading a local `.txt` file.
2.  **(Optional) Add a Reference Image:** If you want the generated images to feature a specific character or subject, upload a reference image.
3.  **Generate Scene Ideas:** Click the "Generate Scene Ideas" button. The application will process the biography and present a list of potential scenes.
4.  **Generate and Select Images:** For each generated scene, you can click "Generate Image" to create visual representations. You can generate multiple images and select your favorite using the radio buttons. Optionally, check the "Ghibli Style" box before generating images to influence the artistic style.
5.  **View Storyboard:** Once you have selected images for your desired scenes, click either "Generate Storyboard" (to view in an overlay) or "Open Storyboard in New Tab" (to view in a separate browser tab).
6.  **Save/Load Session:** At any point, you can save your progress to a JSON file or load a previously saved session.

## 4. Features in Detail

### 4.1. Input Biography

This section allows you to provide the biographical content for scene generation.

*   **Fetch from URL:**
    *   **Description:** Input a public web URL (e.g., a Wikipedia page, an online article) containing the biography text. The application will attempt to extract the main text content.
    *   **Usage:**
        1.  Enter the full URL into the text field labeled "Enter a public URL".
        2.  Click the "Fetch" button.
    *   **Example:** `https://en.wikipedia.org/wiki/Marie_Curie`
*   **Upload a Text File:**
    *   **Description:** Upload a local plain text file (`.txt`) containing the biography.
    *   **Usage:**
        1.  Click the "Choose File" button next to "Or upload a text file".
        2.  Select your `.txt` file from your computer's file system.
*   **Reference Image (Optional):**
    *   **Description:** Provide an image of the subject of the biography. This image can be used by the image generation model to maintain consistency in character appearance across different scenes.
    *   **Usage:**
        1.  Click the "Choose File" button next to "Reference Image (Optional)".
        2.  Select an image file (e.g., `.jpg`, `.png`) from your computer. A preview of the selected image will appear.

### 4.2. Generate Scene Ideas

This is where the LLM processes your biography.

*   **"Generate Scene Ideas" Button:**
    *   **Description:** After providing biography text, click this button to send the text to the LLM, which will analyze it and propose a series of distinct scenes.
    *   **Usage:** Click the button. A "Generating..." indicator will appear while processing.
*   **Displaying Scenes:**
    *   Once generated, scenes will appear below the button. Each scene includes:
        *   **Title:** A concise title for the scene.
        *   **Human Text:** A brief description of the scene's content.
        *   **"Generate Image" Button:** A button specific to that scene to create visual representations.

### 4.3. Styling Options

*   **Ghibli Style Checkbox:**
    *   **Description:** When checked, this option instructs the image generation model to produce images in a style reminiscent of Studio Ghibli animations.
    *   **Usage:** Check or uncheck this box *before* clicking any "Generate Image" button.

### 4.4. Image Generation

This section allows you to create and select images for your scenes.

*   **"Generate Image" Button:**
    *   **Description:** Click this button next to any scene to generate one or more image options for that specific scene.
    *   **Usage:** Click the button. A "Generating..." indicator will appear.
*   **Image Selection (Radio Buttons):**
    *   **Description:** After images are generated for a scene, they will appear with radio buttons. You can generate multiple images for a single scene. Select your preferred image for the storyboard by clicking its corresponding radio button.
    *   **Usage:** Click the radio button next to the image you wish to select.
*   **Image Preview Popup:**
    *   **Description:** Click on any generated image thumbnail to open a larger preview in a popup window.
    *   **Usage:** Click on a thumbnail.
    *   **Download Image Button:**
        *   **Description:** Within the image preview popup, this button allows you to download the currently displayed image to your computer.
        *   **Usage:** Click the "Download Image" button in the popup.

### 4.5. Storyboard

Once you have selected images for your scenes, you can view the complete storyboard.

*   **"Generate Storyboard" Button:**
    *   **Description:** Displays the selected scenes and their images in an interactive overlay on the current page.
    *   **Usage:** Click the button.
*   **"Open Storyboard in New Tab" Button:**
    *   **Description:** Opens the selected scenes and their images in a new, dedicated browser tab. This is useful for a larger, more focused view.
    *   **Usage:** Click the button.
*   **Storyboard Navigation:**
    *   **Description:** Within the storyboard view (either overlay or new tab), "Previous" and "Next" buttons allow you to navigate through your selected scenes.
    *   **Usage:** Click the "&lt; Previous" or "Next &gt;" buttons.
*   **Scene Counter:**
    *   **Description:** Displays the current scene number and the total number of scenes in your storyboard (e.g., "1 / 5").

### 4.6. Session Management

*   **"Save Session" Button:**
    *   **Description:** Downloads a JSON file containing all your current work: the biography text, the raw LLM response, and all generated and selected images (encoded as base64). This allows you to resume your work later.
    *   **Usage:** Click the "Save Session" button. Your browser will prompt you to save a file named `biography_session.json`.
*   **"Load Session" Button:**
    *   **Description:** Uploads a previously saved `biography_session.json` file to restore your work.
    *   **Usage:** Click the "Load Session" button, then select your saved `biography_session.json` file.

### 4.7. Raw LLM Response

*   **"Raw LLM Response" Section:**
    *   **Description:** This collapsible section displays the raw JSON output received from the LLM after generating scene ideas. This is primarily for debugging or advanced users who want to see the exact data structure.
    *   **Usage:** Click the "Show" or "Hide" toggle button next to "Raw LLM Response" to expand or collapse the section.

## 5. Troubleshooting

*   **"Open Storyboard in New Tab" Button Color:** If the "Open Storyboard in New Tab" button appears blue instead of green, it might be a browser caching issue. Try clearing your browser's cache and reloading the page.
*   **Blank Storyboard in New Tab:** If the new storyboard tab opens but remains blank, ensure you have selected at least one image for a scene before opening the storyboard. Also, try clearing your browser's cache.
*   **Errors in Browser Console:** If you encounter unexpected behavior, open your browser's developer console (usually by pressing F12 or right-clicking and selecting "Inspect" then navigating to the "Console" tab). Error messages here can provide valuable clues.
*   **Image Generation Issues:** If image generation fails, ensure you have a stable internet connection and that the backend server (if applicable) is running correctly.
*   **"Generating..." State Stuck:** If a button remains in a "Generating..." state indefinitely, there might be a network issue or a problem with the backend service. Check your browser's network tab in the developer console for failed requests.