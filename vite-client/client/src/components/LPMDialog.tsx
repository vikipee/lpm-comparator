import { LocalProcessModel, SimilarityMeasures } from "@/types/Report";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PetriNetSkeleton } from "@/components/PetriNetSkeleton";

export default function LPMDialog({selectedLpm, setSelectedLpm, similarityMeasures}:{selectedLpm: LocalProcessModel | null; setSelectedLpm: (lpm:LocalProcessModel | null) => void; similarityMeasures: SimilarityMeasures}){

    return (
        <Dialog open={!!selectedLpm} onOpenChange={() => setSelectedLpm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLpm?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>Fitness: {selectedLpm?.fitness.toFixed(4)}</p>
            <p>Precision: {selectedLpm?.precision.toFixed(4)}</p>
            <p>Coverage: {selectedLpm?.coverage.toFixed(4)}</p>
            <PetriNetSkeleton />
          </div>
        </DialogContent>
      </Dialog>
    );
}