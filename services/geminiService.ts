import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURAÇÃO DA CHAVE ---
const API_KEY = "AIzaSyBfaGZWtweINUbFvzM_dfepAI7uqC7qrxM"; 

// --- INICIALIZAÇÃO DA IA ---
const genAI = new GoogleGenerativeAI(API_KEY);

// --- FUNÇÃO 1: GERAR IDEIAS ---
export const generatePostIdeas = async (client: any, count: number = 3): Promise<any[]> => {
  if (!API_KEY) {
    console.warn("API Key is missing for Gemini.");
    return [];
  }

  try {
    // Usando o modelo Flash que é mais rápido
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Atue como um estrategista de social media.
      Cliente: "${client.name}"
      Setor: "${client.industry || 'Geral'}"
      
      Gere ${count} ideias de posts.
      Retorne APENAS um JSON (sem markdown, sem crase) seguindo este formato de array:
      [
        { "title": "Titulo do post", "format": "Reels", "concept": "Descrição curta" },
        { "title": "Titulo 2", "format": "Static", "concept": "Descrição 2" }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpeza de segurança para garantir que é JSON puro
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error generating post ideas:", error);
    return [];
  }
};

// --- FUNÇÃO 2: GERAR LEGENDA ---
export const generateCaption = async (post: any, clientName: string): Promise<string> => {
   if (!API_KEY) return "API Key não configurada.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Atue como um copywriter senior. Escreva uma legenda para Instagram.
    Cliente: ${clientName}
    Título do Post: ${post.title}
    Formato: ${post.format}
    
    A legenda deve ser engajadora, usar emojis e incluir 3-5 hashtags no final.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error generating caption:", error);
    return "Erro ao gerar legenda.";
  }
}

// --- FUNÇÃO 3: ANALISAR CRONOGRAMA ---
export const analyzeSchedule = async (posts: any[], clientName: string): Promise<string> => {
     if (!API_KEY) return "Sem chave de API.";

     try {
        const postsSummary = posts.map(p => `- ${p.date}: ${p.title} (${p.status})`).join('\n');
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
        Analise este cronograma de posts para o cliente ${clientName}:
        ${postsSummary}
        
        Dê um feedback curto (max 2 parágrafos) sobre frequência e consistência.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

     } catch (e) {
         console.error(e);
         return "Erro na análise.";
     }
}
