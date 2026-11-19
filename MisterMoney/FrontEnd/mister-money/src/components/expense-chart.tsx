"use client";

import { useEffect, useRef, useState } from "react";
import { shortBrl, type MonthPoint } from "@/lib/dashboard-data";

const MIN_WIDTH = 320;
const HEIGHT = 220;
const DEFAULT_MAX = 5000;

type Point = { x: number; y: number };
type Pad = { left: number; right: number; top: number; bottom: number };

function getPad(width: number): Pad {
  return {
    left: 58,
    right: width < 520 ? 10 : 16,
    top: 16,
    bottom: 30,
  };
}

function chartPoints(
  data: MonthPoint[],
  max: number,
  width: number,
  pad: Pad,
): Point[] {
  const usableW = Math.max(width - pad.left - pad.right, 1);
  const usableH = Math.max(HEIGHT - pad.top - pad.bottom, 1);
  return data.map((item, index) => ({
    x: pad.left + (usableW * index) / Math.max(data.length - 1, 1),
    y: pad.top + usableH * (1 - item.value / max),
  }));
}

function smoothPath(points: Point[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

type ExpenseChartProps = {
  data: MonthPoint[];
  max?: number;
  label?: string;
};

export function ExpenseChart({
  data,
  max = DEFAULT_MAX,
  label = "despesas",
}: ExpenseChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MIN_WIDTH);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      const next = Math.max(MIN_WIDTH, Math.round(node.clientWidth));
      setWidth((current) => (current === next ? current : next));
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pad = getPad(width);
  const usableW = Math.max(width - pad.left - pad.right, 1);
  const points = chartPoints(data, max, width, pad);
  const grid = [max, max / 2, 0];
  const line = smoothPath(points);
  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${HEIGHT - pad.bottom} L ${points[0].x} ${HEIGHT - pad.bottom} Z`
    : "";
  const segmentWidth = usableW / Math.max(data.length, 1);
  const labelStep = Math.max(1, Math.ceil(32 / Math.max(segmentWidth, 1)));
  const axisFont = width < 520 ? 10 : 11;
  const safeActive = active !== null && active < data.length ? active : null;
  const activePoint = safeActive === null ? null : points[safeActive];
  const activeData = safeActive === null ? null : data[safeActive];

  return (
    <div ref={containerRef} className="relative mt-3 w-full">
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="h-[220px] w-full overflow-visible"
        role="img"
        aria-label={`Gráfico de ${label} dos últimos meses`}
      >
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd08a" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ffd08a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f29b29" />
            <stop offset="100%" stopColor="#ffd08a" />
          </linearGradient>
        </defs>

        {grid.map((value) => {
          const y =
            pad.top +
            (HEIGHT - pad.top - pad.bottom) * (1 - value / max);
          return (
            <g key={value}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="rgba(249,249,249,0.075)"
                strokeWidth="1"
                strokeDasharray={value === 0 ? "0" : "4 6"}
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#8b92ad"
                fontSize={axisFont}
              >
                {shortBrl(value)}
              </text>
            </g>
          );
        })}

        <path d={area} fill="url(#chartArea)" />
        <path
          d={line}
          fill="none"
          stroke="url(#chartLine)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          const bandStart =
            index === 0 ? pad.left : (points[index - 1].x + point.x) / 2;
          const bandEnd =
            index === points.length - 1
              ? width - pad.right
              : (point.x + points[index + 1].x) / 2;
          return (
            <g key={`${data[index].label}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={safeActive === index ? 6 : 4}
                fill="#010122"
                stroke="#ffd08a"
                strokeWidth="2.5"
              />
              {(data.length <= 6 ||
                (data.length - 1 - index) % labelStep === 0) && (
                <text
                  x={point.x}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  fill={safeActive === index ? "#f9f9f9" : "#c2c7db"}
                  fontSize="11"
                >
                  {data[index].label}
                </text>
              )}
              <rect
                x={bandStart}
                y={pad.top - 8}
                width={Math.max(bandEnd - bandStart, 1)}
                height={HEIGHT - pad.top - pad.bottom + 16}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${data[index].label}: ${shortBrl(data[index].value)}`}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="focus:outline-none"
              />
            </g>
          );
        })}

        {activePoint && (
          <line
            x1={activePoint.x}
            x2={activePoint.x}
            y1={activePoint.y}
            y2={HEIGHT - pad.bottom}
            stroke="#ffd08a"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.6"
          />
        )}
      </svg>

      {activePoint && activeData && (
        <div
          className="glass-strong pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-asset/10 px-3 py-2 shadow-xl"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / HEIGHT) * 100}%`,
          }}
        >
          <span className="block text-[10px] uppercase tracking-wider text-muted">
            {activeData.label}
          </span>
          <span className="tabular block text-sm font-semibold text-accent">
            {shortBrl(activeData.value)}
          </span>
        </div>
      )}
    </div>
  );
}
