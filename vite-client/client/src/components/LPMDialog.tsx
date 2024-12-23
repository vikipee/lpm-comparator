import { LocalProcessModel, SimilarityMeasures } from "@/types/Report";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PetriNetSkeleton } from "@/components/PetriNetSkeleton";
import { useEffect, useState } from "react";
import axios from "axios";
import { ReactSVG } from 'react-svg';

export default function LPMDialog({side, selectedLpm, setSelectedLpm, similarityMeasures}:{side: 1| 2; selectedLpm: LocalProcessModel | null; setSelectedLpm: (lpm:LocalProcessModel | null) => void; similarityMeasures: SimilarityMeasures}){

    const [vis, setVis] = useState<string | null>(null);


    useEffect(() => {
        if(selectedLpm){
            fetchImage();
        }
    }, [selectedLpm]);

    const fetchImage = async () => {
        axios.get(`/api/petrinet/${side}/${selectedLpm?.id}`).then((response) => {
            setVis(response.data.vis);
        }).catch((error) => {
            console.error(error);

        });
      };

    // Function to modify the SVG before it's injected
  const beforeInjection = (svg: SVGElement) => {
    // Remove fixed width and height attributes
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    // Optionally set a viewBox if not present
    if (!svg.getAttribute('viewBox')) {
      const width = svg.getAttribute('width') || '100';
      const height = svg.getAttribute('height') || '100';
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    // Ensure the SVG scales to its container
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Set responsive width and height
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
  };

    return (
        <Dialog open={!!selectedLpm} onOpenChange={() => setSelectedLpm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLpm?.name}</DialogTitle>
            <DialogDescription>
      </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>Fitness: {selectedLpm?.fitness.toFixed(4)}</p>
            <p>Precision: {selectedLpm?.precision.toFixed(4)}</p>
            <p>Coverage: {selectedLpm?.coverage.toFixed(4)}</p>
            {vis ? (
              <ReactSVG
                src={`data:image/svg+xml;utf8,${encodeURIComponent(vis)}`}
                beforeInjection={beforeInjection}
                className="w-full h-auto"
              />
            ) : (
              <PetriNetSkeleton />
            )}
           
          </div>
        </DialogContent>
      </Dialog>
    );
}