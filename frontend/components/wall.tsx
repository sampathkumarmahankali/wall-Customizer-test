import type React from "react"

interface WallProps {
  children: React.ReactNode
  width: number
  height: number
  background: string
  backgroundSize?: string
  border?: {
    width: number
    color: string
    style: "solid" | "dashed" | "dotted" | "double"
    radius: number
  }
}

export default function Wall({ children, width, height, background, backgroundSize, border }: WallProps) {
  const borderStyle =
    border && border.width > 0
      ? {
          border: `${border.width}px ${border.style} ${border.color}`,
          borderRadius: `${border.radius}px`,
        }
      : {}

  const backgroundStyles = background.startsWith("#")
    ? {
        backgroundColor: background,
      }
    : {
        backgroundImage: `url(${background})`,
        backgroundSize: backgroundSize || "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        backgroundColor: "#f9f9f9", // Fallback
        overflow: "hidden",
        ...backgroundStyles,
        ...borderStyle,
      }}
    >
      {children}
    </div>
  )
}
