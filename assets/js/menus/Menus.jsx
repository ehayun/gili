import React, { useState, useEffect } from 'react';

const Menus = () => {
    const [menus, setMenus] = useState([]);
    const [editingMenu, setEditingMenu] = useState(null);
    const [newMenu, setNewMenu] = useState({
        title: '',
        url: '',
        order_num: 0
    });

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await fetch('/api/menus');
            if (response.ok) {
                const data = await response.json();
                setMenus(data);
            }
        } catch (error) {
            console.error('שגיאה בטעינת התפריטים:', error);
        }
    };

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/menus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMenu),
            });

            if (response.ok) {
                await fetchMenus();
                setNewMenu({
                    title: '',
                    url: '',
                    order_num: 0
                });
            }
        } catch (error) {
            console.error('שגיאה ביצירת תפריט:', error);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const response = await fetch(`/api/menus/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingMenu),
            });

            if (response.ok) {
                await fetchMenus();
                setEditingMenu(null);
            }
        } catch (error) {
            console.error('שגיאה בעדכון תפריט:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק פריט תפריט זה?')) {
            return;
        }

        try {
            const response = await fetch(`/api/menus/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchMenus();
            }
        } catch (error) {
            console.error('שגיאה במחיקת תפריט:', error);
        }
    };

    const startEditing = (menu) => {
        setEditingMenu({ ...menu });
    };

    return (
        <div className="container mt-4" dir="rtl">
            <h2 className="mb-4">ניהול תפריט</h2>

            {/* טופס יצירת תפריט חדש */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">הוספת פריט תפריט חדש</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="כותרת"
                                value={newMenu.title}
                                onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="כתובת URL"
                                value={newMenu.url}
                                onChange={(e) => setNewMenu({ ...newMenu, url: e.target.value })}
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="סדר"
                                value={newMenu.order_num}
                                onChange={(e) => setNewMenu({ ...newMenu, order_num: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-primary w-100" onClick={handleCreate}>
                                הוסף תפריט
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* רשימת תפריטים */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">פריטי תפריט</h5>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>מזהה</th>
                            <th>כותרת</th>
                            <th>כתובת URL</th>
                            <th>סדר</th>
                            <th>פעולות</th>
                        </tr>
                        </thead>
                        <tbody>
                        {menus.map(menu => (
                            <tr key={menu.id}>
                                {editingMenu && editingMenu.id === menu.id ? (
                                    <>
                                        <td>{menu.id}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingMenu.title}
                                                onChange={(e) => setEditingMenu({ ...editingMenu, title: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingMenu.url}
                                                onChange={(e) => setEditingMenu({ ...editingMenu, url: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={editingMenu.order_num}
                                                onChange={(e) => setEditingMenu({ ...editingMenu, order_num: parseInt(e.target.value) })}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm ms-2"
                                                onClick={() => handleUpdate(menu.id)}
                                            >
                                                שמור
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setEditingMenu(null)}
                                            >
                                                ביטול
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{menu.id}</td>
                                        <td>{menu.title}</td>
                                        <td>{menu.url}</td>
                                        <td>{menu.order_num}</td>
                                        <td> 
                                            <button
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => startEditing(menu)}
                                            >
                                                עריכה
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(menu.id)}
                                            >
                                                מחיקה
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Menus;
