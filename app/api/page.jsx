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

  const bodyParts = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];
  const equipment = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'resistance band'];

  useEffect(() => {
    fetchExercises();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-white text-xl font-bold">trainIQ</span>
              </Link>
              <div className="text-gray-300">Exercise Database</div>
            </div>
          </div>
        </nav>

        {/* Loading State */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-slate-900 rounded-full"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-white text-xl font-bold">trainIQ</span>
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-white text-xl font-bold">trainIQ</span>
            </Link>
            <div className="text-gray-300">Exercise Database</div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Exercise <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Database</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover hundreds of exercises with detailed instructions, target muscles, and equipment requirements
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Body Part Filter */}
            <select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" className="bg-slate-800">All Body Parts</option>
              {bodyParts.map(part => (
                <option key={part} value={part} className="bg-slate-800 capitalize">{part}</option>
              ))}
            </select>

            {/* Equipment Filter */}
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" className="bg-slate-800">All Equipment</option>
              {equipment.map(eq => (
                <option key={eq} value={eq} className="bg-slate-800 capitalize">{eq}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBodyPart('');
                setSelectedEquipment('');
              }}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-300">
            Found <span className="text-white font-semibold">{exercises.length}</span> exercises
          </div>
          <Link 
            href="/gym-api"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            Start Training 🚀
          </Link>
        </div>

        {/* Exercise Grid */}
        {exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise, index) => (
              <div key={exercise.id || index} className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                {/* Exercise Image/GIF */}
                {exercise.gifUrl && (
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative overflow-hidden">
                    <img 
                      src={exercise.gifUrl} 
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                )}

                <div className="p-6">
                  {/* Exercise Name */}
                  <h3 className="text-xl font-bold text-white mb-3 capitalize">
                    {exercise.name}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exercise.bodyPart && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                        🎯 {exercise.bodyPart}
                      </span>
                    )}
                    {exercise.target && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                        💪 {exercise.target}
                      </span>
                    )}
                    {exercise.equipment && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
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
                            <span className="text-blue-400 mr-2">{idx + 1}.</span>
                            <span>{typeof instruction === 'object' ? instruction.description : instruction}</span>
                          </div>
                        ))}
                        {exercise.instructions.length > 2 && (
                          <div className="text-blue-400 text-xs">
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
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center"
                    >
                      Train Now
                    </Link>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-all duration-300">
                      ⭐
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto">
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Show All Exercises
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/40 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-white text-xl font-bold">trainIQ</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 trainIQ. Your AI-powered fitness companion.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}