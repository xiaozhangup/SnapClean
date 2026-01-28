
import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from "../utils/imageHelpers";

export const editProductImage = async (
  imageFile: File | Blob,
  prompt: string
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const base64Data = await fileToBase64(imageFile);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: (imageFile as File).type || 'image/png',
            },
          },
          {
            text: `You are a professional product photo editor. Please perform the following edit on this image: "${prompt}". Ensure the product remains high-quality and the output is photorealistic.`,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response from AI model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
