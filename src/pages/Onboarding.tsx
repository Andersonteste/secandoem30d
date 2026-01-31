import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Target, Activity, Calendar, Apple, TrendingUp, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is authenticated and if onboarding is already completed
  useEffect(() => {
    let isMounted = true;

    const checkAuthAndOnboarding = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session?.user) {
          navigate("/auth", { replace: true });
          return;
        }

        // Check if onboarding is already completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (!isMounted) return;

        // If onboarding already completed, redirect to dashboard
        if (profile?.onboarding_completed === true) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuthAndOnboarding();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Form data
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [availableDays, setAvailableDays] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const goalOptions = [
    { value: "lose_weight", label: "Perder Peso", icon: TrendingUp },
    { value: "gain_muscle", label: "Ganhar Massa Muscular", icon: Activity },
    { value: "get_fit", label: "Ficar em Forma", icon: Target },
    { value: "maintain", label: "Manter Peso Atual", icon: Target }
  ];

  const experienceOptions = [
    { value: "beginner", label: "Iniciante", desc: "Pouca ou nenhuma experiência" },
    { value: "intermediate", label: "Intermediário", desc: "Alguma experiência com treinos" },
    { value: "advanced", label: "Avançado", desc: "Experiência significativa" }
  ];

  const dietaryOptions = [
    { value: "vegetarian", label: "Vegetariano" },
    { value: "vegan", label: "Vegano" },
    { value: "lactose_intolerant", label: "Intolerante à Lactose" },
    { value: "gluten_free", label: "Sem Glúten" },
    { value: "none", label: "Nenhuma restrição" }
  ];

  const handleDietaryChange = (value: string) => {
    if (value === "none") {
      setDietaryRestrictions([]);
    } else {
      setDietaryRestrictions(prev => 
        prev.includes(value) 
          ? prev.filter(item => item !== value)
          : [...prev.filter(item => item !== "none"), value]
      );
    }
  };

  const handleNext = () => {
    if (step === 1 && (!age || !weight || !height)) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }
    if (step === 2 && !goal) {
      toast({
        variant: "destructive",
        title: "Selecione um objetivo",
        description: "Por favor, escolha seu objetivo principal."
      });
      return;
    }
    if (step === 3 && !targetWeight) {
      toast({
        variant: "destructive",
        title: "Meta de peso",
        description: "Por favor, defina sua meta de peso."
      });
      return;
    }
    if (step === 4 && !experienceLevel) {
      toast({
        variant: "destructive",
        title: "Nível de experiência",
        description: "Por favor, selecione seu nível de experiência."
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!availableDays) {
      toast({
        variant: "destructive",
        title: "Dias disponíveis",
        description: "Por favor, informe quantos dias pode treinar."
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const { error } = await supabase
        .from("profiles")
        .update({
          age: parseInt(age),
          weight_kg: parseFloat(weight),
          height_cm: parseInt(height),
          target_weight_kg: parseFloat(targetWeight),
          goal,
          experience_level: experienceLevel,
          available_days: parseInt(availableDays),
          dietary_restrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : null,
          onboarding_completed: true
        })
        .eq("id", user.id);

      if (error) throw error;

      // Add initial weight log
      await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight_kg: parseFloat(weight)
      });

      toast({
        title: "Perfil criado com sucesso!",
        description: "Seu programa personalizado está pronto."
      });

      navigate("/dashboard");
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

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-fade-in">
        <CardContent className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Vamos Personalizar Seu Programa
            </h1>
            <p className="text-muted-foreground">
              Passo {step} de {totalSteps}
            </p>
            <Progress value={progress} className="mt-4" />
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Informações Básicas</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ex: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="15"
                  max="100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso Atual (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 70.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ex: 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goal Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Qual é o Seu Objetivo?</h2>
              </div>

              <RadioGroup value={goal} onValueChange={setGoal}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${
                        goal === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <option.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Target Weight */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Meta de Peso</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Qual é o seu peso ideal? (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 65.0"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Peso atual: {weight}kg | Diferença: {weight && targetWeight ? Math.abs(parseFloat(weight) - parseFloat(targetWeight)).toFixed(1) : "0"}kg
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Experience Level */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Nível de Experiência</h2>
              </div>

              <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
                <div className="space-y-3">
                  {experienceOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${
                        experienceLevel === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 5: Schedule & Diet */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Disponibilidade e Dieta</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableDays">Quantos dias por semana pode treinar?</Label>
                <Input
                  id="availableDays"
                  type="number"
                  placeholder="Ex: 5"
                  value={availableDays}
                  onChange={(e) => setAvailableDays(e.target.value)}
                  min="1"
                  max="7"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-primary" />
                  <Label>Restrições Alimentares</Label>
                </div>
                <div className="space-y-2">
                  {dietaryOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={
                          option.value === "none" 
                            ? dietaryRestrictions.length === 0 
                            : dietaryRestrictions.includes(option.value)
                        }
                        onCheckedChange={() => handleDietaryChange(option.value)}
                      />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="ml-auto bg-gradient-primary"
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="ml-auto bg-gradient-primary"
              >
                {loading ? "Criando seu programa..." : "Começar Desafio"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
