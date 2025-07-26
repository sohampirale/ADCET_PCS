"use client"

import { useState, useEffect } from 'react';
import { Heart, ExternalLink, User, Calendar, Eye, Share2, ArrowLeft, AlertCircle, Loader2, Crown } from 'lucide-react';
import { useParams } from 'next/navigation';

const EPortfolio = () => {
  const params=useParams();
  const epId=params.epId as string;
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, [epId]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/e-portfolio/${epId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPortfolio(data.data);
      } else {
        setError(data.message || 'Failed to load portfolio');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    console.log('inside handleLike');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: portfolio.title,
          text: `Check out this amazing portfolio: ${portfolio.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 text-center max-w-md w-full">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Portfolio</h2>
          <p className="text-gray-600">Please wait while we fetch the portfolio details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPortfolio}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 text-center max-w-md w-full">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Portfolio Not Found</h2>
          <p className="text-gray-600">The portfolio you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Main Portfolio Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {portfolio.title}
                  </h1>
                  
                  {/* Owner Info */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm">Created by</p>
                      <p className="text-white font-semibold text-lg">{portfolio.owner.name}</p>
                    </div>
                  </div>

                  {/* Mentor Info (if exists) */}
                  {portfolio.mentor && (
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="bg-yellow-400/20 backdrop-blur-sm rounded-full p-3">
                        <Crown className="w-6 h-6 text-yellow-300" />
                      </div>
                      <div>
                        <p className="text-emerald-100 text-sm">Mentored by</p>
                        <p className="text-white font-semibold text-lg">{portfolio.mentor.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center space-x-6 text-emerald-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Created {formatDate(portfolio.createdAt)}</span>
                    </div>
                    {portfolio.updatedAt !== portfolio.createdAt && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Updated {formatDate(portfolio.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 lg:mt-0 lg:ml-8">
                  <div className="flex flex-col space-y-3">
                    {/* Visit Portfolio Button */}
                    <a
                      href={portfolio.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Visit Portfolio</span>
                    </a>

                    {/* Like and Share */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                          portfolio.likedByMe
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                        } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart className={`w-5 h-5 ${portfolio.likedByMe ? 'fill-current' : ''}`} />
                        <span>{portfolio._count.likes}</span>
                      </button>

                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>
          </div>

          {/* Portfolio Stats */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{portfolio._count.likes}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">Live</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.floor((new Date() - new Date(portfolio.createdAt)) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">Days Live</div>
                </div>
              </div>

              <div className="mt-4 lg:mt-0">
                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                  E-Portfolio
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Portfolio Preview</h2>
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <ExternalLink className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {portfolio.title}
              </h3>
              <p className="text-gray-600 mb-6">
                Click "Visit Portfolio" to view the full portfolio experience
              </p>
              <a
                href={portfolio.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Portfolio</span>
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Creator Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>About Creator</span>
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-800">{portfolio.owner.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Portfolio Created</p>
                <p className="font-medium text-gray-800">{formatDate(portfolio.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Engagement Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Engagement</span>
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="font-medium text-gray-800">{portfolio._count.likes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Status</p>
                <p className={`font-medium ${portfolio.likedByMe ? 'text-red-600' : 'text-gray-600'}`}>
                  {portfolio.likedByMe ? 'You liked this portfolio ❤️' : 'Not liked yet'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPortfolio;