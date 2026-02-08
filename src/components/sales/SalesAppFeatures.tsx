import { Play, Utensils, Scale, CalendarCheck, Zap, Smartphone } from "lucide-react";

const features = [
  {
    icon: Play,
    title: "Treinos em Vídeo",
    desc: "30 treinos completos em vídeo para fazer em casa, sem precisar de nenhum equipamento adicional.",
  },
  {
    icon: Utensils,
    title: "Orientação Alimentar Simples",
    desc: "Cardápios práticos e receitas fáceis para seguir no dia a dia sem complicação.",
  },
  {
    icon: Scale,
    title: "Registro de Peso e Evolução",
    desc: "Acompanhe sua evolução registrando seu peso e vendo seu progresso ao longo dos 30 dias.",
  },
  {
    icon: CalendarCheck,
    title: "Acompanhamento de 30 Dias",
    desc: "Marque cada dia completo, acompanhe suas metas e mantenha a constância.",
  },
  {
    icon: Zap,
    title: "Análise Nutricional por IA",
    desc: "Tire foto dos seus pratos e receba análise automática de calorias e nutrientes.",
  },
  {
    icon: Smartphone,
    title: "Acesso Imediato",
    desc: "Após a compra, você recebe acesso instantâneo ao aplicativo e começa no mesmo dia.",
  },
];

const SalesAppFeatures = () => {
  return (
    <section className="bg-[hsl(0,0%,5%)] text-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-[hsl(24,100%,50%/0.15)] text-[hsl(24,100%,50%)] text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
            Tudo no Aplicativo
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            O Que Você Recebe no{" "}
            <span className="bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(145,100%,55%)] bg-clip-text text-transparent">App</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Seu desafio inteiro na palma da mão. Treinos, alimentação, progresso — tudo organizado em um único lugar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[hsl(24,100%,50%/0.4)] transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-[hsl(24,100%,50%/0.15)] flex items-center justify-center mb-4 group-hover:bg-[hsl(24,100%,50%/0.25)] transition-colors">
                <f.icon className="w-7 h-7 text-[hsl(24,100%,50%)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesAppFeatures;
