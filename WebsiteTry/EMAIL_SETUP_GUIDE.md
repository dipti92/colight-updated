# Luxe Scents - Complete Setup Guide

## Step 1: Install Dependencies
```
npm install
```

## Step 2: Configure Gmail (for email notifications)

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to https://myaccount.google.com/apppasswords
4. Generate an App Password for "Mail"
5. Open `email-server.js` and update:
```javascript
const EMAIL_CONFIG = {
    service: 'gmail',
    user: 'your-email@gmail.com',
    pass: 'your-16-char-app-password',
    businessEmail: 'your-email@gmail.com'
};
```

## Step 3: Setup Razorpay Payment Gateway

### Create Razorpay Account
1. Go to https://razorpay.com and sign up
2. Complete KYC verification
3. Go to **Settings > API Keys**
4. Generate **Test Mode** keys first (for testing)
5. You'll get:
   - **Key ID** (starts with `rzp_test_` for test mode)
   - **Key Secret**

### Add Key to Code
Open `checkout.js` and replace this line:
```javascript
key: 'YOUR_RAZORPAY_KEY_ID',
```
With your actual key:
```javascript
key: 'rzp_test_xxxxxxxxxxxx',  // Test key
```

### Test Cards (for testing)
| Card Number      | Expiry | CVV | Name     |
|-----------------|--------|-----|----------|
| 4111 1111 1111 1111 | Any future date | Any 3 digits | Any name |
| 5267 3181 8797 5449 | Any future date | Any 3 digits | Any name |

### UPI Test ID
- success@razorpay (for successful payment)
- failure@razorpay (for failed payment)

### Go Live
1. Complete Razorpay KYC
2. Switch to **Live Mode** in Razorpay Dashboard
3. Generate Live API Keys
4. Replace test key with live key:
```javascript
key: 'rzp_live_xxxxxxxxxxxx',
```

## Step 4: Start the Server
```
node email-server.js
```
Or double-click `start-server.bat`

## Step 5: Test the Full Flow
1. Open http://localhost:3000
2. Add products to cart
3. Go to cart → Proceed to Checkout
4. Fill shipping details
5. Apply promo code (test codes: LUXE10, LUXE20, FLAT500, WELCOME)
6. Click Pay → Complete payment via Razorpay
7. Check emails (customer + business owner)

## Available Promo Codes
| Code    | Discount    |
|---------|-------------|
| LUXE10  | 10% off     |
| LUXE20  | 20% off     |
| FLAT500 | ₹500 off    |
| WELCOME | 15% off     |

## Troubleshooting

**Payment not opening:**
- Check Razorpay key is correct in checkout.js
- Make sure Razorpay script is loaded in checkout.html

**Emails not sending:**
- Verify Gmail App Password is correct
- Check console for error messages
- Ensure 2-Step Verification is enabled

**Cart not working:**
- Clear browser localStorage and try again
- Check browser console for errors
