import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-stone-950 text-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-transparent to-indigo-950/20"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.05),transparent)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-lg">T</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <span className="text-white text-xl sm:text-2xl font-medium">trainIQ</span>
                <div className="text-blue-300/80 text-xs font-normal">AI Fitness Coach</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-blue-300 transition-colors font-normal">Features</a>
              <a href="#workouts" className="text-gray-300 hover:text-blue-300 transition-colors font-normal">Workouts</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-blue-300 transition-colors font-normal">How it Works</a>
              <Link href="/gym-api" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg">
                Start Workout
              </Link>
            </div>
            <div className="lg:hidden">
              <Link href="/gym-api" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300">
                Start
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 sm:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Subtle Badge */}
          <div className="mb-10">
            <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-blue-500/20 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-blue-200/90 font-normal text-sm">AI-Powered Fitness Coach</span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light mb-8 leading-tight tracking-tight">
            <span className="block text-white/95 font-extralight">Get fit with</span>
            <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent font-normal">
              intelligent coaching
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-300/90 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
            Your personal AI trainer that watches your form, counts your reps, and keeps you motivated. 
            <span className="text-blue-300/90"> Get real-time feedback</span> and 
            <span className="text-indigo-300/90"> perfect your workouts</span> with precision guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="mr-2">→</span>
                Start my workout
              </span>
            </Link>
            
            <Link
              href="#demo"
              className="border border-gray-600/50 hover:border-blue-400/50 text-gray-300 hover:text-blue-200 font-medium py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">▷</span>
                Watch demo
              </span>
            </Link>
          </div>

          {/* Subtle Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light text-blue-400/90 mb-1">99%</div>
              <div className="text-gray-400/80 text-sm font-light">Form accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light text-indigo-400/90 mb-1">24/7</div>
              <div className="text-gray-400/80 text-sm font-light">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light text-blue-300/90 mb-1">Real-time</div>
              <div className="text-gray-400/80 text-sm font-light">Feedback</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-white/95 mb-6">
              Why you'll love it
            </h2>
            <p className="text-lg text-gray-300/80 max-w-3xl mx-auto font-light">
              Intelligent features designed to make your workouts more effective and enjoyable
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/5 hover:border-blue-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-2xl">👁</span>
                </div>
                <h3 className="text-xl font-medium text-white/95 mb-4">Form Analysis</h3>
                <p className="text-gray-300/80 leading-relaxed mb-6 font-light">
                  AI-powered pose detection that monitors your form in real-time, ensuring every rep is performed safely and effectively.
                </p>
                <div className="flex items-center text-blue-400/90 font-normal text-sm">
                  <span>Learn more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-medium text-white/95 mb-4">Smart Counting</h3>
                <p className="text-gray-300/80 leading-relaxed mb-6 font-light">
                  Automatic rep counting that tracks your progress accurately, so you can focus entirely on your workout.
                </p>
                <div className="flex items-center text-indigo-400/90 font-normal text-sm">
                  <span>Discover more</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/5 hover:border-blue-400/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-medium text-white/95 mb-4">Progress Tracking</h3>
                <p className="text-gray-300/80 leading-relaxed mb-6 font-light">
                  Detailed analytics and insights that help you understand your progress and optimize your training.
                </p>
                <div className="flex items-center text-blue-400/90 font-normal text-sm">
                  <span>View details</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workout Options */}
      <section id="workouts" className="relative py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-white/95 mb-6">
              Choose your experience
            </h2>
            <p className="text-lg text-gray-300/80 max-w-3xl mx-auto font-light">
              Different training modes to match your goals and preferences
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Option 1 */}
            <Link
              href="/gym-api"
              className="group relative bg-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-medium text-white/95 mb-2">Complete Training</h3>
                <p className="text-blue-200/70 text-sm mb-4 font-light">Full AI coaching with exercise database</p>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
                  Start Training
                </div>
              </div>
            </Link>

            {/* Option 2 */}
            <Link
              href="/gym-advanced"
              className="group relative bg-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-medium text-white/95 mb-2">Advanced Mode</h3>
                <p className="text-indigo-200/70 text-sm mb-4 font-light">Enhanced coaching with deeper insights</p>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                  Try Advanced
                </div>
              </div>
            </Link>

            {/* Option 3 */}
            <Link
              href="/gym"
              className="group relative bg-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/5 hover:border-slate-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🏃</span>
                </div>
                <h3 className="text-lg font-medium text-white/95 mb-2">Simple Mode</h3>
                <p className="text-slate-200/70 text-sm mb-4 font-light">Basic pose detection for quick workouts</p>
                <div className="bg-gradient-to-r from-slate-600 to-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:from-slate-700 group-hover:to-gray-700 transition-all duration-300">
                  Keep Simple
                </div>
              </div>
            </Link>

            {/* Option 4 */}
            <Link
              href="/pose"
              className="group relative bg-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-white/95 mb-2">Analytics Only</h3>
                <p className="text-cyan-200/70 text-sm mb-4 font-light">Pure movement analysis and visualization</p>
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:from-cyan-700 group-hover:to-blue-700 transition-all duration-300">
                  View Analytics
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative py-20 sm:py-32 bg-gradient-to-br from-blue-950/10 to-indigo-950/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-white/95 mb-6">
              How it works
            </h2>
            <p className="text-lg text-gray-300/80 max-w-3xl mx-auto font-light">
              Simple, intuitive, and effective - just the way fitness should be
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-medium text-white/95 mb-4">Open & Allow Camera</h3>
              <p className="text-gray-300/80 font-light leading-relaxed">
                Simply click start workout and grant camera access. We use your camera to analyze your movements in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">🏋️</span>
              </div>
              <h3 className="text-xl font-medium text-white/95 mb-4">Start Your Workout</h3>
              <p className="text-gray-300/80 font-light leading-relaxed">
                Choose your exercise and begin. Our AI will track your form, count reps, and provide instant feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-medium text-white/95 mb-4">Track Progress</h3>
              <p className="text-gray-300/80 font-light leading-relaxed">
                View your performance metrics, track improvements, and get personalized recommendations for better results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-4xl sm:text-5xl font-light text-white/95 mb-6">
            Ready to transform your fitness?
          </h2>
          <p className="text-lg text-gray-300/80 mb-12 leading-relaxed font-light">
            Join thousands who are already improving their workouts with intelligent AI coaching.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20"
            >
              <span className="relative z-10">Start your fitness journey</span>
            </Link>
            
            <Link
              href="/api"
              className="border border-gray-600/50 hover:border-blue-400/50 text-gray-300 hover:text-blue-200 font-medium py-4 px-10 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              Explore exercises
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/40 backdrop-blur-xl border-t border-white/10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-lg">T</span>
                </div>
                <div>
                  <span className="text-white text-xl font-medium">trainIQ</span>
                  <div className="text-blue-300/80 text-xs font-normal">AI Fitness Coach</div>
                </div>
              </div>
              <p className="text-gray-400/80 leading-relaxed mb-6 max-w-md font-light">
                Intelligent fitness coaching powered by AI. Making workouts more effective, engaging, and accessible for everyone.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors cursor-pointer">
                  <span className="text-blue-400">📱</span>
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors cursor-pointer">
                  <span className="text-blue-400">🐦</span>
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors cursor-pointer">
                  <span className="text-blue-400">📧</span>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <h4 className="text-white/95 font-medium mb-4">Quick Access</h4>
              <div className="space-y-2">
                <a href="/gym-api" className="block text-gray-400/80 hover:text-blue-300 transition-colors font-light">AI Trainer</a>
                <a href="/api" className="block text-gray-400/80 hover:text-blue-300 transition-colors font-light">Exercise Library</a>
                <a href="/pose" className="block text-gray-400/80 hover:text-blue-300 transition-colors font-light">Pose Analysis</a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white/95 font-medium mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400/80 hover:text-blue-300 transition-colors font-light">Help Center</a>
                <a href="#" className="block text-gray-400/80 hover:text-blue-300 transition-colors font-light">Contact Us</a>
                <a href="#" className="block text-gray-400/80 hover:text-blue-300 transition-colors font-light">Feedback</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400/80 text-sm mb-4 md:mb-0 font-light">
              © 2025 trainIQ. Intelligent fitness for everyone.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400/80 hover:text-blue-300 text-sm transition-colors font-light">Privacy</a>
              <a href="#" className="text-gray-400/80 hover:text-blue-300 text-sm transition-colors font-light">Terms</a>
              <a href="#" className="text-gray-400/80 hover:text-blue-300 text-sm transition-colors font-light">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
