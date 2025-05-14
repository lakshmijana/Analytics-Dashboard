


// 'use client';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { Sun, Newspaper, TrendingUp } from 'lucide-react';

// export default function HomePage() {
//   const router = useRouter();

//   const dashboards = [
//     {
//       title: 'Stock Market Dashboard',
//       desc: 'Track real-time stock prices, trends & analytics.',
//       icon: <TrendingUp className="h-10 w-10 text-blue-600" />,
//       gradient: 'from-blue-100 to-blue-300',
//       hover: 'hover:from-blue-200 hover:to-blue-400',
//       route: '/finance-dashboard',
//     },
//     {
//       title: 'Weather Dashboard',
//       desc: 'View forecasts and live weather updates by city.',
//       icon: <Sun className="h-10 w-10 text-yellow-600" />,
//       gradient: 'from-yellow-100 to-yellow-300',
//       hover: 'hover:from-yellow-200 hover:to-yellow-400',
//       route: '/weather-dashboard',
//     },
//     {
//       title: 'News Dashboard',
//       desc: 'Stay updated with the latest world news headlines.',
//       icon: <Newspaper className="h-10 w-10 text-green-600" />,
//       gradient: 'from-green-100 to-green-300',
//       hover: 'hover:from-green-200 hover:to-green-400',
//       route: '/news-dashboard',
//     },
//   ];

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-6">
//       {/* Background animation shapes */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 opacity-30 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-10 right-10 w-64 h-64 bg-yellow-100 opacity-40 rounded-full blur-2xl animate-ping" />
//       </div>

//       <motion.h1
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7 }}
//         className="text-4xl font-extrabold text-center text-gray-800 mb-10 z-10 relative"
//       >
//         Welcome to Your Smart Dashboard
//       </motion.h1>

//       <motion.div
//         className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto z-10 relative"
//         initial="hidden"
//         animate="visible"
//         variants={{
//           hidden: {},
//           visible: {
//             transition: {
//               staggerChildren: 0.2,
//             },
//           },
//         }}
//       >
//         {dashboards.map((item, index) => (
//           <motion.div
//             key={index}
//             whileHover={{ scale: 1.05 }}
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: index * 0.2 }}
//             onClick={() => router.push(item.route)}
//             className={`cursor-pointer rounded-2xl p-8 text-center shadow-xl bg-gradient-to-br ${item.gradient} ${item.hover} transition duration-300 ease-in-out`}
//           >
//             <div className="flex justify-center mb-4">{item.icon}</div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h2>
//             <p className="text-gray-600 text-sm">{item.desc}</p>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Footer */}
//       <footer className="text-center mt-16 text-sm text-gray-500 z-10 relative">
//         Built with 💙 by Ammulu | Powered by Next.js & Tailwind CSS
//       </footer>
//     </div>
//   );
// }


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
