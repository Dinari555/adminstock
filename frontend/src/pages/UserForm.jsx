import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import HistoryLog from '../components/HistoryLog';

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'employee',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadUser();
        }
    }, [id]);

    const loadUser = async () => {
        try {
            const response = await api.get(`/users/${id}`);
            const { nom, prenom, email, role } = response.data.data;
            setFormData({ nom, prenom, email, role, password: '' }); // Don't load password
        } catch (error) {
            toast.error('Erreur lors du chargement de l\'utilisateur');
            navigate('/users');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const dataToSend = { ...formData };
            if (!dataToSend.password) {
                delete dataToSend.password; // Don't send empty password on update
            }

            if (id) {
                await api.put(`/users/${id}`, dataToSend);
                toast.success('Utilisateur modifié avec succès');
            } else {
                await api.post('/users', dataToSend);
                toast.success('Utilisateur créé avec succès');
            }
            navigate('/users');
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h2 className="mb-4">{id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
            <Card>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Prénom</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.prenom}
                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mot de passe {id && '(laisser vide pour ne pas changer)'}</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!id}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Rôle</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="employee">Employé</option>
                                <option value="admin">Administrateur</option>
                            </Form.Select>
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                        <Button
                            variant="secondary"
                            className="ms-2"
                            onClick={() => navigate('/users')}
                        >
                            Annuler
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {id && (
        <HistoryLog
          entity="User"
          entityId={id}
          title="Historique des modifications de l'utilisateur"
        />
      )}
    </Container>
  );
};

export default UserForm;
