
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PredictionData, SellingRecommendation, RiskLevel, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMarketAnalysis = async (
  query: string,
  imageBase64?: string,
  location: string = "Telangana"
): Promise<PredictionData> => {
  const parts: any[] = [
    {
      text: `
        Act as a professional Indian Agricultural Market Analyst specializing in the Telangana/Hyderabad region.
        USER QUERY: "${query}"
        LOCATION: ${location}

        INSTRUCTIONS:
        1. LANGUAGE DETECTION: Respond in the SAME language as the query (Telugu or English).
        2. LIVE SEARCH: Use Google Search to find real prices in Telangana Mandis.
        3. QUALITY: Analyze the image if provided (Grade A, B, or C).
        4. JSON ONLY RESPONSE.
      `
    }
  ];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1]
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          crop: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          currentPrice: { type: Type.NUMBER },
          predictedPrice: { type: Type.NUMBER },
          recommendation: { type: Type.STRING, enum: ["SELL_NOW", "WAIT"] },
          risk: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          explanation: { type: Type.STRING },
          explanationAudioScript: { type: Type.STRING },
          daysToWait: { type: Type.NUMBER },
          profitDelta: { type: Type.NUMBER },
          qualityGrade: { type: Type.STRING, nullable: true },
          qualityAssessment: { type: Type.STRING, nullable: true },
          trendData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                price: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["crop", "currentPrice", "predictedPrice", "recommendation", "risk", "explanation", "explanationAudioScript", "trendData"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");

  const prediction = JSON.parse(text) as PredictionData;
  
  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }
  prediction.sources = sources;

  return prediction;
};

export const generateVoiceResponse = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};
