import React, { useState, useEffect } from 'react';

const CarouselEditor = ({ carousels, onUpdate }) => {
    const [carouselList, setCarouselList] = useState([]);
    const [editingCarousel, setEditingCarousel] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        setCarouselList(carousels || []);
    }, [carousels]);

    const handleCarouselSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            // Handle image file separately
            const fileInput = e.target.querySelector('input[type="file"]');
            if (fileInput && fileInput.files[0]) {
                formData.append('image', fileInput.files[0]);
            }

            // Add other form data
            formData.append('id', editingCarousel.id);
            formData.append('title', editingCarousel.title);
            formData.append('content', editingCarousel.content);
            formData.append('order_num', editingCarousel.order_num);
            if (editingCarousel.id) {
                formData.append('id', editingCarousel.id);
            }

            const method = editingCarousel.id ? 'PUT' : 'POST';
            const url = `/api/carousel${editingCarousel.id ? `/${editingCarousel.id}` : ''}`;

            await fetch(url, {
                method,
                body: formData
            });

            setEditingCarousel(null);
            onUpdate();
            // alert('Carousel slide saved successfully!');
        } catch (error) {
            console.error('Error saving carousel slide:', error);
            alert('Error saving carousel slide');
        }
    };

    const handleCarouselChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            if (files && files[0]) {
                setEditingCarousel(prev => ({
                    ...prev,
                    [name]: files[0]
                }));

                // Create preview URL
                const previewUrl = URL.createObjectURL(files[0]);
                setEditingCarousel(prev => ({
                    ...prev,
                    imagePreviewUrl: previewUrl
                }));
            }
        } else {
            setEditingCarousel(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDeleteCarousel = async (id) => {
        if (!window.confirm('Are you sure you want to delete this carousel slide?')) return;

        try {
            await fetch(`/api/carousel/${id}`, { method: 'DELETE' });
            onUpdate();
            alert('Carousel slide deleted successfully!');
        } catch (error) {
            console.error('Error deleting carousel slide:', error);
            alert('Error deleting carousel slide');
        }
    };

    const moveSlide = async (id, direction) => {
        const currentIndex = carouselList.findIndex(slide => slide.id === id);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === carouselList.length - 1)
        ) return;

        const newList = [...carouselList];
        const currentSlide = newList[currentIndex];
        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const swapSlide = newList[swapIndex];

        // Swap order_num values
        const tempOrderNum = currentSlide.order_num;
        currentSlide.order_num = swapSlide.order_num;
        swapSlide.order_num = tempOrderNum;

        try {
            // Update both slides using FormData
            await Promise.all([
                fetch(`/api/carousel/${currentSlide.id}`, {
                    method: 'PUT',
                    body: (() => {
                        const formData = new FormData();
                        formData.append('id', currentSlide.id);
                        formData.append('title', currentSlide.title);
                        formData.append('content', currentSlide.content);
                        formData.append('order_num', currentSlide.order_num);
                        return formData;
                    })()
                }),
                fetch(`/api/carousel/${swapSlide.id}`, {
                    method: 'PUT',
                    body: (() => {
                        const formData = new FormData();
                        formData.append('id', swapSlide.id);
                        formData.append('title', swapSlide.title);
                        formData.append('content', swapSlide.content);
                        formData.append('order_num', parseInt(swapSlide.order_num, 10));
                        return formData;
                    })()
                })
            ]);

            onUpdate();
        } catch (error) {
            console.error('Error reordering slides:', error);
            alert('Error reordering slides');
        }
    };

    const renderCarouselPreview = () => {
        if (carouselList.length === 0) return null;

        return (
            <div id="carouselPreview" className="carousel slide mb-4" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    {carouselList.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            data-bs-target="#carouselPreview"
                            data-bs-slide-to={index}
                            className={index === 0 ? 'active' : ''}
                            aria-current={index === 0 ? 'true' : 'false'}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
                <div className="carousel-inner">
                    {carouselList.map((slide, index) => (
                        <div key={slide.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                            <img
                                src={`/${slide.image_url}`}
                                className="d-block __w-100"
                                alt={slide.title}
                                style={{ height: '50px', objectFit: 'cover' }}
                            />
                            <div className="carousel-caption d-none d-md-block">
                                <h5>{slide.title}</h5>
                                <p>{slide.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselPreview" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselPreview" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        );
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Carousel Slides ({carouselList.length})</h4>
                <div className="d-flex gap-2">
                    <button
                        className={`btn btn-outline-secondary ${previewMode ? 'active' : ''}`}
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        {previewMode ? 'Exit Preview' : 'Preview Mode'}
                    </button>
                    {!editingCarousel && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setEditingCarousel({
                                title: '',
                                content: '',
                                image_url: null,
                                order_num: String(carouselList.length + 1),
                                imagePreviewUrl: null
                            })}
                        >
                            Add New Slide
                        </button>
                    )}
                </div>
            </div>

            {previewMode ? (
                renderCarouselPreview()
            ) : editingCarousel ? (
                <form onSubmit={handleCarouselSubmit} className="bg-light p-4 rounded">
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={editingCarousel.title}
                            onChange={handleCarouselChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Image</label>
                        <input
                            type="file"
                            className="form-control"
                            name="image_url"
                            onChange={handleCarouselChange}
                            accept="image/*"
                            required={!editingCarousel.id}
                        />
                    </div>
                    {(editingCarousel.imagePreviewUrl || editingCarousel.image_url) && (
                        <div className="mb-3">
                            <img
                                src={editingCarousel.imagePreviewUrl || `/${editingCarousel.image_url}`}
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
                            value={editingCarousel.content}
                            onChange={handleCarouselChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Order Number</label>
                        <input
                            type="number"
                            className="form-control"
                            name="order_num"
                            value={editingCarousel.order_num}
                            onChange={handleCarouselChange}
                            min="1"
                            required
                        />
                    </div>
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary">
                            Save Slide
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setEditingCarousel(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {carouselList.map((carousel, index) => (
                        <div key={carousel.id} className="col">
                            <div className="card h-100">
                                {carousel.image_url && (
                                    <img
                                        src={`/${carousel.image_url}`}
                                        className="card-img-top"
                                        alt={carousel.title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title mb-0">
                                            {carousel.title}
                                            <span className="badge bg-secondary ms-2">Order: {carousel.order_num}</span>
                                        </h5>
                                    </div>
                                    <p className="card-text">{carousel.content}</p>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setEditingCarousel({...carousel, imagePreviewUrl: null})}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteCarousel(carousel.id)}
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

export default CarouselEditor;
