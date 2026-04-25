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
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState("0");
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (inView) {
      motionValue.set(end);
    }
  }, [inView, end, motionValue]);

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