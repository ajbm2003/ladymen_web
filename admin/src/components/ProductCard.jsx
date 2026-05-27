import { Link } from "react-router-dom";

const ProductCard = ({ product, onMarkSold, onDelete }) => {
  const imageUrl = product.images?.[0]?.url;

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
            <p className="text-sm text-slate-500">${product.price}</p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              product.status === "available"
                ? "bg-emerald-50 text-emerald-600"
                : product.status === "sold"
                ? "bg-amber-50 text-amber-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {product.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/edit/${product.id}`}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-600"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => onMarkSold(product)}
            className="flex-1 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700"
          >
            Vender
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
