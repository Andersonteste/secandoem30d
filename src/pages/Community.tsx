import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { CommunityStats } from "@/components/community/CommunityStats";
import { BannerCarousel } from "@/components/BannerCarousel";

interface Post {
  id: string;
  user_id: string;
  texto: string;
  imagem_url?: string;
  created_at: string;
  profiles?: {
    display_name?: string;
  };
}

interface PostWithStats extends Post {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  badges: string[];
}

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [groupUrl, setGroupUrl] = useState("");
  const [membersCount, setMembersCount] = useState(0);
  const [todayPostsCount, setTodayPostsCount] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPosts(),
        loadSettings(),
        loadStats()
      ]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados da comunidade"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from("community_settings")
      .select("link_grupo_vip")
      .single();
    
    if (data) {
      setGroupUrl(data.link_grupo_vip);
    }
  };

  const loadStats = async () => {
    // Count members
    const { count: members } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    
    setMembersCount(members || 0);

    // Count today's posts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayPosts } = await supabase
      .from("posts_comunidade")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());
    
    setTodayPostsCount(todayPosts || 0);

    // Calculate engagement rate
    const { data: allPosts } = await supabase
      .from("posts_comunidade")
      .select("id");
    
    if (allPosts && allPosts.length > 0) {
      const { count: totalLikes } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true });
      
      const { count: totalComments } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true });
      
      const engagement = Math.round(((totalLikes || 0) + (totalComments || 0)) / allPosts.length * 100);
      setEngagementRate(Math.min(engagement, 100));
    }
  };

  const loadPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: postsData, error } = await supabase
      .from("posts_comunidade")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (postsData) {
      // Get profiles data separately
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name");

      const postsWithStats = await Promise.all(
        postsData.map(async (post) => {
          const profile = profilesData?.find(p => p.id === post.user_id);
          const { count: likesCount } = await supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          const { count: commentsCount } = await supabase
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          let isLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from("post_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .single();
            
            isLiked = !!likeData;
          }

          // Get user badges
          const badges = await getUserBadges(post.user_id);

          return {
            ...post,
            profiles: profile ? { display_name: profile.display_name } : undefined,
            likesCount: likesCount || 0,
            commentsCount: commentsCount || 0,
            isLiked,
            badges
          };
        })
      );

      setPosts(postsWithStats);
    }
  };

  const getUserBadges = async (userId: string): Promise<string[]> => {
    const badges: string[] = [];

    // Check for 30 days challenge completion
    const { count: completedDays } = await supabase
      .from("challenge_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    if (completedDays && completedDays >= 30) {
      badges.push("🥇 Concluiu 30 dias");
    }

    // Check for hydration streak (simplified - would need more complex logic)
    const { count: postsCount } = await supabase
      .from("posts_comunidade")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (postsCount && postsCount >= 5) {
      badges.push("💬 Postou 5 vezes");
    }

    return badges;
  };

  const handleLikeToggle = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        // Unlike
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        // Like
        await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      loadPosts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pt-20">
      <Navigation />
      
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-glow">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Comunidade Fit</h1>
              <p className="text-sm opacity-90">Conecte-se com outras pessoas no desafio</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Community Stats */}
        <CommunityStats
          membersCount={membersCount}
          todayPostsCount={todayPostsCount}
          engagementRate={engagementRate}
        />

        {/* Banners */}
        <div className="my-8">
          <BannerCarousel />
        </div>

        {/* Create Post Card */}
        <div className="mb-8">
          <CreatePostCard onPostCreated={loadPosts} />
        </div>

        {/* Feed Title */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Feed da Comunidade
        </h2>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando posts...
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum post ainda. Seja o primeiro a compartilhar sua experiência! 💪
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                likesCount={post.likesCount}
                commentsCount={post.commentsCount}
                isLiked={post.isLiked}
                badges={post.badges}
                onLikeToggle={() => handleLikeToggle(post.id)}
                onCommentAdded={loadPosts}
              />
            ))}
          </div>
        )}

        {/* Group VIP CTA Footer */}
        {groupUrl && (
          <Card className="mt-8 p-6 bg-gradient-primary text-primary-foreground text-center shadow-glow">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Entre no Grupo VIP 🔥</h3>
            <p className="text-sm opacity-90 mb-4">
              Conecte-se com outros participantes em tempo real no WhatsApp!
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="font-semibold"
              onClick={() => window.open(groupUrl, "_blank")}
            >
              👉 Entrar no Grupo VIP
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;
