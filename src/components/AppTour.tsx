import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTheme } from 'next-themes';

interface AppTourProps {
  run: boolean;
  onComplete: () => void;
}

const AppTour = ({ run, onComplete }: AppTourProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps: Step[] = [
    {
      target: '[data-tour="header"]',
      content: 'Bem-vindo ao Secando em Casa! 🎉 Aqui você vê suas informações e pode alternar entre modo claro e escuro.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="weight-progress"]',
      content: 'Acompanhe seu progresso de peso em tempo real. O círculo mostra o quanto você já avançou em direção à sua meta! 📊',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-progress"]',
      content: 'Aqui você vê quantos dias do desafio já completou. São 30 dias para transformar seu corpo! 💪',
      placement: 'bottom',
    },
    {
      target: '[data-tour="tips"]',
      content: 'Dicas valiosas de alimentação, treino e bem-estar para você consultar sempre que precisar! 📚',
      placement: 'top',
    },
    {
      target: '[data-tour="hydration"]',
      content: 'Não esqueça de se hidratar! Marque aqui quantos copos de água você bebeu hoje. 💧',
      placement: 'top',
    },
    {
      target: '[data-tour="day-selector"]',
      content: 'Navegue pelos dias do desafio. Os dias completos ficam marcados em verde! ✅',
      placement: 'top',
    },
    {
      target: '[data-tour="daily-content"]',
      content: 'Veja as refeições e treinos de cada dia. Tudo personalizado para você! 🍽️🏋️',
      placement: 'top',
    },
    {
      target: '[data-tour="ai-tools"]',
      content: 'Ferramentas exclusivas com IA! Gere receitas, analise fotos de comida e encontre substituições saudáveis. ✨',
      placement: 'top',
    },
    {
      target: '[data-tour="quick-actions"]',
      content: 'Acesse rapidamente: Bônus exclusivos, comunidade, seu diário alimentar e nossa loja de produtos! 🚀',
      placement: 'top',
    },
    {
      target: '[data-tour="navigation"]',
      content: 'Use o menu para navegar entre todas as seções do app. Explore tudo! 🧭',
      placement: 'top',
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete();
    }
  };

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleCallback}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Concluir',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
      styles={{
        options: {
          primaryColor: 'hsl(25, 95%, 45%)',
          backgroundColor: isDark ? 'hsl(240, 10%, 10%)' : 'hsl(0, 0%, 100%)',
          textColor: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
          arrowColor: isDark ? 'hsl(240, 10%, 10%)' : 'hsl(0, 0%, 100%)',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContent: {
          fontSize: '15px',
          lineHeight: 1.6,
        },
        buttonNext: {
          backgroundColor: 'hsl(25, 95%, 45%)',
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600,
        },
        buttonBack: {
          color: isDark ? 'hsl(0, 0%, 70%)' : 'hsl(240, 10%, 40%)',
          marginRight: 10,
        },
        buttonSkip: {
          color: isDark ? 'hsl(0, 0%, 50%)' : 'hsl(240, 10%, 50%)',
        },
        spotlight: {
          borderRadius: 12,
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};

export default AppTour;
