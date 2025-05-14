'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// TypeScript Types
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

// API Functions
const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
console.log(API_KEY)
const BASE_URL = 'https://newsapi.org/v2';

async function fetchNewsByCategory(category: Category, page: number = 1): Promise<NewsApiResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/top-headlines?country=us&category=${category}&page=${page}&apiKey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      status: 'error',
      totalResults: 0,
      articles: []
    };
  }
}

// Component: Category Filter
function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: Category; 
  onCategoryChange: (category: Category) => void 
}) {
  const categories: Category[] = ['general', 'technology', 'sports', 'business', 'health', 'entertainment'];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
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

// Component: Article Card
function ArticleCard({ 
  article, 
  onClick 
}: { 
  article: Article; 
  onClick: () => void 
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48 w-full">
        {article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">{article.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">{article.description || 'No description available'}</p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{article.source.name}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// Component: Article Modal
function ArticleModal({ 
  article, 
  onClose 
}: { 
  article: Article | null; 
  onClose: () => void 
}) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {article.urlToImage && (
          <img 
            src={article.urlToImage} 
            alt={article.title} 
            className="w-full h-64 object-cover" 
          />
        )}
        
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
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Read Full Article
          </a>
          
          <button 
            onClick={onClose}
            className="ml-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component: NewsFeed
export default function NewsApp() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');
  const [page, setPage] = useState<number>(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    setArticles([]);
    setPage(1);
    setHasMore(true);
    
    fetchNewsByCategory(selectedCategory)
      .then((data) => {
        setArticles(data.articles);
        setHasMore(data.articles.length < data.totalResults);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load news. Please try again.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCategory]);

  const loadMoreArticles = () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setLoading(true);
    
    fetchNewsByCategory(selectedCategory, nextPage)
      .then((data) => {
        setArticles([...articles, ...data.articles]);
        setPage(nextPage);
        setHasMore(articles.length + data.articles.length < data.totalResults);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load more articles. Please try again.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
  };

  const openArticleDetails = (article: Article) => {
    setSelectedArticle(article);
  };

  const closeArticleDetails = () => {
    setSelectedArticle(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">News Explorer</h1>
          <p className="text-gray-600">Stay updated with the latest news from around the world</p>
        </header>
        
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <ArticleCard
                  key={`${article.title}-${index}`}
                  article={article}
                  onClick={() => openArticleDetails(article)}
                />
              ))}
            </div>
            
            {articles.length === 0 && !loading && (
              <div className="text-center py-10">
                <p className="text-gray-600">No articles found for this category.</p>
              </div>
            )}
            
            {hasMore && articles.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreArticles}
                  disabled={loading}
                  className={`px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
        
        <ArticleModal article={selectedArticle} onClose={closeArticleDetails} />
      </div>
    </main>
  );
}

