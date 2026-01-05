import { useState, useEffect } from 'react';
import { Container, Table, Button, InputGroup, Form, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [search, showLowStock]);

  const loadProducts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (showLowStock) params.lowStock = 'true';
      const response = await api.get('/products', { params });
      setProducts(response.data.data.products);
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      toast.success('Produit supprimé avec succès');
      loadProducts();
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
        <h2>Produits</h2>
        <Button variant="primary" onClick={() => navigate('/products/new')}>
          + Nouveau produit
        </Button>
      </div>

      <div className="d-flex gap-3 mb-3">
        <InputGroup style={{ flex: 1 }}>
          <Form.Control
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Form.Check
          type="switch"
          label="Stock faible uniquement"
          checked={showLowStock}
          onChange={(e) => setShowLowStock(e.target.checked)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Référence</th>
            <th>Nom</th>
            <th>Prix (DT)</th>
            <th>Qté Initiale</th>
            <th>Quantité</th>
            <th>Seuil min</th>
            <th>Stock</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                Aucun produit trouvé
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product._id}
                className={product.quantite === 0 ? 'table-danger' : ''}
              >
                <td>{product.reference}</td>
                <td>{product.nom}</td>
                <td>{product.prix.toLocaleString('fr-FR')}</td>
                <td>{product.quantiteInitiale || '-'}</td>
                <td>{product.quantite}</td>
                <td>{product.seuilMin}</td>
                <td>
                  {product.quantite === 0 ? (
                    <Badge bg="danger">Rupture de stock</Badge>
                  ) : product.quantite <= product.seuilMin ? (
                    <Badge bg="warning">Stock faible</Badge>
                  ) : (
                    <Badge bg="success">OK</Badge>
                  )}
                </td>
                <td>
                  <Badge bg={product.status === 'finished' ? 'secondary' : 'primary'}>
                    {product.status === 'finished' ? 'Terminé' : 'Actif'}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => navigate(`/products/${product._id}/edit`)}
                  >
                    Modifier
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default ProductsList;



