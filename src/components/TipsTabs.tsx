import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Droplets, AlertCircle, Clock } from "lucide-react";

const TipsTabs = () => {
  return (
    <Card className="p-6 mb-8 bg-gradient-card shadow-card">
      <h2 className="text-2xl font-bold mb-4">Dicas Importantes</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="praticas">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Dicas Práticas
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Não pule nenhuma refeição</h4>
                  <p className="text-muted-foreground">Pular refeições achando que assim vai emagrecer mais rápido é uma péssima estratégia. Na verdade o efeito é contrário! O organismo entende que você está passando fome e aí o metabolismo fica bem lento e você acaba estocando gordura.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Tome café da manhã</h4>
                  <p className="text-muted-foreground">Depois de horas sem se alimentar, o corpo precisa repor energia logo que acorda. O café da manhã faz com que o nosso metabolismo volte a funcionar corretamente, pois durante a noite, ele fica lento e sem receber energia.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Não confunda fome com sede</h4>
                  <p className="text-muted-foreground">A sensação de sede pode, em alguns momentos, ser confundida com a sensação de fome. Mantenha seu corpo hidratado. O nosso corpo precisa de oito a dez copos de água por dia. A água é eficaz porque ajuda a encher o estômago, com isso, a aumentar a saciedade. Beber alguns copos de água, 40 minutos antes das refeições dá tempo para você se sentir mais satisfeita.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Coma devagar e mastigue bem</h4>
                  <p className="text-muted-foreground">Comer devagar é extremamente importante. Mastigar bem é o começo de uma boa digestão. Comer devagar ajuda na perda de peso porque dá tempo da sensação de saciedade chegar até o cérebro, indicando que o estômago está cheio e que é o momento de parar de comer.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Evite ao MÁXIMO tomar refrigerante</h4>
                  <p className="text-muted-foreground">Evite tomar refrigerantes porque além de não fazer bem a saúde ele também engorda MUUUUUITO. Quando você sair para algum lugar e der aquela vontade de tomar refrigerante, tenta trocar por algum suco! Aprenda a gostar mais de sucos naturais do que de refrigerante okay? Posso contar com você?</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="liquidos">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Líquidos à Vontade
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-4 text-sm">
              <div className="flex gap-2">
                <Droplets className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Líquidos à Vontade</h4>
                  <p className="text-muted-foreground mb-3">Antes de começar você precisa entender que consumo de líquidos é um aliado extremamente poderoso neste processo. Chás e sucos são muito importantes no processo de desintoxicação. Os chás são diuréticos e ajudam a drenar os malefícios do seu corpo, muitos também ativam o metabolismo, como o chá verde, o de gengibre e o de hibisco. Os sucos detox devem fazer parte desta reeducação, pois frutas como abacaxi, melancia e couve potencializam o processo.</p>
                </div>
              </div>
              
              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">A RECOMENDAÇÃO DO NOSSO DESAFIO É INGERIR 3 LITROS DE ÁGUA POR DIA.</h4>
                <p className="text-muted-foreground mb-3">A ÁGUA LIMPA E PURIFICA O NOSSO ORGANISMO!</p>
                
                <h5 className="font-semibold mb-2">Ou você pode calcular a quantidade pelo seu peso:</h5>
                <p className="text-muted-foreground mb-2">Multiplique 30 mililitros por seu peso</p>
                <p className="text-muted-foreground mb-2">Por exemplo, se você pesa 90 kg deve ingerir 2,7 litros de água por dia</p>
                <p className="text-muted-foreground mb-2">O cálculo é feito assim: 30 ml de água para cada kg de peso corporal.</p>
                <p className="text-muted-foreground mb-2">Dessa maneira, é necessário multiplicar seu peso em kg por 30 para obter o resultado em ML, por exemplo: 90kg X 30 = 2.700 ml ou 2 litros e 700 ml.</p>
                <p className="text-muted-foreground">Muito fácil né? Agora vamos imaginar que você pesa 70kg. 70 x 30 = 2.100 ou 2,100 litros</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">RECOMENDAÇÕES - ATENÇÃO!</h4>
                <p className="font-semibold mb-2">ISSO NÃO PODE FALTAR DURANTE O DESAFIO!</p>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Chá secreto 1L por dia - OBRIGATÓRIO</li>
                  <li>O uso dos Sucos detox - OBRIGATÓRIO</li>
                  <li>Jejum - OBRIGATÓRIO</li>
                  <li>Exercícios funcionais - OBRIGATÓRIO</li>
                </ul>
                
                <h5 className="font-semibold mt-3 mb-2">OBRIGATÓRIO</h5>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Não tomar refrigerantes</li>
                  <li>Não comer frituras</li>
                  <li>Evitar o máximo de ingerir açúcar</li>
                </ul>
                <p className="text-muted-foreground mt-2 italic">"Você sabia que um dos maiores causadores de inflamação do organismo é o açúcar? Se você remover o açúcar do seu dia a dia, além do seu corpo ficar mais saudável, você vai desintoxicar e perder muito peso apenas por esse pequeno detalhe. O açúcar causa inflamação e muito ganho de peso!"</p>
                
                <p className="text-muted-foreground mt-3">Lembrando que você tem a opção também, de substituir as refeições grande (almoço e jantar) por sucos detox</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="jejum">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Jejum Como Fazer
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-4 text-sm">
              <div className="flex gap-2">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Jejum Como Fazer</h4>
                  <p className="text-muted-foreground mb-3">Entenda que o jejum é um hábito poderoso neste processo, no período de jejum você permite que seu corpo faça uma manutenção interna, desintoxicando e limpando tudo o que precisa ser eliminado do seu corpo. As células intoxicadas e que não estão funcionando como deveriam são automaticamente desligadas e eliminadas do seu corpo, no jejum você ativa o mecanismo de limpeza e proteção das suas células. Por isso, é tão importante fazer o jejum durante o processo do desafio.</p>
                  <p className="text-muted-foreground mb-3">Portanto, aprenda que o jejum é uma prática com inúmeros benefícios que pode ser feita sempre!</p>
                </div>
              </div>
              
              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Tarefa diária:</h4>
                <p className="text-muted-foreground mb-3">Fazer jejum de no mínimo, 12 horas todos os dias, na parte da noite.</p>
                
                <h5 className="font-semibold mb-2">Exemplos:</h5>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Jantou às 18h, jejum à noite toda, encerrar jejum às 6h da manhã</li>
                  <li>Jantou às 19h, jejum à noite toda, encerrar o jejum às 7h da manhã</li>
                  <li>Jantou às 20h, jejum à noite toda, encerrar o jejum às 8h da manhã</li>
                </ul>
                
                <p className="text-muted-foreground mt-3 font-semibold">Na manhã seguinte, em jejum consuma 200 ml de água morna com 1/2 limão espremido, todos os dias.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default TipsTabs;