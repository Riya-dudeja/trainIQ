import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden">
      {/* Fun Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-white font-bold text-lg sm:text-xl">💪</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
              </div>
              <div>
                <span className="text-white text-xl sm:text-2xl font-bold">trainIQ</span>
                <div className="text-purple-300 text-xs font-medium">AI Fitness Coach</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-purple-300 transition-colors font-medium">Features</a>
              <a href="#workouts" className="text-gray-300 hover:text-purple-300 transition-colors font-medium">Workouts</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-purple-300 transition-colors font-medium">How it Works</a>
              <Link href="/gym-api" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/30">
                Start Workout 🚀
              </Link>
            </div>
            <div className="lg:hidden">
              <Link href="/gym-api" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300">
                Start 🚀
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-20 sm:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Fun Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full backdrop-blur-sm">
              <span className="text-2xl mr-2 animate-bounce">🤖</span>
              <span className="text-purple-300 font-semibold text-sm">AI-Powered Fitness Coach</span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 leading-tight">
            <span className="block">GET FIT WITH</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              AI MAGIC
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
            Your personal AI trainer that watches your form, counts your reps, and keeps you motivated! 
            <span className="text-purple-300">No more guessing</span> - get 
            <span className="text-pink-300"> real-time feedback</span> and 
            <span className="text-blue-300"> perfect your workouts</span> like a pro! 💯
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/30 w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center text-lg">
                <span className="mr-3 text-2xl">🔥</span>
                START MY WORKOUT
              </span>
            </Link>
            
            <Link
              href="#demo"
              className="border-2 border-purple-400/50 hover:border-purple-300 text-purple-200 hover:text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                <span className="mr-3">▶️</span>
                Watch Demo
              </span>
            </Link>
          </div>

          {/* Fun Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">99%</div>
              <div className="text-gray-400 text-sm font-medium">Accurate Form Check</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-pink-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm font-medium">AI Coach Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">∞</div>
              <div className="text-gray-400 text-sm font-medium">Workouts to Explore</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Why You'll
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Love It
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              It's like having a personal trainer in your pocket, but way cooler! 🎯
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                  <span className="text-3xl">👁️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Form Checker</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Never worry about bad form again! Our AI watches your every move and gives you instant feedback to keep you safe and effective.
                </p>
                <div className="flex items-center text-purple-400 font-semibold">
                  <span>Try it now</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Rep Counter</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  No more losing count! Our AI automatically tracks your reps and sets, so you can focus on crushing your workout goals.
                </p>
                <div className="flex items-center text-blue-400 font-semibold">
                  <span>See it work</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/20">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-time Coaching</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Get motivational tips and form corrections as you work out. It's like having a personal trainer cheering you on!
                </p>
                <div className="flex items-center text-green-400 font-semibold">
                  <span>Start coaching</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workout Types Section */}
      <section id="workouts" className="relative py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Choose Your
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Workout Style
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Different vibes for different workouts - pick what fits your mood! 🏋️‍♀️
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Workout 1 */}
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Full Power</h3>
                <p className="text-purple-200 text-sm mb-4">Complete AI training with exercise database and form analysis</p>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                  Let's Go! 🔥
                </div>
              </div>
            </Link>

            {/* Workout 2 */}
            <Link
              href="/gym-advanced"
              className="group relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Mode</h3>
                <p className="text-blue-200 text-sm mb-4">Enhanced coaching with adaptive AI feedback</p>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                  Get Smart! 🤓
                </div>
              </div>
            </Link>

            {/* Workout 3 */}
            <Link
              href="/gym"
              className="group relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/20">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Chill Mode</h3>
                <p className="text-green-200 text-sm mb-4">Simple pose detection for easy workouts</p>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:from-green-400 group-hover:to-emerald-400 transition-all duration-300">
                  Keep it Simple 😌
                </div>
              </div>
            </Link>

            {/* Workout 4 */}
            <Link
              href="/pose"
              className="group relative bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/20">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Data Nerd</h3>
                <p className="text-orange-200 text-sm mb-4">Pure movement analysis and pose visualization</p>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:from-orange-400 group-hover:to-red-400 transition-all duration-300">
                  Show Me Data! 📈
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative py-20 sm:py-32 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              How It
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Actually Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              It's actually pretty simple - just turn on your camera and start moving! 📹
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Open the App</h3>
              <p className="text-gray-300">
                Just click "Start Workout" and give us camera permission. We promise we're not creepy - we just need to see your moves!
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                <span className="text-4xl">🏃‍♀️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. Start Moving</h3>
              <p className="text-gray-300">
                Pick your exercise and start working out! Our AI will track your form in real-time and count your reps automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Get Better</h3>
              <p className="text-gray-300">
                Get instant feedback, track your progress, and watch yourself improve with every workout. It's like magic, but with science!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Ready to Get
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Absolutely Ripped?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Join thousands of people who are already crushing their fitness goals with AI! 
            Your future self will thank you. 💪
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/30"
            >
              <span className="relative z-10 flex items-center justify-center text-lg">
                <span className="mr-3 text-2xl">🔥</span>
                START MY FITNESS JOURNEY
              </span>
            </Link>
            
            <Link
              href="/api"
              className="border-2 border-purple-400/50 hover:border-purple-300 text-purple-200 hover:text-white font-semibold py-4 px-12 rounded-2xl transition-all duration-300 backdrop-blur-sm"
            >
              <span className="flex items-center justify-center">
                <span className="mr-3">📚</span>
                BROWSE EXERCISES
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Fun Footer */}
      <footer className="relative bg-black/60 backdrop-blur-xl border-t border-purple-500/20 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <span className="text-white font-bold text-lg">💪</span>
                </div>
                <div>
                  <span className="text-white text-xl font-bold">trainIQ</span>
                  <div className="text-purple-300 text-xs font-medium">AI Fitness Coach</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Making fitness fun and accessible with AI technology. 
                Because working out shouldn't feel like work! 🎯
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center hover:bg-purple-500/30 transition-colors cursor-pointer">
                  <span className="text-purple-400">📱</span>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center hover:bg-purple-500/30 transition-colors cursor-pointer">
                  <span className="text-purple-400">🐦</span>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center hover:bg-purple-500/30 transition-colors cursor-pointer">
                  <span className="text-purple-400">📸</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Quick Start</h4>
              <div className="space-y-2">
                <a href="/gym-api" className="block text-gray-400 hover:text-purple-300 transition-colors">Full AI Trainer</a>
                <a href="/api" className="block text-gray-400 hover:text-purple-300 transition-colors">Exercise Library</a>
                <a href="/pose" className="block text-gray-400 hover:text-purple-300 transition-colors">Just Pose Analysis</a>
              </div>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-white font-bold mb-4">Need Help?</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-purple-300 transition-colors">How to Use</a>
                <a href="#" className="block text-gray-400 hover:text-purple-300 transition-colors">Troubleshooting</a>
                <a href="#" className="block text-gray-400 hover:text-purple-300 transition-colors">Contact Us</a>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 trainIQ. Making fitness fun since today! 🚀
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
