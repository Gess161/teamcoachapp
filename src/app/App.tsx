import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, HashRouter } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import Team from "../pages/Team";
import TrainingPage from "../pages/Training";
import History from "../pages/History";
import CalendarPage from "../pages/CalendarPage";
import Statistics from "../pages/Statistics";
import TestsPage from "../pages/TestsPage";
import LearnPage from "../pages/LearnPage";
import NotFound from "../pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    storageKey="theme-preference"
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/team" element={<RequireAuth><Team /></RequireAuth>} />
            <Route path="/training" element={<RequireAuth><TrainingPage /></RequireAuth>} />
            <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
            <Route path="/statistics" element={<RequireAuth><Statistics /></RequireAuth>} />
            <Route path="/tests" element={<RequireAuth><TestsPage /></RequireAuth>} />
            <Route path="/learn" element={<RequireAuth><LearnPage /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
