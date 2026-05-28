import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { sections } from "@/entities/learn/constants";

const AccordionItem = ({
  sectionId,
  icon: Icon,
  color,
}: {
  sectionId: string;
  icon: React.ElementType;
  color: string;
}) => {
  const { t } = useTranslation("learn");
  const [open, setOpen] = useState(false);

  const title = t(`sections.${sectionId}.title`);
  const content = t(`sections.${sectionId}.content`, { returnObjects: true }) as { heading: string; text: string }[];

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-secondary/20 transition-colors"
      >
        <Icon className={`w-5 h-5 shrink-0 ${color}`} />
        <span className="font-display font-semibold flex-1">{title}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-border/40 pt-4">
              {Array.isArray(content) && content.map((c) => (
                <div key={c.heading}>
                  <h4 className={`text-sm font-semibold mb-1 ${color}`}>{c.heading}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TheoryAccordion = () => {
  const { t } = useTranslation("learn");

  return (
    <motion.div
      key="theory"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div className="glass-card p-4 flex items-start gap-3 border border-primary/20">
        <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">{t("theorySource")}</p>
          <p className="text-muted-foreground">{t("theorySourceText")}</p>
        </div>
      </div>
      <div className="space-y-3">
        {sections.map((s) => (
          <AccordionItem key={s.id} sectionId={s.id} icon={s.icon} color={s.color} />
        ))}
      </div>
    </motion.div>
  );
};

export default TheoryAccordion;
