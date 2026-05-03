// Cart utility functions
const CartUtils = {
    getCart: () => {
        const cart = localStorage.getItem('luxeScentsCart');
        return cart ? JSON.parse(cart) : [];
    },
    
    saveCart: (cart) => {
        localStorage.setItem('luxeScentsCart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },
    
    addToCart: (product) => {
        const cart = CartUtils.getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        CartUtils.saveCart(cart);
    },
    
    removeFromCart: (productId) => {
        const cart = CartUtils.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        CartUtils.saveCart(updatedCart);
    },
    
    updateQuantity: (productId, quantity) => {
        const cart = CartUtils.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                CartUtils.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                CartUtils.saveCart(cart);
            }
        }
    },
    
    getCartCount: () => {
        const cart = CartUtils.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    getCartTotal: () => {
        const cart = CartUtils.getCart();
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace(',', ''));
            return total + (price * item.quantity);
        }, 0);
    },
    
    clearCart: () => {
        localStorage.removeItem('luxeScentsCart');
        window.dispatchEvent(new Event('cartUpdated'));
    }
};
