import { Sparkles, Target, Layout, RefreshCw, Smartphone } from "lucide-react";

const diffs = [
  { icon: Sparkles, title: "Simplicidade", desc: "Treinos e alimentação sem complicação. Qualquer pessoa consegue seguir." },
  { icon: Target, title: "Método Possível", desc: "Nada de loucura. Um passo por dia, no seu ritmo, na sua casa." },
  { icon: Layout, title: "Organização", desc: "Tudo estruturado dia a dia. Você só precisa abrir o app e seguir." },
  { icon: RefreshCw, title: "Constância", desc: "O segredo do resultado é a consistência. O desafio te ajuda a criar o hábito." },
  { icon: Smartphone, title: "Acompanhamento Digital", desc: "Progresso visual, registro de peso e metas — tudo no aplicativo." },
];

const SalesDifferentials = () => {
  return (
    <section className="bg-[hsl(0,0%,8%)] text-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
          Por Que o Secando em Casa{" "}
          <span className="bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(145,100%,55%)] bg-clip-text text-transparent">Funciona</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {diffs.map((d, i) => (
            <div key={i} className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(24,100%,50%/0.1)] border border-[hsl(24,100%,50%/0.2)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[hsl(24,100%,50%/0.2)] transition-colors">
                <d.icon className="w-7 h-7 text-[hsl(24,100%,50%)]" />
              </div>
              <h3 className="font-bold mb-1">{d.title}</h3>
              <p className="text-white/50 text-sm">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesDifferentials;
