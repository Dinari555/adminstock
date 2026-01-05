import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await api.get('/invoices', {
        params: { limit: 1000 }, // Charger toutes les factures pour la recherche
      });
      const invoicesData = response.data.data.invoices;
      setAllInvoices(invoicesData);
      setInvoices(invoicesData);
    } catch (error) {
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les factures selon la recherche et le statut
  useEffect(() => {
    let filtered = [...allInvoices];

    // Filtre par recherche (nom, prénom, email du client ou numéro de facture)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((invoice) => {
        const clientName = `${invoice.clientId?.nom || ''} ${invoice.clientId?.prenom || ''}`.toLowerCase();
        const clientEmail = (invoice.clientId?.email || '').toLowerCase();
        const invoiceNumber = invoice._id.slice(-8).toLowerCase();
        const total = invoice.total.toString();
        
        return (
          clientName.includes(search) ||
          clientEmail.includes(search) ||
          invoiceNumber.includes(search) ||
          total.includes(search)
        );
      });
    }

    // Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter((invoice) => invoice.statut === statusFilter);
    }

    setInvoices(filtered);
  }, [searchTerm, statusFilter, allInvoices]);

  const handleDownloadPDF = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getStatusBadge = (statut) => {
    const colors = {
      payé: 'success',
      en_attente: 'warning',
      en_retard: 'danger',
    };
    return <Badge bg={colors[statut]}>{statut}</Badge>;
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Confirmer la suppression de cette facture payée ?')) {
      return;
    }

    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Facture supprimée avec succès');
      loadInvoices();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression de la facture"
      );
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
        <h2>Factures</h2>
        <Button variant="primary" onClick={() => navigate('/invoices/new')}>
          + Nouvelle facture
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Rechercher des factures</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Rechercher par client ou facture</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nom, prénom, email du client, numéro de facture ou montant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      ✕
                    </Button>
                  )}
                </InputGroup>
                <Form.Text className="text-muted">
                  Recherche dans le nom, prénom, email du client, numéro de facture ou montant
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtrer par statut</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="payé">Payé</option>
                  <option value="en_attente">En attente</option>
                  <option value="en_retard">En retard</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {(searchTerm || statusFilter) && (
            <div className="mt-2">
              <Badge bg="info" className="me-2">
                {invoices.length} facture(s) trouvée(s)
              </Badge>
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>N° Facture</th>
            <th>Client</th>
            <th>Date</th>
            <th>Total (DT)</th>
            <th>Statut</th>
            <th>Créé par</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                Aucune facture trouvée
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td>{invoice._id.slice(-8)}</td>
                <td>
                  {invoice.clientId?.nom} {invoice.clientId?.prenom}
                </td>
                <td>{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                <td>{invoice.total.toLocaleString('fr-FR')}</td>
                <td>{getStatusBadge(invoice.statut)}</td>
                <td>
                  {invoice.createdBy?.nom} {invoice.createdBy?.prenom}
                </td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                  >
                    Voir détails
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleDownloadPDF(invoice._id)}
                  >
                    PDF
                  </Button>
                  {isAdmin && invoice.statut === 'payé' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteInvoice(invoice._id)}
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

export default InvoicesList;



