import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from 'recharts';
import { FaChartLine, FaTags, FaInfoCircle } from 'react-icons/fa';

/**
 * Robust date extraction helper across all Firestore order schemas
 * Handles Firestore Timestamps, JS Dates, ISO strings, and formatted strings.
 */
function parseOrderDate(ord) {
  if (!ord) return null;

  // 1. Check Firestore Timestamp in createdAt or date or timestamp
  const tsCandidate = ord.createdAt || ord.date || ord.placedAt || ord.timestamp;
  if (tsCandidate && typeof tsCandidate.toDate === 'function') {
    return tsCandidate.toDate();
  }
  if (tsCandidate && typeof tsCandidate.seconds === 'number') {
    return new Date(tsCandidate.seconds * 1000);
  }

  // 2. Check if string representation is parseable
  if (typeof ord.createdAt === 'string' && ord.createdAt.trim()) {
    const d = new Date(ord.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof ord.date === 'string' && ord.date.trim()) {
    const d = new Date(ord.date);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * DashboardAnalytics Component
 * Renders interactive Recharts for Revenue Trends and Category Catalog Breakdown.
 * Accurately parses and chronologically aggregates order revenue across all dates.
 */
export default function DashboardAnalytics({ orders = [], products = [] }) {
  // 1. Prepare Revenue Trend Data grouped by chronological day
  const dateRevenueMap = new Map(); // key: "YYYY-MM-DD" -> { dateLabel: "Aug 16", timestamp: number, revenue: number }

  orders.forEach((ord) => {
    const status = (ord.orderStatus || ord.status || '').toUpperCase();
    const paymentStat = (ord.paymentStatus || ord.payment?.status || '').toUpperCase();
    if (status === 'CANCELLED' || status === 'REFUNDED' || status === 'PAYMENT_FAILED' || paymentStat === 'FAILED') {
      return;
    }

    const raw = ord.totalAmount ?? ord.pricing?.grandTotal ?? ord.amount ?? ord.total ?? 0;
    const amt = typeof raw === 'number' ? (isNaN(raw) ? 0 : raw) : (parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0);
    if (amt <= 0) return;

    const parsedDate = parseOrderDate(ord);
    const dateObj = parsedDate || new Date();

    // Standard ISO date key for sorting: "YYYY-MM-DD"
    const sortKey = dateObj.toISOString().slice(0, 10);
    const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!dateRevenueMap.has(sortKey)) {
      dateRevenueMap.set(sortKey, {
        sortKey,
        date: dateLabel,
        time: dateObj.getTime(),
        revenue: 0,
      });
    }

    const entry = dateRevenueMap.get(sortKey);
    entry.revenue += amt;
  });

  // Sort chronologically ascending (earliest to latest date)
  const chartData = Array.from(dateRevenueMap.values())
    .sort((a, b) => a.time - b.time)
    .map(({ date, revenue }) => ({
      date,
      revenue: Math.round(revenue),
    }));

  // 2. Prepare Category Distribution Data
  const categoryCounts = {};
  products.forEach((prod) => {
    const cat = prod.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const barCategoryData = Object.keys(categoryCounts).map((cat) => ({
    category: cat,
    count: categoryCounts[cat],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

      {/* 1. Revenue Trend Curve */}
      <div className="bg-card border border-border-subtle rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FaChartLine size={14} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-text-base">Revenue & Sales Performance</h3>
              <p className="text-[10px] text-text-muted">Total earnings trend across order transactions</p>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/20">
            ₹ Revenue Curve
          </span>
        </div>

        <div className="h-64 w-full mt-4 flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#888888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    border: '1px solid #6f5a20',
                    color: '#d4af37',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#d4af37' }}
                  labelStyle={{ color: '#c5a64a' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-bg-base flex items-center justify-center text-text-muted">
                <FaInfoCircle size={18} />
              </div>
              <p className="text-xs font-bold text-text-base">No recent revenue data</p>
              <p className="text-[11px] text-text-muted max-w-xs">
                Sales revenue trends will automatically render here as customer orders are placed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Catalog Category Distribution Bar Chart */}
      <div className="bg-card border border-border-subtle rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FaTags size={14} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-text-base">Catalog Category Distribution</h3>
              <p className="text-[10px] text-text-muted">Total inventory items grouped per category</p>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 uppercase border border-blue-500/20">
            Category Breakdown
          </span>
        </div>

        <div className="h-64 w-full mt-4 flex items-center justify-center">
          {barCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#888888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#888888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    border: '1px solid #6f5a20',
                    color: '#d4af37',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#d4af37' }}
                  labelStyle={{ color: '#c5a64a' }}
                  formatter={(val) => [`${val} Products`, 'Inventory']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-bg-base flex items-center justify-center text-text-muted">
                <FaInfoCircle size={18} />
              </div>
              <p className="text-xs font-bold text-text-base">No category data available</p>
              <p className="text-[11px] text-text-muted max-w-xs">
                Add products to your catalog to see category distribution charts.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
