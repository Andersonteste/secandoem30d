import resultado1 from "@/assets/sales/resultado-1.jpg";
import resultado2 from "@/assets/sales/resultado-2.jpg";
import resultado3 from "@/assets/sales/resultado-3.avif";
import resultado4 from "@/assets/sales/resultado-4.avif";
import resultado5 from "@/assets/sales/resultado-5.avif";

const CHECKOUT_URL = "https://pay.kiwify.com.br/0DZqpCK";

const results = [
  { src: resultado1, alt: "Resultado real - transformação corporal" },
  { src: resultado2, alt: "Resultado real - antes e depois" },
  { src: resultado3, alt: "Resultado real - evolução fitness" },
  { src: resultado4, alt: "Resultado real - progresso" },
  { src: resultado5, alt: "Resultado real - transformação" },
];

const SalesResults = () => {
  return (
    <section className="bg-[hsl(0,0%,8%)] text-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          Resultados <span className="text-[hsl(45,100%,50%)]">Reais</span> de Quem Seguiu o Método
        </h2>
        <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
          Pessoas comuns que decidiram começar e mantiveram a constância. 
          Cada corpo reage de forma diferente — os resultados variam de pessoa para pessoa.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border-2 border-[hsl(45,100%,50%/0.3)] hover:border-[hsl(45,100%,50%)] transition-all duration-300 hover:scale-105"
            >
              <img
                src={r.src}
                alt={r.alt}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <p className="text-center text-white/40 text-xs mb-8">
          *Os resultados apresentados são reais, porém individuais. Cada organismo responde de forma diferente ao programa. 
          Resultados podem variar de acordo com o comprometimento, alimentação e condições individuais de cada participante.
        </p>

        <div className="text-center">
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[hsl(45,100%,50%)] hover:bg-[hsl(45,100%,55%)] text-[hsl(0,0%,5%)] text-lg font-extrabold px-10 py-5 rounded-xl transition-all duration-300 shadow-[0_0_30px_hsl(45,100%,50%/0.4)] hover:shadow-[0_0_40px_hsl(45,100%,50%/0.6)] hover:scale-105"
          >
            QUERO COMEÇAR MINHA TRANSFORMAÇÃO
          </a>
        </div>
      </div>
    </section>
  );
};

export default SalesResults;
