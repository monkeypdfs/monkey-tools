export const LaptopIllustration = () => (
  <svg
    viewBox="0 0 600 360"
    className="w-full h-auto drop-shadow-2xl"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby="laptop-illustration-title"
  >
    <title id="laptop-illustration-title">Premium Tools Dashboard Illustration</title>
    {/* Screen Body */}
    <rect x="50" y="20" width="500" height="300" rx="16" fill="#1e293b" />
    <rect x="54" y="24" width="492" height="292" rx="12" fill="#0f172a" />

    {/* Screen Content Area */}
    <rect x="60" y="30" width="480" height="280" rx="4" fill="white" />

    {/* Mock UI in Screen */}
    <rect x="60" y="30" width="480" height="40" fill="#f1f5f9" />
    <circle cx="80" cy="50" r="4" fill="#cbd5e1" />
    <circle cx="95" cy="50" r="4" fill="#cbd5e1" />
    <circle cx="110" cy="50" r="4" fill="#cbd5e1" />

    {/* Content Blocks */}
    <rect x="90" y="80" width="180" height="90" rx="8" fill="#eff6ff" />
    <text x="180" y="115" textAnchor="middle" fill="#3b82f6" fontSize="14" fontWeight="bold">
      PDF
    </text>
    <circle cx="120" cy="140" r="10" fill="#3b82f6" opacity="0.3" />

    <rect x="330" y="80" width="180" height="90" rx="8" fill="#eff6ff" />
    <text x="420" y="115" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="bold">
      Image
    </text>
    <circle cx="360" cy="140" r="10" fill="#10b981" opacity="0.3" />

    <rect x="90" y="190" width="180" height="90" rx="8" fill="#eff6ff" />
    <text x="180" y="225" textAnchor="middle" fill="#8b5cf6" fontSize="14" fontWeight="bold">
      Text
    </text>
    <circle cx="120" cy="250" r="10" fill="#8b5cf6" opacity="0.3" />

    <rect x="330" y="190" width="180" height="90" rx="8" fill="#eff6ff" />
    <text x="420" y="225" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">
      AI
    </text>
    <circle cx="360" cy="250" r="10" fill="#ef4444" opacity="0.3" />

    {/* Base */}
    <path d="M20 320 H580 L600 340 C600 351.046 591.046 360 580 360 H20 C8.9543 360 0 351.046 0 340 L20 320 Z" fill="#cbd5e1" />
    <path d="M20 320 H580 L580 325 H20 L20 320 Z" fill="#94a3b8" />
  </svg>
);
