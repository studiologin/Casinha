import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const googleApiKey = process.env.GOOGLE_GENERATION_API_KEY || "";
const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { product, category } = await req.json();

    if (!googleApiKey) {
      // Mock response if no API key
      return NextResponse.json({
        price: Math.floor(Math.random() * 50) + 5,
        currency: "BRL",
        source: "mock",
      });
    }

    const prompt = `Você é um assistente que estima preços médios de produtos no Brasil. 
    Ao estimar preços de itens básicos ou de peso variado (como arroz, feijão, leite, carnes), considere SEMPRE o preço médio por 1kg ou 1L. 
    Responda APENAS com um número decimal (ex: 15.50) representando o valor em Reais (BRL). 
    Não inclua R$, texto ou explicações.
    
    Qual o preço médio estimado de "${product}" (Categoria: ${category}) no Brasil?`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text() || "0";

    const priceText = content.trim().replace(",", ".");
    const price = parseFloat(priceText);

    return NextResponse.json({
      price: isNaN(price) ? 0 : price,
      currency: "BRL",
      source: "ai_estimate",
    });
  } catch (error) {
    console.error("Error fetching price with Gemini:", error);
    return NextResponse.json(
      { price: 0, currency: "BRL", source: "error" },
      { status: 500 },
    );
  }
}
