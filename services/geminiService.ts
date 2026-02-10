import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI, Type } from "@google/genai";
import { Client, Post, PostStatus } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize safely to avoid crashing if key is missing during dev, 
// though the prompt implies we assume it's there or handle it.
const genAI = new GoogleGenerativeAI(AIzaSyBfaGZWtwEINUbFvzM_dfepAI7uqC7qrxM);

export const generatePostIdeas = async (client: Client, count: number = 3): Promise<any[]> => {
  if (!API_KEY) {
    console.warn("API Key is missing for Gemini.");
    return [];
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Gere ${count} ideias de posts para redes sociais para o cliente "${client.name}" que atua no setor de "${client.industry}". 
    Para cada ideia, forneça um título, um formato sugerido (Reels, Carrossel, Static) e uma breve descrição do conceito.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              format: { type: Type.STRING },
              concept: { type: Type.STRING }
            },
            required: ["title", "format", "concept"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating post ideas:", error);
    return [];
  }
};

export const generateCaption = async (post: Post, clientName: string): Promise<string> => {
   if (!API_KEY) {
    return "API Key não configurada. Não foi possível gerar a legenda.";
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Atue como um copywriter senior. Escreva uma legenda para um post de rede social (${post.network}) para o cliente "${clientName}".
    Título do Post: ${post.title}
    Formato: ${post.format}
    
    A legenda deve ser engajadora, usar emojis apropriados e incluir 3-5 hashtags relevantes no final.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a legenda.";

  } catch (error) {
    console.error("Error generating caption:", error);
    return "Erro ao conectar com a IA.";
  }
}

export const analyzeSchedule = async (posts: Post[], clientName: string): Promise<string> => {
     if (!API_KEY) return "Sem chave de API para análise.";

     try {
        const postsSummary = posts.map(p => `- ${p.date}: ${p.title} (${p.status})`).join('\n');
        const model = 'gemini-3-flash-preview';
        const prompt = `Analise o seguinte cronograma de postagens para o cliente ${clientName}.
        
        ${postsSummary}
        
        Forneça um feedback curto (máximo 2 parágrafos) sobre a consistência, frequência e se há lacunas importantes no calendário. Seja construtivo.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        
        return response.text || "Análise indisponível.";
     } catch (e) {
         console.error(e);
         return "Erro na análise.";
     }
}
