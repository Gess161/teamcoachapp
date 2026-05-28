import {
  RefreshCw, Layers, BarChart2, Zap, Target, Lightbulb,
  Users, Dumbbell, ClipboardCheck, BarChart3, MousePointer, GraduationCap,
} from "lucide-react";

export const sections = [
  { id: "periodization", icon: RefreshCw, color: "text-blue-400" },
  { id: "mesocycles", icon: Layers, color: "text-violet-400" },
  { id: "load", icon: BarChart2, color: "text-yellow-400" },
  { id: "qualities", icon: Zap, color: "text-primary" },
  { id: "itn", icon: Target, color: "text-orange-400" },
  { id: "calendar", icon: Lightbulb, color: "text-pink-400" },
] as const;

export const appHints = [
  { id: "team", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "training", icon: Dumbbell, color: "text-primary", bg: "bg-primary/10" },
  { id: "tests", icon: ClipboardCheck, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { id: "statistics", icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10" },
  { id: "history", icon: MousePointer, color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "tips", icon: Lightbulb, color: "text-green-400", bg: "bg-green-500/10" },
  { id: "calendar", icon: GraduationCap, color: "text-pink-400", bg: "bg-pink-500/10" },
] as const;
