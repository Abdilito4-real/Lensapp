'use client';

import { cn } from "@/lib/utils";

interface WaveformProps {
  isPlaying: boolean;
  color?: string;
  className?: string;
  barCount?: number;
}

export function Waveform({
  isPlaying,
  color = "bg-primary",
  className,
  barCount = 12
}: WaveformProps) {
  return (
    <div className={cn("flex items-center gap-0.5 h-6", className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-0.5 rounded-full transition-all duration-300",
            color,
            isPlaying ? "animate-waveform" : "h-1"
          )}
          style={{
            height: isPlaying ? undefined : '4px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.6 + (i % 5) * 0.1}s`
          }}
        ></span>
      ))}
      <style jsx>{`
        @keyframes waveform {
          0%, 100% { height: 4px; }
          50% { height: 20px; }
        }
        .animate-waveform {
          animation-name: waveform;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
}
