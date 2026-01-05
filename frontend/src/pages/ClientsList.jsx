import { useState, useEffect } from 'react';
import { Container, Table, Button, InputGroup, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/clients', { params });
      setClients(response.data.data.clients);
    } catch (error) {
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client supprimé avec succès');
      loadClients();
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Clients</h2>
        <Button variant="primary" onClick={() => navigate('/clients/new')}>
          + Nouveau client
        </Button>
      </div>

      <InputGroup className="mb-3">
        <Form.Control
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Adresse</th>
            <th>Crédit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                Aucun client trouvé
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client._id}>
                <td>{client.nom}</td>
                <td>{client.prenom}</td>
                <td>{client.email || '-'}</td>
                <td>{client.contact}</td>
                <td>{client.adresse || '-'}</td>
                <td>
                  <span className={`badge bg-${client.credit === 0 ? 'danger' : 'info'}`}>
                    {client.credit || 0} DT
                  </span>
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/clients/${client._id}/edit`)}
                  >
                    Modifier
                  </Button>
                  {client.credit === 0 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(client._id)}
                    >
                      Supprimer
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default ClientsList;



