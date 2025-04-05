import React, { useState, useEffect } from 'react';

function Users() {
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        first_name: '',
        last_name: '',
        email: '',
        updated_password: '',  // Added updated_password field
        role: '',
        is_admin: false
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            console.log('Fetched users:', data);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('שגיאה בעת טעינת המשתמשים');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const url = selectedUser ? `/manager/users/${selectedUser.id}` : '/manager/users';
            const method = selectedUser ? 'PUT' : 'POST';

            // Remove ID field if creating new user
            const submitData = selectedUser ? {
                ...formData,
                // Only include updated_password if it's been changed (not empty)
                ...(formData.updated_password ? { updated_password: formData.updated_password } : {})
            } : {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                updated_password: formData.updated_password,  // Always include updated_password for new users
                is_admin: formData.is_admin
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) throw new Error('Operation failed');

            await fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.log('Error saving user:', error);
            setMessage('שגיאה בשמירת המשתמש. יתכן שכבר קיים משתמש עם מייל כזה. ');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('האם אתם בטוחים שברצונכם למחוק משתמש זה?')) return;

        try {
            const response = await fetch(`/manager/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Delete failed');

            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessage('שגיאה בעת מחיקת המשתמש');
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            updated_password: '',  // Reset updated_password field when editing
            is_admin: user.is_admin || user.role === 'admin',
            role: user.role
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setFormData({
            id: null,
            last_name: '',
            first_name: '',
            email: '',
            updated_password: '',
            is_admin: false,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            id: null,
            last_name: '',
            first_name: '',
            email: '',
            updated_password: '',
            is_admin: false,
        });
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>ניהול משתמשים</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    הוספת משתמש חדש
                </button>
            </div>

            {/* Users Table */}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>שם מלא</th>
                        <th>אימייל</th>
                        <th>תפקיד</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.last_name} {user.first_name}</td>
                            <td>{user.email}</td>
                            <td>{user.is_admin  ? 'מנהל מערכת' : 'משתמש רגיל'}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => handleEdit(user)}
                                >
                                    עדכון
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    מחיקה
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            <div className={`modal fade ${showModal ? 'show' : ''}`}
                 style={{ display: showModal ? 'block' : 'none' }}
                 tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {selectedUser ? 'עדכון משתמש' : 'הוספת משתמש חדש'}
                            </h5>
                            <div>
                                {message}
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleCloseModal}
                                aria-label="Close"
                            ></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {selectedUser && (
                                    <div className="mb-3 hidden">
                                        <label className="form-label">ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.id}
                                            disabled
                                        />
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label htmlFor="first_name" className="form-label">שם פרטי</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="first_name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="last_name" className="form-label">שם משפחה</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="last_name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">אימייל</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="updated_password" className="form-label">
                                        {selectedUser ? 'סיסמה (השאר ריק כדי לא לשנות)' : 'סיסמה'}
                                    </label>
                                    <input
                                        type="updated_password"
                                        className="form-control"
                                        id="updated_password"
                                        value={formData.updated_password}
                                        onChange={(e) => setFormData({...formData, updated_password: e.target.value})}
                                        required={!selectedUser}  // Only required for new users
                                    />
                                </div>
                                <div className="mb-3">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_admin"
                                            checked={formData.is_admin ||formData.role === 'admin'}
                                            onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
                                        />
                                        <label className="form-check-label" htmlFor="is_admin">
                                            מנהל מערכת
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    ביטול
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {selectedUser ? 'עדכון' : 'הוספה'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop */}
            {showModal && (
                <div className="modal-backdrop fade show"></div>
            )}
        </div>
    );
}

export default Users;
