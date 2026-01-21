import MatchTable from '@/lib/MatchTable';
import PriceList from '@/lib/PriceList';

export default function HomePage() {
  return (
    <main className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-12'>
      <div className='mb-12'>
        <h1 className='text-4xl font-extrabold'>Herzlich Willkommen!</h1>
        <h1 className='text-3xl'>Beim Wasserballturnier 2026</h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div className='bg-white shadow-sm rounded-lg border border-gray-200 min-h-[50vh] flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-6xl'>
              Ein Bild von vielen.
            </h1>
          </div>
        </div>
        <MatchTable />
        <PriceList />
      </div>
    </main>
  );
}
