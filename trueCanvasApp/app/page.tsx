import Image from 'next/image';
import Button from '@/components/Button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <Image
        src="/next.svg"
        alt="Next.js Logo"
        width={180}
        height={37}
        className="mb-8"
      />
      <h1 className="text-4xl font-bold mb-4">Welcome to Next.js</h1>
      <ol className="list-decimal list-inside mb-8 text-gray-300">
        <li className="mb-2">Get started by editing <code className="bg-gray-700 px-1 py-0.5 rounded">app/page.tsx</code></li>
        <li>Save and see your changes instantly.</li>
      </ol>
      <div className="flex space-x-4">
        <Button href="https://vercel.com/new" variant="primary">
          Deploy now
        </Button>
        <Button href="https://nextjs.org/docs" variant="secondary">
          Read our docs
        </Button>
      </div>
    </div>
  );
}