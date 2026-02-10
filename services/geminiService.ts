// --- CONFIGURAÇÃO ---
const API_KEY = "AIzaSyBfaGZWtweINUbFvzM_dfepAI7uqC7qrxM"; 

// Função auxiliar para chamar o Google sem biblioteca
async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY) return "";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Erro API: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Erro na requisição Gemini:", error);
    return "";
  }
}

// --- FUNÇÃO 1: IDEIAS DE POSTS ---
export const generatePostIdeas = async (client: any, count: number = 3): Promise<any[]> => {
  const prompt = `
    Atue como social media. Cliente: "${client?.name || 'Cliente'}", Setor: "${client?.industry || 'Geral'}".
    Gere ${count} ideias de posts.
    Retorne APENAS um JSON puro (sem markdown) neste formato de lista:
    [{"title": "Titulo", "format": "Reels", "concept": "Resumo"}]
  `;

  const text = await callGemini(prompt);
  
  try {
    // Limpa qualquer sujeira que a IA possa mandar (como ```json ...)
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Erro ao ler JSON:", e);
    return [];
  }
};

// --- FUNÇÃO 2: LEGENDAS ---
export const generateCaption = async (post: any, clientName: string): Promise<string> => {
  const prompt = `
    Crie uma legenda instagram engajadora.
    Cliente: ${clientName}. Post: ${post?.title}. Formato: ${post?.format}.
    Use emojis e hashtags.
  `;
  return await callGemini(prompt) || "Erro ao gerar legenda.";
};

// --- FUNÇÃO 3: ANÁLISE ---
export const analyzeSchedule = async (posts: any[], clientName: string): Promise<string> => {
  const summary = posts.map(p => `- ${p.date}: ${p.title}`).join('\n');
  const prompt = `Analise este cronograma para ${clientName} e dê um feedback curto:\n${summary}`;
  return await callGemini(prompt) || "Erro na análise.";
};
