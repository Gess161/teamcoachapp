import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { PREPAREDNESS_TYPES } from "@/entities/readiness/constants";

const GROUPS = ["Основні", "Розширені", "Додаткові"] as const;

const PreparednessGrid = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-xl">
          12 видів підготовленості (Платонов)
        </h2>
      </div>
    </div>

    {GROUPS.map((group) => {
      const types = PREPAREDNESS_TYPES.filter((t) => t.group === group);
      return (
        <div key={group} className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {group}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {types.map((t) => (
              <motion.div
                key={t.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default PreparednessGrid;
