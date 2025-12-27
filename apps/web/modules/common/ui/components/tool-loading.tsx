export const ToolLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 min-h-svh">
      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 rounded-full border-muted animate-spin border-t-primary"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-primary/20"></div>
      </div>

      {/* Loading Text */}
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-foreground">Loading Tool</h3>
        <p className="text-sm text-muted-foreground">Please wait while we prepare your tool...</p>
      </div>

      {/* Skeleton Cards */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`${i * 1}`} className="p-4 bg-white border shadow-sm dark:bg-card border-border/50 rounded-xl animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-muted rounded-xl animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded bg-muted animate-pulse"></div>
                <div className="w-2/3 h-3 rounded bg-muted/50 animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded bg-muted animate-pulse"></div>
              <div className="w-3/4 h-3 rounded bg-muted animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
