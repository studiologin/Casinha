import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // base64 image data

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Call OpenAI Vision (GPT-4o-mini is vision-capable and cheap)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em identificar produtos de supermercado, farmácia e pets através de fotos. Você deve identificar o nome do produto e o preço unitário se estiver visível na imagem ou etiqueta. Responda APENAS com um objeto JSON puro no formato: { \"name\": \"NOME DO PRODUTO\", \"price\": 0.00, \"unit\": \"un|kg|g|L|ml|cx\" }. Se o preço não for legível, retorne 0.00. Se a unidade não puder ser determinada, use 'un'.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Identifique o produto e o preço nesta imagem." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const data = JSON.parse(content);

    return NextResponse.json({
      name: data.name || "",
      price: data.price || 0,
      unit: data.unit || "un",
      source: "vision_ai",
    });
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Falha ao analisar a imagem", details: error.message },
      { status: 500 }
    );
  }
}
