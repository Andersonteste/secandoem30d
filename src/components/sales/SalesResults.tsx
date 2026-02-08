import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import resultado1 from "@/assets/sales/resultado-1.jpg";
import resultado2 from "@/assets/sales/resultado-2.jpg";
import resultado3 from "@/assets/sales/resultado-3.avif";
import resultado4 from "@/assets/sales/resultado-4.avif";
import resultado5 from "@/assets/sales/resultado-5.avif";
import resultado6 from "@/assets/sales/resultado-6.jpg";
import resultado7 from "@/assets/sales/resultado-7.jpg";
import resultado8 from "@/assets/sales/resultado-8.jpg";
import resultado9 from "@/assets/sales/resultado-9.jpg";

const CHECKOUT_URL = "https://pay.kiwify.com.br/0DZqpCK";

const results = [
  { src: resultado1, alt: "Resultado real - transformação corporal" },
  { src: resultado6, alt: "Resultado real - antes e depois" },
  { src: resultado8, alt: "Resultado real - transformação masculina" },
  { src: resultado2, alt: "Resultado real - antes e depois" },
  { src: resultado9, alt: "Resultado real - evolução" },
  { src: resultado7, alt: "Resultado real - progresso lateral" },
  { src: resultado3, alt: "Resultado real - evolução fitness" },
  { src: resultado4, alt: "Resultado real - progresso" },
  { src: resultado5, alt: "Resultado real - transformação" },
];

const SalesResults = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-[hsl(0,0%,8%)] text-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          Resultados <span className="bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(145,100%,55%)] bg-clip-text text-transparent">Reais</span> de Quem Seguiu o Método
        </h2>
        <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
          Pessoas comuns que decidiram começar e mantiveram a constância.
          Cada corpo reage de forma diferente — os resultados variam de pessoa para pessoa.
        </p>

        {/* Carousel */}
        <div className="relative">
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[hsl(0,0%,5%/0.8)] border border-white/20 flex items-center justify-center hover:bg-[hsl(24,100%,50%)] hover:text-white transition-colors -translate-x-1/2 md:-translate-x-5"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[hsl(0,0%,5%/0.8)] border border-white/20 flex items-center justify-center hover:bg-[hsl(24,100%,50%)] hover:text-white transition-colors translate-x-1/2 md:translate-x-5"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-2"
                >
                  <div className="rounded-xl overflow-hidden border-2 border-[hsl(24,100%,50%/0.3)] hover:border-[hsl(24,100%,50%)] transition-all duration-300">
                    <img
                      src={r.src}
                      alt={r.alt}
                      className="w-full aspect-[4/5] object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {results.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === selectedIndex
                    ? "bg-[hsl(24,100%,50%)] w-6"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Ir para resultado ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-8 mb-8">
          *Os resultados apresentados são reais, porém individuais. Cada organismo responde de forma diferente ao programa.
          Resultados podem variar de acordo com o comprometimento, alimentação e condições individuais de cada participante.
        </p>

        <div className="text-center">
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(30,100%,45%)] hover:from-[hsl(24,100%,55%)] hover:to-[hsl(30,100%,50%)] text-white text-lg font-extrabold px-10 py-5 rounded-xl transition-all duration-300 shadow-[0_0_30px_hsl(24,100%,50%/0.4)] hover:shadow-[0_0_40px_hsl(24,100%,50%/0.6)] hover:scale-105"
          >
            QUERO COMEÇAR MINHA TRANSFORMAÇÃO
          </a>
        </div>
      </div>
    </section>
  );
};

export default SalesResults;
