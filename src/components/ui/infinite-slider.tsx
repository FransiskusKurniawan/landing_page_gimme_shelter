"use client";

import { ReactNode, useEffect, useRef } from "react";

interface InfiniteSliderProps {
  children: ReactNode;
  speed?: number;
  speedOnHover?: number;
  gap?: number;
}

export function InfiniteSlider({
  children,
  speed = 40,
  speedOnHover = 20,
  gap = 64,
}: InfiniteSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const positionRef = useRef(0);
  const currentSpeedRef = useRef(speed);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const firstChild = slider.firstElementChild as HTMLElement;
    if (!firstChild) return;

    // Calculate the width of one set of items
    const itemWidth = firstChild.offsetWidth + gap;
    const totalWidth = itemWidth * (slider.children.length / 2); // Half because we duplicate

    const animate = () => {
      positionRef.current -= currentSpeedRef.current / 60; // 60fps

      if (Math.abs(positionRef.current) >= totalWidth) {
        positionRef.current = 0;
      }

      if (slider) {
        slider.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Mouse enter/leave handlers
    const handleMouseEnter = () => {
      currentSpeedRef.current = speedOnHover;
    };

    const handleMouseLeave = () => {
      currentSpeedRef.current = speed;
    };

    slider.addEventListener("mouseenter", handleMouseEnter);
    slider.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      slider.removeEventListener("mouseenter", handleMouseEnter);
      slider.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [speed, speedOnHover, gap]);

  return (
    <div className="overflow-hidden">
      <div
        ref={sliderRef}
        className="flex"
        style={{ gap: `${gap}px` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
