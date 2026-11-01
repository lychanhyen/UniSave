import Skeleton from './Skeleton';

export default function SkeletonCard() {
  return (
    <div className="card p-6">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="mt-4 h-9 w-2/3" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  );
}
