import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface DaySelectorProps {
  selectedDay: number;
  completedDays: number[];
  onDaySelect: (day: number) => void;
}

const DaySelector = ({ selectedDay, completedDays, onDaySelect }: DaySelectorProps) => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">Selecione o Dia</h3>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-card p-2">
        <div className="flex gap-2">
          {days.map((day) => {
            const isCompleted = completedDays.includes(day);
            const isSelected = selectedDay === day;
            
            return (
              <Button
                key={day}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onDaySelect(day)}
                className={`
                  relative min-w-[48px] h-12 flex-col gap-1 transition-all
                  ${isSelected && "bg-gradient-primary shadow-glow"}
                  ${isCompleted && !isSelected && "border-primary"}
                `}
              >
                {isCompleted && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-primary" />
                )}
                <span className="text-xs">Dia</span>
                <span className="font-bold">{day}</span>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default DaySelector;