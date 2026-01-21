import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Moon, Sun, Gift } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useTheme } from "next-themes";
import bonusChas from "@/assets/bonus-chas.webp";
import bonusDoces from "@/assets/bonus-doces.webp";
import bonusReceitasFit from "@/assets/bonus-receitas-fit.webp";
import bonusSalgados from "@/assets/bonus-salgados.webp";
import bonusSucos from "@/assets/bonus-sucos.webp";
import bonusMarmitas from "@/assets/bonus-marmitas.png";
import bonusLowCarb from "@/assets/bonus-low-carb.png";
import bonusListaCompras from "@/assets/bonus-lista-compras.png";

const bonusPDFs = [
  {
    id: "1",
    title: "Receitas de Chás",
    url: "https://drive.google.com/file/d/1AdGFj_8VO69aPLAiGhnFX5_nN6Z32EJj/preview",
    image: bonusChas
  },
  {
    id: "2",
    title: "Receitas de Doces",
    url: "https://drive.google.com/file/d/19uNnJ5MUSk4atx4o8mXMJWeOFMw_-Leo/preview",
    image: bonusDoces
  },
  {
    id: "3",
    title: "Receitas Fit - Almoço e Jantar",
    url: "https://drive.google.com/file/d/1JTsloSiGxXICz4do0yjQW72eUeOOtCbY/preview",
    image: bonusReceitasFit
  },
  {
    id: "4",
    title: "Receitas de Salgados",
    url: "https://drive.google.com/file/d/1xyfWK_VDc9nNPpblk7IrezK7_Xaz5ojC/preview",
    image: bonusSalgados
  },
  {
    id: "5",
    title: "Receitas de Sucos",
    url: "https://drive.google.com/file/d/1Mu563GrR7yTZgpekhp2Hdb0iLgI-Doen/preview",
    image: bonusSucos
  },
  {
    id: "6",
    title: "Marmitas Fit",
    url: "https://drive.google.com/file/d/1bd38s7A46bEt1gHoRQcb7XvVoi5CrTTF/preview",
    image: bonusMarmitas
  },
  {
    id: "7",
    title: "+100 Receitas Low Carb",
    url: "https://drive.google.com/file/d/1Edb3BLRW1BXcWS4BhkP2vrmH95ZmUsBG/preview",
    image: bonusLowCarb
  },
  {
    id: "8",
    title: "Lista de Compras Fit",
    url: "https://drive.google.com/file/d/1Qipf9oV5PR9weSroVobwhGCzgd1mQHD0/preview",
    image: bonusListaCompras
  }
];

const Bonus = () => {
  const [selectedPDF, setSelectedPDF] = useState<typeof bonusPDFs[0] | null>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-surface pb-24 md:pt-20">
      <Navigation />
      <header className="relative overflow-hidden py-6 px-4">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Conteúdo Bônus</h1>
              <p className="text-sm text-white/80">Materiais exclusivos para sua jornada</p>
            </div>
          </div>
        </div>
        
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-surface" style={{ borderRadius: '100% 100% 0 0' }} />
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bonusPDFs.map((pdf) => (
            <Card
              key={pdf.id}
              className="overflow-hidden shadow-subtle hover:shadow-card transition-all duration-300 cursor-pointer group border-0 bg-card"
              onClick={() => setSelectedPDF(pdf)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={pdf.image} 
                  alt={pdf.title}
                  className="w-full h-[168px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm">{pdf.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Clique para visualizar</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* PDF Viewer Dialog */}
      <Dialog open={!!selectedPDF} onOpenChange={() => setSelectedPDF(null)}>
        <DialogContent className="max-w-6xl h-[85vh] sm:h-[96vh] p-0 flex flex-col [&>button]:top-2 [&>button]:right-2 sm:[&>button]:top-4 sm:[&>button]:right-4">
          <DialogHeader className="px-6 pt-10 sm:pt-4 pb-2 shrink-0">
            <DialogTitle>{selectedPDF?.title}</DialogTitle>
          </DialogHeader>
          {selectedPDF && (
            <iframe
              src={selectedPDF.url}
              className="w-full flex-1 rounded-b-lg"
              allow="autoplay"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bonus;
