import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-stone-950 text-white overflow-hidden">
      {/* Luxury Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-rose-950/10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-amber-400/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-rose-600/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.03),transparent)] backdrop-blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/60 backdrop-blur-2xl border-b border-amber-200/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
                  <span className="text-black font-black text-xl sm:text-2xl">T</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/30"></div>
              </div>
              <div>
                <span className="text-white text-2xl sm:text-3xl font-light tracking-wider">train</span>
                <span className="text-amber-400 text-2xl sm:text-3xl font-black">IQ</span>
                <div className="text-amber-300/70 text-xs font-light tracking-widest uppercase">Elite Fitness AI</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-10">
              <a href="#experience" className="text-neutral-300 hover:text-amber-300 transition-all duration-300 font-light tracking-wide">Experience</a>
              <a href="#technology" className="text-neutral-300 hover:text-amber-300 transition-all duration-300 font-light tracking-wide">Technology</a>
              <a href="#elite" className="text-neutral-300 hover:text-amber-300 transition-all duration-300 font-light tracking-wide">Elite Training</a>
              <div className="w-px h-8 bg-amber-400/20"></div>
              <Link href="/gym-api" className="group bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30">
                <span className="group-hover:tracking-wider transition-all duration-300">Enter Platform</span>
              </Link>
            </div>
            <div className="lg:hidden">
              <Link href="/gym-api" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300">
                Enter
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 sm:pt-32 pb-32 sm:pb-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Elite Badge */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-400/20 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 animate-pulse shadow-lg shadow-amber-400/50"></div>
              <span className="text-amber-300 font-light text-sm sm:text-base tracking-widest uppercase">Exclusive AI Technology</span>
            </div>
          </div>

          <div className="text-center max-w-6xl mx-auto">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-thin mb-8 sm:mb-12 leading-none tracking-tight">
              <span className="block text-neutral-100">ELITE</span>
              <span className="block bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent font-light">
                FITNESS
              </span>
              <span className="block text-neutral-200 text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider mt-4">
                INTELLIGENCE
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-neutral-300 mb-12 sm:mb-16 leading-relaxed font-extralight px-4 tracking-wide">
              Where luxury meets performance. Experience 
              <span className="text-amber-300 font-light italic"> bespoke AI coaching</span> and 
              <span className="text-rose-300 font-light italic"> precision form analysis</span> 
              crafted for the discerning athlete.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 sm:mb-20 px-4">
              <Link
                href="/gym-api"
                className="group relative bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400 text-black font-semibold py-4 sm:py-5 px-8 sm:px-12 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl shadow-amber-500/20 hover:shadow-amber-400/30 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center tracking-wide">
                  <span className="mr-3 text-xl">✦</span>
                  BEGIN ELITE TRAINING
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </Link>
              
              <Link
                href="#preview"
                className="border-2 border-amber-400/30 hover:border-amber-300/50 text-amber-200 hover:text-amber-100 font-light py-4 sm:py-5 px-8 sm:px-12 rounded-2xl transition-all duration-300 backdrop-blur-sm w-full sm:w-auto tracking-wide"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-3">▷</span>
                  PREVIEW EXPERIENCE
                </span>
              </Link>
            </div>

            {/* Luxury Stats */}
            <div className="grid grid-cols-3 gap-8 sm:gap-12 max-w-3xl mx-auto px-4">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extralight text-amber-300 mb-2 tracking-wider">99.8%</div>
                <div className="text-neutral-400 text-xs sm:text-sm font-light tracking-widest uppercase">Precision</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extralight text-rose-300 mb-2 tracking-wider">0.05s</div>
                <div className="text-neutral-400 text-xs sm:text-sm font-light tracking-widest uppercase">Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extralight text-emerald-300 mb-2 tracking-wider">∞</div>
                <div className="text-neutral-400 text-xs sm:text-sm font-light tracking-widest uppercase">Potential</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Experience Section */}
      <section id="experience" className="relative py-32 sm:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-rose-950/10"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-20 sm:mb-24">
            <h2 className="text-4xl sm:text-6xl font-extralight text-neutral-100 mb-6 sm:mb-8 tracking-wide">
              BESPOKE
              <span className="block bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent font-light">
                EXCELLENCE
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-neutral-300 max-w-4xl mx-auto px-4 font-extralight leading-relaxed tracking-wide">
              Meticulously crafted AI technology that understands the nuances of elite performance
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 sm:gap-12">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-neutral-800/40 via-neutral-900/30 to-stone-900/40 backdrop-blur-2xl rounded-3xl sm:rounded-4xl p-8 sm:p-10 border border-amber-200/10 hover:border-amber-300/20 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 rounded-3xl sm:rounded-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-amber-500/20">
                  <span className="text-2xl sm:text-3xl text-black">◈</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-neutral-100 mb-4 sm:mb-6 tracking-wide">PRECISION ANALYSIS</h3>
                <p className="text-neutral-300 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg font-extralight tracking-wide">
                  Advanced biomechanical assessment with machine learning algorithms that adapt to your unique movement patterns and physiological responses.
                </p>
                <div className="flex items-center text-amber-300 font-light text-base sm:text-lg tracking-wide">
                  <span>Discover More</span>
                  <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-neutral-800/40 via-neutral-900/30 to-stone-900/40 backdrop-blur-2xl rounded-3xl sm:rounded-4xl p-8 sm:p-10 border border-rose-200/10 hover:border-rose-300/20 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-amber-500/5 rounded-3xl sm:rounded-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-400 via-pink-500 to-red-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-rose-500/20">
                  <span className="text-2xl sm:text-3xl text-white">◇</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-neutral-100 mb-4 sm:mb-6 tracking-wide">INTELLIGENT COACHING</h3>
                <p className="text-neutral-300 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg font-extralight tracking-wide">
                  Personalized guidance that evolves with your progress, delivering insights that professional athletes rely on for peak performance.
                </p>
                <div className="flex items-center text-rose-300 font-light text-base sm:text-lg tracking-wide">
                  <span>Explore Further</span>
                  <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-neutral-800/40 via-neutral-900/30 to-stone-900/40 backdrop-blur-2xl rounded-3xl sm:rounded-4xl p-8 sm:p-10 border border-emerald-200/10 hover:border-emerald-300/20 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 rounded-3xl sm:rounded-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-emerald-500/20">
                  <span className="text-2xl sm:text-3xl text-white">◆</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-neutral-100 mb-4 sm:mb-6 tracking-wide">ELITE INSIGHTS</h3>
                <p className="text-neutral-300 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg font-extralight tracking-wide">
                  Comprehensive performance analytics that reveal hidden potential and optimize every aspect of your training regimen.
                </p>
                <div className="flex items-center text-emerald-300 font-light text-base sm:text-lg tracking-wide">
                  <span>Learn More</span>
                  <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Training Platforms */}
      <section id="elite" className="relative py-32 sm:py-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-20 sm:mb-24">
            <h2 className="text-4xl sm:text-6xl font-extralight text-neutral-100 mb-6 sm:mb-8 tracking-wide">
              ELITE TRAINING
              <span className="block bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent font-light">
                PLATFORMS
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-neutral-300 max-w-4xl mx-auto px-4 font-extralight leading-relaxed tracking-wide">
              Curated experiences designed for different levels of performance mastery
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Platform 1 */}
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-amber-400/20 hover:border-amber-300/40 transition-all duration-500 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-amber-500/20">
                  <span className="text-2xl sm:text-3xl text-black">★</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3 tracking-wide">PLATINUM</h3>
                <p className="text-amber-200 text-sm sm:text-base mb-4 sm:mb-6 font-extralight tracking-wide">Complete AI ecosystem with advanced analytics</p>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold group-hover:from-amber-400 group-hover:to-orange-400 transition-all duration-300 tracking-wide">
                  Enter Platform
                </div>
              </div>
            </Link>

            {/* Platform 2 */}
            <Link
              href="/gym-advanced"
              className="group relative bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-red-500/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-rose-400/20 hover:border-rose-300/40 transition-all duration-500 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-red-500/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-rose-500/20">
                  <span className="text-2xl sm:text-3xl text-white">◆</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3 tracking-wide">GOLD</h3>
                <p className="text-rose-200 text-sm sm:text-base mb-4 sm:mb-6 font-extralight tracking-wide">Enhanced coaching with adaptive intelligence</p>
                <div className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold group-hover:from-rose-400 group-hover:to-red-400 transition-all duration-300 tracking-wide">
                  Access Gold
                </div>
              </div>
            </Link>

            {/* Platform 3 */}
            <Link
              href="/gym"
              className="group relative bg-gradient-to-br from-neutral-600/10 via-slate-600/5 to-stone-600/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neutral-400/20 hover:border-neutral-300/40 transition-all duration-500 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-600/20 via-slate-600/10 to-stone-600/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neutral-500 via-slate-500 to-stone-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-neutral-500/20">
                  <span className="text-2xl sm:text-3xl text-white">◇</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3 tracking-wide">SILVER</h3>
                <p className="text-neutral-200 text-sm sm:text-base mb-4 sm:mb-6 font-extralight tracking-wide">Foundational training with core features</p>
                <div className="bg-gradient-to-r from-neutral-500 to-stone-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold group-hover:from-neutral-400 group-hover:to-stone-400 transition-all duration-300 tracking-wide">
                  Start Silver
                </div>
              </div>
            </Link>

            {/* Platform 4 */}
            <Link
              href="/pose"
              className="group relative bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-emerald-400/20 hover:border-emerald-300/40 transition-all duration-500 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-green-500/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-emerald-500/20">
                  <span className="text-2xl sm:text-3xl text-white">◈</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-light text-neutral-100 mb-3 tracking-wide">ANALYTICS</h3>
                <p className="text-emerald-200 text-sm sm:text-base mb-4 sm:mb-6 font-extralight tracking-wide">Pure movement analysis and insights</p>
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold group-hover:from-emerald-400 group-hover:to-green-400 transition-all duration-300 tracking-wide">
                  View Analytics
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury CTA Section */}
      <section className="relative py-32 sm:py-40 bg-gradient-to-br from-neutral-950 via-amber-950/10 to-rose-950/10">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-rose-500/5"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 sm:px-8">
          <h2 className="text-4xl sm:text-6xl font-extralight text-neutral-100 mb-6 sm:mb-8 tracking-wide">
            READY TO ELEVATE
            <span className="block bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent font-light">
              YOUR POTENTIAL?
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-neutral-300 mb-12 sm:mb-16 leading-relaxed px-4 font-extralight tracking-wide">
            Join an exclusive community of elite athletes who demand nothing less than 
            perfection in their training experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/gym-api"
              className="group relative bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400 text-black font-semibold py-4 sm:py-5 px-10 sm:px-16 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl shadow-amber-500/20 hover:shadow-amber-400/30"
            >
              <span className="relative z-10 tracking-wide">BEGIN YOUR TRANSFORMATION</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            </Link>
            
            <Link
              href="/api"
              className="border-2 border-amber-400/30 hover:border-amber-300/50 text-amber-200 hover:text-amber-100 font-light py-4 sm:py-5 px-10 sm:px-16 rounded-2xl transition-all duration-300 backdrop-blur-sm tracking-wide"
            >
              EXPLORE LIBRARY
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="relative bg-black/80 backdrop-blur-2xl border-t border-amber-200/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-4 gap-8 sm:gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
                  <span className="text-black font-black text-lg sm:text-xl">T</span>
                </div>
                <div>
                  <span className="text-white text-xl sm:text-2xl font-light tracking-wider">train</span>
                  <span className="text-amber-400 text-xl sm:text-2xl font-black">IQ</span>
                  <div className="text-amber-300/70 text-xs font-light tracking-widest uppercase">Elite Fitness AI</div>
                </div>
              </div>
              <p className="text-neutral-400 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg font-extralight tracking-wide max-w-md">
                The epitome of luxury fitness technology. Where artificial intelligence meets 
                human potential to create extraordinary results.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-800/40 rounded-xl backdrop-blur-sm flex items-center justify-center hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-200/10">
                  <span className="text-amber-400 text-base sm:text-lg">◆</span>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-800/40 rounded-xl backdrop-blur-sm flex items-center justify-center hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-200/10">
                  <span className="text-amber-400 text-base sm:text-lg">◇</span>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-800/40 rounded-xl backdrop-blur-sm flex items-center justify-center hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-200/10">
                  <span className="text-amber-400 text-base sm:text-lg">◈</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-neutral-100 font-light mb-4 sm:mb-6 text-base sm:text-lg tracking-wide">Platform</h4>
              <div className="space-y-3">
                <a href="/gym-api" className="block text-neutral-400 hover:text-amber-300 transition-colors text-sm sm:text-base font-extralight tracking-wide">Platinum Experience</a>
                <a href="/api" className="block text-neutral-400 hover:text-amber-300 transition-colors text-sm sm:text-base font-extralight tracking-wide">Exercise Library</a>
                <a href="/pose" className="block text-neutral-400 hover:text-amber-300 transition-colors text-sm sm:text-base font-extralight tracking-wide">Movement Analytics</a>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-neutral-100 font-light mb-4 sm:mb-6 text-base sm:text-lg tracking-wide">Elite Support</h4>
              <div className="space-y-3">
                <a href="#" className="block text-neutral-400 hover:text-amber-300 transition-colors text-sm sm:text-base font-extralight tracking-wide">Concierge Service</a>
                <a href="#" className="block text-neutral-400 hover:text-amber-300 transition-colors text-sm sm:text-base font-extralight tracking-wide">Private Training</a>
                <a href="#" className="block text-neutral-400 hover:text-amber-300 transition-colors text-sm sm:text-base font-extralight tracking-wide">Contact Elite Team</a>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-200/10 mt-12 sm:mt-16 pt-8 sm:pt-10 flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-sm sm:text-base mb-4 md:mb-0 font-extralight tracking-wide">
              © 2025 trainIQ. Where excellence meets innovation.
            </div>
            <div className="flex space-x-6 sm:space-x-8">
              <a href="#" className="text-neutral-400 hover:text-amber-300 text-sm sm:text-base transition-colors font-extralight tracking-wide">Privacy</a>
              <a href="#" className="text-neutral-400 hover:text-amber-300 text-sm sm:text-base transition-colors font-extralight tracking-wide">Terms</a>
              <a href="#" className="text-neutral-400 hover:text-amber-300 text-sm sm:text-base transition-colors font-extralight tracking-wide">Elite Membership</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
