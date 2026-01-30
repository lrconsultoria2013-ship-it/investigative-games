import { GoogleGenerativeAI } from "@google/generative-ai";

export const sendMessageToGemini = async (
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    systemPrompt: string,
    userMessage: string,
    apiKey: string
) => {
    if (!apiKey) throw new Error("API Key is required");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
        history: history,
        systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
};
