import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ClientForm from './pages/ClientForm';
import ProductsList from './pages/ProductsList';
import ProductForm from './pages/ProductForm';
import StockOperations from './pages/StockOperations';
import InvoicesList from './pages/InvoicesList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import UsersList from './pages/UsersList';
import UserForm from './pages/UserForm';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/stock" element={<StockOperations />} />
            <Route path="/invoices" element={<InvoicesList />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route
              path="/users"
              element={
                <PrivateRoute roles={['admin']}>
                  <UsersList />
                </PrivateRoute>
              }
            />
            <Route
              path="/users/new"
              element={
                <PrivateRoute roles={['admin']}>
                  <UserForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <PrivateRoute roles={['admin']}>
                  <UserForm />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;



