import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// We use the lighter, faster model for real-time game dialogue
const MODEL_NAME = 'gemini-2.5-flash';

export const generateDialogue = async (
  characterName: string,
  characterContext: string,
  playerAction: string,
  history: { speaker: string; text: string }[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I cannot speak... (Missing API Key)";
  }

  try {
    const historyText = history
      .slice(-4) // Keep context short
      .map(h => `${h.speaker}: ${h.text}`)
      .join('\n');

    const prompt = `
      Current conversation history:
      ${historyText}

      Player Input: "${playerAction}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: `You are an NPC named ${characterName} in a retro adventure game. 
        Context: ${characterContext}. 
        Keep your response short (max 2 sentences), immersive, and in-character. 
        Do not use markdown. Do not include quotes.`,
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The spirits are silent today... (API Error)";
  }
};