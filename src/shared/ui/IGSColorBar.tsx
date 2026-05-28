import { useTranslation } from "react-i18next";
import { PREPAREDNESS_TYPES } from "@/entities/athlete/constants";

const IGSColorBar = ({ variant = "full" }: { variant?: "full" | "compact" }) => {
  const { t } = useTranslation("statistics");

  const components = [
    { key: "physical", labelKey: "igs.physical", width: 40, color: PREPAREDNESS_TYPES.find((p) => p.key === "physical")?.color || "#666" },
    { key: "technical", labelKey: "igs.technical", width: 25, color: PREPAREDNESS_TYPES.find((p) => p.key === "technical")?.color || "#666" },
    { key: "tactical", labelKey: "igs.tactical", width: 20, color: PREPAREDNESS_TYPES.find((p) => p.key === "tactical")?.color || "#666" },
    { key: "psychological", labelKey: "igs.psychological", width: 15, color: PREPAREDNESS_TYPES.find((p) => p.key === "psychological")?.color || "#666" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-secondary/30">
        {components.map((comp) => (
          <div
            key={comp.key}
            style={{ width: `${comp.width}%`, backgroundColor: comp.color }}
            className="transition-all"
            title={t(comp.labelKey)}
          />
        ))}
      </div>
      {variant === "full" && (
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          {components.map((comp) => (
            <div key={comp.key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }} />
              <span className="text-muted-foreground">{t(comp.labelKey)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IGSColorBar;
