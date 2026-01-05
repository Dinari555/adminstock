import { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HistoryLog = ({ entity, entityId, title = 'Historique des opérations' }) => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin && entityId) {
      loadHistory();
    }
  }, [isAdmin, entityId, entity]);

  const loadHistory = async () => {
    try {
      const response = await api.get('/audit', {
        params: {
          entity,
          entityId,
          limit: 50,
        },
      });
      setLogs(response.data.data.logs || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Ne rien afficher si l'utilisateur n'est pas admin
  if (!isAdmin) {
    return null;
  }

  // Ne rien afficher si pas d'ID d'entité
  if (!entityId) {
    return null;
  }

  const getActionLabel = (action) => {
    const labels = {
      CREATE: { label: 'Création', variant: 'success' },
      UPDATE: { label: 'Modification', variant: 'warning' },
      DELETE: { label: 'Suppression', variant: 'danger' },
      STOCK_IN: { label: 'Entrée de stock', variant: 'info' },
      STOCK_OUT: { label: 'Sortie de stock', variant: 'primary' },
      INVOICE_CREATE: { label: 'Facture créée', variant: 'success' },
      INVOICE_UPDATE: { label: 'Facture modifiée', variant: 'warning' },
      INVOICE_DELETE: { label: 'Facture supprimée', variant: 'danger' },
      LOGIN: { label: 'Connexion', variant: 'secondary' },
      LOGOUT: { label: 'Déconnexion', variant: 'secondary' },
    };
    return labels[action] || { label: action, variant: 'secondary' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const formatDetails = (details) => {
    if (!details || typeof details !== 'object') return '—';
    
    const filtered = Object.entries(details)
      .filter(([key]) => !['productId', 'productName', 'method', 'path', 'body'].includes(key))
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      });

    return filtered.length > 0 ? filtered.join(' · ') : '—';
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-muted">Chargement de l'historique...</span>
        </Card.Body>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="mt-4 border-secondary">
        <Card.Header className="bg-light">
          <h5 className="mb-0 text-muted">
            <i className="bi bi-clock-history me-2"></i>
            {title}
          </h5>
          <small className="text-muted">
            Aucune opération enregistrée pour cet élément
          </small>
        </Card.Header>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-primary">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-clock-history me-2"></i>
          {title}
        </h5>
        <small className="opacity-75">
          Journal des modifications et actions effectuées sur cet élément
        </small>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table striped hover size="sm" className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '20%' }}>Date et heure</th>
                <th style={{ width: '15%' }}>Action</th>
                <th style={{ width: '20%' }}>Utilisateur</th>
                <th style={{ width: '45%' }}>Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const actionInfo = getActionLabel(log.action);
                const userName = log.userId
                  ? `${log.userId.nom || ''} ${log.userId.prenom || ''}`.trim() || log.userId.email || 'Utilisateur inconnu'
                  : 'Système';
                
                return (
                  <tr key={log._id || index}>
                    <td>
                      <span className="fw-semibold text-primary">
                        {formatDate(log.date || log.createdAt || log.timestamp)}
                      </span>
                    </td>
                    <td>
                      <Badge bg={actionInfo.variant} className="px-2 py-1">
                        {actionInfo.label}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted">
                        <i className="bi bi-person-circle me-1"></i>
                        {userName}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDetails(log.details)}
                      </small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default HistoryLog;

