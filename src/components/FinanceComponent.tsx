


// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   TimeScale,
//   Filler
// } from 'chart.js';

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   TimeScale,
//   Filler
// );

// // TypeScript Types
// type TimeRange = '1d' | '1w' | '1m' | '1y';

// interface StockData {
//   symbol: string;
//   name: string;
//   price: number;
//   change: number;
//   changePercent: number;
//   high: number;
//   low: number;
//   volume: number;
//   previousClose: number;
//   open: number;
//   marketCap?: number;
// }

// interface ChartData {
//   dates: string[];
//   prices: number[];
// }

// interface StockSymbol {
//   symbol: string;
//   name: string;
// }

// // Mock data for when API is unavailable or rate-limited
// const MOCK_DATA = {
//   stockData: {
//     symbol: 'AAPL',
//     name: 'Apple Inc.',
//     price: 173.45,
//     change: 2.15,
//     changePercent: 1.25,
//     high: 175.20,
//     low: 171.30,
//     volume: 67489500,
//     previousClose: 171.30,
//     open: 172.15,
//     marketCap: 2850000000000
//   },
//   chartData: {
//     '1d': {
//       dates: [...Array(24).keys()].map(i => new Date(Date.now() - (23 - i) * 30 * 60000).toISOString()),
//       prices: [171.30, 171.45, 171.80, 172.15, 172.30, 172.15, 172.65, 173.10, 172.85, 173.25, 173.40, 173.15, 173.30, 173.45, 173.20, 173.10, 172.95, 173.15, 173.30, 173.55, 173.70, 173.55, 173.40, 173.45]
//     },
//     '1w': {
//       dates: [...Array(5).keys()].map(i => new Date(Date.now() - (4 - i) * 24 * 60 * 60000).toISOString()),
//       prices: [169.85, 170.45, 171.60, 172.30, 173.45]
//     },
//     '1m': {
//       dates: [...Array(22).keys()].map(i => new Date(Date.now() - (21 - i) * 24 * 60 * 60000).toISOString()),
//       prices: [165.50, 166.20, 167.40, 166.80, 167.55, 168.40, 169.25, 168.70, 167.90, 168.45, 169.35, 170.20, 171.15, 170.60, 169.85, 170.45, 171.30, 172.15, 171.60, 172.30, 173.10, 173.45]
//     },
//     '1y': {
//       dates: [...Array(12).keys()].map(i => new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60000).toISOString()),
//       prices: [145.20, 152.75, 158.90, 154.45, 160.30, 163.75, 159.40, 165.20, 168.85, 171.60, 170.45, 173.45]
//     }
//   },
//   symbolSearch: [
//     { symbol: 'AAPL', name: 'Apple Inc.' },
//     { symbol: 'MSFT', name: 'Microsoft Corporation' },
//     { symbol: 'AMZN', name: 'Amazon.com Inc.' },
//     { symbol: 'GOOGL', name: 'Alphabet Inc.' },
//     { symbol: 'META', name: 'Meta Platforms Inc.' },
//     { symbol: 'TSLA', name: 'Tesla Inc.' },
//     { symbol: 'NVDA', name: 'NVIDIA Corporation' },
//     { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
//     { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
//     { symbol: 'JNJ', name: 'Johnson & Johnson' }
//   ]
// };

// // API Functions with fallback to mock data
// const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
// const BASE_URL = 'https://www.alphavantage.co/query';

// // Flag to use mock data when API is unavailable
// const USE_MOCK_DATA = true; // Set to false to use real API

// async function fetchStockQuote(symbol: string): Promise<StockData | null> {
//   if (USE_MOCK_DATA) {
//     // For demo purposes, simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 500));
    
//     // Return mock data if the symbol matches one we have
//     const mockSymbol = MOCK_DATA.symbolSearch.find(s => s.symbol === symbol);
//     if (mockSymbol) {
//       return {
//         ...MOCK_DATA.stockData,
//         symbol: symbol,
//         name: mockSymbol.name
//       };
//     }
    
//     return null;
//   }
  
//   try {
//     const response = await fetch(
//       `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch stock data');
//     }
    
//     const data = await response.json();
    
//     if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
//       return null;
//     }
    
//     const quote = data['Global Quote'];
    
//     // Also fetch company overview for the name
//     const overviewResponse = await fetch(
//       `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
//     );
    
//     let name = symbol;
//     let marketCap = undefined;
    
//     if (overviewResponse.ok) {
//       const overviewData = await overviewResponse.json();
//       if (overviewData.Name) {
//         name = overviewData.Name;
//       }
//       if (overviewData.MarketCapitalization) {
//         marketCap = parseFloat(overviewData.MarketCapitalization);
//       }
//     }
    
//     return {
//       symbol: symbol,
//       name: name,
//       price: parseFloat(quote['05. price']),
//       change: parseFloat(quote['09. change']),
//       changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
//       high: parseFloat(quote['03. high']),
//       low: parseFloat(quote['04. low']),
//       volume: parseInt(quote['06. volume']),
//       previousClose: parseFloat(quote['08. previous close']),
//       open: parseFloat(quote['02. open']),
//       marketCap: marketCap
//     };
//   } catch (error) {
//     console.error('Error fetching stock quote:', error);
//     return null;
//   }
// }

// async function fetchTimeSeriesData(symbol: string, range: TimeRange): Promise<ChartData | null> {
//   if (USE_MOCK_DATA) {
//     // For demo purposes, simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 500));
    
//     return MOCK_DATA.chartData[range];
//   }
  
//   try {
//     let functionName = 'TIME_SERIES_INTRADAY';
//     let interval = '5min';
//     let dataKey = 'Time Series (5min)';
    
//     switch(range) {
//       case '1d':
//         functionName = 'TIME_SERIES_INTRADAY';
//         interval = '5min';
//         dataKey = 'Time Series (5min)';
//         break;
//       case '1w':
//         functionName = 'TIME_SERIES_DAILY';
//         dataKey = 'Time Series (Daily)';
//         break;
//       case '1m':
//         functionName = 'TIME_SERIES_DAILY';
//         dataKey = 'Time Series (Daily)';
//         break;
//       case '1y':
//         functionName = 'TIME_SERIES_MONTHLY';
//         dataKey = 'Monthly Time Series';
//         break;
//     }
    
//     const url = functionName === 'TIME_SERIES_INTRADAY' 
//       ? `${BASE_URL}?function=${functionName}&symbol=${symbol}&interval=${interval}&outputsize=full&apikey=${API_KEY}`
//       : `${BASE_URL}?function=${functionName}&symbol=${symbol}&apikey=${API_KEY}`;
    
//     const response = await fetch(url);
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch time series data');
//     }
    
//     const data = await response.json();
    
//     if (!data[dataKey]) {
//       return null;
//     }
    
//     const timeSeriesData = data[dataKey];
//     const dates: string[] = [];
//     const prices: number[] = [];
    
//     // Determine how many data points to include based on the range
//     let dataPoints = 0;
//     switch(range) {
//       case '1d': dataPoints = 78; break; // 6.5 hours of trading × 12 points per hour
//       case '1w': dataPoints = 5; break;  // 5 trading days
//       case '1m': dataPoints = 22; break; // ~22 trading days in a month
//       case '1y': dataPoints = 12; break; // 12 months
//     }
    
//     let count = 0;
//     for (const date in timeSeriesData) {
//       if (count >= dataPoints) break;
      
//       dates.unshift(date);
//       prices.unshift(parseFloat(timeSeriesData[date]['4. close']));
//       count++;
//     }
    
//     return { dates, prices };
//   } catch (error) {
//     console.error('Error fetching time series data:', error);
//     return null;
//   }
// }

// async function searchStockSymbols(query: string): Promise<StockSymbol[]> {
//   if (USE_MOCK_DATA) {
//     // For demo purposes, simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Filter mock data based on the query
//     return MOCK_DATA.symbolSearch.filter(stock => 
//       stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
//       stock.name.toLowerCase().includes(query.toLowerCase())
//     );
//   }
  
//   try {
//     const response = await fetch(
//       `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to search stock symbols');
//     }
    
//     const data = await response.json();
    
//     if (!data.bestMatches) {
//       return [];
//     }
    
//     return data.bestMatches.map((match: any) => ({
//       symbol: match['1. symbol'],
//       name: match['2. name']
//     }));
//   } catch (error) {
//     console.error('Error searching stock symbols:', error);
//     return [];
//   }
// }

// // Component: Search Bar with Autocomplete
// function StockSearch({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
//   const [query, setQuery] = useState<string>('');
//   const [results, setResults] = useState<StockSymbol[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showDropdown, setShowDropdown] = useState<boolean>(false);
//   const searchRef = useRef<HTMLDivElement>(null);
  
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
//         setShowDropdown(false);
//       }
//     };
    
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);
  
//   useEffect(() => {
//     const searchSymbols = async () => {
//       if (query.length < 2) {
//         setResults([]);
//         return;
//       }
      
//       setLoading(true);
//       const symbols = await searchStockSymbols(query);
//       setResults(symbols);
//       setLoading(false);
//       setShowDropdown(true);
//     };
    
//     const debounceTimer = setTimeout(searchSymbols, 300);
//     return () => clearTimeout(debounceTimer);
//   }, [query]);
  
//   const handleSelectStock = (symbol: string) => {
//     onSelectStock(symbol);
//     setQuery(''); // Clear the search after selection
//     setShowDropdown(false);
//   };
  
//   return (
//     <div className="relative mb-6" ref={searchRef}>
//       <div className="relative">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search for a stock symbol (e.g., AAPL, MSFT, GOOGL)"
//           className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <svg
//           className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 20 20"
//           fill="currentColor"
//         >
//           <path
//             fillRule="evenodd"
//             d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
//             clipRule="evenodd"
//           />
//         </svg>
//       </div>
      
//       {showDropdown && (
//         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//           {loading ? (
//             <div className="p-4 text-center text-gray-500">Loading...</div>
//           ) : results.length > 0 ? (
//             <ul>
//               {results.map((result) => (
//                 <li
//                   key={result.symbol}
//                   onClick={() => handleSelectStock(result.symbol)}
//                   className="p-3 hover:bg-gray-100 cursor-pointer"
//                 >
//                   <div className="font-medium">{result.symbol}</div>
//                   <div className="text-sm text-gray-600">{result.name}</div>
//                 </li>
//               ))}
//             </ul>
//           ) : query.length >= 2 ? (
//             <div className="p-4 text-center text-gray-500">No results found</div>
//           ) : null}
//         </div>
//       )}
//     </div>
//   );
// }

// // Component: Stock Overview Card
// function StockOverview({ stockData }: { stockData: StockData }) {
//   const formatLargeNumber = (num?: number) => {
//     if (!num) return 'N/A';
//     if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
//     if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
//     return `$${num.toFixed(2)}`;
//   };
  
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
//           <p className="text-gray-600">{stockData.name}</p>
//         </div>
//         <div className="text-right">
//           <div className="text-2xl font-bold">${stockData.price.toFixed(2)}</div>
//           <div className={`text-lg ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//             {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <div className="bg-gray-50 p-3 rounded">
//           <div className="text-sm text-gray-500">Open</div>
//           <div className="font-medium">${stockData.open.toFixed(2)}</div>
//         </div>
//         <div className="bg-gray-50 p-3 rounded">
//           <div className="text-sm text-gray-500">Previous Close</div>
//           <div className="font-medium">${stockData.previousClose.toFixed(2)}</div>
//         </div>
//         <div className="bg-gray-50 p-3 rounded">
//           <div className="text-sm text-gray-500">Days Range</div>
//           <div className="font-medium">${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}</div>
//         </div>
//         <div className="bg-gray-50 p-3 rounded">
//           <div className="text-sm text-gray-500">Volume</div>
//           <div className="font-medium">{stockData.volume.toLocaleString()}</div>
//         </div>
//         <div className="bg-gray-50 p-3 rounded">
//           <div className="text-sm text-gray-500">Market Cap</div>
//           <div className="font-medium">{formatLargeNumber(stockData.marketCap)}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Component: Time Range Selector
// function TimeRangeSelector({ 
//   selectedRange, 
//   onSelectRange 
// }: { 
//   selectedRange: TimeRange; 
//   onSelectRange: (range: TimeRange) => void 
// }) {
//   const ranges: { value: TimeRange; label: string }[] = [
//     { value: '1d', label: '1 Day' },
//     { value: '1w', label: '1 Week' },
//     { value: '1m', label: '1 Month' },
//     { value: '1y', label: '1 Year' }
//   ];
  
//   return (
//     <div className="flex space-x-2 mb-4">
//       {ranges.map((range) => (
//         <button
//           key={range.value}
//           onClick={() => onSelectRange(range.value)}
//           className={`px-4 py-2 rounded-md ${
//             selectedRange === range.value
//               ? 'bg-blue-600 text-white'
//               : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//           }`}
//         >
//           {range.label}
//         </button>
//       ))}
//     </div>
//   );
// }

// // Component: Stock Chart
// function StockChart({ 
//   symbol, 
//   chartData, 
//   timeRange 
// }: { 
//   symbol: string; 
//   chartData: ChartData | null; 
//   timeRange: TimeRange 
// }) {
//   if (!chartData || chartData.dates.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-80">
//         <p className="text-gray-500">No chart data available</p>
//       </div>
//     );
//   }
  
//   // Format x-axis labels based on time range
//   const formatLabels = (timeRange: TimeRange) => {
//     return chartData.dates.map(date => {
//       const dateObj = new Date(date);
//       switch (timeRange) {
//         case '1d':
//           return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         case '1w':
//           return dateObj.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
//         case '1m':
//           return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
//         case '1y':
//           return dateObj.toLocaleDateString([], { month: 'short', year: '2-digit' });
//         default:
//           return dateObj.toLocaleDateString();
//       }
//     });
//   };
  
//   const data = {
//     labels: formatLabels(timeRange),
//     datasets: [
//       {
//         label: `${symbol} Stock Price`,
//         data: chartData.prices,
//         borderColor: 'rgb(59, 130, 246)',
//         backgroundColor: 'rgba(59, 130, 246, 0.1)',
//         borderWidth: 2,
//         pointRadius: timeRange === '1y' ? 2 : 0,
//         pointHoverRadius: 6,
//         tension: 0.1,
//         fill: true
//       }
//     ]
//   };
  
//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         display: false
//       },
//       tooltip: {
//         mode: 'index' as const,
//         intersect: false,
//         callbacks: {
//           label: function(context: any) {
//             return `$${context.raw.toFixed(2)}`;
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: {
//           display: false
//         },
//         ticks: {
//           maxRotation: 0,
//           autoSkip: true,
//           maxTicksLimit: 8
//         }
//       },
//       y: {
//         grid: {
//           color: 'rgba(0, 0, 0, 0.05)'
//         },
//         ticks: {
//           callback: function(value: any) {
//             return `$${value}`;
//           }
//         }
//       }
//     },
//     interaction: {
//       mode: 'index' as const,
//       intersect: false
//     }
//   };
  
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h3 className="text-lg font-medium mb-4">{symbol} Stock Price Chart</h3>
//       <div className="h-80">
//         <Line data={data} options={options} />
//       </div>
//     </div>
//   );
// }

// // Main Component: Finance App
// export default function FinanceApp() {
//   const [symbol, setSymbol] = useState<string>('AAPL'); // Default to Apple Inc.
//   const [stockData, setStockData] = useState<StockData | null>(null);
//   const [chartData, setChartData] = useState<ChartData | null>(null);
//   const [timeRange, setTimeRange] = useState<TimeRange>('1m');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Add a status message for API limitations
//   const [apiLimitNotice, setApiLimitNotice] = useState<boolean>(USE_MOCK_DATA);
  
//   useEffect(() => {
//     if (!symbol) return;
    
//     const loadStockData = async () => {
//       setLoading(true);
//       setError(null);
      
//       try {
//         const quote = await fetchStockQuote(symbol);
        
//         if (!quote) {
//           setError(`No data found for symbol: ${symbol}`);
//           setStockData(null);
//           setChartData(null);
//           setLoading(false);
//           return;
//         }
        
//         setStockData(quote);
        
//         const timeSeriesData = await fetchTimeSeriesData(symbol, timeRange);
//         setChartData(timeSeriesData);
//       } catch (error) {
//         console.error("Error loading stock data:", error);
//         setError("Failed to load stock data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     loadStockData();
//   }, [symbol, timeRange]);
  
//   const handleSelectStock = (newSymbol: string) => {
//     setSymbol(newSymbol);
//   };
  
//   const handleSelectTimeRange = (range: TimeRange) => {
//     setTimeRange(range);
//   };
  
//   return (
//     <main className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         <header className="mb-8 text-center">
//           <h1 className="text-3xl font-bold mb-2">Stock Market Explorer</h1>
//           <p className="text-gray-600">Track real-time stock market data and historical trends</p>
//         </header>
        
//         {apiLimitNotice && (
//           <div className="bg-blue-100 text-blue-800 p-4 rounded mb-6 text-center">
//             Note: This app is currently using demo data due to API rate limitations.
//             <button 
//               className="ml-2 underline text-blue-600"
//               onClick={() => setApiLimitNotice(false)}
//             >
//               Dismiss
//             </button>
//           </div>
//         )}
        
//         <StockSearch onSelectStock={handleSelectStock} />
        
//         {error && (
//           <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
//             {error}
//           </div>
//         )}
        
//         {loading ? (
//           <div className="space-y-4">
//             <div className="bg-gray-100 h-40 rounded-lg animate-pulse"></div>
//             <div className="bg-gray-100 h-80 rounded-lg animate-pulse"></div>
//           </div>
//         ) : (
//           <>
//             {stockData && (
//               <>
//                 <StockOverview stockData={stockData} />
                
//                 <TimeRangeSelector 
//                   selectedRange={timeRange} 
//                   onSelectRange={handleSelectTimeRange} 
//                 />
                
//                 <StockChart 
//                   symbol={symbol} 
//                   chartData={chartData} 
//                   timeRange={timeRange} 
//                 />
//               </>
//             )}
//           </>
//         )}
        
//         <div className="mt-8 text-center text-sm text-gray-500">
//           <p>Data provided by Alpha Vantage API. Stock market data may be delayed.</p>
//         </div>
//       </div>
//     </main>
//   );
// }

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  TooltipItem,
  ChartData,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

// TypeScript Types
type TimeRange = '1d' | '1w' | '1m' | '1y';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  open: number;
  marketCap?: number;
}

interface ChartDataPoint {
  dates: string[];
  prices: number[];
}

interface StockSymbol {
  symbol: string;
  name: string;
}

// Define explicit types for API responses
interface GlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

interface OverviewData {
  Name?: string;
  MarketCapitalization?: string;
  [key: string]: string | undefined;
}

interface TimeSeriesData {
  [date: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  };
}

interface SymbolSearchMatch {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

// Mock data for when API is unavailable or rate-limited
const MOCK_DATA = {
  stockData: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 173.45,
    change: 2.15,
    changePercent: 1.25,
    high: 175.20,
    low: 171.30,
    volume: 67489500,
    previousClose: 171.30,
    open: 172.15,
    marketCap: 2850000000000
  },
  chartData: {
    '1d': {
      dates: [...Array(24).keys()].map(i => new Date(Date.now() - (23 - i) * 30 * 60000).toISOString()),
      prices: [171.30, 171.45, 171.80, 172.15, 172.30, 172.15, 172.65, 173.10, 172.85, 173.25, 173.40, 173.15, 173.30, 173.45, 173.20, 173.10, 172.95, 173.15, 173.30, 173.55, 173.70, 173.55, 173.40, 173.45]
    },
    '1w': {
      dates: [...Array(5).keys()].map(i => new Date(Date.now() - (4 - i) * 24 * 60 * 60000).toISOString()),
      prices: [169.85, 170.45, 171.60, 172.30, 173.45]
    },
    '1m': {
      dates: [...Array(22).keys()].map(i => new Date(Date.now() - (21 - i) * 24 * 60 * 60000).toISOString()),
      prices: [165.50, 166.20, 167.40, 166.80, 167.55, 168.40, 169.25, 168.70, 167.90, 168.45, 169.35, 170.20, 171.15, 170.60, 169.85, 170.45, 171.30, 172.15, 171.60, 172.30, 173.10, 173.45]
    },
    '1y': {
      dates: [...Array(12).keys()].map(i => new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60000).toISOString()),
      prices: [145.20, 152.75, 158.90, 154.45, 160.30, 163.75, 159.40, 165.20, 168.85, 171.60, 170.45, 173.45]
    }
  },
  symbolSearch: [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' }
  ]
};

// API Functions with fallback to mock data
const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Flag to use mock data when API is unavailable
const USE_MOCK_DATA = true; // Set to false to use real API

async function fetchStockQuote(symbol: string): Promise<StockData | null> {
  if (USE_MOCK_DATA) {
    // For demo purposes, simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data if the symbol matches one we have
    const mockSymbol = MOCK_DATA.symbolSearch.find(s => s.symbol === symbol);
    if (mockSymbol) {
      return {
        ...MOCK_DATA.stockData,
        symbol: symbol,
        name: mockSymbol.name
      };
    }
    
    return null;
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const data: { 'Global Quote'?: GlobalQuote } = await response.json();
    
    if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
      return null;
    }
    
    const quote = data['Global Quote'];
    
    // Also fetch company overview for the name
    const overviewResponse = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    let name = symbol;
    let marketCap = undefined;
    
    if (overviewResponse.ok) {
      const overviewData: OverviewData = await overviewResponse.json();
      if (overviewData.Name) {
        name = overviewData.Name;
      }
      if (overviewData.MarketCapitalization) {
        marketCap = parseFloat(overviewData.MarketCapitalization);
      }
    }
    
    return {
      symbol: symbol,
      name: name,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      marketCap: marketCap
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
}

async function fetchTimeSeriesData(symbol: string, range: TimeRange): Promise<ChartDataPoint | null> {
  if (USE_MOCK_DATA) {
    // For demo purposes, simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_DATA.chartData[range];
  }
  
  try {
    let functionName = 'TIME_SERIES_INTRADAY';
    let interval = '5min';
    let dataKey = 'Time Series (5min)';
    
    switch(range) {
      case '1d':
        functionName = 'TIME_SERIES_INTRADAY';
        interval = '5min';
        dataKey = 'Time Series (5min)';
        break;
      case '1w':
        functionName = 'TIME_SERIES_DAILY';
        dataKey = 'Time Series (Daily)';
        break;
      case '1m':
        functionName = 'TIME_SERIES_DAILY';
        dataKey = 'Time Series (Daily)';
        break;
      case '1y':
        functionName = 'TIME_SERIES_MONTHLY';
        dataKey = 'Monthly Time Series';
        break;
    }
    
    const url = functionName === 'TIME_SERIES_INTRADAY' 
      ? `${BASE_URL}?function=${functionName}&symbol=${symbol}&interval=${interval}&outputsize=full&apikey=${API_KEY}`
      : `${BASE_URL}?function=${functionName}&symbol=${symbol}&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch time series data');
    }
    
    const data: Record<string, TimeSeriesData | undefined> = await response.json();
    
    if (!data[dataKey]) {
      return null;
    }
    
    const timeSeriesData = data[dataKey];
    if (!timeSeriesData) return null;
    
    const dates: string[] = [];
    const prices: number[] = [];
    
    // Determine how many data points to include based on the range
    let dataPoints = 0;
    switch(range) {
      case '1d': dataPoints = 78; break; // 6.5 hours of trading × 12 points per hour
      case '1w': dataPoints = 5; break;  // 5 trading days
      case '1m': dataPoints = 22; break; // ~22 trading days in a month
      case '1y': dataPoints = 12; break; // 12 months
    }
    
    let count = 0;
    for (const date in timeSeriesData) {
      if (count >= dataPoints) break;
      
      dates.unshift(date);
      prices.unshift(parseFloat(timeSeriesData[date]['4. close']));
      count++;
    }
    
    return { dates, prices };
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return null;
  }
}

async function searchStockSymbols(query: string): Promise<StockSymbol[]> {
  if (USE_MOCK_DATA) {
    // For demo purposes, simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock data based on the query
    return MOCK_DATA.symbolSearch.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search stock symbols');
    }
    
    const data: { bestMatches?: SymbolSearchMatch[] } = await response.json();
    
    if (!data.bestMatches) {
      return [];
    }
    
    return data.bestMatches.map((match) => ({
      symbol: match['1. symbol'],
      name: match['2. name']
    }));
  } catch (error) {
    console.error('Error searching stock symbols:', error);
    return [];
  }
}

// Component: Search Bar with Autocomplete
function StockSearch({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<StockSymbol[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const searchSymbols = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      const symbols = await searchStockSymbols(query);
      setResults(symbols);
      setLoading(false);
      setShowDropdown(true);
    };
    
    const debounceTimer = setTimeout(searchSymbols, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);
  
  const handleSelectStock = (symbol: string) => {
    onSelectStock(symbol);
    setQuery(''); // Clear the search after selection
    setShowDropdown(false);
  };
  
  return (
    <div className="relative mb-6" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a stock symbol (e.g., AAPL, MSFT, GOOGL)"
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li
                  key={result.symbol}
                  onClick={() => handleSelectStock(result.symbol)}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{result.symbol}</div>
                  <div className="text-sm text-gray-600">{result.name}</div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Component: Stock Overview Card
function StockOverview({ stockData }: { stockData: StockData }) {
  const formatLargeNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
          <p className="text-gray-600">{stockData.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${stockData.price.toFixed(2)}</div>
          <div className={`text-lg ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Open</div>
          <div className="font-medium">${stockData.open.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Previous Close</div>
          <div className="font-medium">${stockData.previousClose.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Days Range</div>
          <div className="font-medium">${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Volume</div>
          <div className="font-medium">{stockData.volume.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Market Cap</div>
          <div className="font-medium">{formatLargeNumber(stockData.marketCap)}</div>
        </div>
      </div>
    </div>
  );
}

// Component: Time Range Selector
function TimeRangeSelector({ 
  selectedRange, 
  onSelectRange 
}: { 
  selectedRange: TimeRange; 
  onSelectRange: (range: TimeRange) => void 
}) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '1y', label: '1 Year' }
  ];
  
  return (
    <div className="flex space-x-2 mb-4">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onSelectRange(range.value)}
          className={`px-4 py-2 rounded-md ${
            selectedRange === range.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

// Component: Stock Chart
function StockChart({ 
  symbol, 
  chartData, 
  timeRange 
}: { 
  symbol: string; 
  chartData: ChartDataPoint | null; 
  timeRange: TimeRange 
}) {
  if (!chartData || chartData.dates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-80">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }
  
  // Format x-axis labels based on time range
  const formatLabels = (timeRange: TimeRange) => {
    return chartData.dates.map(date => {
      const dateObj = new Date(date);
      switch (timeRange) {
        case '1d':
          return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case '1w':
          return dateObj.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
        case '1m':
          return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        case '1y':
          return dateObj.toLocaleDateString([], { month: 'short', year: '2-digit' });
        default:
          return dateObj.toLocaleDateString();
      }
    });
  };
  
  const data: ChartData<'line'> = {
    labels: formatLabels(timeRange),
    datasets: [
      {
        label: `${symbol} Stock Price`,
        data: chartData.prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: timeRange === '1y' ? 2 : 0,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: true
      }
    ]
  };
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            // return `$${context.raw.toString()}`;
             return `$${(context.raw as number).toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: number | string) {
            return `$${value}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">{symbol} Stock Price Chart</h3>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

// Main Component: Finance App
export default function FinanceApp() {
  const [symbol, setSymbol] = useState<string>('AAPL'); // Default to Apple Inc.
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add a status message for API limitations
  const [apiLimitNotice, setApiLimitNotice] = useState<boolean>(USE_MOCK_DATA);
  
  useEffect(() => {
    if (!symbol) return;
    
    const loadStockData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const quote = await fetchStockQuote(symbol);
        
        if (!quote) {
          setError(`No data found for symbol: ${symbol}`);
          setStockData(null);
          setChartData(null);
          setLoading(false);
          return;
        }
        
        setStockData(quote);
        
        const timeSeriesData = await fetchTimeSeriesData(symbol, timeRange);
        setChartData(timeSeriesData);
      } catch (error) {
        console.error("Error loading stock data:", error);
        setError("Failed to load stock data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadStockData();
  }, [symbol, timeRange]);
  
  const handleSelectStock = (newSymbol: string) => {
    setSymbol(newSymbol);
  };
  
  const handleSelectTimeRange = (range: TimeRange) => {
    setTimeRange(range);
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Stock Market Explorer</h1>
          <p className="text-gray-600">Track real-time stock market data and historical trends</p>
        </header>
        
        {apiLimitNotice && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded mb-6 text-center">
            Note: This app is currently using demo data due to API rate limitations.
            <button 
              className="ml-2 underline text-blue-600"
              onClick={() => setApiLimitNotice(false)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <StockSearch onSelectStock={handleSelectStock} />
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            <div className="bg-gray-100 h-40 rounded-lg animate-pulse"></div>
            <div className="bg-gray-100 h-80 rounded-lg animate-pulse"></div>
          </div>
        ) : (
          <>
            {stockData && (
              <>
                <StockOverview stockData={stockData} />
                
                <TimeRangeSelector 
                  selectedRange={timeRange} 
                  onSelectRange={handleSelectTimeRange} 
                />
                
                <StockChart 
                  symbol={symbol} 
                  chartData={chartData} 
                  timeRange={timeRange} 
                />
              </>
            )}
          </>
        )}
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data provided by Alpha Vantage API. Stock market data may be delayed.</p>
        </div>
      </div>
    </main>
  );
}