import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      toast.success('Utilisateur supprimé avec succès');
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Utilisateurs</h2>
        </Col>
        {isAdmin && (
          <Col xs="auto">
            <Button variant="primary" onClick={() => navigate('/users/new')}>
              + Ajouter un employé
            </Button>
          </Col>
        )}
      </Row>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Rôle</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.nom}</td>
              <td>{user.prenom}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                  {user.role}
                </Badge>
              </td>
              {isAdmin && (
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/users/${user._id}/edit`)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user._id)}
                    disabled={user.role === 'admin'} // Prevent deleting admin
                  >
                    Supprimer
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default UsersList;



