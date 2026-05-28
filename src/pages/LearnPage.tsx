import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, GraduationCap } from "lucide-react";
import DashboardLayout from "@/shared/ui/DashboardLayout";
import TheoryAccordion from "@/widgets/TheoryAccordion";
import AppHintsGrid from "@/widgets/AppHintsGrid";

const LearnPage = () => {
  const { t } = useTranslation("learn");
  const [activeTab, setActiveTab] = useState<"hints" | "theory">("hints");

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-display font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit">
          {(
            [
              { key: "hints", label: t("tabs.hints"), icon: Lightbulb },
              { key: "theory", label: t("tabs.theory"), icon: GraduationCap },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "hints" ? <AppHintsGrid key="hints" /> : <TheoryAccordion key="theory" />}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default LearnPage;
