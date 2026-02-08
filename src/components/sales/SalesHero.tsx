import pedroHero from "@/assets/sales/pedro-hero-full.png";
import logoDesafio from "@/assets/sales/logo-desafio-30.png";

const CHECKOUT_URL = "https://pay.kiwify.com.br/0DZqpCK";

const SalesHero = () => {
  return (
    <section className="relative overflow-hidden bg-[hsl(0,0%,5%)] text-white">
      {/* Accent line top */}
      <div className="h-1 w-full bg-gradient-to-r from-[hsl(45,100%,50%)] via-[hsl(40,100%,55%)] to-[hsl(45,100%,50%)]" />

      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,hsl(45,100%,50%,0.06),transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-0 md:py-16">
        {/* Mobile: stacked layout | Desktop: side by side */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
          
          {/* Text content */}
          <div className="flex-1 text-center md:text-left order-2 md:order-1 pb-8 md:pb-0">
            {/* Logo */}
            <img
              src={logoDesafio}
              alt="Desafio 30 Dias - Pedro Bahia"
              className="h-20 sm:h-24 md:h-28 mx-auto md:mx-0 mb-6"
              loading="eager"
            />

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] mb-6">
              Transforme Seu Corpo em{" "}
              <span className="text-[hsl(45,100%,50%)]">30 Dias</span>{" "}
              Treinando em Casa
            </h1>

            <p className="text-base md:text-lg text-white/75 mb-8 max-w-xl mx-auto md:mx-0">
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

            <p className="text-white/40 text-sm mt-4">
              Acesso imediato após a compra
            </p>
          </div>

          {/* Pedro image — bottom-aligned, no rounded corners on mobile */}
          <div className="flex-shrink-0 w-72 sm:w-80 md:w-[22rem] lg:w-[26rem] order-1 md:order-2 relative">
            {/* Glow behind Pedro */}
            <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,hsl(45,100%,50%,0.12),transparent_70%)] blur-2xl" />
            <img
              src={pedroHero}
              alt="Pedro Bahia - Treinador do Desafio 30 Dias"
              className="relative w-full h-auto drop-shadow-[0_0_50px_hsl(45,100%,50%/0.15)]"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesHero;
