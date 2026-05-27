import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Catalog from "./pages/Catalog.jsx";
import NewProduct from "./pages/NewProduct.jsx";
import EditProduct from "./pages/EditProduct.jsx";
import Settings from "./pages/Settings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useState } from "react";

const AppLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="px-4 pt-6">
        <div className="flex items-center justify-between gap-3 rounded-3xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="LadyWen" className="h-14 w-auto" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="text-base font-semibold text-slate-900">Panel movil</h1>
            </div>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
              aria-label="Abrir menu"
            >
              ☰
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-30 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <NavLink
                  to="/"
                  className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Catalogo
                </NavLink>
                <NavLink
                  to="/new"
                  className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Nuevo
                </NavLink>
                <NavLink
                  to="/settings"
                  className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Ajustes
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-10 pt-6">{children}</main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route
          index
          element={
            <AppLayout>
              <Catalog />
            </AppLayout>
          }
        />
        <Route
          path="new"
          element={
            <AppLayout>
              <NewProduct />
            </AppLayout>
          }
        />
        <Route
          path="edit/:id"
          element={
            <AppLayout>
              <EditProduct />
            </AppLayout>
          }
        />
        <Route
          path="settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
