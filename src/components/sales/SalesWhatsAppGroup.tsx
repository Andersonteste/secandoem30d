import { MessageCircle, Users, Bell, Heart, Shield } from "lucide-react";

const benefits = [
  { icon: MessageCircle, text: "Motivação diária para manter o foco" },
  { icon: Bell, text: "Avisos e direcionamentos importantes" },
  { icon: Heart, text: "Ambiente de apoio e acolhimento" },
  { icon: Users, text: "Comunidade ativa durante todo o desafio" },
  { icon: Shield, text: "Grupo exclusivo para participantes" },
];

const SalesWhatsAppGroup = () => {
  return (
    <section className="bg-[hsl(0,0%,5%)] text-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[hsl(142,70%,35%/0.2)] to-[hsl(142,70%,25%/0.1)] border border-[hsl(142,70%,40%/0.3)] rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-[hsl(142,70%,40%)] flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Grupo Exclusivo no{" "}
              <span className="text-[hsl(142,70%,50%)]">WhatsApp</span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Ao entrar no desafio, você ganha acesso ao grupo exclusivo onde
              ninguém fica sozinho na jornada.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                <b.icon className="w-5 h-5 text-[hsl(142,70%,50%)] flex-shrink-0" />
                <p className="text-white/90 text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesWhatsAppGroup;
