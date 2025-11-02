import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Trophy, Droplet, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    texto: string;
    imagem_url?: string;
    created_at: string;
    profiles?: {
      display_name?: string;
    };
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  badges?: string[];
  onLikeToggle: () => void;
  onCommentAdded: () => void;
}

export const PostCard = ({ post, likesCount, commentsCount, isLiked, badges = [], onLikeToggle, onCommentAdded }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return "agora";
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `há ${Math.floor(seconds / 86400)} dias`;
    return `há ${Math.floor(seconds / 604800)} semanas`;
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          texto: commentText.trim()
        });

      if (error) throw error;

      setCommentText("");
      onCommentAdded();
      toast({
        title: "Comentário publicado!",
        description: "Seu comentário foi adicionado com sucesso."
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

  const getBadgeIcon = (badge: string) => {
    if (badge.includes("30 dias")) return <Trophy className="h-3 w-3" />;
    if (badge.includes("Hidratação")) return <Droplet className="h-3 w-3" />;
    if (badge.includes("Post")) return <Flame className="h-3 w-3" />;
    return <Trophy className="h-3 w-3" />;
  };

  const displayName = post.profiles?.display_name || "Usuário";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Card className="p-4 bg-card border-border hover:shadow-lg transition-all">
      {/* User Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar>
          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{displayName}</h3>
            <span className="text-xs text-muted-foreground">{getTimeAgo(post.created_at)}</span>
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {getBadgeIcon(badge)}
                <span className="ml-1">{badge}</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm mb-3 whitespace-pre-wrap">{post.texto}</p>

      {/* Image */}
      {post.imagem_url && (
        <div className="w-full rounded-lg overflow-hidden mb-3">
          <img 
            src={post.imagem_url} 
            alt="Post" 
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <button 
          onClick={onLikeToggle}
          className={`flex items-center gap-1 text-sm transition-colors ${
            isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Escreva um comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <Button
              onClick={handleComment}
              disabled={loading || !commentText.trim()}
              size="sm"
              className="bg-gradient-primary"
            >
              Enviar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
