"use client"

import Avatar from "boring-avatars"

const COLORS = ["#CC0001", "#FFCC00", "#010066", "#10B981", "#3B82F6"]

export function BoringAvatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const avatarSeed = seed || "default"

  return (
    <Avatar
      name={avatarSeed}
      size={size}
      variant="beam"
      colors={COLORS}
      square={false}
      className="rounded-full"
      aria-label={`Avatar ${avatarSeed}`}
      title
    />
  )
}
