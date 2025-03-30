import React, { useState, useEffect } from 'react';
import HebrewEditor from '../components/HebrewEditor';
import Pagination from '../components/Pagination';

const Pages = () => {
    // State management
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState({
        id: 0,
        slug: '',
        title: '',
        image_url: '',
        content: '',
        menu_id: 0
    });
    const [menus, setMenus] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [paging, setPaging] = useState({
        page: 1,
        limit: 10,
        total_rows: 0,
        total_pages: 0,
        next_page: 1,
        prev_page: 1,
        pages: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Fetch pages on component mount
    useEffect(() => {
        fetchPages(1);
        fetchMenus();
    }, []);

    // Fetch pages from API
    const fetchPages = async (page = 1) => {
        try {
            const response = await fetch(`/api/pages?page=${page}&limit=${paging.limit}&search=${searchTerm}`);
            const data = await response.json();
            setPages(data.rows);
            setPaging({
                ...data,
                rows: undefined
            });
        } catch (error) {
            console.error('שגיאה בטעינת דפים:', error);
        }
    };

    // Fetch menus for dropdown
    const fetchMenus = async () => {
        try {
            const response = await fetch('/api/menus');
            const data = await response.json();
            data.unshift({ id: 0, title: 'ללא תפריט' });
            setMenus(data);
        } catch (error) {
            console.error('שגיאה בטעינת תפריטים:', error);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle rich text editor content changes
    const handleContentChange = (content) => {
        setCurrentPage(prev => ({
            ...prev,
            content
        }));
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // Start creating a new page
    const handleNewPage = () => {
        resetForm();
        setIsCreating(true);
    };

    // Submit form (create or update)
    const handleSubmit = async (e) => {
        console.log("handleSubmit");
        e.preventDefault();

        // Create FormData object for file upload
        const formData = new FormData();

        // Add all page fields
        Object.keys(currentPage).forEach(key => {
            formData.append(key, currentPage[key]);
        });

        // Add image file if selected
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const url = isEditing
                ? `/api/pages/${currentPage.id}`
                : '/api/pages';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                resetForm();
                fetchPages(paging.page);
            } else {
                alert(result.message || 'אירעה שגיאה');
            }
        } catch (error) {
            console.error('שגיאה בשמירת דף:', error);
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setCurrentPage({
            id: 0,
            slug: '',
            title: '',
            image_url: '',
            content: '',
            menu_id: 0
        });
        setImageFile(null);
        setIsEditing(false);
        setIsCreating(false);
        setShowPreview(false);
    };

    // Edit a page
    const handleEdit = (page) => {
        setCurrentPage(page);
        setIsEditing(true);
        setIsCreating(false);
        window.scrollTo(0, 0);
    };

    // Delete a page
    const handleDelete = async (id) => {
        if (!confirm('האם אתה בטוח שברצונך למחוק דף זה?')) {
            return;
        }

        try {
            const response = await fetch(`/api/pages/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                fetchPages(paging.page);
            } else {
                alert(result.message || 'אירעה שגיאה');
            }
        } catch (error) {
            console.error('שגיאה במחיקת דף:', error);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Submit search form
    const submitSearch = (e) => {
        e.preventDefault();
        fetchPages(1);
    };

    // Set page class for pagination
    const setPageClass = (p, current) => {
        return p === current ? "page-item active" : "page-item";
    };

    return (
        <div className="container-fluid mt-4" dir="rtl">
            <h2 className="mb-4">ניהול דפים</h2>

            {/* Search Form */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={submitSearch} className="row">
                        <div className="col-md-8">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="חפש לפי כותרת או מזהה..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="col-md-4">
                            <button type="submit" className="btn btn-primary">חיפוש</button>
                            <button type="button" className="btn btn-secondary me-2" onClick={() => {
                                setSearchTerm('');
                                fetchPages(1);
                            }}>איפוס</button>
                            <button type="button" className="btn btn-success" onClick={handleNewPage}>
                                דף חדש
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Form - only visible when editing or creating */}
            {(isEditing || isCreating) && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h4>{isEditing ? 'עריכת דף' : 'הוספת דף חדש'}</h4>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">כותרת</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    name="title"
                                    value={currentPage.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="menu_id" className="form-label">תפריט</label>
                                <select
                                    className="form-select"
                                    id="menu_id"
                                    name="menu_id"
                                    value={currentPage.menu_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">בחר תפריט</option>
                                    {menus.map(menu => (
                                        <option key={menu.id} value={menu.id}>{menu.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="image" className="form-label">תמונה</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="image"
                                    onChange={handleImageChange}
                                />
                                {(currentPage.image_url || imageFile) && (
                                    <div className="mt-2">
                                        {currentPage.image_url && !imageFile && (
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-info mb-2"
                                                    onClick={() => setShowPreview(!showPreview)}
                                                >
                                                    {showPreview ? 'הסתר' : 'הצג'} תמונה נוכחית
                                                </button>
                                                {showPreview && (
                                                    <div>
                                                        <img
                                                            src={currentPage.image_url}
                                                            alt="נוכחי"
                                                            className="img-thumbnail"
                                                            style={{ maxWidth: '200px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {imageFile && (
                                            <small className="text-muted">
                                                תמונה חדשה נבחרה: {imageFile.name}
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="content" className="form-label">תוכן</label>
                                <HebrewEditor
                                    value={currentPage.content}
                                    onChange={handleContentChange}
                                />
                            </div>

                            <div className="d-flex justify-content-between">
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'עדכון' : 'שמירה'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={resetForm}
                                >
                                    ביטול
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pages List */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4>רשימת דפים</h4>
                    {!isEditing && !isCreating && (
                        <button
                            className="btn btn-success"
                            onClick={handleNewPage}
                        >
                            דף חדש
                        </button>
                    )}
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th>מזהה</th>
                                <th>כותרת</th>
                                <th>מזהה URL</th>
                                <th>תפריט</th>
                                <th>פעולות</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pages.length > 0 ? (
                                pages.map(page => (
                                    <tr key={page.id}>
                                        <td>{page.id}</td>
                                        <td>{page.title}</td>
                                        <td>{page.slug}</td>
                                        <td>
                                            {menus.find(m => m.id === page.menu_id)?.title || 'לא זמין'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-info ms-2"
                                                onClick={() => handleEdit(page)}
                                            >
                                                עריכה
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(page.id)}
                                            >
                                                מחיקה
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        לא נמצאו דפים
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pages.length > 0 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination
                                pages={paging.pages || []}
                                Paging={paging}
                                Filter={fetchPages}
                                setPageClass={setPageClass}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pages;
