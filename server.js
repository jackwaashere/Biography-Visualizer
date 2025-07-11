require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fal = require('@fal-ai/serverless-client');

if (process.env.FAL_API_KEY) {
    fal.config({
        credentials: process.env.FAL_API_KEY,
    });
}

const app = express();
const port = 3000;

// IMPORTANT: Replace with your actual Gemini API key
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

app.post('/generate-scenes', async (req, res) => {
    const { biographyText } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Read the biography below, create a few scene ideas to generate images for some events in his biography.

The scenes should have two parts.
(1) human friendly text to describe the image.
(2) concise prompt for an image model like Flux to generate high quality image
(3) concise prompt for a video model like Kling to generate high quality short 5s video

The image prompt should not contain the name of the person. The human friendly text may contain the name of the person.

The response is in JSON format. Example:
{
  "scene 1": {
    "title": "Early Career Hustle: Stand-Up and Sales",
    "human_text": "Jimmy O. Yang navigates the early days of his career, balancing the grind of performing stand-up comedy with the practical necessity of earning a living, perhaps by selling pre-owned vehicles. This scene captures his determination and resourcefulness as he builds his foundation in entertainment.",
    "prompt": "A young adult man, dressed in a sharp but slightly worn suit, stands in front of a neon-lit 'Used Cars' sign. He holds a microphone in one hand and gestures as if delivering a punchline, blending the worlds of a comedian and a salesman. Urban night setting, gritty realism, detailed.",
    "video_prompt": "A young adult man, dressed sharply, transitions smoothly from passionately performing stand-up comedy on a small, dimly lit stage, gesturing emphatically with a microphone, to then standing confidently beside a used car, gesturing towards it as if making a sales pitch. Both scenes are quick cuts, showing his dual life."
  },
}

Biography:
${biographyText}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = await response.text();
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex > -1 && endIndex > -1) {
            text = text.substring(startIndex, endIndex + 1);
        }
        res.json({ scenes: JSON.parse(text) });
    } catch (error) {
        console.error('Error generating scenes:', error);
        res.status(500).json({ error: 'Error generating scenes' });
    }
});

app.post('/generate-image', async (req, res) => {
    const { prompt, image_url } = req.body;

    try {
        const result = await fal.subscribe('fal-ai/flux-pro/kontext', {
            input: {
                prompt,
                image_url
            },
            logs: true,
            onQueueUpdate: (update) => {
                console.log('queue update', update);
            },
        });
        res.json({ imageUrl: result.images[0].url });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Error generating image' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
