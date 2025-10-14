import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-gray-900">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-lg sm:text-xl">T</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-white text-xl sm:text-2xl font-black tracking-tight">trainIQ</span>
                <div className="text-blue-400 text-xs font-medium">AI FITNESS</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors font-medium">Features</a>
              <a href="#trainers" className="text-gray-300 hover:text-blue-400 transition-colors font-medium">AI Trainers</a>
              <a href="#technology" className="text-gray-300 hover:text-blue-400 transition-colors font-medium">Technology</a>
              <div className="w-px h-6 bg-white/20"></div>
              <Link href="/gym-api" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg">
                Launch App
              </Link>
            </div>
            <div className="lg:hidden">
              <Link href="/gym-api" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300">
                Launch
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-20 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-400 font-semibold text-xs sm:text-sm">POWERED BY ADVANCED AI</span>
            </div>
          </div>

          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 sm:mb-8 leading-none">
              <span className="block">NEXT-GEN</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                FITNESS AI
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 leading-relaxed font-light px-4">
              Revolutionary pose detection technology meets artificial intelligence to deliver 
              <span className="text-blue-400 font-semibold"> real-time form correction</span> and 
              <span className="text-cyan-400 font-semibold"> personalized coaching</span> 
              that adapts to your every movement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <Link
                href="/gym-api"
                className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  START TRAINING
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </Link>
              
              <Link
                href="#demo"
                className="border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-400 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
              >
                Watch Demo
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mb-1">99.2%</div>
                <div className="text-gray-400 text-xs sm:text-sm font-medium">ACCURACY</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 mb-1">0.1s</div>
                <div className="text-gray-400 text-xs sm:text-sm font-medium">RESPONSE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-green-400 mb-1">24/7</div>
                <div className="text-gray-400 text-xs sm:text-sm font-medium">AI COACH</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-32 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
              REVOLUTIONARY
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TECHNOLOGY
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Cutting-edge AI and computer vision technology that transforms how you train
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl">🎯</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">REAL-TIME ANALYSIS</h3>
                <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Advanced MediaPipe integration provides instant pose detection and movement analysis with sub-second latency for immediate feedback.
                </p>
                <div className="flex items-center text-blue-400 font-semibold text-sm sm:text-base">
                  <span>Learn more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-cyan-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl">🧠</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">ADAPTIVE AI COACHING</h3>
                <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Machine learning algorithms continuously adapt to your form and progress, providing personalized corrections and motivation.
                </p>
                <div className="flex items-center text-cyan-400 font-semibold text-sm sm:text-base">
                  <span>Learn more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-green-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl">📈</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">PERFORMANCE METRICS</h3>
                <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Comprehensive analytics track your progress, form quality, and workout intensity with detailed performance insights.
                </p>
                <div className="flex items-center text-green-400 font-semibold text-sm sm:text-base">
                  <span>Learn more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Trainers Section */}
      <section id="trainers" className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
              CHOOSE YOUR
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AI TRAINER
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Each AI trainer is specialized for different fitness goals and experience levels
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg sm:text-2xl">🚀</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">ADVANCED AI</h3>
                <p className="text-blue-200 text-xs sm:text-sm mb-3 sm:mb-4">Complete workout analysis with exercise database</p>
                <div className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold group-hover:bg-blue-400 transition-colors">
                  Start Training
                </div>
              </div>
            </Link>

            <Link
              href="/gym-advanced"
              className="group relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg sm:text-2xl">🤖</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">SMART COACH</h3>
                <p className="text-cyan-200 text-xs sm:text-sm mb-3 sm:mb-4">Enhanced pose analysis with adaptive feedback</p>
                <div className="bg-cyan-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold group-hover:bg-cyan-400 transition-colors">
                  Try Smart
                </div>
              </div>
            </Link>

            <Link
              href="/gym"
              className="group relative bg-gradient-to-br from-slate-500/10 to-gray-500/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-500/20 hover:border-slate-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 to-gray-500/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg sm:text-2xl">🏋️</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">BASIC TRAINER</h3>
                <p className="text-slate-200 text-xs sm:text-sm mb-3 sm:mb-4">Simple pose detection for beginners</p>
                <div className="bg-slate-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold group-hover:bg-slate-400 transition-colors">
                  Start Simple
                </div>
              </div>
            </Link>

            <Link
              href="/pose"
              className="group relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg sm:text-2xl">📊</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">POSE ANALYZER</h3>
                <p className="text-green-200 text-xs sm:text-sm mb-3 sm:mb-4">Raw pose detection and visualization</p>
                <div className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold group-hover:bg-green-400 transition-colors">
                  Analyze Now
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
            READY TO TRANSFORM
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              YOUR FITNESS?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 leading-relaxed px-4">
            Join the future of fitness training with AI-powered form analysis, 
            real-time feedback, and personalized coaching that evolves with you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span className="relative z-10">START YOUR AI JOURNEY</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </Link>
            
            <Link
              href="/api"
              className="border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-400 font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              EXPLORE EXERCISES
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/80 backdrop-blur-xl border-t border-white/10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-6 sm:gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm sm:text-base">T</span>
                </div>
                <div>
                  <span className="text-white text-lg sm:text-xl font-black">trainIQ</span>
                  <div className="text-blue-400 text-xs font-medium">AI FITNESS</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Revolutionary AI-powered fitness platform that transforms your workout experience 
                with real-time pose detection and intelligent coaching.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors cursor-pointer">
                  <span className="text-blue-400 text-sm sm:text-base">🐦</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors cursor-pointer">
                  <span className="text-blue-400 text-sm sm:text-base">💼</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-cyan-500/20 transition-colors cursor-pointer">
                  <span className="text-cyan-400 text-sm sm:text-base">📸</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
              <div className="space-y-2">
                <a href="/gym-api" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">AI Trainer</a>
                <a href="/api" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Exercise Database</a>
                <a href="/pose" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Pose Analysis</a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">Contact</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-xs sm:text-sm mb-4 md:mb-0">
              © 2025 trainIQ. The future of AI-powered fitness training.
            </div>
            <div className="flex space-x-4 sm:space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-xs sm:text-sm transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-xs sm:text-sm transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-xs sm:text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
