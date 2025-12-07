
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, Language, LanguageCode } from "../types";
import { isModelDownloaded } from "./offlineService";
import { SUPPORTED_LANGUAGES } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_OFFLINE_RESULT: AnalysisResult = {
  title: "Offline Analysis (Limited Mode)",
  documentType: "unknown",
  translatedContent: "### Offline Mode Active\n\n**Note:** You are currently offline. This is a basic analysis based on on-device capabilities.\n\nWe have detected a medical document. Please reconnect to the internet for a full analysis including safety checks, detailed translation, and visual highlighting.\n\n**Extracted Content:**\n\n*(Simulation)* Patient instructions and medication details would appear here extracted via local OCR.",
  summary: "You are currently offline. This is a limited analysis. Please connect to the internet for full details.",
  isEmergency: false,
  highlights: [
    {
        box_2d: [100, 100, 300, 900],
        label: "Document Content",
        type: "normal",
        description: "Text region detected",
        importanceExplanation: "Offline detection region."
    }
  ],
  quiz: [
    { 
      question: "Is the app in offline mode?", 
      answer: true, 
      explanation: "Yes, the app is using the downloaded language model for basic processing." 
    },
    {
      question: "Can I get full details offline?",
      answer: false,
      explanation: "No, full safety checks and precise translation require an internet connection."
    }
  ]
};

export const analyzeDocument = async (
  base64Image: string,
  targetLanguage: Language
): Promise<AnalysisResult> => {
  // Check connectivity first
  if (!navigator.onLine) {
    if (isModelDownloaded(targetLanguage.code)) {
      console.log("Offline mode: using downloaded model");
      return {
        ...MOCK_OFFLINE_RESULT,
        timestamp: Date.now()
      };
    } else {
      throw new Error(`You are offline. Please download the ${targetLanguage.name} model for offline use.`);
    }
  }

  try {
    // Strip the data:image/jpeg;base64, prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `
      You are MedSnap, a certified medical translator and pharmacist. 
      Analyze the provided medical document image (prescription, lab result, discharge summary).
      
      Source Language: English (assumed, unless clearly otherwise).
      Target Language: ${targetLanguage.name} (${targetLanguage.nativeName}).

      Your goal is to provide a medically accurate translation that preserves all numbers, dates, and drug names exactly, while using a formal but simple tone suitable for low-literacy patients.

      Task:
      
      1. **CRITICAL SAFETY CHECK (Emergency Detection)**: 
         Scan the text for ANY life-threatening instructions or indicators.
         Triggers include but are not limited to:
         - "Call 911", "Go to ER", "Emergency Room", "Seek immediate care".
         - Critical symptoms: "Chest pain", "Shortness of breath", "Difficulty breathing", "Anaphylaxis".
         - Critical lab values explicitly flagged as "Critical", "Panic", or significantly out of safe range (e.g. Potassium > 6.0).
         
         If ANY of these are found:
         - Set 'isEmergency' to TRUE.
         - Set 'emergencyMessage' to a translated urgent warning banner (e.g., "¡EMERGENCIA! Vaya al hospital ahora mismo").

      2. **Medical Translation**: 
         Translate the full content into ${targetLanguage.name}.
         - **Style**: Formal but simple tone suitable for low-literacy patients.
         - **Accuracy**: Preserve all numbers, dates, and drug names EXACTLY. 
         - **Do NOT Translate**: Patient names, doctor names, facility names, or medication names (e.g. "Amoxicillin" remains "Amoxicillin").
         - **Structure**: Maintain original layout structure in Markdown as much as possible.

      3. **Ambiguity Check**:
         Identify up to 3 terms that might be ambiguous, culturally specific, or have multiple meanings in the target language.
         Provide the chosen translation, an alternative, and a brief explanation to help the patient avoid confusion.

      4. **Audio Script**: 
         Create a natural spoken explanation in ${targetLanguage.name}.
         - Structure: Short, clear sentences.
         - Example style: "This is a prescription for [Drug]. You must take [Amount] [Frequency] with food..."

      5. **Visual Highlights**: 
         Identify regions to highlight on the image:
         - **CRITICAL** (Red): The specific emergency warnings found in step 1, plus allergies/contraindications.
         - **MEDICATION** (Orange): Drug names, dosages, frequencies.
         - **DATE** (Yellow): Dates, times, durations.
         - **NORMAL** (Green): Normal lab results, standard headers.
         
         For each highlight, provide an 'importanceExplanation' in ${targetLanguage.name}.
         This should be a very short sentence (5-10 words) explaining simply WHY this info matters.

      6. **Verification (Quiz)**: 
         Create 2-3 simple Yes/No questions in ${targetLanguage.name} to verify the patient understands the key instructions.
         - **Simple**: Ensure language is very basic.
         - **Helpful**: If they answer wrong, the 'explanation' should gently correct them (e.g., "Actually, you should take it with food to avoid stomach pain.").

      Return the response in strictly valid JSON format matching the schema provided.
      For highlights, provide bounding boxes [ymin, xmin, ymax, xmax] on a scale of 0 to 1000.
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
            translatedContent: { type: Type.STRING, description: "Full medically accurate translation in Markdown" },
            summary: { type: Type.STRING, description: "Natural audio script in target language" },
            isEmergency: { type: Type.BOOLEAN, description: "True if life-threatening instructions are found" },
            emergencyMessage: { type: Type.STRING, description: "Translated urgent banner text (e.g. '¡EMERGENCIA! ...')" },
            ambiguities: {
              type: Type.ARRAY,
              description: "List of ambiguous terms clarified",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  translated: { type: Type.STRING },
                  alternative: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            },
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
                  description: { type: Type.STRING },
                  importanceExplanation: { type: Type.STRING, description: "Simple explanation of importance in target language" }
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

    const result = JSON.parse(text) as AnalysisResult;
    result.timestamp = Date.now();
    return result;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Fallback if offline-like error occurs
    if (isModelDownloaded(targetLanguage.code) && 
       (error.message?.includes('fetch') || error.message?.includes('network') || !navigator.onLine)) {
        return {
          ...MOCK_OFFLINE_RESULT,
          timestamp: Date.now()
        };
    }

    throw new Error("Failed to analyze document. Check your internet connection or try again.");
  }
};

export const identifyLanguageFromAudio = async (base64Audio: string): Promise<Language | null> => {
  try {
    const cleanBase64 = base64Audio.replace(/^data:audio\/(webm|mp3|wav|ogg|mpeg);base64,/, "");
    
    const prompt = `
      User just spoke their preferred language.
      Detect the language they requested and return ONLY this JSON:
      {"target_language_name": "Spanish", "target_language_code": "es"}
      
      The target_language_code must be one of: ${SUPPORTED_LANGUAGES.map(l => l.code).join(', ')}.
      If the language is not found or unclear, return null.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "audio/webm", // Common browser recording format
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
             target_language_name: { type: Type.STRING },
             target_language_code: { type: Type.STRING },
           },
           required: ["target_language_name", "target_language_code"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const result = JSON.parse(text);
    if (!result.target_language_code) return null;

    // Find the matching language object
    const match = SUPPORTED_LANGUAGES.find(l => l.code === result.target_language_code);
    return match || null;

  } catch (error) {
    console.error("Language ID Error:", error);
    return null;
  }
};

export const generateAudioFromScript = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Calm, middle-aged female voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;
    
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};
