"use client";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  // Default values
  const DEFAULTS = {
    audio: true,
    voice: "System Default",
    speed: 1,
    sensitivity: 1,
  };
  const [audio, setAudio] = useState(DEFAULTS.audio);
  const [voice, setVoice] = useState(DEFAULTS.voice);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [sensitivity, setSensitivity] = useState(DEFAULTS.sensitivity);

  const handleReset = () => {
    setAudio(DEFAULTS.audio);
    setVoice(DEFAULTS.voice);
    setSpeed(DEFAULTS.speed);
    setSensitivity(DEFAULTS.sensitivity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden flex flex-col items-center relative">
      {/* Simple Header */}
      <nav className="relative z-50 border-b border-white/10 w-full flex justify-center bg-slate-950/80">
        <div className="max-w-3xl w-full flex items-center justify-between px-8 pt-4 pb-2">
          <div className="flex items-center space-x-3">
            <span className="text-white text-xl font-bold tracking-tight">trainIQ</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-white/80 text-base font-normal tracking-tight">Settings</span>
            <Link href="/" className="text-blue-400 hover:underline hover:text-blue-300 transition-colors text-base font-medium px-2 py-1 rounded">Home</Link>
          </div>
        </div>
      </nav>

      {/* No background overlays for a clean look */}

      {/* No profile avatar for a professional look */}
      <div className="h-10" />

      {/* Settings Card - clean, modern look */}
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl shadow-xl p-12 border border-slate-700 z-10">
        <div className="space-y-8">
          {/* Audio Feedback Toggle */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 shadow group transition-all">
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Audio Feedback
                <span className="ml-1 text-xs text-slate-300 cursor-pointer" title="Enable or disable voice instructions and feedback during your workout.">i</span>
              </div>
              <div className="text-xs text-slate-400">Voice instructions and feedback during your workout.</div>
            </div>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={audio} onChange={e => setAudio(e.target.checked)} />
              <div className={`w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer transition-all ${audio ? 'bg-blue-400' : ''}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all ${audio ? 'translate-x-5' : ''}`} />
            </label>
          </div>

          {/* Voice Type */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 shadow group transition-all">
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Voice Type
                <span className="ml-1 text-xs text-slate-300 cursor-pointer" title="Choose your preferred voice for audio feedback.">i</span>
              </div>
              <select className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white mt-2" value={voice} onChange={e => setVoice(e.target.value)}>
                <option>System Default</option>
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
          </div>

          {/* Feedback Speed */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 shadow group transition-all">
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Feedback Speed
                <span className="ml-1 text-xs text-slate-300 cursor-pointer" title="Adjust how quickly feedback is spoken.">i</span>
              </div>
              <input type="range" min="0.5" max="1.5" step="0.1" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full accent-blue-400 mt-2" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* Pose Detection Sensitivity */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 shadow group transition-all">
            <div className="flex-1">
              <div className="font-semibold text-base text-white flex items-center gap-2">Pose Detection Sensitivity
                <span className="ml-1 text-xs text-slate-300 cursor-pointer" title="Set how strict or forgiving pose detection should be.">i</span>
              </div>
              <input type="range" min="0" max="2" step="1" value={sensitivity} onChange={e => setSensitivity(Number(e.target.value))} className="w-full accent-blue-400 mt-2" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Forgiving</span>
                <span>Balanced</span>
                <span>Strict</span>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button type="button" onClick={handleReset} className="px-4 py-2 rounded border-2 border-slate-600 text-blue-400 bg-transparent hover:bg-blue-900/20 font-semibold transition-all">
              Reset All Settings
            </button>
          </div>

          {/* About/Version Info */}
          <div className="text-xs text-slate-400 text-center pt-4 border-t border-slate-700">
            TrainIQ v1.0 &mdash; Fitness App &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
