import { NavLink } from "react-router-dom";

const tabClasses = ({ isActive }) =>
  `flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${
    isActive ? "bg-blue-50 text-blue-600" : "text-slate-500"
  }`;

const TabBar = () => {
  return (
    <nav className="fixed bottom-4 left-4 right-4 flex items-center gap-2 rounded-3xl bg-white p-2 shadow-lg">
      <NavLink to="/" className={tabClasses}>
        <span className="text-lg">📦</span>
        Catalogo
      </NavLink>
      <NavLink to="/new" className={tabClasses}>
        <span className="text-lg">➕</span>
        Nuevo
      </NavLink>
      <NavLink to="/settings" className={tabClasses}>
        <span className="text-lg">⚙️</span>
        Ajustes
      </NavLink>
    </nav>
  );
};

export default TabBar;
