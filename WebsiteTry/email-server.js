const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Email configuration - UPDATE THESE WITH YOUR DETAILS
const EMAIL_CONFIG = {
    service: 'gmail',
    user: 'your-email@gmail.com',          // Your Gmail
    pass: 'your-app-password',              // Your Gmail App Password
    businessEmail: 'your-email@gmail.com'   // Business owner email for order notifications
};

const transporter = nodemailer.createTransport({
    service: EMAIL_CONFIG.service,
    auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass
    }
});

function generateOrderItemsHTML(cart) {
    return cart.map(item => {
        const price = parseFloat(item.price.replace(',', ''));
        const total = price * item.quantity;
        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
            </tr>`;
    }).join('');
}

function customerEmailHTML(data) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: white; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #69443C, #4a2f29); padding: 30px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px;">LUXE SCENTS</h1>
                <p style="color: white; margin: 10px 0 0; font-size: 14px;">Order Confirmation</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #69443C; margin-top: 0;">Thank you for your order, ${data.customer.firstName}!</h2>
                <p style="color: #666;">Your order has been placed successfully. Here are the details:</p>
                
                <div style="background: #faf8f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
                </div>

                <h3 style="color: #69443C;">Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #faf8f6;">
                            <th style="padding: 12px; text-align: left;">Product</th>
                            <th style="padding: 12px; text-align: center;">Qty</th>
                            <th style="padding: 12px; text-align: right;">Price</th>
                            <th style="padding: 12px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateOrderItemsHTML(data.cart)}
                    </tbody>
                </table>

                <div style="margin-top: 20px; padding: 15px; background: #faf8f6; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>Subtotal:</span><span>₹${data.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    ${data.discount > 0 ? `<div style="display: flex; justify-content: space-between; margin: 5px 0; color: #27ae60;">
                        <span>Discount (${data.promoCode}):</span><span>-₹${data.discount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>Shipping:</span><span>${data.shipping === 0 ? 'FREE' : '₹' + data.shipping}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>Tax (GST 18%):</span><span>₹${data.tax.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <hr style="border: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 18px; font-weight: bold; color: #69443C;">
                        <span>Grand Total:</span><span>₹${data.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>

                <h3 style="color: #69443C; margin-top: 25px;">Shipping Address</h3>
                <div style="background: #faf8f6; padding: 15px; border-radius: 8px;">
                    <p style="margin: 3px 0;">${data.customer.firstName} ${data.customer.lastName}</p>
                    <p style="margin: 3px 0;">${data.customer.address}${data.customer.apartment ? ', ' + data.customer.apartment : ''}</p>
                    <p style="margin: 3px 0;">${data.customer.city}, ${data.customer.state} - ${data.customer.pincode}</p>
                    <p style="margin: 3px 0;">Phone: ${data.customer.phone}</p>
                </div>
            </div>
            <div style="background: #4a2f29; padding: 20px; text-align: center; color: #aaa; font-size: 12px;">
                <p style="margin: 0;">© 2024 Luxe Scents. All rights reserved.</p>
                <p style="margin: 5px 0 0;">If you have questions, contact us at info@luxescents.com</p>
            </div>
        </div>
    </div>`;
}

function businessEmailHTML(data) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: white; border-radius: 10px; overflow: hidden;">
            <div style="background: #e74c3c; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">🛒 New Order Received!</h1>
            </div>
            <div style="padding: 30px;">
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                    <strong>Order ID:</strong> ${data.orderId}<br>
                    <strong>Payment ID:</strong> ${data.paymentId}<br>
                    <strong>Amount:</strong> ₹${data.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}<br>
                    <strong>Date:</strong> ${new Date().toLocaleString('en-IN')}
                </div>

                <h3 style="color: #333;">Customer Details</h3>
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr><td style="padding: 5px; color: #666;">Name:</td><td style="padding: 5px;"><strong>${data.customer.firstName} ${data.customer.lastName}</strong></td></tr>
                    <tr><td style="padding: 5px; color: #666;">Email:</td><td style="padding: 5px;">${data.customer.email}</td></tr>
                    <tr><td style="padding: 5px; color: #666;">Phone:</td><td style="padding: 5px;">${data.customer.phone}</td></tr>
                    <tr><td style="padding: 5px; color: #666;">Address:</td><td style="padding: 5px;">${data.customer.address}${data.customer.apartment ? ', ' + data.customer.apartment : ''}, ${data.customer.city}, ${data.customer.state} - ${data.customer.pincode}</td></tr>
                </table>

                <h3 style="color: #333;">Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateOrderItemsHTML(data.cart)}
                    </tbody>
                </table>

                <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
                    <p style="margin: 5px 0;">Subtotal: ₹${data.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                    ${data.discount > 0 ? `<p style="margin: 5px 0; color: #27ae60;">Discount (${data.promoCode}): -₹${data.discount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>` : ''}
                    <p style="margin: 5px 0;">Shipping: ${data.shipping === 0 ? 'FREE' : '₹' + data.shipping}</p>
                    <p style="margin: 5px 0;">Tax: ₹${data.tax.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                    <hr>
                    <p style="margin: 5px 0; font-size: 18px;"><strong>Grand Total: ₹${data.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></p>
                </div>
            </div>
        </div>
    </div>`;
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Contact form email
    if (req.url === '/send-email' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const formData = JSON.parse(body);
                await transporter.sendMail({
                    from: EMAIL_CONFIG.user,
                    to: EMAIL_CONFIG.businessEmail,
                    subject: `New Enquiry from ${formData.name || 'Website Visitor'}`,
                    html: `
                        <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
                            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                                <h2 style="color: #69443C;">New Contact Form Submission</h2>
                                <p><strong>Name:</strong> ${formData.name || 'Not provided'}</p>
                                <p><strong>Email:</strong> ${formData.email}</p>
                                <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
                                <div style="padding: 15px; background: #faf8f6; border-left: 4px solid #d4af37; border-radius: 5px; margin-top: 15px;">
                                    <strong>Message:</strong>
                                    <p>${formData.comment || 'No message'}</p>
                                </div>
                                <p style="color: #999; font-size: 12px; margin-top: 20px;">Received: ${new Date().toLocaleString()}</p>
                            </div>
                        </div>`
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('Contact email error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false }));
            }
        });
        return;
    }

    // Order confirmation emails
    if (req.url === '/send-order-email' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);

                // Email to customer
                await transporter.sendMail({
                    from: `"Luxe Scents" <${EMAIL_CONFIG.user}>`,
                    to: data.customer.email,
                    subject: `Order Confirmed - ${data.orderId} | Luxe Scents`,
                    html: customerEmailHTML(data)
                });

                // Email to business owner
                await transporter.sendMail({
                    from: EMAIL_CONFIG.user,
                    to: EMAIL_CONFIG.businessEmail,
                    subject: `🛒 New Order ${data.orderId} - ₹${data.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`,
                    html: businessEmailHTML(data)
                });

                console.log(`Order ${data.orderId} - Emails sent successfully`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('Order email error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
    }[extname] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
    console.log('Press Ctrl+C to stop');
});
