import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CreatePostCardProps {
  onPostCreated: () => void;
}

export const CreatePostCard = ({ onPostCreated }: CreatePostCardProps) => {
  const [texto, setTexto] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Apenas imagens JPG e PNG são permitidas"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB"
      });
      return;
    }

    setImageFile(file);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagemUrl(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagemUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!texto.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite algo para publicar"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let uploadedImageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
        
        uploadedImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("posts_comunidade")
        .insert({
          user_id: user.id,
          texto: texto.trim(),
          imagem_url: uploadedImageUrl
        });

      if (error) throw error;

      setTexto("");
      setImagemUrl("");
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onPostCreated();
      
      toast({
        title: "Post publicado! 🎉",
        description: "Sua experiência foi compartilhada com a comunidade."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="Compartilhe sua experiência com o desafio... 💪"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-[80px] bg-white/10 border-white/20 text-primary-foreground placeholder:text-white/70 resize-none"
          />
          
          {imagemUrl && (
            <div className="relative">
              <img 
                src={imagemUrl} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-white/20 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-white/90">
                  {imageFile ? imageFile.name : "Adicionar imagem (opcional)"}
                </span>
              </label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !texto.trim()}
              variant="secondary"
              className="font-semibold"
            >
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
