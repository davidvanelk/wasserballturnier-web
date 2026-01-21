export default function PriceList({ className = '' }) {
  return (
    <div
      className={`bg-white shadow-sm rounded-lg border border-gray-200 p-6 min-h-[50vh] items-center justify-center ${className}`}
    >
      <h2 className='text-2xl font-bold mb-4'>Preisliste</h2>
    </div>
  );
}
