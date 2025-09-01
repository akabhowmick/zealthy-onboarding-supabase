import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <nav className="flex gap-4 mb-6">
        <Link to="/">Onboarding</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/data">Data</Link>
      </nav>
      <Outlet />
    </div>
  );
}
