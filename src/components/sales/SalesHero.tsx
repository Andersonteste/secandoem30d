import pedroHero from "@/assets/sales/pedro-hero.png";

const CHECKOUT_URL = "https://pay.kiwify.com.br/0DZqpCK";

const SalesHero = () => {
  return (
    <section className="relative overflow-hidden bg-[hsl(0,0%,5%)] text-white">
      {/* Accent line top */}
      <div className="h-1 w-full bg-gradient-to-r from-[hsl(45,100%,50%)] via-[hsl(40,100%,55%)] to-[hsl(45,100%,50%)]" />
      
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-[hsl(45,100%,50%)] text-[hsl(0,0%,5%)] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              Desafio 30 Dias
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Transforme Seu Corpo em{" "}
              <span className="text-[hsl(45,100%,50%)]">30 Dias</span>{" "}
              Treinando em Casa
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
              Um método simples, direto e eficiente para você criar constância, 
              perder peso e se sentir bem — com acompanhamento completo pelo aplicativo.
            </p>
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[hsl(45,100%,50%)] hover:bg-[hsl(45,100%,55%)] text-[hsl(0,0%,5%)] text-lg md:text-xl font-extrabold px-10 py-5 rounded-xl transition-all duration-300 shadow-[0_0_30px_hsl(45,100%,50%/0.4)] hover:shadow-[0_0_40px_hsl(45,100%,50%/0.6)] hover:scale-105 w-full sm:w-auto"
            >
              QUERO ENTRAR NO DESAFIO 30 DIAS
            </a>
            <p className="text-white/50 text-sm mt-4">Acesso imediato após a compra</p>
          </div>

          {/* Image */}
          <div className="flex-shrink-0 w-64 md:w-80 lg:w-96">
            <img
              src={pedroHero}
              alt="Pedro Bahia - Treinador do Desafio 30 Dias"
              className="w-full h-auto drop-shadow-[0_0_40px_hsl(45,100%,50%/0.2)] rounded-2xl"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesHero;
