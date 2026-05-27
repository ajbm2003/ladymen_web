import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/api.js";
import ProductForm from "../components/ProductForm.jsx";

const EditProduct = () => {
  const { id } = useParams();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch("/api/categories")
  });

  const { data: product } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => apiFetch(`/api/admin/products/${id}`)
  });

  const handleSubmit = (payload) => {
    return apiFetch(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  };

  const initialData = product
    ? {
        ...product,
        price: Number(product.price),
        categoryId: product.categoryId || product.category?.id,
        images: product.images || []
      }
    : null;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Editar producto</h1>
      </header>
      {initialData ? (
        <ProductForm categories={categories} initialData={initialData} onSubmit={handleSubmit} />
      ) : (
        <p className="text-sm text-slate-500">Cargando...</p>
      )}
    </div>
  );
};

export default EditProduct;
