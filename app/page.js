import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-transparent to-gray-950"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-yellow-600/3 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 rounded-lg flex items-center justify-center">
                <span className="text-black font-semibold text-sm">T</span>
              </div>
              <div>
                <span className="text-white text-xl font-semibold tracking-tight">trainIQ</span>
                <div className="text-amber-400/60 text-xs font-medium">AI FITNESS COACH</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#modes" className="text-gray-400 hover:text-white transition-colors">
                Training Modes
              </a>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <Link href="/gym-api" className="bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-600 hover:to-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg transition-all duration-200">
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
              <span className="text-white">AI Fitness Coach</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400/90 via-yellow-500/90 to-amber-500/90 bg-clip-text text-transparent">
                That Actually Works
              </span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Real-time pose analysis with intelligent form coaching and automatic rep counting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gym-api"
                className="bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-600 hover:to-yellow-600 text-black font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Start Training
              </Link>
              <button className="border border-gray-600/50 hover:border-gray-500/70 text-gray-300 hover:text-white py-3 px-6 rounded-lg transition-all duration-200">
                Watch Demo
              </button>
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
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
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
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-semibold text-amber-400 mb-1">94%</div>
                      <div className="text-amber-300/70 text-sm">Form Score</div>
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
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
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
              Training <span className="text-amber-400/90">Modes</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Choose your preferred training experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Primary Mode */}
            <Link
              href="/gym-api"
              className="group relative bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 hover:border-amber-500/30 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">AI Trainer Pro</h3>
                <p className="text-amber-200/70 text-sm mb-3">Complete coaching experience</p>
                <div className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-md text-xs font-medium">
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
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Quick Start</h3>
                <p className="text-gray-300/70 text-sm">Fast workouts</p>
              </div>
            </Link>

            <Link
              href="/pose"
              className="group bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/40 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Analytics</h3>
                <p className="text-gray-300/70 text-sm">Movement analysis</p>
              </div>
            </Link>

            <Link
              href="/api"
              className="group bg-gray-900/30 border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/40 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💪</span>
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
              className="inline-flex items-center bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-600 hover:to-yellow-600 text-black font-medium py-4 px-8 rounded-lg transition-all duration-200"
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
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 rounded-lg flex items-center justify-center">
                <span className="text-black font-semibold text-sm">T</span>
              </div>
              <div>
                <span className="text-white text-lg font-semibold">trainIQ</span>
                <div className="text-amber-400/60 text-xs">AI FITNESS COACH</div>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2025 trainIQ. AI fitness for everyone.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
