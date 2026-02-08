import { CheckCircle2 } from "lucide-react";

const items = [
  "Quer emagrecer mas não sabe por onde começar",
  "Já tentou várias dietas e treinos sem resultados duradouros",
  "Não tem tempo ou disposição para ir a outros lugares treinar",
  "Precisa de um método simples, organizado e fácil de seguir",
  "Quer treinar em casa, no seu tempo, sem complicação",
  "Busca constância e disciplina, não soluções milagrosas",
  "Quer acompanhamento digital diário para não desistir",
  "Deseja mudar de vida com um passo de cada vez",
];

const SalesForWho = () => {
  return (
    <section className="bg-[hsl(0,0%,5%)] text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          Para Quem É o{" "}
          <span className="text-[hsl(45,100%,50%)]">Desafio 30 Dias</span>?
        </h2>
        <p className="text-center text-white/60 mb-12 text-lg">
          Se você se identifica com algum dos itens abaixo, esse desafio foi feito pra você.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <CheckCircle2 className="w-6 h-6 text-[hsl(45,100%,50%)] flex-shrink-0 mt-0.5" />
              <p className="text-white/90">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesForWho;
