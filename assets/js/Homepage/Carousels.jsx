import React, {useEffect, useState} from "react";
import HebrewEditor from "../components/HebrewEditor";

const initialCarouselState = {
  id: null,
  title: "",
  image_url: "",
  content: "",
  order_num: 0,
};

const Carousels = () => {
  const [carousels, setCarousels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialCarouselState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Stores the file chosen by the user from the local drive
  const [uploadFile, setUploadFile] = useState(null);
  // Image preview URL (comes from the image_url field or generated from a local file)
  const [previewImage, setPreviewImage] = useState("");

  // Fetch carousels from /api/carousels (assumes an array or an object with a "rows" property)
  const fetchCarousels = async () => {
    try {
      const res = await fetch("/api/carousels");
      const data = await res.json();
      setCarousels(Array.isArray(data) ? data : data.rows || []);
    } catch (error) {
      console.error("Error fetching carousels:", error);
    }
  };

  // Load carousels on mount
  useEffect(() => {
    fetchCarousels();
  }, []);

  // When a URL is provided (and no file is chosen) update the preview image
  useEffect(() => {
    if (formData.image_url && !uploadFile) {
      setPreviewImage(formData.image_url);
    }
  }, [formData.image_url, uploadFile]);

  // File input change handler: store the file and generate a preview URL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  // Open modal for creating a new carousel item: reset form and preview
  const openCreateModal = () => {
    setFormData(initialCarouselState);
    setUploadFile(null);
    setPreviewImage("");
    setShowModal(true);
  };

  // Open modal for editing an existing carousel item
  const openEditModal = (item) => {
    setFormData(item);
    setUploadFile(null);
    setPreviewImage(item.image_url || "");
    setShowModal(true);
  };

  // Handle text input changes for any field
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle content updates from the HebrewEditor (rich text editor)
  const handleContentChange = (content) => {
    setFormData((prevData) => ({
      ...prevData,
      content: content,
    }));
  };

  // Submit handler: if a file is provided, send all data in a single FormData request.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let method = formData.id ? "PUT" : "POST";
      let url = formData.id ? `/api/carousels/${formData.id}` : "/api/carousels";

      // If a file is selected, create a FormData object with all the fields.
      if (uploadFile) {
        const fd = new FormData();
        fd.append("title", formData.title);
        fd.append("image_url", formData.image_url); // optional text URL if provided
        fd.append("content", formData.content);
        fd.append("order_num", formData.order_num);
        // Append the file under "image"
        fd.append("image", uploadFile);
        if (formData.id) {
          fd.append("id", formData.id);
        }
        const res = await fetch(url, {
          method,
          body: fd,
          // The browser will set the appropriate Content-Type boundary for multipart/form-data
        });
        if (!res.ok) throw new Error("Network response was not ok");
      } else {
        // Otherwise send a JSON payload
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Network response was not ok");
      }

      // Refresh the list and close the modal
      await fetchCarousels();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving carousel:", error);
    } finally {
      setIsSubmitting(false);
      setUploadFile(null);
    }
  };

  // Delete a carousel given its id
  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הקרוסלה?")) return;
    try {
      const res = await fetch(`/api/carousels/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchCarousels();
    } catch (error) {
      console.error("Error deleting carousel:", error);
    }
  };

  return (
      <div className="container mt-4">

        {/* Carousels List */}
        <table className="table table-striped">
          <thead>
          <tr>
            <th>כותרת</th>
            <th>תמונה</th>
            <th>סדר</th>
            <th>
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                הוסף קרוסלה
              </button>
            </th>
          </tr>
          </thead>
          <tbody>
          {carousels.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>
                  {item.image_url ? (
                      <img
                          src={item.image_url}
                          alt={item.title}
                          style={{width: "60px"}}
                          className="img-thumbnail"
                      />
                  ) : (
                      "אין תמונה"
                  )}
                </td>
                <td>{item.order_num}</td>
                <td>
                  <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => openEditModal(item)}
                  >
                    ערוך
                  </button>
                  <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                  >
                    מחק
                  </button>
                </td>
              </tr>
          ))}
          {carousels.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  אין קרוסלות זמינות.
                </td>
              </tr>
          )}
          </tbody>
        </table>

        {/* Bootstrap 5 Modal for create/update */}
        {showModal && (
            <>
              <div className="modal show fade" style={{display: "block"}}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                      <div className="modal-header">
                        <h5 className="modal-title">
                          {formData.id ? "ערוך קרוסלה" : "הוסף קרוסלה"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-10 mb-3">
                        {/* Title Input */}
                          <label className="form-label">כותרת</label>
                          <input
                              type="text"
                              className="form-control"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                          />
                        </div>
                          {/* Order Number */}
                          <div className="col-md-2 mb-3">
                            <label className="form-label">סדר</label>
                            <input
                                type="number"
                                className="form-control"
                                name="order_num"
                                value={formData.order_num}
                                onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        {/* Image URL Input */}
                        <div className="mb-3 hidden">
                          <label className="form-label">קישור לתמונה</label>
                          <input
                              type="text"
                              className="form-control"
                              name="image_url"
                              value={formData.image_url}
                              onChange={handleInputChange}
                          />
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                          {/* File Upload Input */}
                            <label className="form-label">העלה תמונה</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                          </div>

                          {/* Image Preview */}
                          <div className="col-md-6  mb-3">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt={formData.title || "תצוגה"}
                                    style={{maxWidth: "100px", height: "auto"}}
                                    className="img-thumbnail"
                                />
                            ) : (
                                <p className="text-muted">אין תצוגה מקדימה לתמונה</p>
                            )}
                          </div>
                        </div>



                        {/* Content Editor */}
                        <div className="mb-3">
                          <label className="form-label">תוכן</label>
                          <HebrewEditor
                              value={formData.content}
                              onChange={handleContentChange}
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowModal(false)}
                        >
                          סגור
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                          {isSubmitting ? "שומר..." : "שמור"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              {/* Modal backdrop */}
              <div
                  className="modal-backdrop fade show"
                  onClick={() => setShowModal(false)}
              ></div>
            </>
        )}
      </div>
  );
};

export default Carousels;
