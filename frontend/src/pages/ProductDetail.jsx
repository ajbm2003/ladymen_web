import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchJSON, postJSON } from "../utils/api.js";

const optimizeImageUrl = (url) => {
  if (!url) return "";
  const hasQuery = url.includes("?");
  const suffix = "w=900&h=900&fit=crop&auto=format";
  return hasQuery ? `${url}&${suffix}` : `${url}?${suffix}`;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchJSON(`/api/products/${slug}`)
  });

  const whatsappMessage = useMemo(() => {
    if (!product) return "";
    return `Hola, me interesa: ${product.name} (Ref: ${product.slug})`;
  }, [product]);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  const handleContact = async () => {
    if (!product) return;
    await postJSON("/api/contact", { productId: product.id });
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };

  if (isLoading || !product) {
    return (
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center text-slate-500">
        Cargando producto...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-[32px] bg-slate-100">
            {product.category?.name && (
              <span className="absolute left-6 top-6 rounded-full bg-teal-600/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {product.category.name}
              </span>
            )}
            {product.images.length ? (
              <img
                src={optimizeImageUrl(product.images[activeIndex]?.url)}
                alt={product.name}
                className="h-[520px] w-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex h-[520px] w-full items-center justify-center text-sm text-slate-400">
                Sin imagen
              </div>
            )}

            {product.images.length > 1 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )
                  }
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow"
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow"
                  aria-label="Imagen siguiente"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    index === activeIndex
                      ? "border-brand-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={optimizeImageUrl(image.url)}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-brand-700">${product.price}</p>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <p>{product.description}</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <span
                  key={variant.id}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {variant.name}: {variant.value}
                </span>
              ))}
            </div>
          </div>

          {product.videoUrl && (
            <div className="rounded-3xl bg-slate-100 p-3">
              <video
                src={product.videoUrl}
                controls
                className="h-[260px] w-full rounded-2xl object-cover"
              />
            </div>
          )}

          <button
            onClick={handleContact}
            className="mt-auto flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-green-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-green-200"
          >
            Contactar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
