import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ClientesPage } from './pages/clientes/ClientesPage';
import { InventarioPage } from './pages/inventario/InventarioPage';
import { PaquetesPage } from './pages/paquetes/PaquetesPage';
import { CronogramaPage } from './pages/cronograma/CronogramaPage';
import { ContratosPage } from './pages/contratos/ContratosPage';
import { PagosPage } from './pages/pagos/PagosPage';
import { PlantillasPage } from './pages/plantillas/PlantillasPage';
import { PerfilPage } from './pages/perfil/PerfilPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/inventario" element={<InventarioPage />} />
              <Route path="/paquetes" element={<PaquetesPage />} />
              <Route path="/cronograma" element={<CronogramaPage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/pagos" element={<PagosPage />} />
              <Route path="/plantillas" element={<PlantillasPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
