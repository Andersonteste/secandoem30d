import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rounded" | "text";
  shimmer?: boolean;
}

function Skeleton({ 
  className, 
  variant = "default",
  shimmer = true,
  ...props 
}: SkeletonProps) {
  const variants = {
    default: "rounded-lg",
    circular: "rounded-full",
    rounded: "rounded-xl",
    text: "rounded h-4 w-full",
  };

  return (
    <div 
      className={cn(
        "bg-muted relative overflow-hidden",
        variants[variant],
        shimmer && "skeleton-shimmer",
        className
      )} 
      {...props} 
    />
  );
}

// Preset skeleton components for common use cases
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 rounded-xl bg-card border-0 shadow-subtle", className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRecipeCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 rounded-xl bg-card border-0 shadow-subtle", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
        <Skeleton variant="circular" className="w-9 h-9" />
      </div>
    </div>
  );
}

function SkeletonWorkoutCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 rounded-xl bg-card border-0 shadow-subtle", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
      <Skeleton className="w-full aspect-video rounded-lg mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl bg-card border-0 shadow-subtle overflow-hidden", className)}>
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Skeleton variant="circular" className="w-20 h-20" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border-0 shadow-subtle text-center">
          <Skeleton className="h-8 w-12 mx-auto mb-2" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

function SkeletonBonusCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl bg-card border-0 shadow-subtle overflow-hidden", className)}>
      <Skeleton className="w-full h-[168px] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Weight Progress */}
      <div className="p-5 rounded-xl bg-card border-0 shadow-subtle">
        <div className="flex items-center gap-6">
          <Skeleton variant="circular" className="w-28 h-28" />
          <SkeletonText lines={2} className="flex-1" />
        </div>
      </div>
      
      {/* Challenge Progress */}
      <div className="p-6 rounded-xl bg-card border-0 shadow-subtle">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
        <Skeleton className="h-4 w-48 mt-3" />
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-card border-0 shadow-subtle flex flex-col items-center justify-center gap-2">
            <Skeleton variant="rounded" className="w-10 h-10" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonRecipeCard, 
  SkeletonWorkoutCard, 
  SkeletonProductCard,
  SkeletonProfile,
  SkeletonStats,
  SkeletonBonusCard,
  SkeletonText,
  SkeletonDashboard
};
