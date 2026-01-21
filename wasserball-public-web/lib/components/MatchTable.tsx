export default function MatchTable({ className = '' }) {
  return (
    <div
      className={`bg-white shadow-sm rounded-lg border border-gray-200 min-h-[50vh] flex items-center justify-center ${className}`}
    >
      <h2 className="text-2xl font-bold mb-4 mt-12">Spielplan goes here</h2>
    </div>
  );
}
