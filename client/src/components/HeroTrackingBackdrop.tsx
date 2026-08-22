import "./HeroTrackingBackdrop.css";

export default function HeroTrackingBackdrop() {
  const streets = [
    "M-30 110 C160 15 260 200 450 116 S760 35 1060 120",
    "M-20 214 C190 125 345 290 520 200 S780 130 1060 222",
    "M-20 324 C130 245 344 416 530 307 S805 225 1060 328",
    "M-20 440 C170 345 338 530 564 402 S815 360 1060 458",
    "M-20 560 C154 445 376 634 575 522 S790 460 1060 578",
    "M-20 680 C160 566 360 750 555 650 S810 555 1060 690",
  ];
  const verticals = [
    "M86 -30 C25 160 170 335 74 760",
    "M222 -30 C153 188 315 420 208 760",
    "M355 -30 C286 215 452 443 350 760",
    "M493 -30 C414 186 586 410 488 760",
    "M640 -30 C568 204 735 430 634 760",
    "M790 -30 C716 182 880 413 774 760",
    "M930 -30 C858 200 1005 445 920 760",
  ];
  const route =
    "M255 610 C380 637 432 548 531 493 S655 455 727 358 S816 275 914 190";
  return (
    <div className="hero-tracking-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1060 760" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="heroRouteGlow">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="heroMapTone" cx="68%" cy="46%">
            <stop stopColor="#174742" stopOpacity=".55" />
            <stop offset=".62" stopColor="#0a1b22" stopOpacity=".22" />
            <stop offset="1" stopColor="#050b0d" />
          </radialGradient>
        </defs>
        <rect width="1060" height="760" fill="url(#heroMapTone)" />
        {streets.map((path, index) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke={index % 2 === 0 ? "#28434e" : "#18303a"}
            strokeWidth={index % 2 === 0 ? 4 : 2}
          />
        ))}
        {verticals.map((path, index) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke={index % 2 === 0 ? "#203b46" : "#153039"}
            strokeWidth={index % 2 === 0 ? 3.5 : 2}
          />
        ))}
        <path
          d={route}
          fill="none"
          stroke="#123c2e"
          strokeWidth="28"
          strokeLinecap="round"
        />
        <path
          d={route}
          fill="none"
          stroke="#55e49b"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#heroRouteGlow)"
        />
        <circle
          cx="255"
          cy="610"
          r="25"
          fill="#0b2722"
          stroke="#55e49b"
          strokeWidth="6"
        />
        <circle cx="255" cy="610" r="8" fill="#f6fffb" />
        <circle
          cx="914"
          cy="190"
          r="25"
          fill="#2d1718"
          stroke="#ff847b"
          strokeWidth="6"
        />
        <circle cx="914" cy="190" r="8" fill="#fff7f5" />
        <g className="hero-tracking-car">
          <animateMotion
            dur="9s"
            repeatCount="indefinite"
            path={route}
            rotate="auto"
          />
          <g transform="translate(-25 -15)">
            <rect x="0" y="6" width="50" height="22" rx="8" fill="#f1f5f3" />
            <path d="M10 6 L17 0 H34 L42 6 Z" fill="#ffffff" />
            <path d="M17 2 H33 L37 6 H14 Z" fill="#85aeb4" />
            <circle cx="13" cy="29" r="5" fill="#071115" />
            <circle cx="37" cy="29" r="5" fill="#071115" />
          </g>
        </g>
      </svg>
      <span className="hero-map-label hero-map-label--one">JUÁREZ</span>
      <span className="hero-map-label hero-map-label--two">ROMA NORTE</span>
      <span className="hero-map-label hero-map-label--three">DOCTORES</span>
    </div>
  );
}
