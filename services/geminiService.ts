
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PredictionData, SellingRecommendation, RiskLevel, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Intelligent multimodal analyst for market trends and quality.
 */
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
        1. LANGUAGE DETECTION: Detect if the query is in Telugu or English. Respond in the SAME language for both 'explanation' and 'explanationAudioScript'.
        2. LIVE SEARCH: Use Google Search to find ACTUAL TODAY'S prices for the mentioned crop in Telangana Mandis.
        3. MULTIMODAL QUALITY: If an image is provided, analyze the crop quality (A=Excellent, B=Good, C=Average).
        4. PREDICTION: Forecast the price for the next 7 days. 
           - Suggest WAIT if a price increase > 10% is expected.
           - Suggest SELL_NOW if prices are peaking or likely to drop.

        RETURN JSON:
        {
          "crop": "Name of crop",
          "quantity": 1,
          "unit": "kg/quintal/bags",
          "currentPrice": number,
          "predictedPrice": number,
          "recommendation": "SELL_NOW" | "WAIT",
          "risk": "LOW" | "MEDIUM" | "HIGH",
          "explanation": "Professional analysis in user's language.",
          "explanationAudioScript": "A warm, friendly version for audio playback in user's language.",
          "daysToWait": number,
          "profitDelta": number,
          "qualityGrade": "A" | "B" | "C" | null,
          "qualityAssessment": "Detailed visual analysis summary" | null,
          "trendData": [{"day": "Mon", "price": number}, ...]
        }
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

  const prediction = JSON.parse(response.text) as PredictionData;
  
  // Extract grounding sources
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
