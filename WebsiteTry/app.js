const { useState } = React;

const FRAGRANCES = ['Bergamot', 'Lemon', 'Orange', 'Grapefruit', 'Mint', 'Lavender', 'Rose', 'Jasmine', 'Sandalwood', 'Musk', 'Vanilla', 'Amber', 'Oud', 'Cedar', 'Patchouli', 'Vetiver'];

const getCartItemId = (productId, customNotes) => {
    if (!customNotes) return `${productId}_default`;
    const key = [customNotes.fragrance, customNotes.colour].filter(Boolean).join('_');
    return key ? `${productId}_${key}` : `${productId}_default`;
};

// Navbar Component
const Navbar = () => {
    const [scrolled, setScrolled] = React.useState(false);
    const [cartCount, setCartCount] = React.useState(0);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('luxeScentsCart') || '[]');
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
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
                <a className="navbar-brand" href="#home">
                    <img src="images/logo.jpg" alt="Luxe Scents" className="brand-logo" />
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#home">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#products">Products</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="about.html">About</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="contact.html">Contact</a>
                        </li>
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

// Hero Section Component
const HeroSection = () => {
    return (
        <section className="hero-section" id="home">
            <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600&h=500&fit=crop" alt="Luxury Fragrances" className="hero-image" />
            <div className="hero-overlay">
                <h1>Discover Your Signature Scent</h1>
                <p>Luxury fragrances crafted with the finest ingredients</p>
                <a href="products.html" className="btn btn-primary-custom">Shop Now</a>
            </div>
        </section>
    );
};

// Fragrance Modal Component
const FragranceModal = ({ product, show, onClose, onAddToCart }) => {
    const [form, setForm] = React.useState({ fragrance: '', colour: '', notes: '' });

    if (!show) return null;

    const handleAdd = () => {
        const hasCustom = form.fragrance || form.colour.trim() || form.notes.trim();
        onAddToCart(product, hasCustom ? { ...form, colour: form.colour.trim(), notes: form.notes.trim() } : null);
        setForm({ fragrance: '', colour: '', notes: '' });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="fragrance-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
                <div className="fm-product-header">
                    <div className="fm-product-icon"><img src={product.image} alt={product.name} /></div>
                    <div>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="fm-price">₹{product.price}</div>
                    </div>
                </div>
                <div className="fm-customization">
                    <h4><i className="fas fa-magic"></i> Customise Your Variant</h4>
                    <p className="fm-hint">All fields are optional</p>
                    <div className="fm-field">
                        <label><i className="fas fa-flask"></i> Fragrance</label>
                        <select value={form.fragrance} onChange={e => setForm(p => ({ ...p, fragrance: e.target.value }))}>
                            <option value="">Select a fragrance</option>
                            {FRAGRANCES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="fm-field">
                        <label><i className="fas fa-palette"></i> Colour</label>
                        <input type="text" placeholder="e.g. Midnight Blue" value={form.colour} onChange={e => setForm(p => ({ ...p, colour: e.target.value }))} />
                    </div>
                    <div className="fm-field">
                        <label><i className="fas fa-sticky-note"></i> Additional Notes</label>
                        <textarea placeholder="Any special requests..." rows="3" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                </div>
                <button className="fm-add-btn" onClick={handleAdd}>
                    <i className="fas fa-shopping-cart"></i> Add to Cart — ₹{product.price}
                </button>
            </div>
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product, onOpenCustomize }) => {
    const [variants, setVariants] = React.useState([]);

    React.useEffect(() => {
        const syncVariants = () => {
            const cart = JSON.parse(localStorage.getItem('luxeScentsCart') || '[]');
            setVariants(cart.filter(i => i.id === product.id));
        };
        syncVariants();
        window.addEventListener('cartUpdated', syncVariants);
        return () => window.removeEventListener('cartUpdated', syncVariants);
    }, [product.id]);

    const totalQty = variants.reduce((t, v) => t + v.quantity, 0);

    const updateVariantQty = (cartItemId, newQty) => {
        const cart = JSON.parse(localStorage.getItem('luxeScentsCart') || '[]');
        if (newQty <= 0) {
            const updated = cart.filter(i => i.cartItemId !== cartItemId);
            localStorage.setItem('luxeScentsCart', JSON.stringify(updated));
        } else {
            const item = cart.find(i => i.cartItemId === cartItemId);
            if (item) item.quantity = newQty;
            localStorage.setItem('luxeScentsCart', JSON.stringify(cart));
        }
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const notesLabel = (cn) => {
        if (!cn) return 'Default';
        return [cn.fragrance, cn.colour].filter(Boolean).join(' · ') || 'Default';
    };

    return (
        <div className="col-md-4">
            <div className="product-card card">
                {product.bestSeller && <span className="best-seller-badge"><i className="fas fa-fire"></i> Best Seller</span>}
                <div className="product-img">
                    <img src={product.image} alt={product.name} />
                </div>
                <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description}</p>
                    <div className="product-price">₹{product.price}</div>
                    {variants.length > 0 && (
                        <div className="variant-list">
                            {variants.map(v => (
                                <div key={v.cartItemId} className="variant-row">
                                    <div className="variant-notes" title={notesLabel(v.customNotes)}>
                                        <i className="fas fa-flask"></i> {notesLabel(v.customNotes)}
                                    </div>
                                    <div className="qty-control qty-control-sm">
                                        <button className="qty-btn" onClick={() => updateVariantQty(v.cartItemId, v.quantity - 1)}>
                                            <i className={`fas fa-${v.quantity === 1 ? 'trash' : 'minus'}`}></i>
                                        </button>
                                        <span className="qty-display">{v.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateVariantQty(v.cartItemId, v.quantity + 1)}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button className="btn btn-add-cart" onClick={() => onOpenCustomize(product)}>
                        {totalQty > 0 ? <><i className="fas fa-plus"></i> Add Another Variant</> : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Products Section Component
const ProductsSection = () => {
    const [modalProduct, setModalProduct] = React.useState(null);

    const products = [
        { id: 1, name: "Mystic Oud", description: "Rich and woody fragrance with oriental notes", price: "2,999", image: "https://images.unsplash.com/photo-1594035910387-fbd1a485b12e?w=400&h=400&fit=crop", bestSeller: true },
        { id: 2, name: "Rose Garden", description: "Delicate floral scent with hints of jasmine", price: "2,499", image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=400&fit=crop" },
        { id: 3, name: "Ocean Breeze", description: "Fresh aquatic fragrance for everyday wear", price: "1,999", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop", bestSeller: true },
        { id: 4, name: "Amber Nights", description: "Warm and sensual evening fragrance", price: "3,499", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop" },
        { id: 5, name: "Citrus Burst", description: "Energizing blend of citrus and herbs", price: "1,799", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop" },
        { id: 6, name: "Velvet Musk", description: "Sophisticated musk with vanilla undertones", price: "2,799", image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop", bestSeller: true }
    ];

    const handleAddToCart = (product, customNotes) => {
        const cart = JSON.parse(localStorage.getItem('luxeScentsCart') || '[]');
        const cartItemId = getCartItemId(product.id, customNotes);
        const existing = cart.find(i => i.cartItemId === cartItemId);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1, customNotes: customNotes || null, cartItemId });
        }

        localStorage.setItem('luxeScentsCart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    return (
        <section className="products-section" id="products">
            <div className="container">
                <h2 className="section-title">Our Collection</h2>
                <div className="row">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} onOpenCustomize={setModalProduct} />
                    ))}
                </div>
                <div className="text-center mt-4">
                    <a href="products.html" className="btn btn-load-more">
                        Load More Products <i className="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
            <FragranceModal
                product={modalProduct}
                show={!!modalProduct}
                onClose={() => setModalProduct(null)}
                onAddToCart={handleAddToCart}
            />
        </section>
    );
};

// Features Section Component
const FeaturesSection = () => {
    const features = [
        {
            icon: "fas fa-shipping-fast",
            title: "Free Shipping",
            description: "On orders above ₹1,500"
        },
        {
            icon: "fas fa-award",
            title: "Premium Quality",
            description: "100% authentic fragrances"
        },
        {
            icon: "fas fa-undo",
            title: "Easy Returns",
            description: "30-day return policy"
        },
        {
            icon: "fas fa-headset",
            title: "24/7 Support",
            description: "Dedicated customer service"
        }
    ];

    return (
        <section className="features-section">
            <div className="container">
                <div className="row">
                    {features.map((feature, index) => (
                        <div key={index} className="col-md-3 col-sm-6">
                            <div className="feature-box">
                                <div className="feature-icon">
                                    <i className={feature.icon}></i>
                                </div>
                                <h4>{feature.title}</h4>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// About Section Component
const AboutSection = () => {
    return (
        <section className="about-section" id="about">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <h2>About Us</h2>
                        <p>
                            We are passionate about creating exceptional fragrances that tell a story. 
                            Each scent in our collection is carefully crafted using the finest ingredients 
                            sourced from around the world.
                        </p>
                        <p>
                            Our master perfumers blend traditional techniques with modern innovation to 
                            create unique, long-lasting fragrances that become a part of your identity.
                        </p>
                        <p>
                            Experience the art of perfumery with Luxe Scents - where luxury meets elegance.
                        </p>
                    </div>
                    <div className="about-image">
                        <i className="fas fa-spray-can"></i>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Footer Component
const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h5>About Us</h5>
                        <p>Luxe Scents brings you premium fragrances that define elegance and sophistication.</p>
                        <div className="social-icons">
                            <a href="#"><i className="fab fa-facebook"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <h5>Quick Links</h5>
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#products">Products</a></li>
                            <li><a href="about.html">About</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h5>Contact Info</h5>
                        <ul>
                            <li><i className="fas fa-map-marker-alt"></i> 123 Fragrance Street, Mumbai</li>
                            <li><i className="fas fa-phone"></i> +91 98765 43210</li>
                            <li><i className="fas fa-envelope"></i> info@luxescents.com</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Luxe Scents. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

// Main App Component
const App = () => {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <ProductsSection />
            <FeaturesSection />
            <AboutSection />
            <Footer />
        </div>
    );
};

// Render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
