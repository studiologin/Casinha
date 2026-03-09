import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { product, category } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      // Mock response if no API key
      return NextResponse.json({
        price: Math.floor(Math.random() * 50) + 5,
        currency: "BRL",
        source: "mock",
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que estima preços médios de produtos no Brasil. Ao estimar preços de itens básicos ou de peso variado (como arroz, feijão, leite, carnes), considere SEMPRE o preço médio por 1kg ou 1L. Responda APENAS com um número decimal (ex: 15.50) representando o valor em Reais (BRL). Não inclua R$, texto ou explicações.",
        },
        {
          role: "user",
          content: `Qual o preço médio estimado de "${product}" (Categoria: ${category}) no Brasil?`,
        },
      ],
    });

    const content = response.choices[0].message.content || "0";
    const priceText = content.trim().replace(",", ".");
    const price = parseFloat(priceText);

    return NextResponse.json({
      price: isNaN(price) ? 0 : price,
      currency: "BRL",
      source: "ai_estimate",
    });
  } catch (error) {
    console.error("Error fetching price:", error);
    return NextResponse.json(
      { price: 0, currency: "BRL", source: "error" },
      { status: 500 },
    );
  }
}
