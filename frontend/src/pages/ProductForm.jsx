import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import HistoryLog from '../components/HistoryLog';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    description: '',
    prix: 0,
    quantite: 0,
    quantiteInitiale: 0,
    seuilMin: 10,
    type: 'Standard',
  });
  const [customType, setCustomType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const data = response.data.data;
      setFormData({
        ...data,
        quantiteInitiale: data.quantiteInitiale || 0,
      });
      if (data.type !== 'Standard') {
        // If type is not standard, it might be a custom type or we might want to handle it
        // For now, let's assume if it's not in our predefined list (if we had one), it's custom
        // But here we only have 'Standard' and 'Autre' in UI logic.
        // If the backend returns something else, we might need to set customType
        if (data.type !== 'Standard') {
          // If we want to support editing custom types properly:
          // setFormData({ ...data, type: 'Autre' });
          // setCustomType(data.type);
          // But for simplicity, let's just keep it as is or default to Standard if unknown
        }
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du produit');
      navigate('/products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation: quantité doit être < seuil min
    if (formData.quantite >= formData.seuilMin) {
      setError('La quantité doit être strictement inférieure au seuil minimum');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = { ...formData };
      if (dataToSend.type === 'Autre') {
        dataToSend.type = customType;
      }
      // Enforce uppercase name
      dataToSend.nom = dataToSend.nom.toUpperCase();

      if (id) {
        await api.put(`/products/${id}`, dataToSend);
        toast.success('Produit modifié avec succès');
      } else {
        await api.post('/products', dataToSend);
        toast.success('Produit créé avec succès');
      }
      navigate('/products');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2 className="mb-4">{id ? 'Modifier le produit' : 'Nouveau produit'}</h2>
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Référence *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.type === 'Standard' ? 'Standard' : 'Autre'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, type: val });
                      if (val === 'Standard') setCustomType('');
                    }}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Autre">Autre</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {formData.type === 'Autre' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Préciser le type</Form.Label>
                    <Form.Control
                      type="text"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix unitaire (DT) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité Initiale</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.quantiteInitiale}
                    onChange={(e) => setFormData({ ...formData, quantiteInitiale: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Seuil minimum *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.seuilMin}
                    onChange={(e) => setFormData({ ...formData, seuilMin: parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => navigate('/products')}
            >
              Annuler
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {id && (
        <HistoryLog
          entity="Product"
          entityId={id}
          title="Historique des opérations du produit"
        />
      )}
    </Container>
  );
};

export default ProductForm;



