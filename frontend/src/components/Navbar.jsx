import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        <BootstrapNavbar.Brand href="#/dashboard">Depot Dashboard</BootstrapNavbar.Brand>
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="dark" id="user-dropdown">
              {user?.prenom} {user?.nom}
              <span className="badge bg-primary ms-2">{user?.role}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.ItemText>
                <small>{user?.email}</small>
              </Dropdown.ItemText>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Déconnexion</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;



