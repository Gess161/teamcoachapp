import { PREPAREDNESS_TYPES } from "@/entities/athlete/constants";

const IGSColorBar = ({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) => {
  // IGS components with their colors and weights
  // ІГС = 0.4·Фізична + 0.25·Технічна + 0.2·Тактична + 0.15·Психологічна
  const components = [
    {
      key: "physical",
      label: "Фізична (40%)",
      width: 40,
      color:
        PREPAREDNESS_TYPES.find((p) => p.key === "physical")?.color || "#666",
    },
    {
      key: "technical",
      label: "Технічна (25%)",
      width: 25,
      color:
        PREPAREDNESS_TYPES.find((p) => p.key === "technical")?.color || "#666",
    },
    {
      key: "tactical",
      label: "Тактична (20%)",
      width: 20,
      color:
        PREPAREDNESS_TYPES.find((p) => p.key === "tactical")?.color || "#666",
    },
    {
      key: "psychological",
      label: "Психологічна (15%)",
      width: 15,
      color:
        PREPAREDNESS_TYPES.find((p) => p.key === "psychological")?.color ||
        "#666",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-secondary/30">
        {components.map((comp) => (
          <div
            key={comp.key}
            style={{
              width: `${comp.width}%`,
              backgroundColor: comp.color,
            }}
            className="transition-all"
            title={comp.label}
          />
        ))}
      </div>
      {variant === "full" && (
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          {components.map((comp) => (
            <div key={comp.key} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: comp.color }}
              />
              <span className="text-muted-foreground">{comp.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IGSColorBar;
