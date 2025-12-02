"use client";

import { useState, useEffect } from 'react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold text-lg">T</span>
                </div>
                <div>
                  <span className="text-white text-2xl font-bold">TrainIQ</span>
                  <div className="text-yellow-400 text-xs font-medium">AI FITNESS TRAINER</div>
                </div>
              </Link>
              <div className="text-gray-300">Exercise Database</div>
            </div>
          </div>
        </nav>

        {/* Loading State */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-spin flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-black rounded-full"></div>
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
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold text-lg">T</span>
                </div>
                <div>
                  <span className="text-white text-2xl font-bold">TrainIQ</span>
                  <div className="text-yellow-400 text-xs font-medium">AI FITNESS TRAINER</div>
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
              <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <div className="text-red-400 text-xl font-semibold mb-2">Oops! Something went wrong</div>
            <div className="text-gray-400 mb-6">{error}</div>
            <button 
              onClick={fetchExercises}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-lg">T</span>
              </div>
              <div>
                <span className="text-white text-2xl font-bold">TrainIQ</span>
                <div className="text-yellow-400 text-xs font-medium">AI FITNESS TRAINER</div>
              </div>
            </Link>
            <div className="text-gray-300">Exercise Database</div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="container mx-auto px-6 py-12">
        <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl font-bold text-white mb-4">
            Exercise <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Database</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover hundreds of exercises with detailed instructions, target muscles, and equipment requirements. Perfect for beginners starting their fitness journey!
          </p>
        </div>

        {/* Search and Filters - Streamlined */}
        <div className={`mb-8 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Main Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by exercise name, muscle group, or equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/30 border border-gray-700/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/30 focus:bg-gray-900/50 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Compact Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Body Part Filter */}
            <select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              className="bg-gray-900/30 border border-gray-700/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/30 transition-all duration-300 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="" className="bg-gray-800">🎯 All Body Parts</option>
              {bodyParts.map(part => (
                <option key={part} value={part} className="bg-gray-800 capitalize">{part}</option>
              ))}
            </select>

            {/* Equipment Filter */}
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="bg-gray-900/30 border border-gray-700/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/30 transition-all duration-300 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="" className="bg-gray-800">🏋️ All Equipment</option>
              {equipment.map(eq => (
                <option key={eq} value={eq} className="bg-gray-800 capitalize">{eq}</option>
              ))}
            </select>

            {/* Clear Filters - Compact */}
            {(searchQuery || selectedBodyPart || selectedEquipment) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBodyPart('');
                  setSelectedEquipment('');
                }}
                className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800/30"
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
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-300">
            Found <span className="text-white font-semibold">{exercises.length}</span> exercises
          </div>
          <Link 
            href="/gym-api"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-orange-500/25"
          >
            Start AI Training 🚀
          </Link>
        </div>

        {/* Exercise Grid */}
        {exercises.length > 0 ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {exercises.map((exercise, index) => (
              <div 
                key={exercise.id || index} 
                className={`group bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden hover:border-yellow-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                {/* Exercise Image/GIF */}
                {exercise.gifUrl && (
                  <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-orange-500/20 relative overflow-hidden">
                    <img 
                      src={exercise.gifUrl} 
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-all duration-300"></div>
                  </div>
                )}

                <div className="p-6">
                  {/* Exercise Name */}
                  <h3 className="text-xl font-bold text-white mb-3 capitalize group-hover:text-yellow-400 transition-colors">
                    {exercise.name}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exercise.bodyPart && (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
                        🎯 {exercise.bodyPart}
                      </span>
                    )}
                    {exercise.target && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium border border-yellow-500/30">
                        💪 {exercise.target}
                      </span>
                    )}
                    {exercise.equipment && (
                      <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm font-medium border border-gray-500/30">
                        🏋️ {exercise.equipment}
                      </span>
                    )}
                  </div>

                  {/* Instructions Preview */}
                  {exercise.instructions && exercise.instructions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-semibold mb-2">Quick Steps:</h4>
                      <div className="text-gray-400 text-sm space-y-1">
                        {exercise.instructions.slice(0, 2).map((instruction, idx) => (
                          <div key={idx} className="flex items-start">
                            <span className="text-yellow-400 mr-2">{idx + 1}.</span>
                            <span>{typeof instruction === 'object' ? instruction.description : instruction}</span>
                          </div>
                        ))}
                        {exercise.instructions.length > 2 && (
                          <div className="text-yellow-400 text-xs">
                            +{exercise.instructions.length - 2} more steps...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/gym-api?exercise=${encodeURIComponent(exercise.name)}`}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center transform hover:scale-105 hover:shadow-lg"
                    >
                      Train with AI
                    </Link>
                    <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-yellow-400 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12">
                      ⭐
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-24 h-24 bg-gray-900/50 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No exercises found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria or clear the filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBodyPart('');
                setSelectedEquipment('');
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-orange-500/25"
            >
              Show All Exercises
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/80 py-12 mt-20 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-lg">T</span>
              </div>
              <div>
                <span className="text-white text-xl font-bold">TrainIQ</span>
                <div className="text-yellow-400 text-xs font-medium">AI FITNESS TRAINER</div>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 TrainIQ. Your AI-powered fitness companion for beginners and experts alike.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
