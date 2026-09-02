import React from "react";

/**
 * Production-grade infinite marquee component.
 * Duplicates children dynamically to guarantee seamless 100% loop transitions.
 */
export default function InfiniteMarquee({
  children,
  className = "",
  speed = 30, // Loop duration in seconds
  pauseOnHover = false,
  direction = "left", // 'left' | 'right'
}) {
  const childArray = React.Children.toArray(children);

  // Safety fallback if no children passed
  if (!childArray.length) return null;

  // Multiply items if category list is small to ensure track overflows properly
  const itemsNeeded = Math.max(2, Math.ceil(10 / childArray.length));
  const repeatedChildren = Array(itemsNeeded).fill(childArray).flat();

  return (
    <div
      className={`group relative flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className}`}
    >
      {/* Primary Track */}
      <div
        className={`flex min-w-full shrink-0 items-center justify-around gap-4 py-2 ${
          direction === "right" ? "animate-marquee-reverse" : "animate-marquee"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {repeatedChildren.map((item, idx) => (
          <React.Fragment key={`orig-${idx}`}>{item}</React.Fragment>
        ))}
      </div>

      {/* Duplicated Track (Prevents white space / jump gaps) */}
      <div
        aria-hidden="true"
        className={`flex min-w-full shrink-0 items-center justify-around gap-4 py-2 ${
          direction === "right" ? "animate-marquee-reverse" : "animate-marquee"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {repeatedChildren.map((item, idx) => (
          <React.Fragment key={`dup-${idx}`}>{item}</React.Fragment>
        ))}
      </div>
    </div>
  );
}