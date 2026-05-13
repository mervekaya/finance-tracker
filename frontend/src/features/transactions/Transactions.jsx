import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import * as txApi from "../../api/transactions";
import * as catApi from "../../api/categories";

const fmt = (n, cur = "TRY") =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur === "TRY" ? "TRY" : "USD" }).format(n);

const CURRENCIES = ["TRY", "USD", "EUR", "GBP", "CHF", "JPY"];

function TransactionForm({ categories, initial, onSave, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(
    initial || { type: "expense", amount: "", currency: "TRY", category_id: "", description: "", date: today }
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const filteredCats = categories.filter((c) => c.type === form.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, amount: parseFloat(form.amount), category_id: form.category_id || null });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-700">{initial ? "İşlem Düzenle" : "Yeni İşlem"}</h2>

      <div className="flex gap-2">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set("type", t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              form.type === t
                ? t === "expense" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "expense" ? "Gider" : "Gelir"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tutar</label>
          <input
            type="number"
            step="0.01"
            required
            min="0.01"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Para Birimi</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
          >
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Kategori</label>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={form.category_id}
          onChange={(e) => set("category_id", e.target.value)}
        >
          <option value="">Kategori seç</option>
          {filteredCats.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Tarih</label>
        <input
          type="date"
          required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Açıklama</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Opsiyonel"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
          Kaydet
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200 transition">
          İptal
        </button>
      </div>
    </form>
  );
}

export default function Transactions() {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [txs, setTxs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    txApi.getTransactions({ month })
      .then((r) => setTxs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [month]);
  useEffect(() => { catApi.getCategories().then((r) => setCategories(r.data)); }, []);

  const handleSave = async (data) => {
    if (editing) {
      await txApi.updateTransaction(editing.id, data);
      setEditing(null);
    } else {
      await txApi.createTransaction(data);
      setShowForm(false);
    }
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu işlemi silmek istiyor musun?")) return;
    await txApi.deleteTransaction(id);
    load();
  };

  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount_try, 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount_try, 0);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">İşlemler</h1>
          <div className="flex items-center gap-3">
            <input
              type="month"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <button
              onClick={() => { setShowForm(true); setEditing(null); }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              + Yeni İşlem
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Gelir", value: income, color: "text-green-600" },
            { label: "Gider", value: expense, color: "text-red-500" },
            { label: "Net", value: income - expense, color: income - expense >= 0 ? "text-indigo-600" : "text-red-600" },
            { label: "İşlem Sayısı", value: txs.length, color: "text-gray-700", raw: true },
          ].map(({ label, value, color, raw }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>
                {raw ? value : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-2">
            {loading ? (
              <p className="text-center text-gray-400 py-10">Yükleniyor...</p>
            ) : txs.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400">
                Bu ay henüz işlem yok
              </div>
            ) : (
              txs.map((tx) => (
                <div key={tx.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tx.category?.icon || "📦"}</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {tx.category?.name || "Kategorisiz"}
                        {tx.description && <span className="text-gray-400 font-normal"> · {tx.description}</span>}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                        {tx.type === "income" ? "+" : "-"}
                        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(tx.amount_try)}
                      </p>
                      {tx.currency !== "TRY" && (
                        <p className="text-xs text-gray-400">{tx.amount} {tx.currency}</p>
                      )}
                    </div>
                    <button onClick={() => { setEditing(tx); setShowForm(false); }} className="text-gray-400 hover:text-indigo-500 text-xs">✏️</button>
                    <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-500 text-xs">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            {(showForm || editing) && (
              <TransactionForm
                categories={categories}
                initial={editing}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
