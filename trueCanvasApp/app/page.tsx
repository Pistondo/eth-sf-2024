export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center text-white p-4"
      style={{
        backgroundImage: `url(/page1.png)`,
        backgroundSize: 'contain',
        backgroundPosition: '50% 0%', // Center horizontally, align to the top
        height: '3800px', // Fill the entire viewport height
      }}>
    </div>
  );
}