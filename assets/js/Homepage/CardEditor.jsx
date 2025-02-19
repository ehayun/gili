import React, { useState, useEffect } from 'react';

const CardEditor = ({ cards, onUpdate }) => {
    const [cardList, setCardList] = useState([]);
    const [editingCard, setEditingCard] = useState(null);

    useEffect(() => {
        setCardList(cards || []);
    }, [cards]);

    const handleCardSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            // Handle image file separately
            const fileInput = e.target.querySelector('input[type="file"]');
            if (fileInput && fileInput.files[0]) {
                formData.append('image', fileInput.files[0]);
            }

            // Add other form data
            formData.append('title', editingCard.title);
            formData.append('content', editingCard.content);
            formData.append('order_num', parseInt(editingCard.order_num, 10));
            if (editingCard.id) {
                formData.append('id', editingCard.id);
            }

            const method = editingCard.id ? 'PUT' : 'POST';
            const url = `/api/cards${editingCard.id ? `/${editingCard.id}` : ''}`;

            await fetch(url, {
                method,
                body: formData
            });

            setEditingCard(null);
            onUpdate();
            // alert('Card saved successfully!');
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Error saving card');
        }
    };

    const handleCardChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            if (files && files[0]) {
                setEditingCard(prev => ({
                    ...prev,
                    [name]: files[0]
                }));

                // Create preview URL
                const previewUrl = URL.createObjectURL(files[0]);
                setEditingCard(prev => ({
                    ...prev,
                    imagePreviewUrl: previewUrl
                }));
            }
        } else {
            setEditingCard(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm('Are you sure you want to delete this card?')) return;

        try {
            await fetch(`/api/cards/${id}`, { method: 'DELETE' });
            onUpdate();
            alert('Card deleted successfully!');
        } catch (error) {
            console.error('Error deleting card:', error);
            alert('Error deleting card');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <h4>Cards ({cardList.length})</h4>
                {!editingCard && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setEditingCard({
                            title: '',
                            content: '',
                            image_url: null,
                            order_num: String(cardList.length + 1),
                            imagePreviewUrl: null
                        })}
                    >
                        Add New Card
                    </button>
                )}
            </div>

            {editingCard ? (
                <form onSubmit={handleCardSubmit} className="bg-light p-4 rounded">
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={editingCard.title}
                            onChange={handleCardChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Image</label>
                        <input
                            type="file"
                            className="form-control"
                            name="image_url"
                            onChange={handleCardChange}
                            accept="image/*"
                            required={!editingCard.id}
                        />
                    </div>
                    {(editingCard.imagePreviewUrl || editingCard.image_url) && (
                        <div className="mb-3">
                            <img
                                src={editingCard.imagePreviewUrl || `/uploads/${editingCard.image_url}`}
                                alt="Preview"
                                className="img-thumbnail"
                                style={{ maxHeight: '200px' }}
                            />
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label">Content</label>
                        <textarea
                            className="form-control"
                            name="content"
                            rows="4"
                            value={editingCard.content}
                            onChange={handleCardChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Order Number</label>
                        <input
                            type="number"
                            className="form-control"
                            name="order_num"
                            value={editingCard.order_num}
                            onChange={handleCardChange}
                            min="1"
                            required
                        />
                    </div>
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary">
                            Save Card
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setEditingCard(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {cardList.map(card => (
                        <div key={card.id} className="col">
                            <div className="card h-100">
                                {card.image_url && (
                                    <img
                                        src={`/uploads/${card.image_url}`}
                                        className="card-img-top"
                                        alt={card.title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {card.title}
                                        <span className="badge bg-secondary ms-2">Order: {card.order_num}</span>
                                    </h5>
                                    <p className="card-text">{card.content}</p>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setEditingCard({...card, imagePreviewUrl: null})}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteCard(card.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CardEditor;
