const { useState, useEffect } = React;

// Navbar Component (with cart)
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
                <a className="navbar-brand" href="index.html">
                    <img src="images/logo.jpg" alt="Luxe Scents" className="brand-logo" />
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="index.html">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="products.html">Products</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="about.html">About</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="contact.html">Contact</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link cart-link active" href="cart.html">
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

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const price = parseFloat(item.price.replace(',', ''));
    const subtotal = price * item.quantity;

    const notesLabel = (cn) => {
        if (!cn) return null;
        return [cn.fragrance, cn.colour].filter(Boolean);
    };

    const notes = notesLabel(item.customNotes);

    return (
        <div className="cart-item">
            <div className="cart-item-icon">
                <img src={item.image} alt={item.name} />
            </div>
            <div className="cart-item-details">
                <h5>{item.name}</h5>
                <p>{item.description}</p>
                {notes && notes.length > 0 && (
                    <div className="cart-item-notes">
                        {notes.map(n => <span key={n} className="note-tag">{n}</span>)}
                    </div>
                )}
                {item.customNotes && item.customNotes.notes && (
                    <div className="cart-item-extra-note">{item.customNotes.notes}</div>
                )}
                <div className="cart-item-price">₹{item.price}</div>
            </div>
            <div className="cart-item-quantity">
                <button 
                    className="qty-btn" 
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                >
                    <i className="fas fa-minus"></i>
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button 
                    className="qty-btn" 
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>
            <div className="cart-item-subtotal">
                ₹{subtotal.toLocaleString('en-IN')}
            </div>
            <button className="cart-item-remove" onClick={() => onRemove(item.cartItemId)}>
                <i className="fas fa-trash"></i>
            </button>
        </div>
    );
};

// Cart Page Component
const CartPage = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    const loadCart = () => {
        const cartData = JSON.parse(localStorage.getItem('luxeScentsCart') || '[]');
        // Migrate old cart items without cartItemId
        let migrated = false;
        cartData.forEach(item => {
            if (!item.cartItemId) {
                item.cartItemId = `${item.id}_default`;
                migrated = true;
            }
        });
        if (migrated) localStorage.setItem('luxeScentsCart', JSON.stringify(cartData));
        setCart(cartData);
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(cartItemId);
            return;
        }

        const updatedCart = cart.map(item => 
            item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('luxeScentsCart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        setCart(updatedCart);
    };

    const removeItem = (cartItemId) => {
        const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
        localStorage.setItem('luxeScentsCart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        setCart(updatedCart);
    };

    const clearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            localStorage.removeItem('luxeScentsCart');
            window.dispatchEvent(new Event('cartUpdated'));
            setCart([]);
        }
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace(',', ''));
            return total + (price * item.quantity);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 1500 ? 0 : 100;
    const tax = subtotal * 0.18; // 18% GST
    const grandTotal = subtotal + shipping + tax;

    return (
        <>
            <Navbar />
            <div className="cart-page">
                <div className="container">
                    <div className="page-header">
                        <h1>Shopping Cart</h1>
                        <p>{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <i className="fas fa-shopping-cart"></i>
                            <h3>Your cart is empty</h3>
                            <p>Add some fragrances to get started!</p>
                            <a href="products.html" className="btn btn-primary-custom">
                                Browse Products
                            </a>
                        </div>
                    ) : (
                        <div className="cart-content">
                            <div className="cart-items-section">
                                <div className="cart-header">
                                    <h3>Cart Items</h3>
                                    <button className="btn-clear-cart" onClick={clearCart}>
                                        <i className="fas fa-trash"></i> Clear Cart
                                    </button>
                                </div>
                                {cart.map(item => (
                                    <CartItem 
                                        key={item.cartItemId} 
                                        item={item}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>

                            <div className="cart-summary">
                                <h3>Order Summary</h3>
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                                {shipping === 0 && (
                                    <div className="free-shipping-note">
                                        <i className="fas fa-check-circle"></i> You got free shipping!
                                    </div>
                                )}
                                <div className="summary-row">
                                    <span>Tax (GST 18%)</span>
                                    <span>₹{tax.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span>Grand Total</span>
                                    <span>₹{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                                <a href="checkout.html" className="btn-checkout">
                                    Proceed to Checkout <i className="fas fa-arrow-right"></i>
                                </a>
                                <a href="products.html" className="btn-continue">
                                    <i className="fas fa-arrow-left"></i> Continue Shopping
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// Render the Cart Page
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CartPage />);
