import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import HistoryLog from '../components/HistoryLog';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement de la facture');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
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

  if (!invoice) {
    return (
      <Container>
        <div className="text-center py-5">
          <p>Facture non trouvée</p>
          <Button onClick={() => navigate('/invoices')}>Retour à la liste</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Détails de la facture</h2>
        <div>
          <Button variant="info" className="me-2" onClick={handleDownloadPDF}>
            Télécharger PDF
          </Button>
          <Button variant="secondary" onClick={() => navigate('/invoices')}>
            Retour
          </Button>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Informations client</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Nom:</strong> {invoice.clientId?.nom} {invoice.clientId?.prenom}</p>
              <p><strong>Email:</strong> {invoice.clientId?.email || '—'}</p>
              <p><strong>Contact:</strong> {invoice.clientId?.contact || '—'}</p>
              <p><strong>Adresse:</strong> {invoice.clientId?.adresse || '—'}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Informations facture</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>N° Facture:</strong> {invoice._id.slice(-8)}</p>
              <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
              <p><strong>Statut:</strong> {getStatusBadge(invoice.statut)}</p>
              <p><strong>Créé par:</strong> {invoice.createdBy?.nom} {invoice.createdBy?.prenom}</p>
              <p><strong>Total:</strong> <span className="h4 text-primary">{invoice.total.toLocaleString('fr-FR')} DT</span></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Articles</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Référence</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.productId?.nom || '—'}</td>
                  <td>{item.productId?.reference || '—'}</td>
                  <td>{item.qte}</td>
                  <td>{item.prixUnitaire?.toLocaleString('fr-FR')} DT</td>
                  <td>{item.total?.toLocaleString('fr-FR')} DT</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {id && (
        <HistoryLog
          entity="Invoice"
          entityId={id}
          title="Historique des modifications de la facture"
        />
      )}
    </Container>
  );
};

export default InvoiceDetail;

