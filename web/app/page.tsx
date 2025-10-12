export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Hello World! 🌍
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to your Next.js app with Tailwind CSS
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Built with:
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>⚡ Next.js 15</li>
            <li>🎨 Tailwind CSS</li>
            <li>📦 TypeScript</li>
            <li>🔧 ESLint</li>
            <li>🚀 Vercel Ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
