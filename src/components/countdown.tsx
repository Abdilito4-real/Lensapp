'use client';

import { useState, useEffect } from 'react';

type CountdownProps = {
  targetDate: string;
};

const calculateTimeLeft = (targetDate: string) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set initial time left on mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex flex-col items-center">
            <span className="text-2xl md:text-4xl font-bold tabular-nums">{formatTime(timeLeft.hours)}</span>
            <span className="text-xs text-muted-foreground">Hours</span>
        </div>
        <span className="text-2xl md:text-4xl font-bold">:</span>
        <div className="flex flex-col items-center">
            <span className="text-2xl md:text-4xl font-bold tabular-nums">{formatTime(timeLeft.minutes)}</span>
            <span className="text-xs text-muted-foreground">Minutes</span>
        </div>
        <span className="text-2xl md:text-4xl font-bold">:</span>
        <div className="flex flex-col items-center">
            <span className="text-2xl md:text-4xl font-bold tabular-nums">{formatTime(timeLeft.seconds)}</span>
            <span className="text-xs text-muted-foreground">Seconds</span>
        </div>
    </div>
  );
}
