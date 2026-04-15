import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vehicles from "./pages/Vehicles";
import Mechanics from "./pages/Mechanics";

function App() {
  return (
    <>
    <ToastContainer 
    position="bottom-left"
    autoClose={2000}
    theme="colored"
  />
    <BrowserRouter>
      <Routes>
        
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="mechanics" element={<Mechanics />} />
        </Route>

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;