import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsDetailsModalProps {
  isOpen: boolean;
  trainingName?: string;
  trainingDate?: string;
  results?: any;
  onClose: () => void;
}

const ResultsDetailsModal = ({
  isOpen,
  trainingName,
  trainingDate,
  results,
  onClose,
}: ResultsDetailsModalProps) => {
  if (!results) return null;

  const athleteCount = results.results?.length || 0;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <div className="glass-card max-w-6xl w-full max-h-[90vh] overflow-y-auto space-y-6 p-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    Результати тренування
                  </h2>
                  <p className="text-muted-foreground mt-1">{trainingName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Info Bar */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm">{trainingDate}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">{athleteCount} спортсменів</span>
                </div>
              </div>

              {/* Results Table */}
              {results.results && results.results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg">
                    Результати спортсменів
                  </h3>

                  <div className="space-y-4">
                    {results.results.map((athleteResult: any, idx: number) => (
                      <motion.div
                        key={athleteResult.athleteId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-card p-4 space-y-3"
                      >
                        <h4 className="font-semibold text-primary">
                          {athleteResult.athleteName || `Спортсмен ${idx + 1}`}
                        </h4>

                        {/* Exercise Results */}
                        {athleteResult.exerciseResults &&
                          Object.keys(athleteResult.exerciseResults).length >
                            0 && (
                            <div className="space-y-2 text-sm">
                              <p className="text-muted-foreground font-medium">
                                Результати вправ:
                              </p>
                              <div className="space-y-1 pl-4">
                                {Object.entries(
                                  athleteResult.exerciseResults,
                                ).map(([exerciseId, criteria]: any) => (
                                  <div
                                    key={exerciseId}
                                    className="text-muted-foreground"
                                  >
                                    {criteria.map(
                                      (criterion: any, idx: number) => (
                                        <div
                                          key={`${exerciseId}_${idx}`}
                                          className="text-xs py-1"
                                        >
                                          • Критерій {criterion.criterionId}:{" "}
                                          <span className="font-medium text-foreground">
                                            {criterion.value}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Global Results */}
                        {athleteResult.globalResults &&
                          athleteResult.globalResults.length > 0 && (
                            <div className="space-y-2 text-sm pt-2 border-t border-primary/10">
                              <p className="text-muted-foreground font-medium">
                                Загальні критерії:
                              </p>
                              <div className="space-y-1 pl-4">
                                {athleteResult.globalResults.map(
                                  (criterion: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="text-xs py-1 text-muted-foreground"
                                    >
                                      • Критерій {criterion.criterionId}:{" "}
                                      <span className="font-medium text-foreground">
                                        {criterion.value}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Close Button */}
              <div className="flex gap-3 justify-end pt-4 border-t border-primary/10">
                <Button onClick={onClose}>Закрити</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResultsDetailsModal;
