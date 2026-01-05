import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../services/api';
import HistoryLog from '../components/HistoryLog';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    contact: '+216',
    adresse: '',
    credit: '', // Changed from 0 to empty string for input handling
    note: '',
    history: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const response = await api.get(`/clients/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du client');
      navigate('/clients');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone number (must be +216 followed by 8 digits)
    const phoneRegex = /^\+216\d{8}$/;
    if (!phoneRegex.test(formData.contact)) {
      setError('Le numéro de contact doit commencer par +216 et contenir 8 chiffres supplémentaires.');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        credit: formData.credit === '' ? 0 : parseFloat(formData.credit),
      };

      if (id) {
        await api.put(`/clients/${id}`, dataToSend);
        toast.success('Client modifié avec succès');
        // Reload client data to show updated history and reset fields
        loadClient();
        // Reset note and credit input (optional, but good for UX if staying on page)
        // For now, we stay on page to show history
      } else {
        await api.post('/clients', dataToSend);
        toast.success('Client créé avec succès');
        navigate('/clients');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Historique - ${formData.nom} ${formData.prenom}`, 14, 15);
    doc.text(`Contact: ${formData.contact}`, 14, 22);
    doc.text(`Crédit Actuel: ${formData.credit || 0} DT`, 14, 29);

    const tableColumn = ["Date", "Type", "Montant (DT)", "Note"];
    const tableRows = [];

    formData.history.forEach(item => {
      const date = new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString();
      const type = item.type === 'payment' ? 'Paiement' : 'Crédit';
      const amount = item.amount;
      const note = item.note || '-';
      tableRows.push([date, type, amount, note]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    });

    doc.save(`historique_${formData.nom}_${formData.prenom}.pdf`);
  };

  return (
    <Container>
      <h2 className="mb-4">{id ? 'Modifier le client' : 'Nouveau client'}</h2>
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact *</Form.Label>
              <Form.Control
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Crédit (DT)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.credit}
                    onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Note (pour l'historique)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Paiement partiel, Achat à crédit..."
                    value={formData.note || ''}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
              onClick={() => navigate('/clients')}
            >
              Retour
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {id && formData.history && formData.history.length > 0 && (
        <Card className="mt-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>Historique des paiements et crédits</h5>
            <Button variant="outline-secondary" size="sm" onClick={exportPDF}>
              Imprimer PDF
            </Button>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.history.slice().reverse().map((item, index) => ( // Show newest first
                    <tr key={index}>
                      <td>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}</td>
                      <td>
                        <span className={`badge bg-${item.type === 'payment' ? 'success' : 'warning'}`}>
                          {item.type === 'payment' ? 'Paiement' : 'Crédit'}
                        </span>
                      </td>
                      <td>{item.amount} DT</td>
                      <td>{item.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {id && (
        <HistoryLog
          entity="Client"
          entityId={id}
          title="Historique des modifications du client"
        />
      )}
    </Container>
  );
};

export default ClientForm;

