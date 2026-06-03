import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

/** SVG fills do not resolve CSS variables — use explicit colors. */
const CHART = {
  primary: "#7c3aed",
  primarySoft: "#a78bfa",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  cyan: "#06b6d4",
  grid: "rgba(148, 163, 184, 0.25)",
  axis: "#64748b",
  materials: "#7c3aed",
  overhead: "#f59e0b",
} as const;

const tooltipBox = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
  padding: "10px 12px",
  fontSize: 12,
};

function ChartTooltip({ active, payload, label, valueFormatter }: TooltipProps<number, string> & {
  valueFormatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const value = Number(row.value ?? 0);
  const fmt = valueFormatter ?? ((v: number) => String(v));

  return (
    <div style={tooltipBox}>
      {label ? <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{label}</p> : null}
      <p style={{ margin: label ? "4px 0 0" : 0, color: "#64748b" }}>
        <span style={{ color: row.color ?? CHART.primary, fontWeight: 600 }}>{row.name ?? "Value"}:</span>{" "}
        {fmt(value)}
      </p>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

function qcColor(name: string): string {
  if (name === "pass") return CHART.success;
  if (name === "fail") return CHART.danger;
  if (name === "rework") return CHART.warning;
  return CHART.cyan;
}

function qcLabel(name: string): string {
  if (name === "pass") return "Pass";
  if (name === "fail") return "Fail";
  if (name === "rework") return "Rework";
  return name;
}

type Point = { name: string; value: number };

export function ProductionOutputTrendChart({ data }: { data: { day: string; actual: number }[] }) {
  if (!data.length) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No completed output in range
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="prodOutputFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART.primary} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="day" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} units`} />} />
        <Area
          type="monotone"
          dataKey="actual"
          name="Output"
          stroke={CHART.primary}
          strokeWidth={2}
          fill="url(#prodOutputFill)"
          dot={{ r: 3, fill: CHART.primary, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: CHART.primarySoft }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProductionYieldTrendChart({
  data,
  domain,
}: {
  data: { week: string; oee: number }[];
  domain: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="week" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          domain={domain}
          tick={{ fill: CHART.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v}%`} />} />
        <Line
          type="monotone"
          dataKey="oee"
          name="Yield"
          stroke={CHART.success}
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#fff", stroke: CHART.success, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: CHART.success }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProductionCostBreakdownChart({
  breakdown,
}: {
  breakdown: { raw_material_cost: number; overhead_cost: number; total_cost: number };
}) {
  const data: Point[] = [
    { name: "Materials", value: breakdown.raw_material_cost },
    { name: "Overhead", value: breakdown.overhead_cost },
  ];

  const hasAny = data.some((row) => row.value > 0);
  if (!hasAny) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No costing in selected range
      </p>
    );
  }

  const colors = [CHART.materials, CHART.overhead];

  return (
    <div className="flex h-full flex-col">
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: CHART.axis, fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
          />
          <Tooltip
            cursor={{ fill: "rgba(124, 58, 237, 0.06)" }}
            content={<ChartTooltip valueFormatter={formatMoney} />}
          />
          <Bar dataKey="value" name="Cost" radius={[8, 8, 0, 0]} maxBarSize={72}>
            {data.map((row, i) => (
              <Cell
                key={row.name}
                fill={colors[i]}
                fillOpacity={row.value > 0 ? 1 : 0.25}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 px-2 pb-1 text-xs text-muted-foreground">
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: CHART.materials }} />
          Materials {formatMoney(breakdown.raw_material_cost)}
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: CHART.overhead }} />
          Overhead {formatMoney(breakdown.overhead_cost)}
        </span>
        <span className="font-medium text-foreground">Total {formatMoney(breakdown.total_cost)}</span>
      </div>
    </div>
  );
}

export function ProductionQcResultsChart({ data }: { data: Point[] }) {
  if (!data.length) return null;

  const total = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="flex h-full flex-col items-center">
      <ResponsiveContainer width="100%" height="78%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={data.length > 1 ? 3 : 0}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={qcColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const row = payload[0].payload as Point;
              const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
              return (
                <div style={tooltipBox}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{qcLabel(row.name)}</p>
                  <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                    {row.value} inspection{row.value === 1 ? "" : "s"} ({pct}%)
                  </p>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value) => qcLabel(String(value))}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-muted-foreground">
        {total} inspection{total === 1 ? "" : "s"} in range
      </p>
    </div>
  );
}
