import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { messages, question_count } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        message:
          "Por favor, configure a chave da API da OpenAI para usar o Menu Especial.",
        is_final: false,
      });
    }

    const isFinal = question_count >= 4;

    const systemPrompt = isFinal
      ? `Você é um assistente culinário. Baseado na conversa, sugira uma receita. 
         Retorne APENAS um JSON válido com a seguinte estrutura, sem markdown ou texto adicional:
         {
           "recipe_name": "Nome da Receita",
           "description": "Descrição apetitosa",
           "servings": 2,
           "prep_time": "30 min",
           "difficulty": "Fácil",
           "ingredients": [
             { "name": "Produto", "quantity": "2", "unit": "unidades", "category": "mercado", "estimated_price": null }
           ],
           "steps": [
             { "step": 1, "instruction": "Texto do passo", "duration": "5 min" }
           ],
           "image_prompt": "descrição para gerar imagem"
         }`
      : `Você é um assistente culinário amigável (Manoel ou Nucha). Faça UMA pergunta curta e direta para ajudar a decidir o que cozinhar.
         Exemplos de perguntas: "Preferem algo leve ou mais substancioso?", "Tem alguma restrição alimentar?", "Quanto tempo temos para cozinhar?".
         Seja criativo e não repita perguntas.`;

    const openAiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      temperature: 0.7,
      messages: openAiMessages as any,
      response_format: isFinal ? { type: "json_object" } : { type: "text" },
    });

    const text = response.choices[0].message.content || "";

    if (isFinal) {
      try {
        // Try to parse JSON
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
  } catch (error) {
    console.error("Error in menu chat:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro. Tente novamente.", is_final: false },
      { status: 500 },
    );
  }
}
