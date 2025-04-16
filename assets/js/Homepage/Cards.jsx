import React, {useEffect, useState} from "react";
import Select from "react-select";
import HebrewEditor from "../components/HebrewEditor";

// Define an initial empty card state
const initialCardState = {
  id: null,
  title: "",
  image_url: "",
  menu_id: null,
  content: "",
  order_num: 0,
};

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [menus, setMenus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialCardState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Stores the file chosen from the local drive
  const [uploadFile, setUploadFile] = useState(null);
  // Preview image URL (either from text input or generated from file)
  const [previewImage, setPreviewImage] = useState("");

  // Fetch menus from /api/menus
  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      const data = await res.json();
      setMenus(data); // assuming data is an array of menus
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  // Fetch cards from /api/cards and extract the rows property
  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data.rows || []);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  // Initialize menus and cards on mount
  useEffect(() => {
    fetchMenus();
    fetchCards();
  }, []);

  // Update preview from image_url if no file is chosen
  useEffect(() => {
    if (formData.image_url && !uploadFile) {
      setPreviewImage(formData.image_url);
    }
  }, [formData.image_url, uploadFile]);

  // Handle file input change: store the file and update the preview URL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  // Open modal for creating a new card: reset form state and preview
  const openCreateModal = () => {
    setFormData(initialCardState);
    setUploadFile(null);
    setPreviewImage("");
    setShowModal(true);
  };

  // Open modal for editing an existing card: populate formData and preview
  const openEditModal = (card) => {
    setFormData(card);
    setUploadFile(null);
    setPreviewImage(card.image_url || "");
    setShowModal(true);
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle react-select changes for menu
  const handleMenuChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      menu_id: selectedOption ? selectedOption.value : null,
    }));
  };

  // Handle content changes from HebrewEditor
  const handleContentChange = (content) => {
    setFormData((prevData) => ({
      ...prevData,
      content: content,
    }));
  };

  // Submit form for creating/updating a card. If a file is provided, use FormData to send all data together.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let method = formData.id ? "PUT" : "POST";
      let url = formData.id ? `/api/cards/${formData.id}` : "/api/cards";

      // If a file is selected, send as FormData
      if (uploadFile) {
        const fd = new FormData();
        // Append all the card fields
        fd.append("title", formData.title);
        fd.append("image_url", formData.image_url); // Optional extra URL provided
        fd.append("menu_id", formData.menu_id);
        fd.append("content", formData.content);
        fd.append("order_num", formData.order_num);
        // Include the file (for the server, the key is "image")
        fd.append("image", uploadFile);
        // If editing, include id if needed
        if (formData.id) {
          fd.append("id", formData.id);
        }
        const res = await fetch(url, {
          method,
          body: fd,
          // Do not set Content-Type: the browser adds the correct boundary for multipart requests.
        });
        if (!res.ok) throw new Error("Network response was not ok");
      } else {
        // Otherwise send JSON data
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Network response was not ok");
      }
      // Refresh the card list and close the modal
      await fetchCards();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving card:", error);
    } finally {
      setIsSubmitting(false);
      setUploadFile(null);
    }
  };

  // Delete a card given its id
  const handleDelete = async (cardId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הכרטיס?")) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete the card");
      await fetchCards();
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  // Build react-select options based on menus data
  const menuOptions = menus.map((menu) => ({
    value: menu.id,
    label: menu.title,
  }));

  // Determine selected menu option if editing a card
  const selectedMenuOption =
      menuOptions.find((option) => option.value === formData.menu_id) || null;

  return (
      <div className="container mt-4">

        {/* Cards List */}
        <table className="table table-striped">
          <thead>
          <tr>
            <th>כותרת</th>
            <th>תמונה</th>
            <th>תפריט</th>
            <th>סדר</th>
            <th>
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                הוסף כרטיס
              </button>
            </th>
          </tr>
          </thead>
          <tbody>
          {cards.map((card) => (
              <tr key={card.id}>
                <td>{card.title}</td>
                <td>
                  {card.image_url ? (
                      <img
                          src={card.image_url}
                          alt={card.title}
                          style={{width: "60px"}}
                          className="img-thumbnail"
                      />
                  ) : (
                      "אין תמונה"
                  )}
                </td>
                <td>{card.menu ? card.menu.title : "לא זמין"}</td>
                <td>{card.order_num}</td>
                <td>
                  <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => openEditModal(card)}
                  >
                    ערוך
                  </button>
                  <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(card.id)}
                  >
                    מחק
                  </button>
                </td>
              </tr>
          ))}
          {cards.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">
                  אין כרטיסים זמינים.
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
                          {formData.id ? "ערוך כרטיס" : "הוסף כרטיס"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        {/* Title Input */}
                        <div className="mb-3">
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
                          {/* File Upload Input */}
                          <div className="col-md-6 mb-3">
                            <label className="form-label">העלה תמונה</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                          </div>

                          {/* Image Preview */}
                          <div className="col-md-6 mb-3">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt={formData.title || "תצוגה מקדימה"}
                                    style={{maxWidth: "100px", height: "auto"}}
                                    className="img-thumbnail"
                                />
                            ) : (
                                <p className="text-muted">אין תצוגה מקדימה לתמונה</p>
                            )}
                          </div>
                        </div>

                        {/* Menu Selection and Order Number on the same row */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">תפריט</label>
                            <Select
                                options={menuOptions}
                                value={selectedMenuOption}
                                onChange={handleMenuChange}
                                isClearable
                            />
                          </div>
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


                        {/* Content Editor using HebrewEditor */}
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

export default Cards;
