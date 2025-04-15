import React, { useEffect, useState } from 'react';
import HebrewEditor from '../components/HebrewEditor';

function Pages() {
  const [pages, setPages] = useState([]);
  const [menus, setMenus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // new state for search
  const [pageForm, setPageForm] = useState({
    id: null,
    slug: '',
    title: '',
    keywords: '',
    menu_id: '',
    parent_id: '',
    image_url: '',
    imageFile: null,
    content: '',
  });

  // Fetch pages and menus on component mount.
  useEffect(() => {
    fetchPages();
    fetchMenus();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const data = await response.json();
      // Assumes pages are returned in data.rows; if not, use data directly.
      setPages(data.rows || data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      const data = await response.json();
      setMenus(data);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  // Open modal with fields filled for edit.
  const handleOpenModalForEdit = (page) => {
    setPageForm({
      id: page.id,
      slug: page.slug,
      title: page.title,
      keywords: page.keywords,
      menu_id: page.menu ? page.menu.id : '',
      parent_id: page.parent ? page.parent.id : '',
      image_url: page.image_url,
      imageFile: null, // Reset file field
      content: page.content,
    });
    setIsEdit(true);
    setShowModal(true);
  };

  // Open modal with empty fields for create.
  const handleOpenModalForCreate = () => {
    setPageForm({
      id: null,
      slug: '',
      title: '',
      keywords: '',
      menu_id: '',
      parent_id: '',
      image_url: '',
      imageFile: null,
      content: '',
    });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle changes for text inputs and select dropdowns.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPageForm({ ...pageForm, [name]: value });
  };

  // Handle file input changes.
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPageForm({ ...pageForm, imageFile: file });
  };

  // Save the page (create or update) using FormData.
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('slug', pageForm.slug);
      formData.append('title', pageForm.title);
      formData.append('keywords', pageForm.keywords);
      formData.append('image_url', pageForm.image_url);
      formData.append('menu_id', pageForm.menu_id);
      formData.append('parent_id', pageForm.parent_id);
      formData.append('content', pageForm.content);
      if (pageForm.imageFile) {
        formData.append('image', pageForm.imageFile);
      }
      console.log('FormData:', pageForm);
      // If editing, assume PUT to /api/pages/:id; otherwise, POST to /api/pages.
      let url = '/manager/pages';
      let method = 'POST';
      if (isEdit && pageForm.id) {
        url = `/manager/pages/${pageForm.id}`;
        method = 'PUT';
      }
      const response = await fetch(url, {
        method,
        body: formData,
      });
      if (response.ok) {
        fetchPages();
        handleCloseModal();
      } else {
        console.error('Error saving page:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  // New delete function to remove a page.
  const handleDelete = async (pageId) => {
    // Optional: Add a confirmation dialog.
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הדף הזה?")) {
      return;
    }
    try {
      const response = await fetch(`/manager/pages/${pageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Refresh the pages list after successful deletion.
        fetchPages();
      } else {
        console.error('Error deleting page:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  // Filter pages based on search term.
  const filteredPages = pages.filter((page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">עמודים</h2>
          <div className="d-flex align-items-center">
            <input
                type="text"
                className="form-control me-2"
                style={{ width: "200px" }}
                placeholder="חיפוש"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleOpenModalForCreate}>
              צור חדש
            </button>
          </div>
        </div>
        <table className="table table-bordered">
          <thead>
          <tr>
            <th>כותרת</th>
            <th>תפריט</th>
            <th>דף אב</th>
            <th>תמונה</th>
            <th>פעולות</th>
          </tr>
          </thead>
          <tbody>
          {filteredPages.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td>{page.menu ? page.menu.title : ''}</td>
                <td>{page.parent ? page.parent.title : ''}</td>
                <td>
                  {page.image_url && (
                      <img src={page.image_url} alt="" style={{ width: '40px' }} />
                  )}
                </td>
                <td>
                  <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleOpenModalForEdit(page)}
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
          ))}
          </tbody>
        </table>

        {/* Modal for create/edit page */}
        {showModal && (
            <div className="modal show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-xl" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{isEdit ? 'ערוך דף' : 'צור דף'}</h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <div className="mb-3 hidden">
                        <label className="form-label">כתובת</label>
                        <input
                            type="text"
                            className="form-control"
                            name="slug"
                            value={pageForm.slug}
                            onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">כותרת</label>
                        <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={pageForm.title}
                            onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">תוכן</label>
                        <HebrewEditor
                            value={pageForm.content}
                            onChange={(value) => setPageForm({ ...pageForm, content: value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">מילות מפתח</label>
                        <input
                            type="text"
                            className="form-control"
                            name="keywords"
                            value={pageForm.keywords}
                            onChange={handleChange}
                        />
                      </div>
                      {/* New row for Menu and Parent fields */}
                      <div className="mb-3 row">
                        <div className="col-md-6">
                          <label className="form-label">תפריט</label>
                          <select
                              className="form-select"
                              name="menu_id"
                              value={pageForm.menu_id}
                              onChange={handleChange}
                          >
                            <option value="">בחר תפריט</option>
                            {menus.map((menu) => (
                                <option key={menu.id} value={menu.id}>
                                  {menu.title}
                                </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">דף אב</label>
                          <select
                              className="form-select"
                              name="parent_id"
                              value={pageForm.parent_id}
                              onChange={handleChange}
                          >
                            <option value="">ללא</option>
                            {pages
                                .filter((p) => !isEdit || p.id !== pageForm.id)
                                .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.title}
                                    </option>
                                ))}
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">העלאת תמונה</label>
                        <input
                            type="file"
                            className="form-control"
                            name="image"
                            onChange={handleFileChange}
                        />
                      </div>
                      {pageForm.image_url && !pageForm.imageFile && (
                          <div className="mb-3">
                            <p>תמונה נוכחית:</p>
                            <img src={pageForm.image_url} alt="Current" style={{ width: '100px' }} />
                          </div>
                      )}
                      {pageForm.imageFile && (
                          <div className="mb-3">
                            <p>תצוגה מקדימה:</p>
                            <img
                                src={URL.createObjectURL(pageForm.imageFile)}
                                alt="Preview"
                                style={{ width: '100px' }}
                            />
                          </div>
                      )}
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      סגור
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave}>
                      שמירת שינויים
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default Pages;
