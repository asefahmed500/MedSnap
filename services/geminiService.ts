import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "../types";

// Initialize Gemini Client
// IMPORTANT: In a real production app, this should be proxied through a backend
// to avoid exposing the API key. For this demo architecture, we use client-side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDocument = async (
  base64Image: string,
  targetLanguage: Language
): Promise<AnalysisResult> => {
  try {
    // Strip the data:image/jpeg;base64, prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `
      You are MedSnap, an expert medical translator and assistant. 
      Analyze the provided medical document image.
      
      Target Language: ${targetLanguage.name} (${targetLanguage.nativeName}).

      Task:
      1. Identify the document type (Prescription, Lab Result, Discharge Instructions, etc.).
      2. Translate the core content into the Target Language. Use simple, clear language suitable for a layperson.
      3. Identify any EMERGENCY instructions or critical warnings (e.g., "Call 911", "Severe side effects").
      4. Create a specialized audio summary script that explains the document simply in the Target Language.
      5. Identify specific regions in the image to highlight (Medication Names, Dosages, Warnings, Dates).
      6. Create 3 simple Yes/No questions in the Target Language to verify the user understands the key instructions.

      Return the response in strictly valid JSON format matching the schema provided.
      For the highlights, estimate the bounding boxes [ymin, xmin, ymax, xmax] on a scale of 0 to 1000.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short title for the document in the target language" },
            documentType: { 
              type: Type.STRING, 
              enum: ["prescription", "lab_result", "discharge", "instruction", "unknown"] 
            },
            translatedContent: { type: Type.STRING, description: "Full translation in Markdown format" },
            summary: { type: Type.STRING, description: "A conversational summary script for TTS" },
            isEmergency: { type: Type.BOOLEAN },
            emergencyMessage: { type: Type.STRING, description: "Translating warning message if emergency" },
            highlights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  box_2d: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER },
                    description: "[ymin, xmin, ymax, xmax] 0-1000 scale"
                  },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["critical", "medication", "date", "normal"] },
                  description: { type: Type.STRING }
                }
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "documentType", "translatedContent", "summary", "isEmergency", "highlights", "quiz"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze document. Please ensure the image is clear and try again.");
  }
};
