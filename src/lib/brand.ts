export const BRAND = {
  name: "Secando em Casa",
  tagline: "Seu personal online para treinos, alimentação e evolução.",
  shortTagline: "Seu personal online",
  initialJourney: "Jornada Inicial",
  checkoutUrl: "https://pay.kiwify.com.br/0DZqpCK",
};

export const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Emagrecer",
  gain_muscle: "Ganhar massa",
  maintain: "Manter peso",
  get_fit: "Melhorar condicionamento",
};

export const LOCATION_LABELS: Record<string, string> = {
  casa: "Em casa",
  academia: "Academia",
  ambos: "Casa e academia",
};

export const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export const WORKOUT_GOALS = [
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "condicionamento", label: "Condicionamento" },
  { value: "mobilidade", label: "Mobilidade" },
];

export const FOOD_GOALS = [
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "ganho_massa", label: "Ganho de massa" },
  { value: "manutencao", label: "Manutenção" },
  { value: "rotina_rapida", label: "Rotina rápida" },
  { value: "baixo_orcamento", label: "Baixo orçamento" },
];

export const DIET_TAGS = [
  { value: "vegetarian", label: "Vegetariano" },
  { value: "vegan", label: "Vegano" },
  { value: "lactose_free", label: "Sem lactose" },
  { value: "gluten_free", label: "Sem glúten" },
];

export const EQUIPMENT_OPTIONS = [
  { value: "nenhum", label: "Nenhum (peso do corpo)" },
  { value: "halteres", label: "Halteres" },
  { value: "elastico", label: "Elástico / faixa" },
  { value: "banco", label: "Banco / cadeira" },
  { value: "barra", label: "Barra fixa" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "academia", label: "Máquinas de academia" },
];

export const STORE_CATEGORIES = [
  "Equipamentos",
  "Acessórios",
  "Produtos fitness",
  "Suplementos",
  "Materiais digitais",
  "Produtos recomendados",
];

export const JOURNEY_PRESETS = [
  { slug: "jornada-inicial", name: "Jornada Inicial" },
  { slug: "emagrecimento", name: "Emagrecimento" },
  { slug: "academia", name: "Academia" },
  { slug: "treino-em-casa", name: "Treino em Casa" },
  { slug: "retomada", name: "Retomada" },
  { slug: "manutencao", name: "Manutenção" },
  { slug: "hipertrofia", name: "Hipertrofia" },
  { slug: "habitos-e-rotina", name: "Hábitos e Rotina" },
];
