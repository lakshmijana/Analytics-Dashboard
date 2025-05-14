


'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LineChart, Sun, Newspaper } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const dashboards = [
    {
      title: 'Stock Market Dashboard',
      icon: <LineChart className="w-10 h-10 mx-auto text-blue-800 mb-2" />,
      description: 'Track stocks, trends, and financial news in real-time.',
      bg: 'bg-blue-100 hover:bg-blue-200',
      path: '/finance-dashboard',
    },
    {
      title: 'Weather Dashboard',
      icon: <Sun className="w-10 h-10 mx-auto text-yellow-700 mb-2" />,
      description: 'Get live weather forecasts and updates across locations.',
      bg: 'bg-yellow-100 hover:bg-yellow-200',
      path: '/weather-dashboard',
    },
    {
      title: 'News Dashboard',
      icon: <Newspaper className="w-10 h-10 mx-auto text-green-700 mb-2" />,
      description: 'Catch up with the latest world and local news.',
      bg: 'bg-green-100 hover:bg-green-200',
      path: '/news-dashboard',
    },
  ];

  return (
    <motion.div
      className="p-10 bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold text-center mb-4">Welcome to PGAGI Analytics Dashboard</h1>
      <p className="text-center text-gray-600 mb-10">Choose a dashboard to get started</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {dashboards.map((dash, idx) => (
          <motion.div
            key={idx}
            onClick={() => router.push(dash.path)}
            className={`p-6 rounded-2xl cursor-pointer text-center shadow-md transition duration-300 ${dash.bg}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {dash.icon}
            <h2 className="text-xl font-semibold mb-2">{dash.title}</h2>
            <p className="text-gray-700 text-sm">{dash.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
