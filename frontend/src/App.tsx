import { Outlet, Link } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Onboarding" },
  { to: "/admin", label: "Admin" },
  { to: "/data", label: "Data" },
];

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: `var(--z-bg)`,
        color: `rgb(var(--z-ink))`,
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-6">
        <nav
          className="flex gap-6 mb-8 rounded-xl px-4 py-3 text-sm font-medium shadow-sm ring-1"
          style={{
            backgroundColor: `var(--z-card)`,
          }}
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="transition hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded-md px-1.5 py-0.5"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
