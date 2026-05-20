export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-canvas-parchment flex items-center justify-center">
      <div className="text-center">
        <div className="mb-z-lg">
          <h1 className="text-display-lg font-display font-semibold text-ink">
            Zenitech
          </h1>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )
}
