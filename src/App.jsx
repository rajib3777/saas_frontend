import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import EmployeesPage from './pages/EmployeesPage';
import ClientsPage from './pages/ClientsPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ParcelsPage from './pages/ParcelsPage';
import AdsPage from './pages/AdsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.is_active_subscriber) return <div style={{padding:'2rem', textAlign:'center'}}><h2>Your account is pending admin approval.</h2><p>Please contact support or wait for approval.</p></div>;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="parcels" element={<ParcelsPage />} />
          <Route path="ads" element={<AdsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
