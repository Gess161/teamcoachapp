import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users, Dumbbell, History, CalendarDays, BarChart3,
  LogOut, LayoutDashboard, ClipboardCheck, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.team"), url: "/team", icon: Users },
    { title: t("nav.training"), url: "/training", icon: Dumbbell },
    { title: t("nav.tests"), url: "/tests", icon: ClipboardCheck },
    { title: t("nav.history"), url: "/history", icon: History },
    { title: t("nav.calendar"), url: "/calendar", icon: CalendarDays },
    { title: t("nav.statistics"), url: "/statistics", icon: BarChart3 },
    { title: t("nav.learn"), url: "/learn", icon: BookOpen },
  ];

  const handleLogout = () => {
    localStorage.removeItem("coach_auth");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-lg">{t("sidebar.appName")}</h2>
            <p className="text-xs text-muted-foreground">{t("sidebar.coachPanel")}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <button
              key={item.url}
              onClick={() => navigate(item.url)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary glow-border"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
