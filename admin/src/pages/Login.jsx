import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";
import useAuth from "../hooks/useAuth.js";

const Login = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, pin })
      });
      setToken(response.token);
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-lg"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo.png" alt="LadyWen" className="h-36 w-auto" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Catalogo Admin</h1>
            <p className="text-sm text-slate-500">Ingresa con tu email y PIN.</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3"
            required
          />
        </div>
        {error && (
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-brand-600 text-white"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
