import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SimilarityMeasures } from '@/types/Report';

export type SimilarityMeasure = keyof SimilarityMeasures;

export const SimilaritySelection = ({
  similarityMeasure,
  setSimilarityMeasure,
}: {
  similarityMeasure: SimilarityMeasure;
  setSimilarityMeasure: (v: SimilarityMeasure) => void;
}) => {
  return (
    <Select
      onValueChange={(v) => setSimilarityMeasure(v as SimilarityMeasure)}
      defaultValue={similarityMeasure}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select similarity measure" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="trace_similarity">Trace similarity</SelectItem>
        <SelectItem value="eventually_follows_similarity">
          Eventually Follows similarity
        </SelectItem>
        <SelectItem value="transition_adjacency_similarity">
          Directly Follows similarity
        </SelectItem>
        <SelectItem value="ged_similarity">
          Graph Edit Distance similarity
        </SelectItem>
        <SelectItem value="trace_similarity_perfect">
          Perfect trace similarity
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
