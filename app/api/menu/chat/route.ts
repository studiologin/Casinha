import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const googleApiKey = process.env.GOOGLE_GENERATION_API_KEY || "";

if (!googleApiKey) {
  console.warn("⚠️ GOOGLE_GENERATION_API_KEY IS MISSING IN SERVER ENVIRONMENT");
} else {
  console.log("✅ Google API Key loaded (starts with):", googleApiKey.substring(0, 5) + "...");
}

const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { messages, question_count } = await req.json();

    if (!googleApiKey) {
      return NextResponse.json({
        message:
          "Por favor, configure a chave da API do Google Gemini (GOOGLE_GENERATION_API_KEY) para usar o Menu Especial.",
        is_final: false,
      });
    }

    const isFinal = question_count >= 4;

    const systemPrompt = isFinal
      ? `Você é um assistente culinário. Baseado na conversa, sugira uma receita ideal. 
         Retorne APENAS um JSON válido com a seguinte estrutura, sem markdown ou texto adicional:
         {
           "recipe_name": "Nome da Receita",
           "description": "Descrição apetitosa",
           "servings": 2,
           "prep_time": "30 min",
           "difficulty": "Fácil",
           "ingredients": [
             { "name": "Produto", "quantity": "2", "unit": "unidades", "category": "menu", "estimated_price": null }
           ],
           "steps": [
             { "step": 1, "instruction": "Texto do passo", "duration": "5 min" }
           ],
           "image_prompt": "descrição para gerar imagem"
         }`
      : `Você é um assistente culinário amigável (Manoel ou Nucha). Você deve seguir RIGOROSAMENTE esta sequência de 5 perguntas:
         1. Na primeira interação (count=0), pergunte obrigatoriamente: "O que gostaria de comer?"
         2. Na segunda interação (count=1), pergunte obrigatoriamente: "Qual o valor pretende gastar?"
         3. Da 3ª à 5ª interação, faça perguntas curtas e diretas sobre restrições, tempo disponível ou preferências de sabor para refinar a sugestão.
         
         Faça APENAS UMA pergunta por vez. Seja criativo mas mantenha o foco no orçamento na segunda pergunta.`;

    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : "Olá";
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage(systemPrompt + "\n\nUsuário disse: " + lastMessage);
    const response = await result.response;
    const text = response.text() || "";

    if (isFinal) {
      try {
        // Try to parse JSON from Gemini's response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const recipeJson = jsonMatch
          ? JSON.parse(jsonMatch[0])
          : JSON.parse(text);

        return NextResponse.json({
          message: "Aqui está uma sugestão perfeita para vocês!",
          is_final: true,
          recipe: recipeJson,
        });
      } catch (e) {
        console.error("Failed to parse recipe JSON", text);
        return NextResponse.json({
          message:
            "Ops, tive um problema ao criar a receita. Podemos tentar de novo?",
          is_final: false,
        });
      }
    }

    return NextResponse.json({
      message: text,
      is_final: false,
    });
  } catch (error: any) {
    console.error("Error in menu chat:", error);

    return NextResponse.json(
      { message: "Ocorreu um erro ao processar sua solicitação no Gemini. Verifique a chave de API.", is_final: false },
      { status: 500 },
    );
  }
}
