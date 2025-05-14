

'use client';

import React, { useState, useEffect } from 'react';

type Category = 'technology' | 'sports' | 'business' | 'health' | 'entertainment' | 'general';

interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

async function fetchNewsByCategory(category: Category, page: number = 1): Promise<NewsApiResponse> {
  try {
    if (!API_KEY) throw new Error('NEWS_API_KEY is not configured');

    const apiUrl = `${BASE_URL}/top-headlines?country=us&category=${category}&page=${page}&apiKey=${API_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error:', errorData);
      throw new Error(`Status ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return { status: 'error', totalResults: 0, articles: [] };
  }
}

function CategoryFilter({
  selectedCategory,
  onCategoryChange
}: {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}) {
  const categories: Category[] = ['general', 'technology', 'sports', 'business', 'health', 'entertainment'];

  return (
    <div className="flex flex-wrap justify-center gap-2 my-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full capitalize transition-colors ${
            selectedCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
    >
      <div className="h-48 w-full relative">
        <img
          src={article.urlToImage || 'https://via.placeholder.com/640x360?text=No+Image'}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=No+Image';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">{article.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">{article.description || 'No description available'}</p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{article.source.name}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

function ArticleModal({ article, onClose }: { article: Article | null; onClose: () => void }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {article.urlToImage && <img src={article.urlToImage} alt={article.title} className="w-full h-64 object-cover" />}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-3">{article.title}</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>{article.author ? `By ${article.author}` : article.source.name}</span>
            <span>{new Date(article.publishedAt).toLocaleString()}</span>
          </div>
          <p className="text-gray-800 mb-6">{article.content || article.description}</p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Read Full Article
          </a>
          <button
            onClick={onClose}
            className="ml-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message, apiKey }: { message: string; apiKey: string | undefined }) {
  return (
    <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
      <strong>Error:</strong> {message}
      {!apiKey && (
        <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded">
          Please set <code>NEXT_PUBLIC_NEWS_API_KEY</code> in your <code>.env.local</code>.
        </div>
      )}
    </div>
  );
}

export default function NewsApp() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');
  const [page, setPage] = useState<number>(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    loadArticles('initial');
  }, [selectedCategory]);

  const loadArticles = async (type: 'initial' | 'loadMore') => {
    if (!API_KEY) {
      setError('Missing API key');
      setLoading(false);
      return;
    }

    setLoading(true);
    const currentPage = type === 'loadMore' ? page + 1 : 1;

    const data = await fetchNewsByCategory(selectedCategory, currentPage);

    if (data.status === 'error') {
      setError('API returned an error.');
    } else {
      setArticles((prev) => (type === 'loadMore' ? [...prev, ...data.articles] : data.articles));
      setPage(currentPage);
      setHasMore(data.articles.length + articles.length < data.totalResults);
      setError(null);
    }

    setLoading(false);
  };

  const isMockData = () => !API_KEY;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">News Explorer</h1>
      <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      {error && <ErrorBanner message={error} apiKey={API_KEY} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(isMockData()
          ? [
              {
                source: { id: null, name: 'Mock Source' },
                author: 'Developer',
                title: 'This is a mock article because the API key is missing',
                description: 'Set your environment variable to see real articles.',
                url: '#',
                urlToImage: 'https://via.placeholder.com/640x360?text=Missing+API+Key',
                publishedAt: new Date().toISOString(),
                content: 'Use real API key to fetch real news content.'
              }
            ]
          : articles
        ).map((article, index) => (
          <ArticleCard key={index} article={article} onClick={() => setSelectedArticle(article)} />
        ))}
      </div>

      {hasMore && !isMockData() && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => loadArticles('loadMore')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </main>
  );
}
