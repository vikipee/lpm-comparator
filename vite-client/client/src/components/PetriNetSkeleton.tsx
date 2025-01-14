import { Skeleton } from '@/components/ui/skeleton';

function TransitionSkeleton() {
  return <Skeleton className="h-8 w-8 bg-gray-200" />;
}

function PlaceSkeleton() {
  return <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />;
}

function ArcSkeleton({ orientation = 'vertical', length = 24 }) {
  const style =
    orientation === 'vertical'
      ? { height: `${length}px`, width: '2px', margin: '4px 0' }
      : { width: `${length}px`, height: '2px', margin: '0 4px' };

  return <Skeleton style={style} className="bg-gray-200" />;
}

export function PetriNetSkeleton() {
  return (
    <div className="flex flex-row items-center">
      <PlaceSkeleton />
      <ArcSkeleton orientation="horizontal" length={24} />
      <TransitionSkeleton />
      <ArcSkeleton orientation="horizontal" length={24} />
      <PlaceSkeleton />
    </div>
  );
}
