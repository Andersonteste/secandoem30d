import { Card } from "@/components/ui/card";
import { Users, MessageCircle, TrendingUp } from "lucide-react";

interface CommunityStatsProps {
  membersCount: number;
  todayPostsCount: number;
  engagementRate: number;
}

export const CommunityStats = ({ membersCount, todayPostsCount, engagementRate }: CommunityStatsProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Nossa Comunidade
      </h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {membersCount.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Membros</div>
        </div>
        <div>
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {todayPostsCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Posts Hoje</div>
        </div>
        <div>
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {engagementRate}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Engajamento</div>
        </div>
      </div>
    </Card>
  );
};
