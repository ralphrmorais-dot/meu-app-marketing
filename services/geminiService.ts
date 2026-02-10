import { GoogleGenerativeAI } from "@google/generative-ai";

// --- SUA CHAVE (Não apague as aspas!) ---
const API_KEY = "AIzaSyBfaGZWtweINUbFvzM_dfepAI7uqC7qrxM"; 

// Inicializa a IA
const genAI = new GoogleGenerativeAI(API_KEY);

// --- FUNÇÃO 1: GERAR IDEIAS ---
// Usei 'any' para não depender de arquivos externos que podem estar faltando
export const generatePostIdeas = async (client: any, count: number = 3): Promise<any[]> => {
  if (!API_KEY) {
    console.warn("API Key is missing.");
    return [];
  }

  try {
    // Usando modelo Flash (mais rápido e garantido)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Atue como um estrategista de social media.
      Cliente: "${client?.name || 'Cliente'}"
      Setor: "${client?.industry || 'Geral'}"
      
      Gere ${count} ideias de posts.
      Retorne APENAS um JSON (sem markdown) seguindo este formato de array:
      [
        { "title": "Titulo", "format": "Reels", "concept": "Descrição" }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpeza para evitar erros de formatação da IA
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Erro ao gerar ideias:", error);
    // Retorna array vazio para não travar o site
    return [];
  }
};

// --- FUNÇÃO 2: GERAR LEGENDA ---
export const generateCaption = async (post: any, clientName: string): Promise<string> => {
   if (!API_KEY) return "Erro: Chave de API faltando.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Escreva uma legenda curta e engajadora para Instagram.
    Cliente: ${clientName}
    Título do Post: ${post?.title || 'Sem título'}
    Formato: ${post?.format || 'Post'}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Erro ao gerar legenda:", error);
    return "Não foi possível gerar a legenda.";
  }
}

// --- FUNÇÃO 3: ANALISAR CRONOGRAMA ---
export const analyzeSchedule = async (posts: any[], clientName: string): Promise<string> => {
     if (!API_KEY) return "Erro: Chave de API faltando.";

     try {
        const postsSummary = posts.map(p => `- ${p.date}: ${p.title}`).join('\n');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Analise este cronograma para ${clientName}:\n${postsSummary}\nDê um feedback de 1 parágrafo.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
     } catch (e) {
         console.error(e);
         return "Erro na análise.";
     }
}
