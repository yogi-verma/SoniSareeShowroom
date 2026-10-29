"use client";

import { useId, useMemo, useState } from "react";
import type { PointerEvent } from "react";
import { FiCalendar, FiLoader, FiTrendingUp } from "react-icons/fi";
import type { SalesTransaction } from "../../../utils/adminApi";

type Range = "week" | "month" | "threeMonths" | "sixMonths" | "year" | "custom";
type Point = { key: string; label: string; sales: number };

const ranges: { value: Range; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "threeMonths", label: "3 months" },
  { value: "sixMonths", label: "6 months" },
  { value: "year", label: "Last year" },
  { value: "custom", label: "Custom" },
];

function getLocalDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shiftDate(date: string, amount: number) {
  const shifted = new Date(`${date}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + amount);
  return shifted.toISOString().slice(0, 10);
}

function getDateLabel(date: string, mode: "weekday" | "day" | "month" | "monthYear") {
  const value = new Date(`${mode === "month" || mode === "monthYear" ? `${date}-01` : date}T00:00:00.000Z`);
  if (mode === "day") return date.slice(-2);
  return new Intl.DateTimeFormat("en-IN", {
    ...(mode === "weekday" ? { weekday: "short" as const } : {}),
    ...(mode === "month" ? { month: "short" as const } : {}),
    ...(mode === "monthYear" ? { month: "short" as const, year: "2-digit" as const } : {}),
    timeZone: "UTC",
  }).format(value);
}

function buildPoints(
  transactions: SalesTransaction[],
  range: Range,
  today: string,
  customStart: string,
  customEnd: string,
): Point[] {
  let keys: string[] = [];
  let monthly = false;
  let labelMode: "weekday" | "day" | "month" | "monthYear" = "weekday";

  if (range === "week" || range === "month" || range === "threeMonths") {
    const days = range === "week" ? 7 : range === "month" ? 30 : 90;
    keys = Array.from({ length: days }, (_, index) => shiftDate(today, index - days + 1));
    labelMode = range === "week" ? "weekday" : "day";
  } else if (range === "sixMonths" || range === "year") {
    monthly = true;
    const count = range === "sixMonths" ? 6 : 12;
    const currentMonth = new Date(`${today.slice(0, 7)}-01T00:00:00.000Z`);
    keys = Array.from({ length: count }, (_, index) => {
      const month = new Date(currentMonth);
      month.setUTCMonth(month.getUTCMonth() - count + index + 1);
      return month.toISOString().slice(0, 7);
    });
    labelMode = "month";
  } else {
    if (!customStart || !customEnd || customStart > customEnd) return [];
    const start = new Date(`${customStart}T00:00:00.000Z`);
    const end = new Date(`${customEnd}T00:00:00.000Z`);
    const dayCount = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    if (!Number.isFinite(dayCount) || dayCount < 1 || dayCount > 36_600) return [];

    if (dayCount <= 90) {
      keys = Array.from({ length: dayCount }, (_, index) => shiftDate(customStart, index));
      labelMode = "day";
    } else {
      monthly = true;
      const month = new Date(`${customStart.slice(0, 7)}-01T00:00:00.000Z`);
      const lastMonth = end.toISOString().slice(0, 7);
      while (month.toISOString().slice(0, 7) <= lastMonth) {
        keys.push(month.toISOString().slice(0, 7));
        month.setUTCMonth(month.getUTCMonth() + 1);
      }
      labelMode = "monthYear";
    }
  }

  const totals = new Map(keys.map((key) => [key, 0]));
  for (const transaction of transactions) {
    if (transaction.transactionType === "expense") continue;
    const date = transaction.transactionDate.slice(0, 10);
    const key = monthly ? date.slice(0, 7) : date;
    const currentTotal = totals.get(key);
    if (currentTotal !== undefined) totals.set(key, currentTotal + transaction.amount);
  }

  return keys.map((key) => ({ key, label: getDateLabel(key, labelMode), sales: totals.get(key) ?? 0 }));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAxisValue(value: number) {
  return `₹${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
}

function createCurve(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

export default function SalesTrendChart({ transactions, isLoading }: {
  transactions: SalesTransaction[];
  isLoading: boolean;
}) {
  const [range, setRange] = useState<Range>("week");
  const [today] = useState(getLocalDate);
  const [customEnd, setCustomEnd] = useState(getLocalDate);
  const [customStart, setCustomStart] = useState(() => shiftDate(getLocalDate(), -29));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, "");

  const points = useMemo(
    () => buildPoints(transactions, range, today, customStart, customEnd),
    [transactions, range, today, customStart, customEnd],
  );
  const totalSales = points.reduce((total, point) => total + point.sales, 0);
  const averageSales = points.length ? totalSales / points.length : 0;
  const peakPoint = points.reduce<Point | null>((peak, point) => !peak || point.sales > peak.sales ? point : peak, null);
  const largestValue = Math.max(0, ...points.map((point) => point.sales));
  const magnitude = largestValue > 0 ? 10 ** Math.floor(Math.log10(largestValue)) : 1;
  const maxValue = largestValue > 0 ? Math.ceil(largestValue / magnitude) * magnitude : 1;
  const width = 900;
  const height = 330;
  const left = 72;
  const right = 28;
  const top = 26;
  const bottom = 48;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: left + (points.length <= 1 ? plotWidth / 2 : index / (points.length - 1) * plotWidth),
    y: top + (1 - point.sales / maxValue) * plotHeight,
  }));
  const linePath = createCurve(chartPoints);
  const areaPath = chartPoints.length > 1
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${top + plotHeight} L ${chartPoints[0].x} ${top + plotHeight} Z`
    : "";
  const customRangeInvalid = range === "custom" && (!customStart || !customEnd || customStart > customEnd);
  const hasSales = largestValue > 0;

  function handleChartPointer(event: PointerEvent<SVGSVGElement>) {
    if (chartPoints.length === 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = Math.min(bounds.width / width, bounds.height / height);
    const letterboxX = (bounds.width - width * scale) / 2;
    const viewX = (event.clientX - bounds.left - letterboxX) / scale;
    const rawIndex = Math.round(((viewX - left) / plotWidth) * (chartPoints.length - 1));
    setActiveIndex(Math.max(0, Math.min(chartPoints.length - 1, rawIndex)));
  }

  return (
    <section className="admin-panel mb-5 overflow-hidden">
      <div className="border-b border-[var(--admin-border)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="admin-page-kicker mb-1">Revenue analytics</p>
            <h2 className="admin-panel-title text-xl">Sales performance</h2>
            <p className="admin-panel-description">Total online and cash sales across the selected period.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-[#f7f3f6] p-1.5" role="group" aria-label="Sales chart date range">
            {ranges.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={range === option.value}
                onClick={() => { setRange(option.value); setActiveIndex(null); }}
                className={`min-h-8 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 ${range === option.value ? "bg-white text-plum shadow-sm ring-1 ring-black/[0.03]" : "text-[#817982] hover:text-plum"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {range === "custom" && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#eee7ed] bg-[#fdfbfc] p-3 sm:flex-row sm:items-end">
            <DateControl label="From" value={customStart} max={customEnd || today} onChange={setCustomStart} />
            <DateControl label="To" value={customEnd} min={customStart} max={today} onChange={setCustomEnd} />
            <p className="pb-1 text-[10px] text-[#928a92]">Long ranges are grouped by month.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-[#f0ece8] bg-[#fdfcfa] px-4 py-4 sm:grid-cols-3 sm:px-6">
        <Stat label="Sales in period" value={isLoading ? null : totalSales} icon="total" />
        <Stat label="Average per interval" value={isLoading ? null : averageSales} icon="average" />
        <Stat label="Best interval" value={isLoading ? null : peakPoint?.sales ?? 0} detail={peakPoint?.label ?? undefined} icon="peak" />
      </div>

      <div className="px-2 py-4 sm:px-5 sm:py-6">
        {isLoading ? (
          <div role="status" aria-label="Loading sales chart" className="flex h-[280px] items-center justify-center text-plum">
            <FiLoader size={24} className="animate-spin" />
            <span className="sr-only">Loading sales chart</span>
          </div>
        ) : customRangeInvalid ? (
          <div className="flex h-[240px] items-center justify-center text-xs text-[#a54a4a]">Select a valid date range to view sales.</div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-[250px] w-full touch-pan-y sm:h-[320px]"
              role="img"
              aria-label={`Sales performance chart with ${formatPrice(totalSales)} sales.`}
              onPointerMove={handleChartPointer}
              onPointerLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6b3c67" stopOpacity="0.24" />
                  <stop offset="65%" stopColor="#6b3c67" stopOpacity="0.07" />
                  <stop offset="100%" stopColor="#6b3c67" stopOpacity="0" />
                </linearGradient>
                <filter id={`${gradientId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {[0, 1, 2, 3, 4].map((tick) => {
                const y = top + tick / 4 * plotHeight;
                const value = maxValue * (1 - tick / 4);
                return (
                  <g key={tick}>
                    <line x1={left} x2={width - right} y1={y} y2={y} stroke="#eee9e4" strokeDasharray={tick === 4 ? undefined : "4 6"} />
                    <text x={left - 12} y={y + 4} textAnchor="end" fill="#99919a" fontSize="11">{formatAxisValue(value)}</text>
                  </g>
                );
              })}

              {hasSales && chartPoints.length > 1 && <path d={areaPath} fill={`url(#${gradientId})`} />}
              {hasSales && chartPoints.length > 1 && <path d={linePath} fill="none" stroke="#552650" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${gradientId}-glow)`} />}
              {hasSales && chartPoints.map((point, index) => (point.sales > 0 && (points.length <= 12 || index === activeIndex || index === 0 || index === points.length - 1)) && (
                <circle key={point.key} cx={point.x} cy={point.y} r={index === activeIndex ? 6 : 4} fill="#fff" stroke="#552650" strokeWidth="3">
                  <title>{`${point.key}: ${formatPrice(point.sales)}`}</title>
                </circle>
              ))}
              {activeIndex !== null && chartPoints[activeIndex] && (
                <g pointerEvents="none">
                  <line x1={chartPoints[activeIndex].x} x2={chartPoints[activeIndex].x} y1={top} y2={top + plotHeight} stroke="#9c7d99" strokeDasharray="4 4" />
                  <circle cx={chartPoints[activeIndex].x} cy={chartPoints[activeIndex].y} r="7" fill="#552650" stroke="white" strokeWidth="3" />
                  <g transform={`translate(${Math.min(Math.max(chartPoints[activeIndex].x - 68, left), width - right - 136)} ${Math.max(chartPoints[activeIndex].y - 62, top)})`}>
                    <rect width="136" height="44" rx="10" fill="#2f1a30" />
                    <text x="12" y="17" fill="#e9dce8" fontSize="10">{chartPoints[activeIndex].key}</text>
                    <text x="12" y="34" fill="white" fontSize="13" fontWeight="600">{formatPrice(chartPoints[activeIndex].sales)}</text>
                  </g>
                </g>
              )}
              {chartPoints.map((point, index) => (index % Math.max(1, Math.ceil(chartPoints.length / 8)) === 0 || index === chartPoints.length - 1) && (
                <text key={point.key} x={point.x} y={height - 12} textAnchor="middle" fill="#918993" fontSize="10">{point.label}</text>
              ))}
            </svg>
            {!hasSales && <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8 text-xs text-[#a097a0]">No sales recorded in this period.</div>}
          </div>
        )}
      </div>
    </section>
  );
}

function DateControl({ label, value, min, max, onChange }: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block w-full sm:max-w-[190px]">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#817982]">{label}</span>
      <span className="relative block">
        <input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="admin-field pr-9 text-xs" />
        <FiCalendar size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#817982]" />
      </span>
    </label>
  );
}

function Stat({ label, value, icon, detail }: {
  label: string;
  value: number | null;
  icon: "total" | "average" | "peak";
  detail?: string;
}) {
  const iconColor = icon === "peak" ? "text-[#a07848]" : "text-plum";
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#f0ece8] bg-white px-3 py-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7f2f6] ${iconColor}`}><FiTrendingUp size={16} /></span>
      <span className="min-w-0">
        <span className="block text-[10px] text-[#928a92]">{label}</span>
        <span className="mt-0.5 flex items-center gap-2 truncate text-sm font-semibold text-[#332a35]">
          {value === null ? <FiLoader aria-label={`Loading ${label}`} size={14} className="animate-spin text-plum" /> : formatPrice(value)}
          {detail && value !== null && <span className="truncate text-[10px] font-normal text-[#928a92]">{detail}</span>}
        </span>
      </span>
    </div>
  );
}
