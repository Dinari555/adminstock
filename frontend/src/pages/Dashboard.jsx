import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import api from '../services/api';
import CardStat from '../components/CardStat';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [summaryRes, salesRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/sales'),
      ]);

      setSummary(summaryRes.data.data);
      setSales(salesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(value);
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Tableau de bord</h2>

      <Row className="mb-4">
        <Col md={3}>
          <CardStat
            title="Ventes aujourd'hui"
            value={summary?.salesToday?.count || 0}
            icon="📈"
            color="success"
          />
        </Col>
        <Col md={3}>
          <CardStat
            title="Ventes ce mois"
            value={formatCurrency(summary?.salesMonth?.total || 0)}
            icon="💰"
            color="primary"
          />
        </Col>
        <Col md={3}>
          <CardStat
            title="Valeur du stock"
            value={formatCurrency(summary?.stockValue || 0)}
            icon="📦"
            color="info"
          />
        </Col>
        <Col md={3}>
          <CardStat
            title="Produits critiques"
            value={summary?.lowStockCount || 0}
            icon="⚠️"
            color="warning"
          />
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <div className="card">
            <div className="card-header">
              <h5>Ventes par période</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total (DT)" />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Nombre" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="card">
            <div className="card-header">
              <h5>Top produits</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSold" fill="#8884d8" name="Quantité vendue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;



