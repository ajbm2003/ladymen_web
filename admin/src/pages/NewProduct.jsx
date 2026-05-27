import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/api.js";
import ProductForm from "../components/ProductForm.jsx";

const NewProduct = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch("/api/categories")
  });

  const handleSubmit = (payload) => {
    return apiFetch("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Nuevo producto</h1>
        <p className="text-sm text-slate-500">Carga un producto desde tu movil.</p>
      </header>
      <ProductForm categories={categories} onSubmit={handleSubmit} />
    </div>
  );
};

export default NewProduct;
