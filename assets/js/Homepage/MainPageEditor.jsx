import React, { useState, useEffect } from 'react';
import CardEditor from './CardEditor';
import CarouselEditor from './CarouselEditor';

const MainPageEditor = () => {
    const [activeTab, setActiveTab] = useState('main');
    const [mainPage, setMainPage] = useState({
        page: {
            title: '',
            content: '',
            image_url: '',
            slug: 'main'
        },
        carousels: [],
        cards: []
    });

    useEffect(() => {
        fetchMainPage();
    }, []);

    const fetchMainPage = async () => {
        try {
            const response = await fetch('/api/main-page');
            const data = await response.json();
            setMainPage(data);
        } catch (error) {
            console.error('Error fetching main page:', error);
        }
    };

    const handleMainContentSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/pages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mainPage.page)
            });
        } catch (error) {
            console.error('Error updating main content:', error);
            alert('Error updating main content');
        }
    };

    const handleMainContentChange = (e) => {
        const { name, value } = e.target;
        setMainPage(prev => ({
            ...prev,
            page: {
                ...prev.page,
                [name]: value
            }
        }));
    };

    return (
        <div className="container-fluid mt-4">
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'main' ? 'active' : ''}`}
                        onClick={() => setActiveTab('main')}>
                        Main Content
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'carousel' ? 'active' : ''}`}
                        onClick={() => setActiveTab('carousel')}>
                        Carousel Images
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}>
                        Cards
                    </button>
                </li>
            </ul>

            <div className="tab-content">
                {activeTab === 'main' && (
                    <div className="tab-pane active">
                        <form onSubmit={handleMainContentSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={mainPage.page.title}
                                    onChange={handleMainContentChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Image URL</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="image_url"
                                    value={mainPage.page.image_url}
                                    onChange={handleMainContentChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Content</label>
                                <textarea
                                    className="form-control"
                                    name="content"
                                    rows="6"
                                    value={mainPage.page.content}
                                    onChange={handleMainContentChange}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Save Main Content
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'carousel' && (
                    <div className="tab-pane active">
                        <CarouselEditor
                            carousels={mainPage.carousels}
                            onUpdate={() => fetchMainPage()}
                        />
                    </div>
                )}

                {activeTab === 'cards' && (
                    <div className="tab-pane active">
                        <CardEditor
                            cards={mainPage.cards}
                            onUpdate={() => fetchMainPage()}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainPageEditor;
