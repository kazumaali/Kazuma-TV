const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Security: Validate that required environment variables exist
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        console.error('Please check your .env file');
        process.exit(1);
    }
}

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'kazumasatou20021423@gmail.com',
        pass: process.env.EMAIL_PASS // You'll need to set this in .env file
    }
});

// Generate verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store verification codes temporarily (in production, use a database)
const verificationCodes = new Map();

// Send verification email endpoint
app.post('/send-verification', async (req, res) => {
    try {
        const { email, username } = req.body;
        
        if (!email || !username) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and username are required' 
            });
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();
        
        // Store code with timestamp (valid for 10 minutes)
        verificationCodes.set(email, {
            code: verificationCode,
            username: username,
            timestamp: Date.now(),
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // Arabic email message
        const emailHtml = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: white;
                    border-radius: 10px;
                    padding: 30px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    color: #6a11cb;
                    margin-bottom: 30px;
                }
                .code {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    color: white;
                    padding: 15px 30px;
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    border-radius: 8px;
                    margin: 20px 0;
                    letter-spacing: 5px;
                }
                .instructions {
                    color: #555;
                    line-height: 1.6;
                    font-size: 16px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>أهلاً بك في Kazuma TV</h1>
                </div>
                
                <div class="instructions">
                    <p>عزيزي ${username},</p>
                    <p>شكراً لتسجيلك في Kazuma TV. لتفعيل حسابك، يرجى استخدام رمز التحقق أدناه:</p>
                </div>
                
                <div class="code">${verificationCode}</div>
                
                <div class="instructions">
                    <p>رجاءاً إنسخ الكود وأدخله في صندوق "كود التحقق" لإنشاء حسابك</p>
                    <p>هذا الرمز صالح لمدة 10 دقائق فقط.</p>
                </div>
                
                <div class="footer">
                    <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
                    <p>© 2024 Kazuma TV. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Email options
        const mailOptions = {
            from: {
                name: 'Kazuma TV',
                address: process.env.EMAIL_USER || 'kazumasatou20021423@gmail.com'
            },
            to: email,
            subject: 'رمز التحقق - Kazuma TV',
            html: emailHtml
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        console.log(`Verification code ${verificationCode} sent to ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Verification email sent successfully' 
        });

    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send verification email',
            error: error.message 
        });
    }
});

// Verify code endpoint
app.post('/verify-code', (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and code are required' 
            });
        }

        const storedData = verificationCodes.get(email);
        
        if (!storedData) {
            return res.json({ 
                success: false, 
                message: 'No verification code found for this email' 
            });
        }

        // Check if code expired
        if (Date.now() > storedData.expires) {
            verificationCodes.delete(email);
            return res.json({ 
                success: false, 
                message: 'Verification code has expired' 
            });
        }

        // Check if code matches
        if (storedData.code === code) {
            verificationCodes.delete(email);
            return res.json({ 
                success: true, 
                message: 'Email verified successfully' 
            });
        } else {
            return res.json({ 
                success: false, 
                message: 'Invalid verification code' 
            });
        }

    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error verifying code',
            error: error.message 
        });
    }
});

// Clean up expired codes every hour
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of verificationCodes.entries()) {
        if (now > data.expires) {
            verificationCodes.delete(email);
        }
    }
}, 60 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Backend ready to send verification emails from: kazumasatou20021423@gmail.com`);
});