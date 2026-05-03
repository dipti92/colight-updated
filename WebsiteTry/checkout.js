const { useState, useEffect } = React;

const PROMO_CODES = {
    'LUXE10': { discount: 10, type: 'percent', label: '10% off' },
    'LUXE20': { discount: 20, type: 'percent', label: '20% off' },
    'FLAT500': { discount: 500, type: 'flat', label: '₹500 off' },
    'WELCOME': { discount: 15, type: 'percent', label: '15% off' }
};

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry"
];

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

// Checkout Page
const CheckoutPage = () => {
    const [cart, setCart] = useState([]);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Promo
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');

    // Form
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', apartment: '', city: '', state: '', pincode: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const cartData = JSON.parse(localStorage.getItem('luxeScentsCart') || '[]');
        if (cartData.length === 0 && !orderPlaced) {
            window.location.href = 'cart.html';
        }
        setCart(cartData);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.lastName.trim()) errs.lastName = 'Last name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        if (!form.phone.trim()) errs.phone = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Invalid phone number';
        if (!form.address.trim()) errs.address = 'Address is required';
        if (!form.city.trim()) errs.city = 'City is required';
        if (!form.state) errs.state = 'State is required';
        if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Invalid pincode';
        return errs;
    };

    // Promo
    const applyPromo = () => {
        setPromoError('');
        const code = promoCode.trim().toUpperCase();
        if (!code) return;
        const promo = PROMO_CODES[code];
        if (promo) {
            setAppliedPromo({ code, ...promo });
            setPromoError('');
        } else {
            setPromoError('Invalid promo code');
            setAppliedPromo(null);
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    // Calculations
    const subtotal = cart.reduce((t, item) => {
        return t + parseFloat(item.price.replace(',', '')) * item.quantity;
    }, 0);

    let discount = 0;
    if (appliedPromo) {
        discount = appliedPromo.type === 'percent'
            ? subtotal * (appliedPromo.discount / 100)
            : appliedPromo.discount;
        discount = Math.min(discount, subtotal);
    }

    const afterDiscount = subtotal - discount;
    const shipping = afterDiscount > 1500 ? 0 : 100;
    const tax = afterDiscount * 0.18;
    const grandTotal = afterDiscount + shipping + tax;

    // Payment
    const handlePayment = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsProcessing(true);
        const amountInPaise = Math.round(grandTotal * 100);

        const options = {
            key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
            amount: amountInPaise,
            currency: 'INR',
            name: 'Luxe Scents',
            description: 'Fragrance Purchase',
            image: '',
            handler: async function (response) {
                const newOrderId = 'LS-' + Date.now().toString(36).toUpperCase();
                
                // Send email notifications
                try {
                    await fetch('/send-order-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: newOrderId,
                            paymentId: response.razorpay_payment_id,
                            customer: form,
                            cart: cart,
                            subtotal, discount, shipping, tax, grandTotal,
                            promoCode: appliedPromo ? appliedPromo.code : null
                        })
                    });
                } catch (err) {
                    console.error('Email notification error:', err);
                }

                // Clear cart and show success
                localStorage.removeItem('luxeScentsCart');
                window.dispatchEvent(new Event('cartUpdated'));
                setOrderId(newOrderId);
                setOrderPlaced(true);
                setIsProcessing(false);
            },
            prefill: {
                name: `${form.firstName} ${form.lastName}`,
                email: form.email,
                contact: form.phone
            },
            theme: {
                color: '#69443C'
            },
            modal: {
                ondismiss: function () {
                    setIsProcessing(false);
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function () {
            alert('Payment failed. Please try again.');
            setIsProcessing(false);
        });
        rzp.open();
    };

    // Order Success
    if (orderPlaced) {
        return (
            <>
                <Navbar />
                <div className="checkout-page">
                    <div className="container">
                        <div className="order-success">
                            <div className="success-icon">
                                <i className="fas fa-check"></i>
                            </div>
                            <h2>Order Placed Successfully!</h2>
                            <p>Thank you for your purchase, {form.firstName}!</p>
                            <p>A confirmation email has been sent to {form.email}</p>
                            <div className="order-id">
                                Order ID: {orderId}
                            </div>
                            <a href="index.html" className="btn-back-home">
                                Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="checkout-page">
                <div className="container">
                    <div className="page-header">
                        <h1>Checkout</h1>
                        <p>Complete your order</p>
                    </div>

                    <div className="checkout-steps">
                        <div className="step completed">
                            <span className="step-number"><i className="fas fa-check"></i></span>
                            <span>Cart</span>
                        </div>
                        <div className="step-line active"></div>
                        <div className="step active">
                            <span className="step-number">2</span>
                            <span>Details</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <span className="step-number">3</span>
                            <span>Payment</span>
                        </div>
                    </div>

                    <div className="checkout-content">
                        <div className="checkout-form-section">
                            <h3><i className="fas fa-user"></i> Shipping Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name <span className="required">*</span></label>
                                    <input type="text" name="firstName" value={form.firstName}
                                        onChange={handleChange} placeholder="First Name"
                                        className={errors.firstName ? 'error' : ''} />
                                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Last Name <span className="required">*</span></label>
                                    <input type="text" name="lastName" value={form.lastName}
                                        onChange={handleChange} placeholder="Last Name"
                                        className={errors.lastName ? 'error' : ''} />
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email <span className="required">*</span></label>
                                    <input type="email" name="email" value={form.email}
                                        onChange={handleChange} placeholder="your.email@example.com"
                                        className={errors.email ? 'error' : ''} />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Phone Number <span className="required">*</span></label>
                                    <input type="tel" name="phone" value={form.phone}
                                        onChange={handleChange} placeholder="9876543210"
                                        className={errors.phone ? 'error' : ''} />
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Address <span className="required">*</span></label>
                                    <input type="text" name="address" value={form.address}
                                        onChange={handleChange} placeholder="House No, Street, Area"
                                        className={errors.address ? 'error' : ''} />
                                    {errors.address && <span className="error-text">{errors.address}</span>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Apartment / Floor (Optional)</label>
                                    <input type="text" name="apartment" value={form.apartment}
                                        onChange={handleChange} placeholder="Apartment, Suite, Floor" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City <span className="required">*</span></label>
                                    <input type="text" name="city" value={form.city}
                                        onChange={handleChange} placeholder="City"
                                        className={errors.city ? 'error' : ''} />
                                    {errors.city && <span className="error-text">{errors.city}</span>}
                                </div>
                                <div className="form-group">
                                    <label>State <span className="required">*</span></label>
                                    <select name="state" value={form.state}
                                        onChange={handleChange}
                                        className={errors.state ? 'error' : ''}>
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    {errors.state && <span className="error-text">{errors.state}</span>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Pincode <span className="required">*</span></label>
                                    <input type="text" name="pincode" value={form.pincode}
                                        onChange={handleChange} placeholder="400001" maxLength="6"
                                        className={errors.pincode ? 'error' : ''} />
                                    {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="order-items">
                                {cart.map(item => {
                                    const price = parseFloat(item.price.replace(',', ''));
                                    const notes = item.customNotes ? [item.customNotes.fragrance, item.customNotes.colour].filter(Boolean) : [];
                                    return (
                                        <div key={item.cartItemId} className="order-item">
                                            <div className="order-item-info">
                                                <div className="order-item-icon">
                                                    <img src={item.image} alt={item.name} />
                                                </div>
                                                <div>
                                                    <div className="order-item-name">{item.name}</div>
                                                    {notes.length > 0 && (
                                                        <div className="order-item-notes">{notes.join(' · ')}</div>
                                                    )}
                                                    <div className="order-item-qty">Qty: {item.quantity}</div>
                                                </div>
                                            </div>
                                            <div className="order-item-price">
                                                ₹{(price * item.quantity).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="promo-section">
                                <h4><i className="fas fa-tag"></i> Promo Code</h4>
                                {!appliedPromo ? (
                                    <>
                                        <div className="promo-input-group">
                                            <input type="text" value={promoCode}
                                                onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                                                placeholder="Enter code"
                                                onKeyDown={(e) => e.key === 'Enter' && applyPromo()} />
                                            <button className="btn-apply-promo" onClick={applyPromo}
                                                disabled={!promoCode.trim()}>
                                                Apply
                                            </button>
                                        </div>
                                        {promoError && <div className="promo-error">{promoError}</div>}
                                    </>
                                ) : (
                                    <div className="promo-applied">
                                        <span><i className="fas fa-check-circle"></i> {appliedPromo.code} — {appliedPromo.label}</span>
                                        <button className="btn-remove-promo" onClick={removePromo}>
                                            <i className="fas fa-times"></i> Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {discount > 0 && (
                                <div className="summary-row discount">
                                    <span>Discount ({appliedPromo.label})</span>
                                    <span>-₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>
                            {shipping === 0 && (
                                <div className="free-shipping-note">
                                    <i className="fas fa-check-circle"></i> Free shipping applied!
                                </div>
                            )}
                            <div className="summary-row">
                                <span>Tax (GST 18%)</span>
                                <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <button className="btn-pay" onClick={handlePayment} disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : <>Pay ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <i className="fas fa-lock"></i></>}
                            </button>
                            <div className="secure-note">
                                <i className="fas fa-shield-alt"></i> Secured by Razorpay
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CheckoutPage />);
