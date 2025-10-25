import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Camera, Upload, Download, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/logo-dark.jpg";

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

    // Set canvas size for Instagram Story (9:16)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background - Dark with texture
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load logo and food image
    const logo = new Image();
    const foodImg = new Image();
    
    let imagesLoaded = 0;
    const checkImagesLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        drawCanvas();
      }
    };

    const drawCanvas = () => {
      // Draw logo at top
      const logoHeight = 180;
      const logoWidth = (logo.width / logo.height) * logoHeight;
      const logoX = (canvas.width - logoWidth) / 2;
      ctx.drawImage(logo, logoX, 50, logoWidth, logoHeight);

      // Draw food image with rounded corners
      const foodImgY = 280;
      const foodImgHeight = 550;
      const foodImgWidth = canvas.width - 100;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(50, foodImgY, foodImgWidth, foodImgHeight, 25);
      ctx.clip();
      
      // Calculate aspect ratio for food image
      const aspectRatio = foodImg.width / foodImg.height;
      const targetAspectRatio = foodImgWidth / foodImgHeight;
      let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
      
      if (aspectRatio > targetAspectRatio) {
        drawHeight = foodImgHeight;
        drawWidth = drawHeight * aspectRatio;
        offsetX = -(drawWidth - foodImgWidth) / 2;
      } else {
        drawWidth = foodImgWidth;
        drawHeight = drawWidth / aspectRatio;
        offsetY = -(drawHeight - foodImgHeight) / 2;
      }
      
      ctx.drawImage(foodImg, 50 + offsetX, foodImgY + offsetY, drawWidth, drawHeight);
      ctx.restore();

      // Title with gradient
      const titleGradient = ctx.createLinearGradient(0, 880, 0, 930);
      titleGradient.addColorStop(0, '#FF8C00');
      titleGradient.addColorStop(0.5, '#FFD700');
      titleGradient.addColorStop(1, '#7FFF00');
      ctx.fillStyle = titleGradient;
      ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(nutritionData.nome, canvas.width / 2, 920);

      // Portion
      ctx.fillStyle = '#999';
      ctx.font = '32px system-ui, -apple-system, sans-serif';
      ctx.fillText(nutritionData.porcao, canvas.width / 2, 970);

      // Nutrition cards
      const cardY = 1030;
      const cardWidth = canvas.width - 100;
      const cardHeight = 130;
      const gap = 20;

      const nutrients = [
        { label: 'Calorias', value: `${nutritionData.calorias}`, unit: 'kcal', color: '#FF4500' },
        { label: 'Proteínas', value: `${nutritionData.proteinas}g`, unit: '', color: '#FF8C00' },
        { label: 'Carboidratos', value: `${nutritionData.carboidratos}g`, unit: '', color: '#FFD700' },
        { label: 'Gorduras', value: `${nutritionData.gorduras}g`, unit: '', color: '#FF6347' },
        { label: 'Fibras', value: `${nutritionData.fibras}g`, unit: '', color: '#7FFF00' },
      ];

      nutrients.forEach((nutrient, index) => {
        const y = cardY + index * (cardHeight + gap);

        // Card background with gradient
        const cardGradient = ctx.createLinearGradient(50, y, 50, y + cardHeight);
        cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
        ctx.fillStyle = cardGradient;
        ctx.beginPath();
        ctx.roundRect(50, y, cardWidth, cardHeight, 18);
        ctx.fill();

        // Colored accent bar with glow
        ctx.shadowColor = nutrient.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = nutrient.color;
        ctx.fillRect(50, y, 10, cardHeight);
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '28px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(nutrient.label, 90, y + 50);

        // Value
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
        ctx.fillText(nutrient.value, 90, y + 105);
      });

      // Footer text
      ctx.fillStyle = '#666';
      ctx.font = '26px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Análise com IA', canvas.width / 2, canvas.height - 40);

      // Trigger download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `secando_em_casa_${nutritionData.nome.replace(/\s+/g, '_')}.png`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Imagem salva!",
            description: "Sua imagem está pronta para postar no Instagram Story!",
          });
        }
      });
    };

    logo.onload = checkImagesLoaded;
    logo.onerror = () => {
      console.error('Error loading logo');
      checkImagesLoaded();
    };
    logo.src = logoImage;

    foodImg.onload = checkImagesLoaded;
    foodImg.src = selectedImage;
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
