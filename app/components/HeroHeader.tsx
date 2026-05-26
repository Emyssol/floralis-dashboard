"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function HeroHeader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{ width: "100%", lineHeight: 0, position: "relative" }}
    >
      <Image
        src="/background/floralis-header.webp"
        alt="FLORALIS — The Cozy Florist"
        width={1920}
        height={640}
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={85}
        className="hero-img"
        style={{ width: "100%", height: "auto", display: "block" }}
      />

      {/* Fade inferior — só desktop */}
      <div className="hero-fade" style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "25%",
        background: "linear-gradient(to bottom, transparent 0%, #FFF8FB 100%)",
        pointerEvents: "none",
      }} />

      <style>{`
        @media (min-width: 768px) {
          .hero-img {
            max-height: 220px;
            object-fit: cover;
            object-position: center 45%;
          }
        }
        @media (max-width: 767px) {
          .hero-fade { height: 30% !important; }
        }
      `}</style>
    </motion.div>
  )
}