import { motion } from "framer-motion";
import { appHints } from "@/entities/learn/constants";

const HintCard = ({ group }: { group: (typeof appHints)[0] }) => {
  const Icon = group.icon;
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg ${group.bg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 ${group.color}`} />
        </div>
        <h3 className="font-display font-semibold">{group.title}</h3>
      </div>
      <ul className="space-y-2">
        {group.hints.map((hint, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className={`text-xs font-bold mt-0.5 shrink-0 ${group.color}`}>
              {i + 1}.
            </span>
            <span className="leading-relaxed">{hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AppHintsGrid = () => (
  <motion.div
    key="hints"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="space-y-4"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {appHints.map((group) => (
        <HintCard key={group.title} group={group} />
      ))}
    </div>
  </motion.div>
);

export default AppHintsGrid;
