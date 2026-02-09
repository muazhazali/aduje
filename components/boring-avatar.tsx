"use client"

const COLORS = ["#CC0001", "#FFCC00", "#010066", "#10B981", "#3B82F6"]

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function BoringAvatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const hash = hashCode(seed || "default")
  const color1 = COLORS[hash % COLORS.length]
  const color2 = COLORS[(hash + 1) % COLORS.length]
  const color3 = COLORS[(hash + 2) % COLORS.length]

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-full"
    >
      <rect width="80" height="80" fill={color1} />
      <circle cx="40" cy="30" r="20" fill={color2} />
      <rect x="15" y="50" width="50" height="30" rx="10" fill={color3} />
    </svg>
  )
}
