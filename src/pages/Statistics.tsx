import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Target, Activity, Plus, X, Save, Brain, Zap, User } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Січ","Лют","Бер","Кві","Тра","Чер","Лип","Серп","Вер","Жов","Лис","Гру"];

const PREP_COLORS: Record<string, string> = {
  ЗФП: "hsl(200, 70%, 50%)", СФП: "hsl(270, 65%, 60%)", Технічна: "hsl(45, 90%, 55%)",
  Тактична: "hsl(20, 80%, 55%)", Психологічна: "hsl(340, 75%, 55%)",
  Теоретична: "hsl(160, 60%, 45%)", Змішана: "hsl(84, 81%, 44%)",
};

// 12 types of preparedness (Platonov)
const PREPAREDNESS_TYPES = [
  // 5 основних
  { key: "physical",       label: "Фізична",             group: "Основні",    icon: "💪", color: "hsl(84,81%,44%)",
    description: "Рівень розвитку фізичних якостей (сила, витривалість, швидкість, гнучкість, координація)",
    source: "Тести ДЮСШ" },
  { key: "technical",      label: "Технічна",            group: "Основні",    icon: "🎯", color: "hsl(45,90%,55%)",
    description: "Рівень технічної майстерності, точність виконання ігрових дій",
    source: "Оцінка тренера" },
  { key: "tactical",       label: "Тактична",            group: "Основні",    icon: "♟️", color: "hsl(200,70%,50%)",
    description: "Здатність вирішувати ігрові ситуації, читати гру",
    source: "Оцінка тренера" },
  { key: "psychological",  label: "Психологічна",        group: "Основні",    icon: "🧠", color: "hsl(340,75%,55%)",
    description: "Вольові якості, стресостійкість, мотивація, концентрація",
    source: "Оцінка тренера" },
  { key: "theoretical",    label: "Теоретична",          group: "Основні",    icon: "📚", color: "hsl(270,65%,60%)",
    description: "Знання правил, тактичних схем, теорії тренування",
    source: "Теоретичний тест" },
  // 5 розширених
  { key: "functional",     label: "Функціональна",       group: "Розширені",  icon: "❤️", color: "hsl(0,75%,55%)",
    description: "Стан серцево-судинної, дихальної систем; ЧСС, МСК",
    source: "Функц. тести" },
  { key: "psychophysio",   label: "Психофізіологічна",   group: "Розширені",  icon: "⚡", color: "hsl(30,80%,55%)",
    description: "Швидкість реакції, увага, сенсомоторна координація",
    source: "Оцінка тренера" },
  { key: "cognitive",      label: "Когнітивна",          group: "Розширені",  icon: "🔬", color: "hsl(160,60%,45%)",
    description: "Оперативне мислення, пам'ять, прийняття рішень під тиском",
    source: "Оцінка тренера" },
  { key: "morphofunc",     label: "Морфофункціональна",  group: "Розширені",  icon: "📏", color: "hsl(190,65%,45%)",
    description: "Антропометрія: зріст, вага, розмах рук, склад тіла",
    source: "Антропометрія" },
  { key: "recovery",       label: "Відновлювальна",      group: "Розширені",  icon: "🔄", color: "hsl(120,55%,45%)",
    description: "Здатність до відновлення після навантажень, адаптаційний резерв",
    source: "Оцінка тренера" },
  // 2 додаткових
  { key: "coordination",   label: "Координаційна",       group: "Додаткові",  icon: "🤸", color: "hsl(60,85%,50%)",
    description: "Спеціальна координація рухів: рівновага, ритм, диференціація",
    source: "Тести ДЮСШ" },
  { key: "integral",       label: "Інтегральна",         group: "Додаткові",  icon: "🏆", color: "hsl(84,81%,44%)",
    description: "Узагальнений результат взаємодії всіх компонентів. ІГС = 0.4·Ф + 0.25·Т + 0.2·Такт + 0.15·Пс",
    source: "Авто: ІГС" },
] as const;


// ─── Readiness Score Entry Modal ──────────────────────────────────────────────

const ReadinessModal = ({
  athletes,
  onClose,
}: {
  athletes: { _id: Id<"athletes">; name: string }[];
  onClose: () => void;
}) => {
  const createScore = useMutation(api.readinessScores.create);
  const [athleteId, setAthleteId] = useState<string>(athletes[0]?._id ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const setScore = (key: string, v: string) => setScores((p) => ({ ...p, [key]: v }));
  const num = (k: string) => scores[k] ? Number(scores[k]) : undefined;

  // Auto-compute IGS
  const igs = useMemo(() => {
    const p = num("physical"), t = num("technical"),
          ta = num("tactical"), ps = num("psychological");
    if (p !== undefined && t !== undefined && ta !== undefined && ps !== undefined) {
      return Math.round(p * 0.4 + t * 0.25 + ta * 0.2 + ps * 0.15);
    }
    return undefined;
  }, [scores]);

  const handleSave = async () => {
    if (!athleteId) return;
    setSaving(true);
    await createScore({
      athleteId: athleteId as Id<"athletes">,
      date,
      physical: num("physical"),
      technical: num("technical"),
      tactical: num("tactical"),
      psychological: num("psychological"),
      functional: num("functional"),
      coordination: num("coordination"),
      recovery: num("recovery"),
      igs,
      coachNotes: notes || undefined,
    });
    setSaving(false);
    onClose();
  };

  const BASIC_KEYS = ["physical", "technical", "tactical", "psychological"];
  const EXTRA_KEYS = ["functional", "coordination", "recovery"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-xl">Оцінка підготовленості</h2>
            <p className="text-sm text-muted-foreground">Введіть бали від 0 до 100</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-muted-foreground">Спортсмен</label>
            <select value={athleteId} onChange={(e) => setAthleteId(e.target.value)}
              className="w-full h-10 rounded-md bg-secondary/50 border border-border/50 px-3 text-sm text-foreground">
              {athletes.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs text-muted-foreground">Дата оцінки</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary/50 border-border/50" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Основні компоненти (для ІГС)</p>
          <div className="grid grid-cols-2 gap-2">
            {BASIC_KEYS.map((k) => {
              const t = PREPAREDNESS_TYPES.find((x) => x.key === k)!;
              return (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t.icon} {t.label}</label>
                  <Input type="number" min={0} max={100} placeholder="0–100" value={scores[k] ?? ""}
                    onChange={(e) => setScore(k, e.target.value)} className="bg-secondary/50 border-border/50" />
                </div>
              );
            })}
          </div>
          {igs !== undefined && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-semibold">ІГС (авто) = {igs}/100</span>
              <span className="text-xs opacity-70 ml-auto">
                {igs >= 85 ? "Відмінна готовність" : igs >= 70 ? "Добра готовність" : igs >= 55 ? "Задовільна" : "Потребує роботи"}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Додаткові компоненти</p>
          <div className="grid grid-cols-3 gap-2">
            {EXTRA_KEYS.map((k) => {
              const t = PREPAREDNESS_TYPES.find((x) => x.key === k)!;
              return (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t.icon} {t.label}</label>
                  <Input type="number" min={0} max={100} placeholder="0–100" value={scores[k] ?? ""}
                    onChange={(e) => setScore(k, e.target.value)} className="bg-secondary/50 border-border/50" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Нотатки тренера</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Спостереження..." className="bg-secondary/50 border-border/50" />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Скасувати</Button>
          <Button onClick={handleSave} disabled={saving || !athleteId} className="flex-1 gap-2">
            <Save className="w-4 h-4" /> {saving ? "Збереження..." : "Зберегти"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Statistics Main Page ─────────────────────────────────────────────────────

const Statistics = () => {
  const trainingsRaw = useQuery(api.trainings.getAll);
  const athletesRaw  = useQuery(api.athletes.getAll);
  const allScoresRaw = useQuery(api.readinessScores.getAll);

  const trainings = trainingsRaw ?? [];
  const athletes  = athletesRaw  ?? [];
  const allScores = (allScoresRaw ?? []) as {
    _id: string; athleteId: Id<"athletes">; date: string; igs?: number;
    physical?: number; technical?: number; tactical?: number; psychological?: number;
    functional?: number; coordination?: number; recovery?: number;
  }[];
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [selectedAthleteForRadar, setSelectedAthleteForRadar] = useState<string>("all");

  // ─── Loading guard — don't render charts until Convex has responded ─────────
  const isLoading = trainingsRaw === undefined || athletesRaw === undefined || allScoresRaw === undefined;

  // ─── Training volume per month ──────────────────────────────────────────────
  const trainingVolume = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: MONTH_NAMES[d.getMonth()], trainings: trainings.filter((t) => t.date.startsWith(key)).length };
    });
  }, [trainings]);

  // ─── Prep type distribution ─────────────────────────────────────────────────
  const prepDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of trainings) if (t.preparationType) counts[t.preparationType] = (counts[t.preparationType] ?? 0) + 1;
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name, value: Math.round((count / total) * 100), color: PREP_COLORS[name] ?? "hsl(84,81%,44%)",
    }));
  }, [trainings]);

  // ─── 5 physical qualities from training types ───────────────────────────────
  const physicalQualities = useMemo(() => {
    const map: Record<string, number> = { speed: 0, strength: 0, endurance: 0, flexibility: 0, coordination: 0 };
    const prepToQ: Record<string, string[]> = {
      ЗФП: ["endurance","strength"], СФП: ["speed","strength"],
      Технічна: ["coordination"], Тактична: ["coordination","speed"], Змішана: ["endurance"],
    };
    const done = trainings.filter((t) => t.status === "completed");
    for (const t of done) for (const q of prepToQ[t.preparationType ?? ""] ?? []) map[q]++;
    const total = done.length || 1;
    return [
      { quality: "Швидкість", score: Math.round((map.speed / total) * 100) },
      { quality: "Сила", score: Math.round((map.strength / total) * 100) },
      { quality: "Витривалість", score: Math.round((map.endurance / total) * 100) },
      { quality: "Гнучкість", score: Math.round((map.flexibility / total) * 100) },
      { quality: "Координація", score: Math.round((map.coordination / total) * 100) },
    ];
  }, [trainings]);

  // ─── Readiness radar (from readiness_scores) ───────────────────────────────
  const readinessRadar = useMemo(() => {
    const filtered = selectedAthleteForRadar === "all"
      ? allScores
      : allScores.filter((s) => s.athleteId === selectedAthleteForRadar);

    if (filtered.length === 0) return null;

    // Take the latest score (or average across selected)
    const latest = filtered[0];
    return [
      { axis: "Фізична",    value: latest.physical ?? 0 },
      { axis: "Технічна",   value: latest.technical ?? 0 },
      { axis: "Тактична",   value: latest.tactical ?? 0 },
      { axis: "Психол.",    value: latest.psychological ?? 0 },
      { axis: "Функц.",     value: latest.functional ?? 0 },
      { axis: "Координ.",   value: latest.coordination ?? 0 },
      { axis: "Відновл.",   value: latest.recovery ?? 0 },
    ];
  }, [allScores, selectedAthleteForRadar]);

  // ─── Summary ────────────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    completed: trainings.filter((t) => t.status === "completed").length,
    planned:   trainings.filter((t) => t.status === "planned").length,
    totalExercises: trainings.reduce((s, t) => s + t.exercises.length, 0),
    athletes: athletes.length,
  }), [trainings, athletes]);

  const loadDistribution = useMemo(() => {
    const c: Record<string, number> = { В: 0, ЗН: 0, С: 0, М: 0 };
    for (const t of trainings) if (t.loadLevel) c[t.loadLevel] = (c[t.loadLevel] ?? 0) + 1;
    return Object.entries(c).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [trainings]);

  const GROUPS = ["Основні", "Розширені", "Додаткові"] as const;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Завантаження...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Статистика</h1>
            <p className="text-muted-foreground mt-1">Аналіз тренувального процесу</p>
          </div>
          <Button onClick={() => setShowReadinessModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Оцінити підготовленість
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Спортсменів",    value: summary.athletes,       icon: Activity },
            { label: "Завершено",      value: summary.completed,      icon: BarChart3 },
            { label: "Заплановано",    value: summary.planned,        icon: TrendingUp },
            { label: "Всього вправ",   value: summary.totalExercises, icon: Target },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className="w-4 h-4 text-primary/60" />
              </div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Volume */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold">Обсяг тренувань (6 міс.)</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trainingVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
                <XAxis dataKey="month" stroke="hsl(220,10%,50%)" fontSize={12} />
                <YAxis stroke="hsl(220,10%,50%)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor:"hsl(220,18%,11%)", border:"1px solid hsl(220,14%,18%)", borderRadius:"8px", color:"hsl(0,0%,95%)" }}
                  formatter={(v: number) => [v, "Тренувань"]} />
                <Bar dataKey="trainings" fill="hsl(84,81%,44%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 5 Physical Qualities Radar */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold">5 фізичних якостей</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Акцент завершених тренувань за видом підготовки</p>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={physicalQualities}>
                <PolarGrid stroke="hsl(220,14%,18%)" />
                <PolarAngleAxis dataKey="quality" tick={{ fill:"hsl(220,10%,60%)", fontSize:11 }} />
                <Radar name="%" dataKey="score" stroke="hsl(84,81%,44%)" fill="hsl(84,81%,44%)" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor:"hsl(220,18%,11%)", border:"1px solid hsl(220,14%,18%)", borderRadius:"8px", color:"hsl(0,0%,95%)" }}
                  formatter={(v: number) => [`${v}%`, "Акцент"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Prep type pie */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold">Вид підготовки</h2>
            </div>
            {prepDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">Немає тренувань з вказаним видом підготовки</p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={190}>
                  <PieChart>
                    <Pie data={prepDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                      {prepDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor:"hsl(220,18%,11%)", border:"1px solid hsl(220,14%,18%)", borderRadius:"8px", color:"hsl(0,0%,95%)" }}
                      formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {prepDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Load levels */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold">Рівні навантаження (Платонов)</h2>
            </div>
            {loadDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">Немає тренувань з вказаним навантаженням</p>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={loadDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(220,10%,50%)" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(220,10%,50%)" fontSize={13} width={30} />
                  <Tooltip contentStyle={{ backgroundColor:"hsl(220,18%,11%)", border:"1px solid hsl(220,14%,18%)", borderRadius:"8px", color:"hsl(0,0%,95%)" }}
                    formatter={(v: number) => [v, "Тренувань"]} />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {loadDistribution.map((_e, i) => {
                      const colors = ["hsl(340,75%,55%)","hsl(20,80%,55%)","hsl(45,90%,55%)","hsl(160,60%,45%)"];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ─── 12 Types of Preparedness ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-xl">12 видів підготовленості (Платонов)</h2>
            </div>
          </div>

          {GROUPS.map((group) => {
            const types = PREPAREDNESS_TYPES.filter((t) => t.group === group);
            return (
              <div key={group} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{group}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {types.map((t) => (
                    <motion.div
                      key={t.key}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass-card p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{t.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{t.label}</p>
                            <p className="text-xs text-muted-foreground">{t.source}</p>
                          </div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: t.color }} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Readiness scores radar (if data exists) ───────────────────────── */}
        {allScores.length > 0 && (
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold">ІГС — Індекс готовності спортсмена</h2>
              </div>
              <select
                value={selectedAthleteForRadar}
                onChange={(e) => setSelectedAthleteForRadar(e.target.value)}
                className="h-8 rounded-md bg-secondary/50 border border-border/50 px-2 text-sm text-foreground"
              >
                <option value="all">Всі (останній)</option>
                {athletes.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>

            {readinessRadar ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={readinessRadar}>
                    <PolarGrid stroke="hsl(220,14%,18%)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill:"hsl(220,10%,60%)", fontSize:11 }} />
                    <Radar name="Підготовленість" dataKey="value" stroke="hsl(84,81%,44%)" fill="hsl(84,81%,44%)" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor:"hsl(220,18%,11%)", border:"1px solid hsl(220,14%,18%)", borderRadius:"8px", color:"hsl(0,0%,95%)" }}
                      formatter={(v: number) => [`${v}/100`, ""]} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {readinessRadar.map((r) => (
                    <div key={r.axis} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-20 shrink-0">{r.axis}</span>
                      <div className="flex-1 bg-secondary/50 rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${r.value}%` }} />
                      </div>
                      <span className="text-sm font-mono font-medium w-10 text-right">{r.value}</span>
                    </div>
                  ))}
                  {/* IGS */}
                  {(() => {
                    const latest = selectedAthleteForRadar === "all"
                      ? allScores[0]
                      : allScores.find((s) => s.athleteId === selectedAthleteForRadar);
                    if (!latest?.igs) return null;
                    return (
                      <div className="mt-4 p-3 rounded-lg bg-primary/10 text-center">
                        <p className="text-xs text-muted-foreground">ІГС (Індекс готовності)</p>
                        <p className="text-3xl font-display font-bold text-primary">{latest.igs}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {latest.igs >= 85 ? "Відмінна готовність до змагань" :
                           latest.igs >= 70 ? "Добра готовність" :
                           latest.igs >= 55 ? "Задовільна готовність" : "Потребує підготовки"}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Немає даних для обраного спортсмена
              </p>
            )}
          </div>
        )}

        {allScores.length === 0 && (
          <div className="glass-card p-8 text-center border border-dashed border-border/50">
            <Brain className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">Оцінок підготовленості ще немає</p>
            <p className="text-sm text-muted-foreground/60 mt-1 mb-4">
              Додайте оцінку щоб побачити ІГС та radar-діаграму підготовленості
            </p>
            <Button onClick={() => setShowReadinessModal(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Додати оцінку
            </Button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showReadinessModal && (
          <ReadinessModal
            athletes={athletes}
            onClose={() => setShowReadinessModal(false)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Statistics;
