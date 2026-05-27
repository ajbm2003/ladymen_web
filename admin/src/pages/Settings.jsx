import useAuth from "../hooks/useAuth.js";

const Settings = () => {
  const { setToken } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Ajustes</h1>
        <p className="text-sm text-slate-500">Configuraciones basicas.</p>
      </header>
      <button
        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
        onClick={() => setToken(null)}
      >
        Cerrar sesion
      </button>
    </div>
  );
};

export default Settings;
