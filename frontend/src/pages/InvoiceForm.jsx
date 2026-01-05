import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
  });
  const [formData, setFormData] = useState({
    clientId: '',
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/products'),
      ]);
      setClients(clientsRes.data.data.clients);
      setProducts(productsRes.data.data.products);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    }
  };

  const filteredClients = clients.filter((client) => {
    const search = clientSearch.toLowerCase();
    return (
      client.nom.toLowerCase().includes(search) ||
      client.prenom.toLowerCase().includes(search) ||
      (client.email || '').toLowerCase().includes(search)
    );
  });

  const handleCreateClient = async () => {
    if (!newClient.nom || !newClient.prenom) {
      toast.error('Nom et prénom sont obligatoires');
      return;
    }

    if (!newClient.telephone) {
      toast.error('Le téléphone (contact) est obligatoire');
      return;
    }

    try {
      // Mapper telephone vers contact pour correspondre au modèle backend
      const clientData = {
        nom: newClient.nom,
        prenom: newClient.prenom,
        email: newClient.email,
        contact: newClient.telephone, // Le backend attend "contact" pas "telephone"
        adresse: newClient.adresse,
      };
      
      const response = await api.post('/clients', clientData);
      const created = response.data.data;
      const updatedClients = [...clients, created];
      setClients(updatedClients);
      setFormData({ ...formData, clientId: created._id });
      setShowNewClientForm(false);
      setNewClient({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
      });
      toast.success('Client créé avec succès');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du client');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: '', qte: 1 },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    let total = 0;
    formData.items.forEach((item) => {
      const product = products.find((p) => p._id === item.productId);
      if (product) {
        total += product.prix * item.qte;
      }
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.clientId) {
      setError('Veuillez sélectionner un client');
      return;
    }

    if (formData.items.length === 0) {
      setError('Veuillez ajouter au moins un article');
      return;
    }

    setLoading(true);
    try {
      await api.post('/invoices', formData);
      toast.success('Facture créée avec succès');
      navigate('/invoices');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Nouvelle facture</h2>
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Client *</Form.Label>
              <InputGroup className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Rechercher un client (nom, prénom, email)"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                <Button
                  variant={showNewClientForm ? 'secondary' : 'outline-primary'}
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                >
                  {showNewClientForm ? 'Fermer' : 'Nouveau client'}
                </Button>
              </InputGroup>
              <Form.Select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
              >
                <option value="">Sélectionner un client</option>
                {filteredClients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.nom} {client.prenom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {showNewClientForm && (
              <Card className="mb-3 border-primary">
                <Card.Body>
                  <h5 className="mb-3">Ajouter un nouveau client</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom *</Form.Label>
                        <Form.Control
                          type="text"
                          value={newClient.nom}
                          onChange={(e) => setNewClient({ ...newClient, nom: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Prénom *</Form.Label>
                        <Form.Control
                          type="text"
                          value={newClient.prenom}
                          onChange={(e) => setNewClient({ ...newClient, prenom: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={newClient.email}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Téléphone</Form.Label>
                        <Form.Control
                          type="text"
                          value={newClient.telephone}
                          onChange={(e) =>
                            setNewClient({ ...newClient, telephone: e.target.value })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={newClient.adresse}
                      onChange={(e) => setNewClient({ ...newClient, adresse: e.target.value })}
                    />
                  </Form.Group>
                  <div className="text-end">
                    <Button variant="primary" size="sm" onClick={handleCreateClient}>
                      Enregistrer le client
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Articles</h5>
                <Button variant="success" size="sm" onClick={addItem}>
                  + Ajouter
                </Button>
              </div>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => {
                    const product = products.find((p) => p._id === item.productId);
                    const itemTotal = product ? product.prix * item.qte : 0;
                    return (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            required
                          >
                            <option value="">Sélectionner</option>
                            {products
                              .filter((p) => p.quantite > 0)
                              .map((product) => (
                                <option key={product._id} value={product._id}>
                                  {product.nom} (Stock: {product.quantite})
                                </option>
                              ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="1"
                            max={product?.quantite || 0}
                            value={item.qte}
                            onChange={(e) => updateItem(index, 'qte', parseInt(e.target.value))}
                            required
                          />
                        </td>
                        <td>{product ? product.prix.toLocaleString('fr-FR') : '-'}</td>
                        <td>{itemTotal.toLocaleString('fr-FR')} DT</td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => removeItem(index)}>
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Aucun article ajouté
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <div className="text-end mt-3">
                <h5>Total: {calculateTotal().toLocaleString('fr-FR')} DT</h5>
              </div>
            </div>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer la facture'}
            </Button>
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => navigate('/invoices')}
            >
              Annuler
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InvoiceForm;



