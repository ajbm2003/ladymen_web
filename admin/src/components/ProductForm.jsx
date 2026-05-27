import { useEffect, useState } from "react";
import { apiFetch, uploadImages, uploadVideo } from "../utils/api.js";

const emptyState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  status: "available",
  images: [],
  videoUrl: "",
  variants: []
};

const ProductForm = ({ initialData, onSubmit, categories }) => {
  const [formData, setFormData] = useState(initialData || emptyState);
  const [localImages, setLocalImages] = useState([]);
  const [localVideo, setLocalVideo] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    setFormData(initialData || emptyState);
  }, [initialData]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === "available" ? "archived" : "available"
    }));
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 3);
    setLocalImages(files);
  };

  const handleVideo = (event) => {
    const file = (event.target.files || [])[0] || null;
    setLocalVideo(file);
  };

  const handleRemoveExistingImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    try {
      const basePayload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: Number(formData.categoryId),
        images: formData.images || [],
        videoUrl: formData.videoUrl || null
      };

      const savedProduct = await onSubmit(basePayload);
      showToast("Guardado correctamente");

      if (!localImages.length && !localVideo) {
        if (!initialData) {
          setFormData(emptyState);
          setLocalImages([]);
          setLocalVideo(null);
        }
        return;
      }

      let uploaded = [];
      if (localImages.length) {
        uploaded = await uploadImages(localImages, setUploadProgress);
      }

      let uploadedVideoUrl = basePayload.videoUrl || "";
      if (localVideo) {
        const videoResponse = await uploadVideo(localVideo);
        uploadedVideoUrl = videoResponse.secure_url || videoResponse.url;
      }

      const imagePayload = [
        ...(basePayload.images || []),
        ...uploaded.map((item, index) => ({
          url: item.secure_url || item.url,
          isPrimary: index === 0,
          sortOrder: index
        }))
      ];

      const updatePayload = {
        ...basePayload,
        images: imagePayload,
        videoUrl: uploadedVideoUrl || null
      };

      const targetId = initialData?.id ?? savedProduct?.id;
      if (targetId) {
        await apiFetch(`/api/admin/products/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(updatePayload)
        });
      }

      if (!initialData) {
        setFormData(emptyState);
        setLocalImages([]);
        setLocalVideo(null);
      }
    } catch (error) {
      showToast(error.message || "Error al guardar");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {offline && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sin conexion. Reintentando...
        </div>
      )}
      <div className="sticky top-4 z-20 rounded-2xl bg-white p-3 shadow-sm">
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Nombre</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          type="text"
          className="h-11 rounded-xl border border-slate-200 px-3"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Enlace (URL)</label>
        <input
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          type="text"
          className="h-11 rounded-xl border border-slate-200 px-3"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Descripcion</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Precio</label>
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            type="number"
            inputMode="decimal"
            className="h-11 rounded-xl border border-slate-200 px-3"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Unidades</label>
          <input
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            type="number"
            inputMode="numeric"
            min="0"
            className="h-11 rounded-xl border border-slate-200 px-3"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Categoria</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="h-11 rounded-xl border border-slate-200 px-3"
            required
          >
            <option value="">Selecciona</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Disponible</p>
          <p className="text-xs text-slate-400">Disponible o archivado</p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`h-8 w-16 rounded-full p-1 ${
            formData.status === "available" ? "bg-emerald-400" : "bg-slate-300"
          }`}
        >
          <span
            className={`block h-6 w-6 rounded-full bg-white transition ${
              formData.status === "available" ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Imagenes (maximo 3)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="text-sm"
        />
        {uploadProgress > 0 && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {localImages.map((file, index) => (
            <img
              key={`${file.name}-${index}`}
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="h-24 w-full rounded-xl object-cover"
            />
          ))}
        </div>
        {formData.images?.length ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Imagenes existentes</p>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <div key={image.url} className="relative">
                  <img
                    src={image.url}
                    alt="Producto"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-white px-2 py-1 text-xs shadow"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Video corto (opcional)
        </label>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideo}
          className="text-sm"
        />
        {localVideo ? (
          <p className="text-xs text-slate-500">{localVideo.name}</p>
        ) : formData.videoUrl ? (
          <p className="text-xs text-slate-500">Video cargado</p>
        ) : null}
      </div>
      {toast && (
        <div className="fixed left-4 right-4 top-4 flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm text-white">
          {toast}
        </div>
      )}
    </form>
  );
};

export default ProductForm;
