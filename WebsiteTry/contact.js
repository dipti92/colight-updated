const { useState } = React;

// Navbar Component
const Navbar = () => {
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                            <a className="nav-link" href="index.html#products">Products</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="about.html">About</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link active" href="contact.html">Contact</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#cart">
                                <i className="fas fa-shopping-cart"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

// Contact Page Component
const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        comment: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('');

        try {
            const response = await fetch('/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', phone: '', comment: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="contact-page">
            <div className="contact-container">
                <div className="contact-header">
                    <h1>Get In Touch</h1>
                    <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>

                <div className="contact-content">
                    <div className="contact-info">
                        <h2>Contact Information</h2>
                        
                        <div className="info-item">
                            <div className="info-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div className="info-text">
                                <h3>Visit Us</h3>
                                <p>123 Fragrance Street<br/>Mumbai, Maharashtra 400001</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <i className="fas fa-phone"></i>
                            </div>
                            <div className="info-text">
                                <h3>Call Us</h3>
                                <p>+91 98765 43210<br/>Mon-Sat: 10AM - 7PM</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className="info-text">
                                <h3>Email Us</h3>
                                <p>info@luxescents.com<br/>support@luxescents.com</p>
                            </div>
                        </div>

                        <div className="social-links">
                            <h3>Follow Us</h3>
                            <div className="social-icons-contact">
                                <a href="#"><i className="fab fa-facebook"></i></a>
                                <a href="#"><i className="fab fa-instagram"></i></a>
                                <a href="#"><i className="fab fa-twitter"></i></a>
                                <a href="#"><i className="fab fa-youtube"></i></a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-section">
                        <h2>Send Us a Message</h2>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email <span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your.email@example.com"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="comment">Message</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleChange}
                                    placeholder="Your message here..."
                                    rows="5"
                                ></textarea>
                            </div>
                            {submitStatus === 'success' && (
                                <div className="success-message">
                                    <i className="fas fa-check-circle"></i> Message sent successfully! We'll get back to you soon.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="error-message-box">
                                    <i className="fas fa-exclamation-circle"></i> Failed to send message. Please try again.
                                </div>
                            )}
                            <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};

// Render the Contact Page
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ContactPage />);
