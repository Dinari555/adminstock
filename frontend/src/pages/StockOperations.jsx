import { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';

const StockOperations = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [operationType, setOperationType] = useState('IN');
  const [quantite, setQuantite] = useState(1);
  const [note, setNote] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadAlerts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data.products);
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await api.get('/products/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des alertes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Veuillez sélectionner un produit');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/products/${selectedProduct}/stock`, {
        type: operationType,
        quantite,
        note,
      });
      toast.success('Opération de stock enregistrée avec succès');
      setQuantite(1);
      setNote('');
      loadProducts();
      loadAlerts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Gestion du stock</h2>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Nouvelle opération</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Produit *</Form.Label>
                  <Form.Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.reference} - {product.nom} (Stock: {product.quantite})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Type d'opération *</Form.Label>
                  <Form.Select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value)}
                    required
                  >
                    <option value="IN">Entrée de stock</option>
                    <option value="OUT">Sortie de stock</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quantité *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quantite}
                    onChange={(e) => setQuantite(parseInt(e.target.value))}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note optionnelle..."
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StockOperations;



