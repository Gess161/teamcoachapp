import { motion, AnimatePresence } from "framer-motion";
import { Users, X, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AthletesSelectorProps {
  trainingId: Id<"trainings">;
  currentAthleteIds: Id<"athletes">[];
  onClose: () => void;
}

const AthletesSelector = ({ trainingId, currentAthleteIds, onClose }: AthletesSelectorProps) => {
  const athletes = useQuery(api.athletes.getAll) ?? [];
  const updateTraining = useMutation(api.trainings.update);
  const { toast } = useToast();

  const addAthlete = async (athleteId: Id<"athletes">) => {
    if (currentAthleteIds.includes(athleteId)) return;
    await updateTraining({ id: trainingId, athleteIds: [...currentAthleteIds, athleteId] });
    toast({ title: "Спортсмена додано до тренування" });
  };

  const removeAthlete = async (athleteId: Id<"athletes">) => {
    await updateTraining({
      id: trainingId,
      athleteIds: currentAthleteIds.filter((id) => id !== athleteId),
    });
    toast({ title: "Спортсмена видалено" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="glass-card p-6 w-full max-w-md space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Додати спортсменів
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {athletes.length > 0 ? (
              athletes.map((athlete) => {
                const isSelected = currentAthleteIds.includes(athlete._id);
                return (
                  <div
                    key={athlete._id}
                    onClick={() => {
                      if (isSelected) {
                        removeAthlete(athlete._id);
                      } else {
                        addAthlete(athlete._id);
                      }
                    }}
                    className={`p-3 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/20 border border-primary"
                        : "bg-secondary/30 border border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{athlete.name}</p>
                        <p className="text-xs text-muted-foreground">{athlete.specialization}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Спортсменів не знайдено
              </p>
            )}
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Готово
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AthletesSelector;
