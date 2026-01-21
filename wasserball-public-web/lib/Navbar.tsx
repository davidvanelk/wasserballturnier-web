'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className='bg-background border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <Link href='/' className='text-xl font-bold text-foreground'>
                Wasserball
              </Link>
            </div>
            <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
              <Link
                href='/'
                className='inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-foreground hover:border-gray-300 hover:text-gray-500 transition-colors'
              >
                Home
              </Link>
              <Link
                href='/turniere'
                className='inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-foreground hover:border-gray-300 hover:text-gray-500 transition-colors'
              >
                Turniere
              </Link>
              <Link
                href='/kontakt'
                className='inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-foreground hover:border-gray-300 hover:text-gray-500 transition-colors'
              >
                Kontakt
              </Link>
            </div>
          </div>
          <div className='-mr-2 flex items-center sm:hidden'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type='button'
              className='inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
              aria-controls='mobile-menu'
              aria-expanded={isMenuOpen}
            >
              <span className='sr-only'>Menü öffnen</span>
              {!isMenuOpen ? (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              ) : (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='sm:hidden' id='mobile-menu'>
          <div className='pt-2 pb-3 space-y-1 bg-background border-b border-gray-200'>
            <Link
              href='/'
              className='block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50'
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href='/turniere'
              className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              onClick={() => setIsMenuOpen(false)}
            >
              Turniere
            </Link>
            <Link
              href='/kontakt'
              className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              onClick={() => setIsMenuOpen(false)}
            >
              Kontakt
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
