import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import express from "express";

const app = express();
const port = process.env.NODE_ENV === "production" ? process.env.PORT || 3000 : 3001;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      config: {
        systemInstruction:
          "You are Bara AI, an AI assistant. You speak Indonesian clearly and concisely. Be helpful and polite.",
      },
    });

    // In @google/genai, we cannot pre-load history easily via `ai.chats.create` config in the same way as legacy.
    // Wait, the SDK `ai.chats.create` supports passing history?
    // Let me check if `history` is supported in `chats.create`.
    // If not, I can just build the chat contents manually and use `ai.models.generateContent()`.
    // Actually, `ai.models.generateContent` with a custom `contents` array is much more reliable.

    let contents = [];
    if (history && Array.isArray(history)) {
      contents = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
      config: {
        systemInstruction:
          "You are Bara AI, an AI assistant. You communicate clearly and concisely in Indonesian.",
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response." });
  }
});

// For production, serve the Vite build
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
