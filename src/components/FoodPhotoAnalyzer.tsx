import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Camera, Upload, Download, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NutritionData {
  nome: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  porcao: string;
}

interface FoodPhotoAnalyzerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FoodPhotoAnalyzer = ({ open, onOpenChange }: FoodPhotoAnalyzerProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setNutritionData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food-photo', {
        body: { imageBase64: selectedImage }
      });

      if (error) throw error;

      if (data.success) {
        setNutritionData(data.data);
        toast({
          title: "Análise concluída!",
          description: "Informações nutricionais calculadas com sucesso.",
        });
      } else {
        throw new Error(data.error || "Erro ao analisar foto");
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível analisar a foto",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateShareableImage = () => {
    if (!canvasRef.current || !nutritionData || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1350;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw the food image
    const img = new Image();
    img.onload = () => {
      // Draw food image with rounded corners
      const imgHeight = 500;
      const imgY = 50;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(50, imgY, canvas.width - 100, imgHeight, 20);
      ctx.clip();
      ctx.drawImage(img, 50, imgY, canvas.width - 100, imgHeight);
      ctx.restore();

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(nutritionData.nome, canvas.width / 2, imgY + imgHeight + 80);

      // Portion
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '32px system-ui, -apple-system, sans-serif';
      ctx.fillText(nutritionData.porcao, canvas.width / 2, imgY + imgHeight + 130);

      // Nutrition cards
      const cardY = imgY + imgHeight + 200;
      const cardWidth = 480;
      const cardHeight = 140;
      const gap = 40;

      const nutrients = [
        { label: 'Calorias', value: `${nutritionData.calorias}`, unit: 'kcal', color: '#FF6B6B' },
        { label: 'Proteínas', value: `${nutritionData.proteinas}g`, unit: '', color: '#4ECDC4' },
        { label: 'Carboidratos', value: `${nutritionData.carboidratos}g`, unit: '', color: '#95E1D3' },
        { label: 'Gorduras', value: `${nutritionData.gorduras}g`, unit: '', color: '#F38181' },
        { label: 'Fibras', value: `${nutritionData.fibras}g`, unit: '', color: '#AA96DA' },
      ];

      nutrients.forEach((nutrient, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = 50 + col * (cardWidth + gap);
        const y = cardY + row * (cardHeight + gap);

        // Card background with slight transparency
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight, 15);
        ctx.fill();

        // Colored accent bar
        ctx.fillStyle = nutrient.color;
        ctx.fillRect(x, y, 8, cardHeight);

        // Label
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '28px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(nutrient.label, x + 30, y + 45);

        // Value
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
        ctx.fillText(nutrient.value, x + 30, y + 105);
      });

      // Footer
      ctx.fillStyle = '#666';
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Secando em Casa - Análise com IA', canvas.width / 2, canvas.height - 40);

      // Trigger download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${nutritionData.nome.replace(/\s+/g, '_')}_nutricao.png`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Imagem salva!",
            description: "Sua imagem personalizada foi baixada com sucesso.",
          });
        }
      });
    };
    img.src = selectedImage;
  };

  const handleClose = () => {
    setSelectedImage(null);
    setNutritionData(null);
    setAnalyzing(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Análise Nutricional com IA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedImage ? (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Selecione uma foto da sua refeição</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tire uma foto ou escolha uma da galeria
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Escolher Foto
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Food" 
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => {
                      setSelectedImage(null);
                      setNutritionData(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {!nutritionData && !analyzing && (
                  <Button 
                    onClick={analyzePhoto} 
                    className="w-full bg-gradient-primary"
                  >
                    Analisar Foto
                  </Button>
                )}

                {analyzing && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Analisando sua refeição...</p>
                  </div>
                )}

                {nutritionData && (
                  <div className="space-y-4">
                    <div className="bg-gradient-card p-6 rounded-lg shadow-card">
                      <h3 className="text-xl font-bold mb-2">{nutritionData.nome}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{nutritionData.porcao}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground">Calorias</p>
                          <p className="text-2xl font-bold">{nutritionData.calorias}</p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                        <div className="bg-background/50 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground">Proteínas</p>
                          <p className="text-2xl font-bold">{nutritionData.proteinas}g</p>
                        </div>
                        <div className="bg-background/50 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground">Carboidratos</p>
                          <p className="text-2xl font-bold">{nutritionData.carboidratos}g</p>
                        </div>
                        <div className="bg-background/50 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground">Gorduras</p>
                          <p className="text-2xl font-bold">{nutritionData.gorduras}g</p>
                        </div>
                        <div className="bg-background/50 p-4 rounded-lg col-span-2">
                          <p className="text-xs text-muted-foreground">Fibras</p>
                          <p className="text-2xl font-bold">{nutritionData.fibras}g</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={generateShareableImage} 
                      className="w-full gap-2 bg-gradient-primary"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Imagem para Compartilhar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default FoodPhotoAnalyzer;
