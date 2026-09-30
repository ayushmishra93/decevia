"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, StepForward, Terminal as TermIcon, ShieldAlert } from "lucide-react";
export function TerminalReplay({ logs, sessionTitle }) {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    // Playback timer
    useEffect(() => {
        if (!isPlaying)
            return;
        if (currentLineIndex >= logs.length) {
            setIsPlaying(false);
            return;
        }
        const delay = (2000 / speed);
        const timer = setTimeout(() => {
            setCurrentLineIndex((prev) => prev + 1);
        }, delay);
        return () => clearTimeout(timer);
    }, [isPlaying, currentLineIndex, logs.length, speed]);
    const handleReset = () => {
        setIsPlaying(false);
        setCurrentLineIndex(0);
    };
    const handleStepForward = () => {
        if (currentLineIndex < logs.length) {
            setCurrentLineIndex((prev) => prev + 1);
        }
    };
    return (<div className="rounded-xl bg-[#070B14] border border-[#1E293B] overflow-hidden shadow-2xl font-mono">
      {/* Terminal Top Window Bar */}
      <div className="bg-[#0B1220] border-b border-[#1E293B] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mac window dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"/>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"/>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"/>
          </div>
          <TermIcon className="w-4 h-4 text-[#00D9FF]"/>
          <span className="text-xs text-gray-300 font-semibold truncate max-w-xs">
            {sessionTitle} [READ-ONLY FORENSIC REPLAY]
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button disabled={!logs.length} onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B] hover:border-[#00D9FF]/40 text-xs text-white transition-colors" title={isPlaying ? "Pause replay" : "Play session stream"}>
            {isPlaying ? (<>
                <Pause className="w-3 h-3 text-amber-400"/>
                <span>Pause</span>
              </>) : (<>
                <Play className="w-3 h-3 text-emerald-400"/>
                <span>Replay</span>
              </>)}
          </button>

          <button onClick={handleStepForward} disabled={currentLineIndex >= logs.length} className="p-1.5 rounded bg-[#111827] border border-[#1E293B] text-gray-400 hover:text-white disabled:opacity-40" title="Step Forward">
            <StepForward className="w-3 h-3"/>
          </button>

          <button onClick={handleReset} className="p-1.5 rounded bg-[#111827] border border-[#1E293B] text-gray-400 hover:text-white" title="Reset to start">
            <RotateCcw className="w-3 h-3"/>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded bg-[#111827] border border-[#1E293B] p-0.5 text-[11px]">
            {[1, 2, 5].map((s) => (<button key={s} onClick={() => setSpeed(s)} className={`px-1.5 py-0.5 rounded ${speed === s ? "bg-[#00D9FF]/20 text-[#00D9FF] font-bold" : "text-gray-400 hover:text-white"}`}>
                {s}x
              </button>))}
          </div>

          <span className="text-[11px] text-gray-500 ml-1">
            {currentLineIndex} / {logs.length}
          </span>
        </div>
      </div>

      {/* Terminal Screen Canvas */}
      <div className="p-4 sm:p-5 h-80 overflow-y-auto text-xs space-y-3 bg-[#070B14] select-text">
        <div className="text-gray-500 text-[11px] pb-2 border-b border-[#1E293B]/60">
          # Decevia Read-Only Simulation Recorder
          <br /># Stored commands and results are inert text. Nothing is executed.
        </div>

        {!logs.length && <p className="text-slate-400 py-4">No simulated commands were recorded for this session.</p>}
        {logs.slice(0, currentLineIndex).map((log, idx) => (<div key={idx} className="space-y-1 group">
            {/* Command prompt line */}
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500 text-[10px] select-none">[{log.time}]</span>
              <span className="text-emerald-400 font-bold select-none">admin@decoy:~$</span>
              <span className="text-white font-semibold flex-1">{log.command}</span>
              {log.isSuspicious && (<span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 select-none">
                  <ShieldAlert className="w-2.5 h-2.5"/>
                  PROBE
                </span>)}
            </div>

            {/* Simulated Command stdout */}
            {log.output && (<div className="pl-6 text-gray-300 text-[11px] whitespace-pre-wrap font-mono leading-relaxed bg-[#0B1220]/40 p-2 rounded border border-[#1E293B]/40">
                {log.output}
              </div>)}
          </div>))}

        {/* Current active prompt with blinking cursor */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-bold select-none">admin@decoy:~$</span>
          <span className="terminal-cursor"/>
        </div>
      </div>
    </div>);
}
