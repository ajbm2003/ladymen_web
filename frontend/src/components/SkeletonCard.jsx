const SkeletonCard = () => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
};

export default SkeletonCard;
