"use client";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden flex flex-col items-center relative">
      {/* Uniform Header (matches Home) */}
      {/* Navigation - matches Home */}
      <nav className="relative z-50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 rounded-lg flex items-center justify-center">
                <span className="text-black font-semibold text-sm">T</span>
              </div>
              <div>
                <span className="text-white text-xl font-semibold tracking-tight">trainIQ</span>
                <div className="text-amber-400/60 text-xs font-medium">AI FITNESS COACH</div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-amber-400/90 text-lg font-semibold tracking-tight">Settings</span>
              <Link href="/" className="bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-600 hover:to-yellow-600 text-black font-medium px-4 py-1.5 rounded-lg transition-all duration-200 text-sm">Home</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Subtle background overlays to match Home */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-transparent to-gray-950"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Profile section - styled to match Home */}
      <div className="w-full flex flex-col items-center mt-8 mb-4 z-10">
        <div className="bg-gradient-to-r from-amber-600/80 to-yellow-600/80 rounded-full p-2 shadow-lg flex items-center justify-center border-4 border-amber-400">
          <svg viewBox="0 0 24 24" fill="none" className="w-20 h-20 rounded-full bg-gray-900" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#232323" />
            <circle cx="12" cy="10" r="4" fill="#fbbf24" />
            <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" fill="#fbbf24" />
          </svg>
        </div>
      </div>

      {/* Settings Card - styled to match Home cards */}
      <div className="w-full max-w-xl bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 rounded-2xl shadow-2xl p-8 border border-amber-400/20 z-10">
        <div className="space-y-8">
          {/* Audio Feedback Toggle */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-yellow-900/30 shadow group hover:shadow-yellow-700 transition-all">
            <div className="flex-shrink-0 bg-amber-700/30 rounded-full p-2">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" fill="#fbbf24"/></svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Audio Feedback
                <span className="ml-1 text-xs text-amber-300 cursor-pointer" title="Enable or disable voice instructions and feedback during your workout.">ⓘ</span>
              </div>
              <div className="text-xs text-amber-200">Voice instructions and feedback during your workout.</div>
            </div>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-400 transition-all"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5" />
            </label>
          </div>

          {/* Voice Type */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-yellow-900/30 shadow group hover:shadow-yellow-700 transition-all">
            <div className="flex-shrink-0 bg-amber-700/30 rounded-full p-2">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 3v18m9-9H3" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Voice Type
                <span className="ml-1 text-xs text-amber-300 cursor-pointer" title="Choose your preferred voice for audio feedback.">ⓘ</span>
              </div>
              <select className="w-full bg-gray-900 border border-amber-400/30 rounded px-3 py-2 text-white mt-2">
                <option>System Default</option>
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
          </div>

          {/* Feedback Speed */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-yellow-900/30 shadow group hover:shadow-yellow-700 transition-all">
            <div className="flex-shrink-0 bg-amber-700/30 rounded-full p-2">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Feedback Speed
                <span className="ml-1 text-xs text-amber-300 cursor-pointer" title="Adjust how quickly feedback is spoken.">ⓘ</span>
              </div>
              <input type="range" min="0.5" max="1.5" step="0.1" defaultValue="1" className="w-full accent-yellow-400 mt-2" />
              <div className="flex justify-between text-xs text-amber-200 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* Pose Detection Sensitivity */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-yellow-900/30 shadow group hover:shadow-yellow-700 transition-all">
            <div className="flex-shrink-0 bg-amber-700/30 rounded-full p-2">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2"/><path d="M8 12l2.5 2.5L16 9" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Pose Detection Sensitivity
                <span className="ml-1 text-xs text-amber-300 cursor-pointer" title="Set how strict or forgiving pose detection should be.">ⓘ</span>
              </div>
              <input type="range" min="0" max="2" step="1" defaultValue="1" className="w-full accent-yellow-400 mt-2" />
              <div className="flex justify-between text-xs text-amber-200 mt-1">
                <span>Forgiving</span>
                <span>Balanced</span>
                <span>Strict</span>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded border-2 border-yellow-700 text-yellow-400 bg-transparent hover:bg-yellow-700/20 font-semibold flex items-center gap-2 transition-all">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Reset All Settings
            </button>
          </div>

          {/* About/Version Info */}
          <div className="text-xs text-amber-300 text-center pt-4 border-t border-amber-400/20">
            TrainIQ v1.0 &mdash; AI Fitness Trainer &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
