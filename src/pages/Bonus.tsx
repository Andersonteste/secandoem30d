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
  }
];

const Bonus = () => {
  const [selectedPDF, setSelectedPDF] = useState<typeof bonusPDFs[0] | null>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-primary-foreground hover:bg-white/20"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Conteúdo Bônus</h1>
              <p className="text-sm opacity-90">Materiais exclusivos para sua jornada</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bonusPDFs.map((pdf) => (
            <Card
              key={pdf.id}
              className="overflow-hidden hover:shadow-glow transition-all cursor-pointer group"
              onClick={() => setSelectedPDF(pdf)}
            >
              <div className="relative">
                <img 
                  src={pdf.image} 
                  alt={pdf.title}
                  className="w-full h-[168px] object-cover group-hover:scale-105 transition-transform duration-300"
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
        <DialogContent className="max-w-6xl h-[96vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-4 pb-2 shrink-0">
            <DialogTitle>{selectedPDF?.title}</DialogTitle>
          </DialogHeader>
          {selectedPDF && (
            <iframe
              src={selectedPDF.url}
              className="w-full h-[calc(96vh-60px)] rounded-b-lg"
              allow="autoplay"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bonus;
