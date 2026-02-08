import { CreditCard, Smartphone, Flame } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    num: "01",
    title: "Faça Sua Inscrição",
    desc: "Compra rápida e segura. Você recebe o acesso em poucos minutos.",
  },
  {
    icon: Smartphone,
    num: "02",
    title: "Acesse o Aplicativo",
    desc: "Abra o app, complete seu perfil e veja todo o conteúdo do desafio.",
  },
  {
    icon: Flame,
    num: "03",
    title: "Comece no Mesmo Dia",
    desc: "O desafio é perpétuo — você entra e começa hoje. Sem esperar turma, sem data fixa.",
  },
];

const SalesHowItWorks = () => {
  return (
    <section className="bg-[hsl(0,0%,8%)] text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          Como <span className="text-[hsl(45,100%,50%)]">Funciona</span>
        </h2>
        <p className="text-center text-white/60 mb-12 text-lg">
          Em 3 passos simples você já está dentro do desafio.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex-1 relative bg-white/5 border border-white/10 rounded-2xl p-8 text-center group hover:border-[hsl(45,100%,50%/0.5)] transition-all duration-300"
            >
              <span className="text-5xl font-black text-[hsl(45,100%,50%/0.15)] absolute top-4 right-4 group-hover:text-[hsl(45,100%,50%/0.3)] transition-colors">
                {s.num}
              </span>
              <div className="w-16 h-16 rounded-full bg-[hsl(45,100%,50%)] flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-8 h-8 text-[hsl(0,0%,5%)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-white/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesHowItWorks;
