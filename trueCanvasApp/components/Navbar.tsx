import Link from 'next/link';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">A TrueCanvas</Link>
          <Link href="/verify" className="hover:text-gray-300 transition-colors">Verify</Link>
          <Link href="/gallery" className="hover:text-gray-300 transition-colors">Gallery</Link>
        </div>
        <DynamicWidget />
      </div>
    </nav>
  );
};

export default Navbar;
