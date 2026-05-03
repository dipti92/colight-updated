const { useState, useEffect } = React;

// Navbar
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('luxeScentsCart') || '[]');
            setCartCount(cart.reduce((t, i) => t + i.quantity, 0));
        };

        updateCartCount();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('cartUpdated', updateCartCount);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    return (
        <nav className={`navbar navbar-expand-lg navbar-dark ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <a className="navbar-brand" href="index.html">
                    <img src="images/logo.jpg" alt="Luxe Scents" className="brand-logo" />
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item"><a className="nav-link" href="index.html">Home</a></li>
                        <li className="nav-item"><a className="nav-link" href="products.html">Products</a></li>
                        <li className="nav-item"><a className="nav-link active" href="about.html">About</a></li>
                        <li className="nav-item"><a className="nav-link" href="contact.html">Contact</a></li>
                        <li className="nav-item">
                            <a className="nav-link cart-link" href="cart.html">
                                <i className="fas fa-shopping-cart"></i>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

// About Page
const AboutPage = () => {
    const values = [
        { icon: 'fas fa-leaf', title: 'Natural Ingredients', desc: 'We source only the finest natural ingredients from trusted suppliers across the globe.' },
        { icon: 'fas fa-hand-sparkles', title: 'Handcrafted', desc: 'Each fragrance is meticulously handcrafted by our master perfumers with decades of experience.' },
        { icon: 'fas fa-recycle', title: 'Sustainable', desc: 'Eco-friendly packaging and cruelty-free practices are at the heart of everything we do.' },
        { icon: 'fas fa-heart', title: 'Made with Love', desc: 'Every bottle carries our passion for creating scents that become a part of your story.' }
    ];

    const stats = [
        { number: '50+', label: 'Unique Fragrances' },
        { number: '10K+', label: 'Happy Customers' },
        { number: '8+', label: 'Years of Craft' },
        { number: '100%', label: 'Natural Ingredients' }
    ];

    const team = [
        { name: 'Arjun Mehta', role: 'Founder & CEO', desc: 'Visionary entrepreneur with a passion for luxury fragrances and 15 years in the industry.', icon: 'fas fa-user-tie' },
        { name: 'Priya Sharma', role: 'Master Perfumer', desc: 'Trained in Grasse, France with expertise in blending oriental and floral compositions.', icon: 'fas fa-flask' },
        { name: 'Rahul Kapoor', role: 'Head of Design', desc: 'Creates the iconic packaging that makes every Luxe Scents product a visual masterpiece.', icon: 'fas fa-palette' },
        { name: 'Ananya Desai', role: 'Quality Director', desc: 'Ensures every fragrance meets our exacting standards before reaching your hands.', icon: 'fas fa-award' }
    ];

    return (
        <>
            <Navbar />
            <div className="about-page">
                <div className="about-hero">
                    <div className="container">
                        <h1>Our Story</h1>
                        <p>Crafting luxury fragrances that define elegance since 2016</p>
                    </div>
                </div>

                <section className="about-story">
                    <div className="container">
                        <div className="story-content">
                            <div className="story-text">
                                <h2>The Art of Perfumery</h2>
                                <p>
                                    Luxe Scents was born from a simple belief — that everyone deserves to experience 
                                    the transformative power of a truly exceptional fragrance. Founded in Mumbai in 2016, 
                                    we set out to create perfumes that don't just smell beautiful, but tell a story.
                                </p>
                                <p>
                                    Our master perfumers blend traditional Indian fragrance techniques with modern 
                                    innovation, sourcing the finest ingredients from lavender fields of Provence to 
                                    sandalwood forests of Mysore. Each scent is a journey — carefully composed to 
                                    evoke emotions and create lasting memories.
                                </p>
                                <p>
                                    Today, Luxe Scents is trusted by thousands of fragrance enthusiasts across India, 
                                    and we continue to push the boundaries of what a perfume can be.
                                </p>
                            </div>
                            <div className="story-image">
                                <i className="fas fa-spray-can"></i>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="about-values">
                    <div className="container">
                        <h2>What We Stand For</h2>
                        <div className="row g-3">
                            {values.map((v, i) => (
                                <div key={i} className="col-md-3 col-sm-6">
                                    <div className="value-card">
                                        <div className="value-icon">
                                            <i className={v.icon}></i>
                                        </div>
                                        <h4>{v.title}</h4>
                                        <p>{v.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="about-stats">
                    <div className="container">
                        <div className="row">
                            {stats.map((s, i) => (
                                <div key={i} className="col-md-3 col-6">
                                    <div className="stat-item">
                                        <div className="stat-number">{s.number}</div>
                                        <div className="stat-label">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="about-team">
                    <div className="container">
                        <h2>Meet Our Team</h2>
                        <p>The passionate people behind every bottle</p>
                        <div className="row g-3">
                            {team.map((t, i) => (
                                <div key={i} className="col-md-3 col-sm-6">
                                    <div className="team-card">
                                        <div className="team-avatar">
                                            <i className={t.icon}></i>
                                        </div>
                                        <h5>{t.name}</h5>
                                        <div className="team-role">{t.role}</div>
                                        <p>{t.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="about-cta">
                    <div className="container">
                        <h2>Ready to Find Your Signature Scent?</h2>
                        <p>Explore our collection and discover fragrances crafted just for you.</p>
                        <div className="cta-buttons">
                            <a href="products.html" className="btn-cta-primary">
                                <i className="fas fa-shopping-bag"></i> Shop Now
                            </a>
                            <a href="contact.html" className="btn-cta-outline">
                                <i className="fas fa-envelope"></i> Get in Touch
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AboutPage />);
