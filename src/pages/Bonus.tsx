import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Moon, Sun, Gift } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useTheme } from "next-themes";

const bonusPDFs = [
  {
    id: "1",
    title: "Receitas de Chás",
    url: "https://drive.google.com/file/d/1AdGFj_8VO69aPLAiGhnFX5_nN6Z32EJj/preview"
  },
  {
    id: "2",
    title: "Receitas de Doces",
    url: "https://drive.google.com/file/d/19uNnJ5MUSk4atx4o8mXMJWeOFMw_-Leo/preview"
  },
  {
    id: "3",
    title: "Receitas Fit - Almoço e Jantar",
    url: "https://drive.google.com/file/d/1JTsloSiGxXICz4do0yjQW72eUeOOtCbY/preview"
  },
  {
    id: "4",
    title: "Receitas de Salgados",
    url: "https://drive.google.com/file/d/1xyfWK_VDc9nNPpblk7IrezK7_Xaz5ojC/preview"
  },
  {
    id: "5",
    title: "Receitas de Sucos",
    url: "https://drive.google.com/file/d/1Mu563GrR7yTZgpekhp2Hdb0iLgI-Doen/preview"
  },
  {
    id: "6",
    title: "Marmitas Fit",
    url: "https://drive.google.com/file/d/1bd38s7A46bEt1gHoRQcb7XvVoi5CrTTF/preview"
  },
  {
    id: "7",
    title: "+100 Receitas Low Carb",
    url: "https://drive.google.com/file/d/1Edb3BLRW1BXcWS4BhkP2vrmH95ZmUsBG/preview"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bonusPDFs.map((pdf) => (
            <Card
              key={pdf.id}
              className="p-6 hover:shadow-glow transition-all cursor-pointer"
              onClick={() => setSelectedPDF(pdf)}
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary p-4 rounded-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{pdf.title}</h3>
                  <p className="text-sm text-muted-foreground">Clique para visualizar</p>
                </div>
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
