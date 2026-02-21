import { useLocation, useNavigate } from "react-router-dom";
import { Users, Dumbbell, History, CalendarDays, BarChart3, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Дашборд", url: "/dashboard", icon: LayoutDashboard },
  { title: "Команда", url: "/team", icon: Users },
  { title: "Тренування", url: "/training", icon: Dumbbell },
  { title: "Історія", url: "/history", icon: History },
  { title: "Календар", url: "/calendar", icon: CalendarDays },
  { title: "Статистика", url: "/statistics", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("coach_auth");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-lg">AthletePro</h2>
            <p className="text-xs text-muted-foreground">Панель тренера</p>
          </div>
        </div>
      </div>

      {/* Nav */}
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

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Вийти</span>
        </button>
      </div>
    </aside>
  );
}
