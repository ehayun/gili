import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import HebrewEditor from '../components/HebrewEditor';

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState({
    id: 0,
    slug: '',
    title: '',
    imageURL: '',
    content: '',
    keywords: '',
    menuID: null,
    parentID: null
  });
  const [menus, setMenus] = useState([]);
  const [parentPages, setParentPages] = useState([]);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch pages, menus, and parent pages on component mount
  useEffect(() => {
    fetchPages();
    fetchMenus();

    // Set up Bootstrap modal event listener to reset form on modal hide
    const pageModal = document.getElementById('pageModal');
    if (pageModal) {
      pageModal.addEventListener('hidden.bs.modal', resetForm);
    }

    return () => {
      // Clean up event listener on component unmount
      if (pageModal) {
        pageModal.removeEventListener('hidden.bs.modal', resetForm);
      }
    };
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get('/api/pages');
      // Extract data from the rows field
      const pagesData = response.data.rows || [];
      setPages(pagesData);
      setFilteredPages(pagesData);
      setParentPages(pagesData);
    } catch (error) {
      console.error('Error fetching pages:', error);
      alert('נכשל בטעינת דפים. אנא נסה שוב.');
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await axios.get('/api/menus');
      // Extract data from the rows field
      const menusData = response.data || [];
      setMenus(menusData);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredPages(pages);
    } else {
      const filtered = pages.filter(
          page =>
              page.title.toLowerCase().includes(term.toLowerCase()) ||
              page.slug.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPages(filtered);
    }
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setCurrentPage({...currentPage, [name]: value});
  };

  const handleContentChange = (content) => {
    setCurrentPage({...currentPage, content});
  };

  const handleSelectChange = (e) => {
    const {name, value} = e.target;
    const numValue = value === '' ? null : parseInt(value, 10);
    setCurrentPage({...currentPage, [name]: numValue});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCurrentPage({
      id: 0,
      slug: '',
      title: '',
      imageURL: '',
      content: '',
      keywords: '',
      menuID: null,
      parentID: null
    });
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setModalMode('add');
  };

  const openAddModal = () => {
    // Make sure we reset the form completely before showing the modal
    resetForm();
  };

  const openEditModal = (page) => {
    // First reset any previous data
    resetForm();

    // Then set the current page data
    setCurrentPage({
      id: page.id,
      slug: page.slug,
      title: page.title,
      imageURL: page.image_url,
      content: page.content,
      keywords: page.keywords,
      menuID: page.menu_id,
      parentID: page.parent_id
    });
    setImagePreview(page.image_url);
    setModalMode('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create initial pageData without the image URL
      const pageData = {
        id: currentPage.id,
        slug: currentPage.slug,
        title: currentPage.title,
        image_url: currentPage.imageURL, // Use existing imageURL initially
        content: currentPage.content,
        keywords: currentPage.keywords,
        menu_id: currentPage.menuID,
        parent_id: currentPage.parentID
      };

      let response;
      let createdPage;

      // First save the page to get an ID (for new pages)
      if (modalMode === 'add') {
        response = await axios.post('/api/pages', pageData);
        createdPage = response.data;
      } else {
        response = await axios.put(`/api/pages/${currentPage.id}`, pageData);
        createdPage = response.data;
      }

      // Now that we have a page ID, upload the image if one was selected
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        const formData = new FormData();
        formData.append('image', fileInputRef.current.files[0]);
        formData.append('pageId', createdPage.id); // Pass the page ID to the upload endpoint

        try {
          const uploadResponse = await axios.post('/api/pages/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          // Update the page with the new image URL if upload was successful
          if (uploadResponse.data && uploadResponse.data.imageUrl) {
            const updateImageData = {
              ...pageData,
              id: createdPage.id,
              image_url: uploadResponse.data.imageUrl
            };

            await axios.put(`/api/pages/${createdPage.id}`, updateImageData);
            console.log('Page image updated:', uploadResponse.data.imageUrl);
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('הדף נשמר אך העלאת התמונה נכשלה. אנא נסה לערוך את הדף כדי להעלות את התמונה שוב.');
        }
      }

      // Refresh the page list
      fetchPages();

      // Close the modal
      const cancelButton = document.getElementById("m-cancel");
      if (cancelButton) {
        cancelButton.click();
      }

      // Reset the form
      resetForm();
    } catch (error) {
      console.error('Error saving page:', error);
      alert('נכשל בשמירת הדף. אנא נסה שוב.');
    }
  };

  const handleDelete = async (pageId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק דף זה?')) {
      try {
        await axios.delete(`/api/pages/${pageId}`);
        fetchPages();
      } catch (error) {
        console.error('Error deleting page:', error);
        alert('נכשל במחיקת הדף. אנא נסה שוב.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
      <div className="container-fluid mt-4">
        <div className="row mb-4">
          <div className="col">
            <h2>ניהול דפים</h2>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
              <input
                  type="text"
                  className="form-control"
                  placeholder="חפש דפים לפי כותרת או נתיב..."
                  value={searchTerm}
                  onChange={handleSearch}
              />
            </div>
          </div>
          <div className="col-md-6 text-end">
            <button
                className="btn btn-primary"
                onClick={openAddModal}
                data-bs-toggle="modal"
                data-bs-target="#pageModal"
            >
              <i className="bi bi-plus-circle me-1"></i> הוסף דף חדש
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                <tr>
                  <th>מזהה</th>
                  <th>כותרת</th>
                  <th>נתיב</th>
                  <th>תפריט</th>
                  <th>דף אב</th>
                  <th>עודכן בתאריך</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                {filteredPages.length > 0 ? (
                    filteredPages.map(page => (
                        <tr key={page.id}>
                          <td>{page.id}</td>
                          <td>{page.title}</td>
                          <td>{page.slug}</td>
                          <td>{page.menu ? page.menu.name : '-'}</td>
                          <td>{page.parent ? page.parent.title : '-'}</td>
                          <td>{formatDate(page.updated_at)}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openEditModal(page)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#pageModal"
                              >
                                <i className="bi bi-pencil"></i> ערוך
                              </button>
                              <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(page.id)}
                              >
                                <i className="bi bi-trash"></i> מחק
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        {searchTerm ? 'לא נמצאו דפים התואמים את החיפוש שלך' : 'אין דפים זמינים'}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Page Modal - Add/Edit */}
        <div
            className="modal fade"
            id="pageModal"
            tabIndex="-1"
            aria-labelledby="pageModalLabel"
            aria-hidden="true"
            ref={modalRef}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="pageModalLabel">
                  {modalMode === 'add' ? 'הוסף דף חדש' : 'ערוך דף'}
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
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
                    <label htmlFor="image" className="form-label">תמונה</label>
                    <div className="input-group">
                      <input
                          type="file"
                          className="form-control"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                      />
                      <label className="input-group-text" htmlFor="image">
                        <i className="bi bi-upload"></i>
                      </label>
                    </div>

                    {/* Image URL field (hidden but maintained for compatibility) */}
                    <input
                        type="hidden"
                        id="imageURL"
                        name="imageURL"
                        value={currentPage.imageURL}
                        onChange={handleInputChange}
                    />

                    {/* Image preview */}
                    {imagePreview && (
                        <div className="mt-2">
                          <img
                              src={imagePreview}
                              alt="תצוגה מקדימה"
                              className="img-thumbnail"
                              style={{maxHeight: '200px'}}
                          />
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

                  <div className="mb-3">
                    <label htmlFor="keywords" className="form-label">מילות מפתח</label>
                    <input
                        type="text"
                        className="form-control"
                        id="keywords"
                        name="keywords"
                        value={currentPage.keywords}
                        onChange={handleInputChange}
                    />
                    <div className="form-text">רשימת מילות מפתח מופרדות בפסיקים עבור SEO</div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="menuID" className="form-label">תפריט</label>
                      <select
                          className="form-select"
                          id="menuID"
                          name="menuID"
                          value={currentPage.menuID || ''}
                          onChange={handleSelectChange}
                      >
                        <option value="">ללא</option>
                        {menus.map(menu => (
                            <option key={menu.id} value={menu.id}>{menu.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="parentID" className="form-label">דף אב</label>
                      <select
                          className="form-select"
                          id="parentID"
                          name="parentID"
                          value={currentPage.parentID || ''}
                          onChange={handleSelectChange}
                      >
                        <option value="">ללא</option>
                        {parentPages.filter(p => p.id !== currentPage.id).map(page => (
                            <option key={page.id} value={page.id}>{page.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" id="m-cancel">ביטול
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'add' ? 'הוסף דף' : 'שמור שינויים'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Pages;
