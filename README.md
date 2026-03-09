# 🏠 Casinha

Um sistema de gestão doméstica para um casal (Manoel e Nucha) e seus três cachorros (Johnny, Jack e Jimmy).

## Tecnologias

- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- Supabase
- OpenAI API

## Configuração

1. Crie um projeto no Supabase e execute o script SQL fornecido no prompt para criar as tabelas.
2. Obtenha as chaves da API do Supabase (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Obtenha uma chave da API da OpenAI (`OPENAI_API_KEY`).
4. Configure as variáveis de ambiente no painel de Secrets.

## Funcionalidades

- **Dashboard (Home)**: Visão geral com mascotes animados.
- **Lista de Compras**: Organizada por Mercado, Farmácia e Pets. Estimativa de preços via IA.
- **Menu Especial**: Chatbot para sugerir receitas e adicionar ingredientes à lista de compras.
