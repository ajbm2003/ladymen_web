import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";
import ProductCard from "../components/ProductCard.jsx";

const Catalog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products = [], refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiFetch("/api/admin/products")
  });

  const soldProducts = products.filter((product) => (product.soldUnits || 0) > 0);
  const totalSoldUnits = soldProducts.reduce(
    (sum, product) => sum + (product.soldUnits || 0),
    0
  );

  const handleStatus = async (product, status) => {
    if (!window.confirm("Confirmar accion?")) return;
    let quantity = 1;
    if (status === "sold") {
      const answer = window.prompt("Cuantas unidades se vendieron?", "1");
      const parsed = Number(answer);
      if (!Number.isFinite(parsed) || parsed <= 0) return;
      quantity = parsed;
    }
    await apiFetch(`/api/admin/products/${product.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, quantity })
    });
    refetch();
  };

  const handleDelete = async (product) => {
    if (!window.confirm("Eliminar producto?")) return;
    await apiFetch(`/api/admin/products/${product.id}`, {
      method: "DELETE"
    });
    refetch();
  };

  const visibleProducts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      if (product.status === "sold") return false;
      if (!normalized) return true;
      return product.name?.toLowerCase().includes(normalized);
    });
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Catalogo</h1>
          <p className="text-sm text-slate-500">Gestiona tus productos.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:w-64">
            <span className="text-slate-400">🔎</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre"
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </div>
          <button
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500"
            onClick={() => refetch()}
          >
            Refrescar
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onMarkSold={() => handleStatus(product, "sold")}
            onDelete={() => handleDelete(product)}
          />
        ))}
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Productos vendidos</h2>
        <p className="text-xs text-slate-500">
          Unidades vendidas: {totalSoldUnits}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {soldProducts.length ? (
            soldProducts.map((product) => (
              <div key={product.id} className="rounded-xl border border-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {product.description || "Sin descripcion"}
                </p>
                <p className="text-sm font-semibold text-slate-700">${product.price}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No hay productos vendidos.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Catalog;
