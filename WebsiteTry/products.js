const { useState, useEffect, useRef } = React;

const FRAGRANCES = ['Bergamot', 'Lemon', 'Orange', 'Grapefruit', 'Mint', 'Lavender', 'Rose', 'Jasmine', 'Sandalwood', 'Musk', 'Vanilla', 'Amber', 'Oud', 'Cedar', 'Patchouli', 'Vetiver'];

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
                        <li className="nav-item"><a className="nav-link active" href="products.html">Products</a></li>
                        <li className="nav-item"><a className="nav-link" href="about.html">About</a></li>
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

const getCartItemId = (productId, customNotes) => {
    if (!customNotes) return `${productId}_default`;
    const key = [customNotes.fragrance, customNotes.colour].filter(Boolean).join('_');
    return key ? `${productId}_${key}` : `${productId}_default`;
};

// Fragrance Customization Modal
const FragranceModal = ({ product, show, onClose, onAddToCart }) => {
    const [form, setForm] = useState({ fragrance: '', colour: '', notes: '' });

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
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="fm-product-header">
                    <div className="fm-product-icon">
                        <img src={product.image} alt={product.name} />
                    </div>
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

// Product Card
const ProductCard = ({ product, onOpenCustomize }) => {
    const [variants, setVariants] = useState([]);

    useEffect(() => {
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
        <div className="col-md-3 col-sm-6">
            <div className="product-card card">
                {product.bestSeller && <span className="best-seller-badge"><i className="fas fa-fire"></i> Best Seller</span>}
                <div className="product-img">
                    <img src={product.image} alt={product.name} />
                </div>
                <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description}</p>
                    <div className="product-price">₹{product.price}</div>
                    <div className="product-actions">
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
        </div>
    );
};

// Products Page
const ProductsPage = () => {
    const [modalProduct, setModalProduct] = useState(null);

    const allProducts = [
        { id: 1, name: "Mystic Oud", description: "Rich and woody fragrance with oriental notes", price: "2,999", image: "https://images.unsplash.com/photo-1594035910387-fbd1a485b12e?w=400&h=400&fit=crop", bestSeller: true },
        { id: 2, name: "Rose Garden", description: "Delicate floral scent with hints of jasmine", price: "2,499", image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=400&fit=crop" },
        { id: 3, name: "Ocean Breeze", description: "Fresh aquatic fragrance for everyday wear", price: "1,999", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop", bestSeller: true },
        { id: 4, name: "Amber Nights", description: "Warm and sensual evening fragrance", price: "3,499", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop" },
        { id: 5, name: "Citrus Burst", description: "Energizing blend of citrus and herbs", price: "1,799", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop" },
        { id: 6, name: "Velvet Musk", description: "Sophisticated musk with vanilla undertones", price: "2,799", image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop", bestSeller: true },
        { id: 7, name: "Lavender Dreams", description: "Calming lavender with soft woody base", price: "2,299", image: "https://images.unsplash.com/photo-1595425964272-fc617fa19dfa?w=400&h=400&fit=crop" },
        { id: 8, name: "Spice Route", description: "Exotic blend of cardamom and saffron", price: "3,199", image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop" },
        { id: 9, name: "White Tea", description: "Clean and refreshing white tea essence", price: "2,599", image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=400&h=400&fit=crop" },
        { id: 10, name: "Sandalwood Silk", description: "Creamy sandalwood with silk notes", price: "3,299", image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop", bestSeller: true },
        { id: 11, name: "Jasmine Noir", description: "Dark jasmine with mysterious undertones", price: "2,899", image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop" },
        { id: 12, name: "Vanilla Sky", description: "Sweet vanilla with airy cloud notes", price: "2,199", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop" },
        { id: 13, name: "Cedar Woods", description: "Deep cedarwood with earthy moss", price: "2,699", image: "https://images.unsplash.com/photo-1619994403073-2cec844b8c63?w=400&h=400&fit=crop" },
        { id: 14, name: "Peony Blush", description: "Romantic peony with soft pink petals", price: "2,399", image: "https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=400&h=400&fit=crop" },
        { id: 15, name: "Black Orchid", description: "Luxurious black orchid with truffle", price: "3,999", image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=400&h=400&fit=crop", bestSeller: true },
        { id: 16, name: "Mint Mojito", description: "Fresh mint with lime zest", price: "1,899", image: "https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=400&h=400&fit=crop" },
        { id: 17, name: "Cherry Blossom", description: "Delicate cherry blossom in spring", price: "2,499", image: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=400&h=400&fit=crop" },
        { id: 18, name: "Tobacco Leather", description: "Rich tobacco with smooth leather", price: "3,599", image: "https://images.unsplash.com/photo-1594913503018-484cef974cd4?w=400&h=400&fit=crop" }
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
        <>
            <Navbar />
            <div className="products-page">
                <div className="container">
                    <div className="page-header">
                        <h1>All Products</h1>
                        <p>Explore our complete collection of luxury fragrances</p>
                    </div>
                    <div className="row">
                        {allProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onOpenCustomize={setModalProduct}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <FragranceModal
                product={modalProduct}
                show={!!modalProduct}
                onClose={() => setModalProduct(null)}
                onAddToCart={handleAddToCart}
            />
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ProductsPage />);
