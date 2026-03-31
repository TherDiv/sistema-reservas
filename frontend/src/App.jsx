import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Toaster position="top-right" />
        <Routes>
          {/* Si alguien entra a la ruta raíz (/), lo mandamos al login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Nuestras rutas reales */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;