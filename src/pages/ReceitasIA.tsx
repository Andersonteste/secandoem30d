import { Navigation } from "@/components/Navigation";
import { RecipeAIChat } from "@/components/RecipeAIChat";

const ReceitasIA = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <RecipeAIChat />
      </div>
      <Navigation />
    </div>
  );
};

export default ReceitasIA;
