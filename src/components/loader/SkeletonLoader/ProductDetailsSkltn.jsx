function LoadingSkeleton() {
  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-[40px] py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3 w-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 rounded-xl bg-gray-200" />
            ))}
          </div>
          <div className="flex-1 h-[600px] rounded-2xl bg-gray-200" />
        </div>
        {/* Right */}
        <div className="space-y-6 pt-4">
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/4 bg-gray-200 rounded" />
          <div className="h-10 w-1/3 bg-gray-200 rounded" />
          <div className="h-[56px] w-full bg-gray-200 rounded-xl" />
          <div className="h-[56px] w-full bg-gray-200 rounded-xl" />
          <div className="h-32 w-full bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}

export default LoadingSkeleton;