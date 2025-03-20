import React, { useState } from 'react';
import Cards from "./Cards";

const Homepage = () => {
    const [activeTab, setActiveTab] = useState('details');

    return (
        <div className="container mt-4">
            {/* Tabs Navigation */}
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                        type="button"
                        role="tab"
                    >
                        Details
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                        type="button"
                        role="tab"
                    >
                        Cards
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'carousels' ? 'active' : ''}`}
                        onClick={() => setActiveTab('carousels')}
                        type="button"
                        role="tab"
                    >
                        Carousels
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content mt-3">

                {/* Details Tab */}
                <div className={`tab-pane fade ${activeTab === 'details' ? 'show active' : ''}`}>
                    <h3>Details Content</h3>
                    <p>Details about the main page will appear here.</p>
                </div>

                {/* Cards Tab */}
                <div className={`tab-pane fade ${activeTab === 'cards' ? 'show active' : ''}`}>
                    <Cards />
                </div>

                {/* Carousels Tab */}
                <div className={`tab-pane fade ${activeTab === 'carousels' ? 'show active' : ''}`}>
                    <h3>Carousels Content</h3>
                    <p>Carousel items will be shown here.</p>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
