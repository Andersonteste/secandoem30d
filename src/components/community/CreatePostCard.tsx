import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CreatePostCardProps {
  onPostCreated: () => void;
}

export const CreatePostCard = ({ onPostCreated }: CreatePostCardProps) => {
  const [texto, setTexto] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [loading, setLoading] = useState(false);

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

      const { error } = await supabase
        .from("posts_comunidade")
        .insert({
          user_id: user.id,
          texto: texto.trim(),
          imagem_url: imagemUrl.trim() || null
        });

      if (error) throw error;

      setTexto("");
      setImagemUrl("");
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
                className="w-full h-32 object-cover rounded-lg"
                onError={() => setImagemUrl("")}
              />
              <button
                onClick={() => setImagemUrl("")}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <input
                type="text"
                placeholder="URL da imagem (opcional)"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-md px-3 py-1 text-sm placeholder:text-white/70"
              />
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
