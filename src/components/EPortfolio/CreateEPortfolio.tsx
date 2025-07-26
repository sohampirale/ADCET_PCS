"use client"

import { useState } from 'react';
import { Plus, Link2, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const CreateEPortfolio = () => {
  const [formData, setFormData] = useState({
    title: '',
    link: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(''); 
  const [serverMessage, setServerMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Reset submit status when user starts editing
    if (submitStatus) {
      setSubmitStatus('');
      setServerMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Portfolio title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.link.trim()) {
      newErrors.link = 'Portfolio link is required';
    } else if (!isValidUrl(formData.link)) {
      newErrors.link = 'Please enter a valid URL (e.g., https://example.com)';
    }

    return newErrors;
  };

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async () => {
    setServerMessage('');
    setSubmitStatus('');
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/e-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success
        setSubmitStatus('success');
        setServerMessage('Portfolio created successfully!');
        // Reset form
        setFormData({ title: '', link: '' });
        setErrors({});
      } else {
        // Handle API errors
        setSubmitStatus('error');
        setServerMessage(data.message || 'Failed to create portfolio');
      }
    } catch (error) {
      setSubmitStatus('error');
      setServerMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Upload className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Upload E Portfolio</h1>
          <p className="text-gray-600 text-lg">Share your amazing work with the world</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">{serverMessage}</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 font-medium">{serverMessage}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Portfolio Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg text-gray-800 placeholder-gray-400 ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  placeholder="e.g., My Web Development Projects"
                  maxLength="100"
                />
              </div>
              {errors.title && <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>}
              <p className="text-gray-500 text-sm mt-2">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Link Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Portfolio Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg text-gray-800 placeholder-gray-400 ${
                    errors.link ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  placeholder="https://your-portfolio.com"
                />
              </div>
              {errors.link && <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.link}
              </p>}
              <p className="text-gray-500 text-sm mt-2">
                Include the full URL (starting with https:// or http://)
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Portfolio...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Portfolio</span>
                </div>
              )}
            </button>

            {/* Keyboard Shortcut Hint */}
            <p className="text-center text-sm text-gray-500">
              💡 Tip: Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + Enter</kbd> to submit quickly
            </p>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Portfolio Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Use a descriptive title that represents your work</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Make sure your link is publicly accessible</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Include projects that showcase your best skills</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateEPortfolio;