import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

const trainingEvents: Record<string, { name: string; time: string; athletes: number }[]> = {
  "2026-02-17": [{ name: "Відновлювальне", time: "10:00", athletes: 15 }],
  "2026-02-18": [{ name: "Кросфіт", time: "16:00", athletes: 10 }],
  "2026-02-19": [{ name: "Техніка бігу", time: "09:00", athletes: 6 }],
  "2026-02-20": [{ name: "Швидкісна витривалість", time: "16:00", athletes: 12 }],
  "2026-02-21": [{ name: "Силове тренування", time: "10:00", athletes: 8 }],
  "2026-02-22": [{ name: "Техніка бігу", time: "09:00", athletes: 6 }],
  "2026-02-24": [{ name: "Кросфіт", time: "16:00", athletes: 10 }],
  "2026-02-25": [{ name: "Силове тренування", time: "10:00", athletes: 8 }, { name: "Біг 400м", time: "16:00", athletes: 5 }],
  "2026-02-27": [{ name: "Стрибки", time: "11:00", athletes: 7 }],
};

const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-02-21");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const selectedEvents = selectedDate ? trainingEvents[selectedDate] || [] : [];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Календар</h1>
          <p className="text-muted-foreground mt-1">Розклад тренувань</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="font-display font-bold text-xl">
                {monthNames[month]} {year}
              </h2>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {days.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const dateKey = formatDateKey(day);
                const hasEvents = !!trainingEvents[dateKey];
                const isSelected = selectedDate === dateKey;
                const isToday = dateKey === "2026-02-21";

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all
                      ${isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-secondary/50"}
                      ${isToday && !isSelected ? "border border-primary/50" : ""}
                    `}
                  >
                    {day}
                    {hasEvents && (
                      <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-display font-semibold">
              {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("uk-UA", { day: "numeric", month: "long" }) : "Оберіть дату"}
            </h3>
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((ev, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <p className="font-medium text-sm">{ev.name}</p>
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-3">
                      <span>🕐 {ev.time}</span>
                      <span>👥 {ev.athletes} спортсменів</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Немає запланованих тренувань</p>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CalendarPage;
