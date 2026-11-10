import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Text Polishing & Quick Transformation API
app.post('/api/gemini/polish', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, action } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text parameter is required' });
      return;
    }

    const ai = getAiClient();

    let instruction = 'Make this text clear, elegant, and grammatically flawless.';
    if (action === 'shorten') {
      instruction = 'Condense and summarize this into a punchy, ultra-concise sentence or short paragraph.';
    } else if (action === 'formal') {
      instruction = 'Rewrite this in a professional, courteous, and polished business tone.';
    } else if (action === 'casual') {
      instruction = 'Rewrite this in a friendly, approachable, and engaging tone.';
    } else if (action === 'translate_en') {
      instruction = 'Translate this accurately into natural, fluent English.';
    } else if (action === 'translate_id') {
      instruction = 'Translate this accurately into natural, fluent Bahasa Indonesia.';
    } else if (action === 'bullet_points') {
      instruction = 'Format and structure the core ideas of this text into clean, scannable bullet points.';
    }

    const prompt = `System directive: You are an expert copy-paste snippet polisher. Output ONLY the polished/transformed text directly without commentary, quotation marks, or explanations.\n\nTask: ${instruction}\n\nOriginal Text:\n"""\n${text}\n"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const resultText = response.text ? response.text.trim() : '';
    res.json({ result: resultText });
  } catch (err: any) {
    console.error('Error in /api/gemini/polish:', err);
    res.status(500).json({ error: err.message || 'Failed to polish text' });
  }
});

// 2. Multi-turn Chat Assistant API
app.post('/api/gemini/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, systemInstruction, model } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const ai = getAiClient();
    const targetModel = model || 'gemini-3.8-flash';

    // Format contents for Gemini API
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || 
          'You are QuickClip AI, an elite copywriting and note assistant. You help the user craft, refine, organize, and expand sentences, canned replies, email templates, and notes ready for instant 1-click copying. Always keep your primary suggestions concise, formatted cleanly, and ready to paste.',
      },
    });

    res.json({ reply: response.text ? response.text.trim() : '' });
  } catch (err: any) {
    console.error('Error in /api/gemini/chat:', err);
    res.status(500).json({ error: err.message || 'Chat generation failed' });
  }
});

// 3. Text to Speech API (gemini-3.8-flash-tts)
app.post('/api/gemini/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text parameter is required' });
      return;
    }

    const ai = getAiClient();
    const voiceName = voice || 'Kore'; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // Protect token boundaries for instant playback
              speechMetadata: {
                style: 'Clear, articulate, natural speaker with modern cadence',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    let base64Audio = '';
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Audio = part.inlineData.data;
        break;
      }
    }

    if (!base64Audio) {
      res.status(500).json({ error: 'No audio data generated by Gemini TTS' });
      return;
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/tts:', err);
    res.status(500).json({ error: err.message || 'Text-to-speech generation failed' });
  }
});

// 4. High-Quality Image Generation API (gemini-3-pro-image-preview)
app.post('/api/gemini/generate-image', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, size } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const ai = getAiClient();
    // Validate size to 1K, 2K, or 4K
    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(size) ? size : '1K';

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `High quality graphic illustration card cover: ${prompt}. Clean minimalist modern aesthetic, dark slate background, elegant subtle rim lighting, professional digital art, crisp geometry.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: chosenSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    let imageUrl = '';
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      res.status(500).json({ error: 'No image data returned from model' });
      return;
    }

    res.json({ imageUrl, size: chosenSize });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-image:', err);
    res.status(500).json({ error: err.message || 'Image generation failed' });
  }
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuickClip Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
