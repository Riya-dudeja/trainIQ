"use client";

import React, { useState, useEffect } from 'react';
import { searchExercisesAdvanced } from '../utils/gymFitApi';
import Link from 'next/link';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('exerciseBookmarks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [expandedInstructions, setExpandedInstructions] = useState({});

  const bodyParts = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];
  const equipment = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'resistance band'];

  useEffect(() => {
    fetchExercises();
    // Add entrance animation delay
    setTimeout(() => setIsLoaded(true), 300);
  }, [searchQuery, selectedBodyPart, selectedEquipment]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchExercisesAdvanced({ 
        query: searchQuery, 
        bodyPart: selectedBodyPart,
        equipment: selectedEquipment,
        number: 50
      });
      setExercises(response || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (exerciseId) => {
    setBookmarks((prev) => {
      let updated;
      if (prev.includes(exerciseId)) {
        updated = prev.filter(id => id !== exerciseId);
      } else {
        updated = [...prev, exerciseId];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('exerciseBookmarks', JSON.stringify(updated));
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <span className="text-white text-2xl font-bold">TrainIQ</span>
                </div>
              </Link>
              <div className="text-gray-300">Exercise Database</div>
            </div>
          </div>
        </nav>

        {/* Loading State */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-500 rounded-full animate-spin flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
            </div>
            <div className="text-white text-xl font-semibold">Loading exercises...</div>
            <div className="text-gray-400 mt-2">Fetching the latest workout data</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <span className="text-white text-2xl font-bold">TrainIQ</span>
                </div>
              </Link>
              <div className="text-gray-300">Exercise Database</div>
            </div>
          </div>
        </nav>

        {/* Error State */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div className="text-red-400 text-xl font-semibold mb-2">Oops! Something went wrong</div>
            <div className="text-gray-400 mb-6">{error}</div>
            <button 
              onClick={fetchExercises}
              className="bg-gradient-to-r from-slate-700 to-slate-500 hover:from-slate-600 hover:to-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white" style={{background: '#181c24'}}>
      {/* Navigation */}
      <nav className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50 shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl flex items-center justify-center shadow-md">
                {/* <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.01z" /></svg> */}
              </div>
              <div>
                <span className="text-white text-2xl font-extrabold tracking-tight">TrainIQ</span>
              </div>
            </Link>
            <div className="text-slate-200 font-semibold tracking-wide text-lg">Exercise Database</div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            <span className="text-slate-100">Exercise <span className="text-blue-200">Database</span></span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-xl mx-auto font-medium">
            Discover hundreds of exercises with detailed instructions, target muscles, and equipment requirements.<br className="hidden md:block"/> Perfect for beginners starting their fitness journey!
          </p>
        </div>

        {/* Search and Filters - Streamlined */}
        <div className={`mb-6 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700/80 border border-slate-600 rounded-full pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200/30 focus:border-blue-200/20 focus:bg-slate-700/90 transition-all duration-300 shadow-sm"
                style={{backdropFilter: 'blur(6px)'}}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-200 hover:text-blue-300 transition-colors duration-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
                className="bg-slate-700/80 border border-slate-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-200/30 focus:border-blue-200/20 focus:bg-slate-700/90 transition-all duration-300 appearance-none cursor-pointer min-w-[120px] shadow-sm"
            >
              <option value="" className="bg-[#232946]">All Body Parts</option>
              {bodyParts.map(part => (
                <option key={part} value={part} className="bg-[#232946] capitalize">{part}</option>
              ))}
            </select>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/20 focus:bg-slate-800/90 transition-all duration-300 appearance-none cursor-pointer min-w-[120px] shadow-sm"
            >
              <option value="" className="bg-[#232946]">All Equipment</option>
              {equipment.map(eq => (
                <option key={eq} value={eq} className="bg-[#232946] capitalize">{eq}</option>
              ))}
            </select>
            {(searchQuery || selectedBodyPart || selectedEquipment) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBodyPart('');
                  setSelectedEquipment('');
                }}
                className="text-sm text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 px-3 py-2 rounded-full hover:bg-slate-800/60 shadow-sm"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
          <div className="text-slate-200 text-base md:text-lg">
            Found <span className="text-white font-bold">{exercises.length}</span> exercises
          </div>
          <Link 
            href="/gym-api"
            className="bg-transparent font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-base md:text-lg"
          >
            Start Training
          </Link>
        </div>

        {/* Exercise Grid */}
        {exercises.length > 0 ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 justify-center transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {exercises.map((exercise, index) => (
              <div 
                key={exercise.id || index} 
                className={`group bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 overflow-hidden shadow-lg hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-400/10 transition-all duration-500 transform hover:scale-[1.02] ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms`, minHeight: '180px', maxWidth: '390px', margin: 0 }}
                >
                {/* Exercise Image/GIF */}
                {exercise.gifUrl && (
                  <div className="aspect-video bg-slate-900/60 relative overflow-hidden">
                    <img 
                      src={exercise.gifUrl} 
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-blue-400/0 group-hover:bg-blue-400/10 transition-all duration-300"></div>
                  </div>
                )}

                <div className="p-2 md:p-3">
                  {/* Exercise Name */}
                  <h3 className="text-sm font-extrabold text-white mb-1 capitalize group-hover:text-blue-300 transition-colors tracking-tight">
                    {exercise.name}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {exercise.bodyPart && (
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-sm font-medium border border-blue-500/20 flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        {exercise.bodyPart}
                      </span>
                    )}
                    {exercise.target && (
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20 flex items-center gap-1">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        {exercise.target}
                      </span>
                    )}
                    {exercise.equipment && (
                      <span className="px-3 py-1 bg-gray-500/10 text-gray-300 rounded-full text-sm font-medium border border-gray-500/20 flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="10" width="16" height="4" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M8 10V6m8 4V6m-8 8v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        {exercise.equipment}
                      </span>
                    )}
                  </div>

                  {/* Instructions Preview */}
                  {exercise.instructions && exercise.instructions.length > 0 && (
                    <div className="mb-1">
                      <h4 className="text-slate-300 font-semibold mb-0.5 text-xs">Quick Steps:</h4>
                      <div className="text-slate-400 text-xs space-y-0.5">
                        {(expandedInstructions[exercise.id] ? exercise.instructions : exercise.instructions.slice(0, 2)).map((instruction, idx) => (
                          <div key={idx} className="flex items-start">
                            <span className="text-blue-400 mr-2">{idx + 1}.</span>
                            <span>{typeof instruction === 'object' ? instruction.description : instruction}</span>
                          </div>
                        ))}
                        {exercise.instructions.length > 2 && (
                          <button
                            className="mt-1 text-blue-300 hover:text-blue-400 text-xs underline focus:outline-none"
                            onClick={() => setExpandedInstructions(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                          >
                            {expandedInstructions[exercise.id] ? 'Show less' : `Show all steps (${exercise.instructions.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex space-x-1 mt-1">
                    <Link
                      href={`/gym-api?exercise=${encodeURIComponent(exercise.name)}`}
                      className="flex-1 bg-gradient-to-r from-gray-700 to-blue-700 hover:from-blue-700 hover:to-gray-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-all duration-300 text-center transform hover:scale-105 hover:shadow-lg text-sm"
                    >
                      Train with AI
                    </Link>
                    <button
                      className={`px-2 py-1.5 bg-slate-700/60 hover:bg-blue-900/60 text-blue-200 ${bookmarks.includes(exercise.id) ? 'text-blue-400' : 'hover:text-blue-400'} rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-6 shadow`}
                      onClick={() => toggleBookmark(exercise.id)}
                      aria-label={bookmarks.includes(exercise.id) ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      {bookmarks.includes(exercise.id) ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-24 h-24 bg-gray-900/50 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No exercises found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria or clear the filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBodyPart('');
                setSelectedEquipment('');
              }}
              className="bg-gradient-to-r from-gray-700 to-blue-700 hover:from-blue-700 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-500/20"
            >
              Show All Exercises
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/95 py-8 mt-16 border-t border-slate-800 shadow-inner">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.01z" /></svg>
              </div>
              <div>
                <span className="text-white text-xl font-extrabold tracking-tight">TrainIQ</span>
                
              </div>
            </div>
            <div className="text-slate-400 text-sm">
              © 2025 TrainIQ. Your AI-powered fitness companion for beginners and experts alike.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
