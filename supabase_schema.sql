-- SQL Schema for Casinha App

-- 1. Tabella de Itens de Compras (Ativos)
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    quantity TEXT DEFAULT '1',
    unit TEXT DEFAULT 'un',
    category TEXT NOT NULL CHECK (category IN ('mercado', 'farmacia', 'pets', 'menu', 'historico')),
    estimated_price DECIMAL(10, 2),
    price_is_estimated BOOLEAN DEFAULT true,
    checked BOOLEAN DEFAULT false,
    added_by TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Listas de Histórico
CREATE TABLE IF NOT EXISTS public.saved_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('mercado', 'farmacia', 'pets')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Itens dentro das Listas do Histórico
CREATE TABLE IF NOT EXISTS public.saved_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID REFERENCES public.saved_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity TEXT DEFAULT '1',
    unit TEXT DEFAULT 'un',
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Políticas de Segurança (RLS) - Exemplo simples (permitir tudo por enquanto)
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anonymous" ON public.shopping_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anonymous" ON public.saved_lists FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anonymous" ON public.saved_list_items FOR ALL TO anon USING (true) WITH CHECK (true);
