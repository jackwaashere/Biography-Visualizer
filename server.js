require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fal = require('@fal-ai/serverless-client');
const axios = require('axios');

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

async function urlToGenerativePart(url, mimeType) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType
        },
    };
}

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
    let { prompt, image_url } = req.body;

    console.log('--- Fal.ai Image Generation Request ---');
    console.log('Prompt:', prompt);
    if (image_url) {
        console.log('Image URL included:', image_url);
        if (image_url.startsWith('http')) {
            try {
                const response = await axios.get(image_url, { responseType: 'arraybuffer' });
                image_url = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
                console.log('Image URL converted to base64 (first 50 chars):', image_url.substring(0, 50) + '...');
            } catch (error) {
                console.error('Error fetching or converting image:', error);
                return res.status(500).json({ error: 'Error fetching or converting image' });
            }
        } else {
            console.log('Image URL is a base64 string (first 50 chars):', image_url.substring(0, 50) + '...');
        }
    } else {
        console.log('No reference image included.');
    }
    console.log('------------------------------------');

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

app.post('/generate-video', async (req, res) => {
    const { prompt, image_url } = req.body;

    console.log('--- Fal.ai Video Generation Request ---');
    console.log('Prompt:', prompt);
    console.log('Image URL (first 50 chars):', image_url.substring(0, 50) + '...');
    console.log('------------------------------------');

    try {
        const result = await fal.subscribe('fal-ai/kling-video/v2.1/standard/image-to-video', {
            input: {
                prompt,
                image_url,
                video_duration: '5_seconds'
            },
            logs: true,
            onQueueUpdate: (update) => {
                console.log('queue update', update);
            },
        });
        res.json({ video: result.video });
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: 'Error generating video' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
