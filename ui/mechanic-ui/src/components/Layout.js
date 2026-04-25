import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg hidden md:flex flex-col justify-between">

        {/* Top */}
        <div className="flex flex-col">
          <div className="p-4 font-bold text-xl border-b border-gray-200 dark:border-gray-700">
            Mechanic AI
          </div>

          <ul className="p-4 space-y-2">
            <li>
              <Link
                to="/"
                className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/customers"
                className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Customers
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/vehicles"
                className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Vehicles
              </Link>
            </li>
            <li>
              <Link
                to="/mechanics"
                className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Mechanics
              </Link>
            </li>
          </ul>

          {/* Watermark Image */}
          <div className="flex justify-center mt-4 px-4">
            <img
              src="/mechanic-ai.png"
              alt="Mechanic AI"
              className="w-full pointer-events-none select-none"
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-500 hover:bg-red-100 dark:hover:bg-red-900 p-2 rounded"
          >
            Logout
          </button>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Top bar (for mobile / better UX) */}
        <div className="flex justify-end mb-4 md:hidden">
          <ThemeToggle />
        </div>

        <Outlet />
      </div>
    </div>
  );
}