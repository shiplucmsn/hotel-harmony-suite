import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
};

type ChartPoint = { name: string; value: number };

type RevenuePoint = { month: string; revenue: number; invoices?: number };

export function RevenueTrendChart({ data }: { data: RevenuePoint[] }) {
  if (!data.length) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No issued invoices yet</p>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="crmRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#crmRev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LeadsStatusChart({ data }: { data: ChartPoint[] }) {
  if (!data.length) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No leads</p>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function OrdersStatusChart({ data }: { data: ChartPoint[] }) {
  if (!data.length) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No orders</p>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InvoiceStatusChart({ data }: { data: ChartPoint[] }) {
  if (!data.length) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No invoices</p>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis type="number" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="name" fontSize={12} width={72} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
