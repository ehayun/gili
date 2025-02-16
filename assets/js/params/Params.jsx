import React, { useState, useEffect } from 'react';

const Params = () => {
    const [params, setParams] = useState({
        main_title: '',
        sub_title: '',
        phone: '',
        email: '',
        address: '',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchParams();
    }, []);

    const fetchParams = async () => {
        try {
            const response = await fetch('/api/params');
            if (!response.ok) {
                throw new Error('Failed to fetch parameters');
            }
            const data = await response.json();
            setParams(data);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/params', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error('Failed to update parameters');
            }

            setIsEditing(false);
            const updatedData = await response.json();
            setParams(updatedData);
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">טוען...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="container mt-4" dir="rtl">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">עדכון פרמטרים</h5>
                    <button
                        className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'ביטול' : 'עריכה'}
                    </button>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">כותרת ראשית</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="main_title"
                                    value={params.main_title}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">כותרת משנית</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="sub_title"
                                    value={params.sub_title}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">טלפון</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="phone"
                                    value={params.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">דוא״ל</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={params.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">כתובת</label>
                                <textarea
                                    className="form-control"
                                    name="address"
                                    value={params.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    rows="2"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">פייסבוק</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="facebook"
                                    value={params.facebook}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">טוויטר</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="twitter"
                                    value={params.twitter}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">אינסטגרם</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="instagram"
                                    value={params.instagram}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">לינקדאין</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="linkedin"
                                    value={params.linkedin}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            {isEditing && (
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary">
                                        שמור שינויים
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Params;
