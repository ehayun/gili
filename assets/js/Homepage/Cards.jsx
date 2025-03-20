import React, { useState, useEffect, useRef } from 'react';
import HebrewEditor from '../components/HebrewEditor';

const Cards = () => {
    // Use refs to track form elements
    const formRef = useRef(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [editingCard, setEditingCard] = useState(null);
    const [formData, setFormData] = useState({
        id: 0,
        title: '',
        content: '',
        image_url: '',
        order_num: 0
    });
    const [selectedFile, setSelectedFile] = useState(null);

    // Fetch cards data
    const fetchCards = async (page = 1, searchTerm = '') => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cards?page=${page}&search=${searchTerm}`);
            if (!response.ok) {
                throw new Error('נכשל בהבאת הכרטיסים');
            }
            const data = await response.json();
            setCards(data.rows || []);
            setTotalPages(data.total_pages || 1);
            setCurrentPage(data.page || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards(currentPage, search);
    }, [currentPage, search]);

    // Add this effect to reset form when editingCard is null
    useEffect(() => {
        if (editingCard === null) {
            resetForm();
        }
    }, [editingCard]);

    // Function to completely reset the form
    const resetForm = () => {
        // Reset the form element first
        if (formRef.current) {
            formRef.current.reset();
        }

        // Then reset all state
        setFormData({
            id: 0,
            title: '',
            content: '',
            image_url: '',
            order_num: 0
        });
        setSelectedFile(null);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle rich text editor content changes
    const handleEditorChange = (content) => {
        setFormData({ ...formData, content });
    };

    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Update preview with the new file
            const objectUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image_url: objectUrl }));
        } else {
            // If the file input is cleared, also clear the preview
            setSelectedFile(null);
            setFormData(prev => ({ ...prev, image_url: editingCard?.image_url || '' }));
        }
    };

    // Submit form for creating/updating card
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data before submission
            if (!formData.title.trim()) {
                setError("כותרת היא שדה חובה");
                return;
            }

            // Create a FormData object
            const multipartFormData = new FormData();

            // Ensure order_num is a number
            const orderNum = Number(formData.order_num);

            // Add all form fields to FormData
            multipartFormData.append('id', Number(formData.id || 0));
            multipartFormData.append('title', formData.title.trim());
            multipartFormData.append('content', formData.content || '');
            multipartFormData.append('order_num', orderNum);

            // If there's a selected file, append it to FormData
            if (selectedFile) {
                multipartFormData.append('image', selectedFile);
            } else if (formData.image_url && !formData.image_url.startsWith('blob:')) {
                // Keep existing image if no new file was selected
                multipartFormData.append('image_url', formData.image_url);
            }

            const url = editingCard ? `/api/cards/${editingCard.id}` : '/api/cards';
            const method = editingCard ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: multipartFormData,
                // Don't set Content-Type header - the browser will set it automatically with the boundary
            });

            if (!response.ok) {
                throw new Error(`נכשל ב${editingCard ? 'עדכון' : 'יצירת'} הכרטיס`);
            }

            // Reset form and state
            resetForm();

            // Clear editing state
            setEditingCard(null);

            // Refresh data
            fetchCards(currentPage, search);
        } catch (err) {
            setError(err.message);
        }
    };

    // Edit card
    const handleEdit = (card) => {
        // First clear any previous state to avoid data persistence issues
        resetForm();

        // Use setTimeout to ensure state has been cleared before setting new values
        setTimeout(() => {
            setEditingCard(card);
            setFormData({
                id: card.id,
                title: card.title || '',
                content: card.content || '',
                image_url: card.image_url || '',
                order_num: Number(card.order_num) || 0
            });
        }, 10);
    };

    // Delete card
    const handleDelete = async (id) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק כרטיס זה?')) return;

        try {
            const response = await fetch(`/api/cards/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('נכשל במחיקת הכרטיס');
            }

            fetchCards(currentPage, search);
        } catch (err) {
            setError(err.message);
        }
    };

    // Move card up/down in order
    const handleReorder = async (id, direction) => {
        const card = cards.find(c => c.id === id);
        if (!card) return;

        const newOrderNum = card.order_num + (direction === 'up' ? -1 : 1);

        try {
            // Create FormData for reordering
            const reorderFormData = new FormData();
            reorderFormData.append('id', Number(card.id));
            reorderFormData.append('title', card.title);
            reorderFormData.append('content', card.content);
            reorderFormData.append('order_num', Number(newOrderNum));
            if (card.image_url) {
                reorderFormData.append('image_url', card.image_url);
            }

            const response = await fetch(`/api/cards/${id}`, {
                method: 'PUT',
                body: reorderFormData,
            });

            if (!response.ok) {
                throw new Error('נכשל בעדכון סדר הכרטיסים');
            }

            fetchCards(currentPage, search);
        } catch (err) {
            setError(err.message);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingCard(null);
        // resetForm() will be called by the useEffect when editingCard changes to null
    };

    // Create HTML from content
    const createMarkup = (htmlContent) => {
        return { __html: htmlContent };
    };

    if (loading && cards.length === 0) {
        return <div className="d-flex justify-content-center my-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
        <div className="container my-4">
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="סגור"></button>
                </div>
            )}

            <div className="row">
                <div className="col-md-4">
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            {editingCard ? 'עריכת כרטיס' : 'הוספת כרטיס חדש'}
                        </div>
                        <div className="card-body">
                            <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">כותרת</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="content" className="form-label">תוכן</label>
                                    <HebrewEditor
                                        value={formData.content}
                                        onChange={handleEditorChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="image" className="form-label">תמונה</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="image"
                                        name="image"
                                        onChange={handleFileChange}
                                    />
                                    {formData.image_url && (
                                        <div className="mt-2">
                                            <img
                                                src={formData.image_url}
                                                alt="תצוגה מקדימה"
                                                className="img-thumbnail"
                                                style={{ maxHeight: '100px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="order_num" className="form-label">סדר</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="order_num"
                                        name="order_num"
                                        value={formData.order_num}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        {editingCard ? 'עדכן' : 'צור'}
                                    </button>
                                    {editingCard && (
                                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                            ביטול
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">כרטיסים</h5>
                            <div className="input-group w-50 rtl">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="חיפוש..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    className="btn btn-outline-light"
                                    type="button"
                                    onClick={() => fetchCards(1, search)}
                                >
                                    חיפוש
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {cards.length === 0 ? (
                                <p className="text-center my-4">לא נמצאו כרטיסים. צור את הכרטיס הראשון שלך!</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead>
                                        <tr>
                                            <th>כותרת</th>
                                            <th>תמונה</th>
                                            <th>סדר</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {cards.map((card) => (
                                            <tr key={card.id}>
                                                <td>{card.title}</td>
                                                <td>
                                                    {card.image_url && (
                                                        <img
                                                            src={card.image_url}
                                                            alt={card.title}
                                                            className="img-thumbnail"
                                                            style={{ maxHeight: '50px' }}
                                                        />
                                                    )}
                                                </td>
                                                <td>{card.order_num}</td>
                                                <td>
                                                    <div className="btn-group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleEdit(card)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(card.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleReorder(card.id, 'up')}
                                                        >
                                                            <i className="bi bi-arrow-up"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleReorder(card.id, 'down')}
                                                        >
                                                            <i className="bi bi-arrow-down"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="card-footer">
                                <nav aria-label="ניווט בין דפי כרטיסים">
                                    <ul className="pagination justify-content-center mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(1)}>ראשון</button>
                                        </li>
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>הקודם</button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>הבא</button>
                                        </li>
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(totalPages)}>אחרון</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Display Cards Grid Preview */}
            <div className="row mt-5">
                <div className="col-12">
                    <h3 className="border-bottom pb-2 mb-4">תצוגה מקדימה של הכרטיסים</h3>
                </div>
                {cards.map((card) => (
                    <div key={card.id} className="col-md-4 mb-4">
                        <div className="card h-100">
                            {card.image_url && (
                                <img src={card.image_url} className="card-img-top" alt={card.title} />
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{card.title}</h5>
                                <div className="card-text" dangerouslySetInnerHTML={createMarkup(card.content)}></div>
                            </div>
                            <div className="card-footer bg-white">
                                <small className="text-muted">סדר: {card.order_num}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cards;
