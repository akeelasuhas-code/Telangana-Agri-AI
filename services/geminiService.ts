
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PredictionData, SellingRecommendation, RiskLevel, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Intelligent parser that extracts crop, quantity, unit (kg/quintal), and location.
 */
export const parseFarmerQuery = async (text: string): Promise<{ crop: string; quantity: number; unit: 'kg' | 'quintal' | 'bags'; location: string } | null> => {
  const prompt = `
    Extract the crop details from this farmer query: "${text}"
    
    RULES:
    - Identify the crop (e.g., Potato, Tomato, Paddy).
    - Identify the quantity and UNIT (kg, quintal, or bags). 
    - Default unit is 'quintal' if not specified, but check for 'kg' or 'bags'.
    - Default Location: 'Telangana' or 'Hyderabad' if not mentioned.
    
    Return ONLY JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING, enum: ['kg', 'quintal', 'bags'] },
            location: { type: Type.STRING }
          },
          required: ["crop", "quantity", "unit", "location"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Parsing error:", e);
    return null;
  }
};

export const getMarketAnalysis = async (
  crop: string,
  quantity: number,
  unit: 'kg' | 'quintal' | 'bags',
  location: string,
  imageBase64?: string
): Promise<PredictionData> => {
  const parts: any[] = [
    {
      text: `
        Act as a professional Indian Agricultural Market Analyst. 
        Focus on real-time market data for ${location}, Telangana.

        CROP: ${crop}
        QUANTITY: ${quantity} ${unit}

        CORE REQUIREMENTS:
        1. SEARCH: Use Google Search to find ACTUAL TODAY'S PRICE for ${crop} in major Telangana mandis (Warangal, Nizamabad, Hyderabad).
        2. REALISM: Ensure the price is realistic. (e.g., Potatoes in India are ~₹20-40/kg, Tomatoes ~₹30-60/kg). 
           Calculate the total value based on the farmer's ${quantity} ${unit}.
        3. QUALITY: ONLY assess quality if an image is provided. If imageBase64 is NOT present, return null for qualityGrade and qualityAssessment.
        4. ANALYSIS: Provide a 7-day trend. If prices are expected to rise due to low supply, suggest WAIT.

        RETURN JSON:
        {
          "crop": "${crop}",
          "quantity": ${quantity},
          "unit": "${unit}",
          "currentPrice": number (price per ${unit} in INR),
          "predictedPrice": number (predicted price per ${unit} in 5-7 days),
          "recommendation": "SELL_NOW" | "WAIT",
          "risk": "LOW" | "MEDIUM" | "HIGH",
          "explanation": "Brief English analysis including recent news/trends found.",
          "explanationTelugu": "Friendly Telugu audio script for the farmer. Use natural slang like 'రైతు సోదరులారా' (Brother farmer).",
          "daysToWait": number,
          "profitDelta": number (Total extra money earned if waiting),
          "qualityGrade": "A" | "B" | "C" | null,
          "qualityAssessment": string | null,
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
          recommendation: { type: Type.STRING, enum: Object.values(SellingRecommendation) },
          risk: { type: Type.STRING, enum: Object.values(RiskLevel) },
          explanation: { type: Type.STRING },
          explanationTelugu: { type: Type.STRING },
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
        required: ["crop", "quantity", "unit", "currentPrice", "predictedPrice", "recommendation", "risk", "explanation", "explanationTelugu", "daysToWait", "profitDelta", "trendData"]
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
      contents: [{ parts: [{ text: `Say this naturally in a warm, respectful Telugu tone for a rural farmer: ${text}` }] }],
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
