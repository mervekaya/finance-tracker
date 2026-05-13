import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from "recharts";
import Navbar from "../../components/layout/Navbar";
import { getSummary } from "../../api/dashboard";

const fmt = (n) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSummary(year)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return (
    <>
      <Navbar />
      <div className="flex h-[80vh] items-center justify-center text-gray-400">Yükleniyor...</div>
    </>
  );

  const chartData = data.monthly.map((m, i) => ({
    name: MONTHS[i],
    Gelir: m.income,
    Gider: m.expense,
  }));

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        {/* Year selector */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setYear(y => y - 1)} className="p-1 rounded hover:bg-gray-100 text-gray-600">◀</button>
            <span className="font-semibold text-gray-700 w-12 text-center">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="p-1 rounded hover:bg-gray-100 text-gray-600">▶</button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Toplam Gelir", value: data.total_income, color: "text-green-600", bg: "bg-green-50" },
            { label: "Toplam Gider", value: data.total_expense, color: "text-red-500", bg: "bg-red-50" },
            { label: "Net Bakiye", value: data.net, color: data.net >= 0 ? "text-indigo-600" : "text-red-600", bg: data.net >= 0 ? "bg-indigo-50" : "bg-red-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-5`}>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{fmt(value)}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Aylık Gelir & Gider</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend />
                <Bar dataKey="Gelir" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Gider Dağılımı</h2>
            {data.category_breakdown.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-10">Henüz gider yok</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.category_breakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {data.category_breakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <PieTooltip formatter={(v, name) => [fmt(v), name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {data.category_breakdown.slice(0, 5).map((c) => (
                    <div key={c.category} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: c.color }} />
                        {c.icon} {c.category}
                      </span>
                      <span className="text-gray-500">{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
