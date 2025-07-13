# Biography Visualizer

This is a web application that allows users to input a biography, generate scene ideas using the Google Gemini API, and then generate corresponding images for those scenes using the Fal.ai (Flux Pro) image generation service.

## Features

*   **Biography Input:** Upload a text file or fetch content from a public URL to use as the biography.
*   **Reference Image:** Optionally upload a reference image to influence image generation.
*   **Scene Generation:** Utilizes the Google Gemini API to analyze the biography and suggest distinct scenes, complete with human-friendly descriptions, image prompts, and video prompts.
*   **Image Generation:** Integrates with Fal.ai's Flux Pro model to generate images based on the generated scene prompts.
*   **Ghibli Style:** Option to generate images in a Ghibli-inspired art style.
*   **Session Management:** Save and load the current session, including biography text, reference image, generated scenes, and images.
*   **Raw LLM Response:** View the raw JSON response from the Gemini API for debugging or detailed analysis.
*   **Image Download:** Download generated images directly from the application.

## Code Structure

*   `index.html`: The main HTML file that defines the structure of the web application's user interface.
*   `style.css`: Contains the CSS rules for styling the application, ensuring a clean and responsive design.
*   `script.js`: The frontend JavaScript file that handles user interactions, makes API calls to the backend, and dynamically updates the UI.
*   `server.js`: The backend Node.js server that exposes API endpoints for:
    *   `/generate-scenes`: Communicates with the Google Gemini API to generate scene ideas from the biography text.
    *   `/generate-image`: Communicates with the Fal.ai service to generate images based on provided prompts and optional reference images.
*   `package.json`: Defines the project's metadata and lists its Node.js dependencies.
*   `package-lock.json`: Records the exact versions of dependencies used, ensuring consistent installations.
*   `.env.local`: A file to store environment variables, specifically API keys for Google Gemini and Fal.ai.

## Running Guide

To set up and run the Biography Visualizer application, follow these steps:

### Prerequisites

*   **Node.js and npm:** Ensure you have Node.js (which includes npm) installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1.  **Clone the repository (if applicable) or navigate to the project directory:**
    ```bash
    cd biography_gui_project_1
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  **Obtain API Keys:**
    *   **Google Gemini API Key:** Get your API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **Fal.ai API Key:** Obtain your API key from the [Fal.ai website](https://www.fal.ai/).

2.  **Create `.env.local` file:**
    In the root directory of the project, create a file named `.env.local` and add your API keys in the following format:

    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    FAL_API_KEY=YOUR_FAL_API_KEY
    ```
    Replace `YOUR_GEMINI_API_KEY` and `YOUR_FAL_API_KEY` with your actual keys.

### Starting the Server

1.  **Run the Node.js server:**
    ```bash
    node server.js
    ```
    The server will start and listen on port `3000`. You should see a message like `Server listening at http://localhost:3000` in your console.

### Accessing the Application

1.  **Open your web browser:**
    Navigate to `http://localhost:3000` to access the Biography Visualizer application.

You can now input a biography, generate scenes, and create images!
