import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/products', label: 'Produits', icon: '📦' },
    { path: '/stock', label: 'Stock', icon: '📋' },
    { path: '/invoices', label: 'Factures', icon: '🧾' },
    ...(isAdmin ? [{ path: '/users', label: 'Utilisateurs', icon: '👤' }] : []),
  ];

  return (
    <div
      className="bg-dark text-white"
      style={{ width: '250px', minHeight: '100vh', padding: '20px 0' }}
    >
      <Nav className="flex-column">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`text-white px-4 py-3 ${
              location.pathname === item.path ? 'bg-primary' : ''
            }`}
          >
            <span className="me-2">{item.icon}</span>
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;



