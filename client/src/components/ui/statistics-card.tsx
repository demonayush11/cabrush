"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";

const BARS = [
  { value: 35, label: "Other Apps", color: "#D1D5DB", delay: 0.1 },
  { value: 25, label: "Manual Booking", color: "#D1D5DB", delay: 0.2 },
  { value: 99, label: "CabRush", color: "#F5C518", delay: 0.3, isWinner: true },
  { value: 37, label: "Traditional Cabs", color: "#D1D5DB", delay: 0.4 },
];

const CONTAINER_HEIGHT = 400;

type BarChartProps = {
  value: number;
  label: string;
  color: string;
  delay: number;
  isWinner?: boolean;
};

const BarChart = ({ value, label, color, delay, isWinner }: BarChartProps) => {
  const barHeight = (value / 100) * CONTAINER_HEIGHT;
  const hoverColor = isWinner ? "#E6B800" : "#9CA3AF";

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex w-full flex-col items-center"
      style={{ cursor: "pointer" }}
    >
      <div
        className="relative w-full overflow-hidden rounded-3xl"
        style={{
          height: CONTAINER_HEIGHT,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 24,
            backgroundImage:
              "repeating-linear-gradient(135deg, #F3F4F6 0px, #F3F4F6 1px, #FAFAFA 1px, #FAFAFA 12px)",
            zIndex: 0,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          whileHover={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            bottom: barHeight + 8,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1A1A1A",
            color: "#FFFFFF",
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {label}: {value}% confirmation rate
        </motion.div>

        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: barHeight }}
          whileHover={{ backgroundColor: hoverColor }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.9,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: color,
            borderRadius: "20px 20px 0 0",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: isWinner ? "#1A1A1A" : "rgba(0,0,0,0.15)",
              borderRadius: 999,
              padding: "6px 16px",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                color: isWinner ? "#F5C518" : "#FFFFFF",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              <NumberFlow value={value} suffix="%" />
            </span>
          </div>

          {isWinner && (
            <div
              style={{
                position: "absolute",
                top: 56,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#1A1A1A",
                color: "#F5C518",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Fastest confirmed
            </div>
          )}
        </motion.div>
      </div>

      <p
        style={{
          marginTop: 12,
          fontSize: 13,
          fontWeight: isWinner ? 700 : 400,
          color: isWinner ? "#1A1A1A" : "#6B7280",
          textAlign: "center",
        }}
      >
        {label}
      </p>
    </motion.div>
  );
};

const Stats = () => {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        padding: "20px 0",
      }}
    >
      {BARS.map((bar) => (
        <BarChart key={bar.label} {...bar} />
      ))}
    </div>
  );
};

export { Stats };
