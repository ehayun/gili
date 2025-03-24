import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Image } from 'react-bootstrap';
import axios from 'axios';
import HebrewEditor from "../components/HebrewEditor";

const Carousels = () => {
    const [carousels, setCarousels] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentCarousel, setCurrentCarousel] = useState({
        id: 0,
        title: '',
        image_url: '',
        content: '',
        order_num: 0
    });
    const [file, setFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCarousels();
    }, []);

    const fetchCarousels = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/carousels');
            setCarousels(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('שגיאה בטעינת קרוסלות:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCarousel(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setCurrentCarousel(prev => ({ ...prev, content }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const resetForm = () => {
        setCurrentCarousel({
            id: 0,
            title: '',
            image_url: '',
            content: '',
            order_num: 0
        });
        setFile(null);
        setIsEditing(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleShowModal = (carousel = null) => {
        if (carousel) {
            setCurrentCarousel(carousel);
            setIsEditing(true);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            currentCarousel.order_num = Number(currentCarousel.order_num);
            // הוספת נתוני קרוסלה לטופס
            Object.keys(currentCarousel).forEach(key => {
                formData.append(key, currentCarousel[key]);
            });

            // הוספת קובץ אם קיים
            if (file) {
                formData.append('image', file);
            }

            if (isEditing) {
                await axios.put(`/api/carousels/${currentCarousel.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post('/api/carousels', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            fetchCarousels();
            handleCloseModal();
        } catch (error) {
            console.error('שגיאה בשמירת קרוסלה:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק קרוסלה זו?')) {
            try {
                await axios.delete(`/api/carousels/${id}`);
                fetchCarousels();
            } catch (error) {
                console.error('שגיאה במחיקת קרוסלה:', error);
            }
        }
    };

    return (
        <div className="container mt-4" dir="rtl">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h3>ניהול קרוסלות</h3>
                    <Button variant="primary" onClick={() => handleShowModal()}>
                        הוסף קרוסלה חדשה
                    </Button>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center p-4">טוען...</div>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                            <tr>
                                <th>כותרת</th>
                                <th>תמונה</th>
                                <th>סדר</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {carousels.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">לא נמצאו קרוסלות</td>
                                </tr>
                            ) : (
                                carousels.map((carousel) => (
                                    <tr key={carousel.id}>
                                        <td>{carousel.title}</td>
                                        <td>
                                            {carousel.image_url && (
                                                <Image
                                                    src={carousel.image_url}
                                                    alt={carousel.title}
                                                    style={{ width: '100px', height: '50px', objectFit: 'cover' }}
                                                    thumbnail
                                                />
                                            )}
                                        </td>
                                        <td>{carousel.order_num}</td>
                                        <td>
                                            <Button
                                                variant="info"
                                                size="sm"
                                                className="ms-2"
                                                onClick={() => handleShowModal(carousel)}
                                            >
                                                ערוך
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(carousel.id)}
                                            >
                                                מחק
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* מודל יצירה/עריכה */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'ערוך קרוסלה' : 'הוסף קרוסלה חדשה'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit} dir="rtl">
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>כותרת</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={currentCarousel.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>מספר סדר</Form.Label>
                            <Form.Control
                                type="number"
                                name="order_num"
                                value={currentCarousel.order_num}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>תמונה</Form.Label>
                            {currentCarousel.image_url && (
                                <div className="mb-2">
                                    <Image
                                        src={currentCarousel.image_url}
                                        alt={currentCarousel.title}
                                        style={{ maxWidth: '200px', maxHeight: '100px' }}
                                        thumbnail
                                    />
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            <Form.Text className="text-muted">
                                {isEditing ? 'העלה תמונה חדשה כדי להחליף את הקיימת' : 'בחר תמונה עבור הקרוסלה'}
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>תוכן</Form.Label>
                            <HebrewEditor
                                value={currentCarousel.content}
                                onChange={handleContentChange}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            ביטול
                        </Button>
                        <Button variant="primary" type="submit">
                            {isEditing ? 'עדכן' : 'צור'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Carousels;
