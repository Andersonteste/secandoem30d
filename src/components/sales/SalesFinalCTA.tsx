import pedroAuthority from "@/assets/sales/pedro-authority.png";

const CHECKOUT_URL = "https://pay.kiwify.com.br/0DZqpCK";

const SalesFinalCTA = () => {
  return (
    <section className="bg-[hsl(0,0%,5%)] text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[hsl(24,100%,50%/0.1)] to-[hsl(145,100%,45%/0.05)] border border-[hsl(24,100%,50%/0.3)] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[hsl(24,100%,50%/0.1)] rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[hsl(145,100%,45%/0.05)] rounded-full blur-3xl" />

          <div className="relative z-10">
            <img
              src={pedroAuthority}
              alt="Pedro Bahia"
              className="w-28 h-28 rounded-full object-cover mx-auto mb-6 border-4 border-[hsl(24,100%,50%/0.5)]"
              loading="lazy"
            />

            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Sua Transformação Começa{" "}
              <span className="bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(145,100%,55%)] bg-clip-text text-transparent">Agora</span>
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Não espere a segunda-feira, o mês que vem ou o momento perfeito.
              O melhor momento para começar é hoje. Você entra e já começa.
            </p>

            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(30,100%,45%)] hover:from-[hsl(24,100%,55%)] hover:to-[hsl(30,100%,50%)] text-white text-lg md:text-xl font-extrabold px-12 py-5 rounded-xl transition-all duration-300 shadow-[0_0_30px_hsl(24,100%,50%/0.4)] hover:shadow-[0_0_50px_hsl(24,100%,50%/0.6)] hover:scale-105 w-full sm:w-auto"
            >
              QUERO COMEÇAR HOJE
            </a>

            <p className="text-white/40 text-sm mt-6">
              Acesso imediato • Treinos em casa • Acompanhamento pelo app
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-white/30 text-xs text-center mt-8 max-w-2xl mx-auto">
          Aviso legal: Os resultados apresentados nesta página são reais, porém individuais. 
          Cada organismo responde de forma diferente ao programa. Os resultados podem variar de 
          acordo com o comprometimento, alimentação e condições individuais de cada participante. 
          Este programa não substitui acompanhamento médico ou nutricional.
        </p>
      </div>
    </section>
  );
};

export default SalesFinalCTA;
