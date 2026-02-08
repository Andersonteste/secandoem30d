import logoDesafio from "@/assets/sales/logo-desafio-30.png";

const CHECKOUT_URL = "https://pay.kiwify.com.br/0DZqpCK";

const SalesHero = () => {
  return (
    <section className="relative overflow-hidden bg-[hsl(0,0%,5%)] text-white">
      {/* Accent line top */}
      <div className="h-1 w-full bg-gradient-to-r from-[hsl(24,100%,50%)] via-[hsl(100,100%,55%)] to-[hsl(24,100%,50%)]" />

      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(24,100%,50%,0.06),transparent_70%)]" />

      <div className="relative max-w-3xl mx-auto px-4 py-12 md:py-20 text-center">
          {/* Logo */}
          <img
            src={logoDesafio}
            alt="Desafio 30 Dias - Pedro Bahia"
            className="h-20 sm:h-24 md:h-28 mx-auto mb-8"
            loading="eager"
          />

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] mb-6">
            Transforme Seu Corpo em{" "}
            <span className="bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(145,100%,55%)] bg-clip-text text-transparent">30 Dias</span>{" "}
            Treinando em Casa
          </h1>

          <p className="text-base md:text-lg text-white/75 mb-8 max-w-xl mx-auto">
            Um método simples, direto e eficiente para você criar constância,
            perder peso e se sentir bem — com acompanhamento completo pelo aplicativo.
          </p>

          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(30,100%,45%)] hover:from-[hsl(24,100%,55%)] hover:to-[hsl(30,100%,50%)] text-white text-lg md:text-xl font-extrabold px-10 py-5 rounded-xl transition-all duration-300 shadow-[0_0_30px_hsl(24,100%,50%/0.4)] hover:shadow-[0_0_40px_hsl(24,100%,50%/0.6)] hover:scale-105 w-full sm:w-auto"
          >
            QUERO ENTRAR NO DESAFIO 30 DIAS
          </a>

          <p className="text-white/40 text-sm mt-4">
            Acesso imediato após a compra
          </p>
      </div>
    </section>
  );
};

export default SalesHero;
