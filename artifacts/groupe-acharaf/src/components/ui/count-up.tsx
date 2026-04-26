import React, { useEffect, useState, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function CountUp({ end, duration = 2, suffix = "", prefix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // No margin offset — we just need the element to be visible
  const inView = useInView(ref, { once: false });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [value, setValue] = useState("0");

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    // Only animate once we have real data (end > 0) AND the element is in view
    if (inView && end > 0 && !hasAnimated) {
      motionValue.set(end);
      setHasAnimated(true);
    }
  }, [inView, end, motionValue, hasAnimated]);

  // If end changes after animation (shouldn't happen but just in case), re-animate
  useEffect(() => {
    if (hasAnimated && end > 0) {
      motionValue.set(end);
    }
  }, [end, hasAnimated, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setValue(Math.floor(latest).toLocaleString("fr-FR"));
    });
  }, [springValue]);

  return (
    <span ref={ref}>
      {prefix}{value}{suffix}
    </span>
  );
}