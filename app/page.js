'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);
  const handleDemoOpen = () => setShowDemo(true);
  const handleDemoClose = () => setShowDemo(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-gray-950"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-700/80 to-blue-400/80 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">T</span>
              </div>
              <div>
                <span className="text-white text-xl font-semibold tracking-tight">trainIQ</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#modes" className="text-gray-400 hover:text-white transition-colors">
                Training Modes
              </a>
              <Link href="/gym-api" className="bg-gradient-to-r from-blue-700/90 to-blue-400/90 hover:from-blue-700 hover:to-blue-400 text-white font-medium px-5 py-2.5 rounded-lg transition-all duration-200">
                Start Training
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Main Heading */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
              <span className="text-white">Fitness Coach</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400/90 via-blue-500/90 to-blue-600/90 bg-clip-text text-transparent">
                That Actually Works
              </span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Real-time pose analysis with intelligent form coaching and automatic rep counting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gym-api"
                className="bg-gradient-to-r from-blue-700/90 to-blue-400/90 hover:from-blue-700 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Start Training
              </Link>
              <button
                className="border border-gray-600/50 hover:border-gray-500/70 text-gray-300 hover:text-white py-3 px-6 rounded-lg transition-all duration-200"
                onClick={handleDemoOpen}
              >
                Watch Demo
              </button>
              {/* Video Modal */}
              {showDemo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="bg-gray-900 rounded-2xl shadow-2xl p-4 max-w-2xl w-full relative animate-fade-in">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                      onClick={handleDemoClose}
                      aria-label="Close Demo"
                    >
                      &times;
                    </button>
                    <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden">
                      {/* Replace the src below with your actual video file or YouTube embed */}
                      <iframe
                        width="100%"
                        height="400"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-80 rounded-lg"
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* App Preview */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
              <div className="relative z-10">
                {/* App Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Live Analysis</span>
                  </div>
                </div>
                
                {/* App Interface */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Camera Feed */}
                  <div className="lg:col-span-2 bg-black/30 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3">🏃‍♂️</div>
                      <div className="text-gray-400 text-sm">Camera View</div>
                    </div>
                    
                    {/* Angle Display */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="text-blue-400 text-sm">Left Knee</div>
                        <div className="text-white font-semibold">142°</div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="text-green-400 text-sm">Right Knee</div>
                        <div className="text-white font-semibold">138°</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Panel */}
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-semibold text-blue-400 mb-1">94%</div>
                      <div className="text-blue-300/70 text-sm">Form Score</div>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-semibold text-green-400 mb-1">12</div>
                      <div className="text-green-300/70 text-sm">Reps</div>
                    </div>
                    
                    <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3">
                      <div className="text-green-400 text-sm font-medium mb-1">✓ Good Form</div>
                      <div className="text-gray-400 text-xs">Keep core engaged</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Perfect Form</h3>
              <p className="text-gray-400 text-sm">Real-time pose analysis</p>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">�</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Smart Counting</h3>
              <p className="text-gray-400 text-sm">Automatic rep detection</p>
            </div>
            
            <div className="bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Live Feedback</h3>
              <p className="text-gray-400 text-sm">Instant coaching tips</p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Modes */}
      <section id="modes" className="relative py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Training <span className="text-blue-400/90">Modes</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Choose your preferred training experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Primary Mode */}
            <Link
              href="/gym-api"
              className="group relative bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {/* Trainer: Subtle person icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 0a7 7 0 017 7v3a7 7 0 01-14 0V11a7 7 0 017-7zm-4 7h8m-4 4h.01M9 15h.01M15 15h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Trainer</h3>
                <p className="text-blue-200/70 text-sm mb-3">Complete coaching experience</p>
                <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-md text-xs font-medium">
                  Recommended
                </div>
              </div>
            </Link>

            {/* Other Modes */}
            <Link
              href="/gym"
              className="group bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/40 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {/* Quick Start: Lightning bolt icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Quick Start</h3>
                <p className="text-gray-300/70 text-sm">Fast workouts</p>
              </div>
            </Link>

            <Link
              href="/settings"
              className="group bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/40 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {/* Settings: Gear icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.01c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.01 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.01 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572-1.01c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.01-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.01z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Settings</h3>
                <p className="text-gray-300/70 text-sm">App preferences</p>
              </div>
            </Link>

            <Link
              href="/api"
              className="group bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/40 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {/* Exercises: Dumbbell icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75v-1.5a.75.75 0 00-1.5 0v1.5m0 10.5v1.5a.75.75 0 001.5 0v-1.5m10.5-10.5v-1.5a.75.75 0 00-1.5 0v1.5m0 10.5v1.5a.75.75 0 001.5 0v-1.5m-12-7.5h15m-15 6h15m-10.5-6v6m6-6v6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Exercises</h3>
                <p className="text-gray-300/70 text-sm">Browse library</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="bg-gray-900/30 border border-gray-700/30 rounded-2xl p-10">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Ready to Start Training?
            </h2>
            <p className="text-gray-300 mb-8">
              No downloads required. Works instantly in your browser.
            </p>
            
            <Link
              href="/gym-api"
              className="inline-flex items-center bg-gradient-to-r from-blue-700/90 to-blue-400/90 hover:from-blue-700 hover:to-blue-400 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200"
            >
              Start Training Now
            </Link>
            
            <div className="text-sm text-gray-400 mt-4">
              Camera stays private • No signup needed
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/30 border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-700/80 to-blue-400/80 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">T</span>
              </div>
              <div>
                <span className="text-white text-lg font-semibold">trainIQ</span>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2025 trainIQ. Fitness for everyone.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
