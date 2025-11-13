// Initialize EmailJS
(function() {
    // Use a more reliable initialization method
    if (typeof emailjs !== 'undefined') {
        emailjs.init("d3oDpvpHsE4_0H-dq");
        console.log("EmailJS initialized");
    }
})();

// User management functions
class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
    }

    // Load users from localStorage
    loadUsers() {
        const usersJSON = localStorage.getItem('kazumaTV_users');
        return usersJSON ? JSON.parse(usersJSON) : {};
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('kazumaTV_users', JSON.stringify(this.users));
    }

    // Get current logged in user
    getCurrentUser() {
        return localStorage.getItem('kazumaTV_currentUser');
    }

    // Set current logged in user
    setCurrentUser(email) {
        if (email) {
            localStorage.setItem('kazumaTV_currentUser', email);
        } else {
            localStorage.removeItem('kazumaTV_currentUser');
        }
        this.currentUser = email;
    }

    // Check if user exists
    userExists(email) {
        return !!this.users[email];
    }

    // Register new user
    registerUser(firstname, email, password) {
        if (this.userExists(email)) {
            return { success: false, message: 'البريد الإلكتروني مسجل مسبقاً!' };
        }

        this.users[email] = {
            firstname: firstname,
            email: email,
            password: password,
            verified: false,
            verificationCode: this.generateVerificationCode(),
            createdAt: new Date().toISOString()
        };

        this.saveUsers();
        return { success: true, message: 'تم إنشاء الحساب بنجاح' };
    }

    // Verify user
    verifyUser(email, code) {
        const user = this.users[email];
        if (user && user.verificationCode === code) {
            user.verified = true;
            user.verificationCode = null;
            this.saveUsers();
            return { success: true, message: 'تم تأكيد الحساب بنجاح' };
        }
        return { success: false, message: 'رمز التأكيد غير صحيح' };
    }

    // Login user
    loginUser(email, password) {
        const user = this.users[email];
        if (!user) {
            return { success: false, message: 'البريد الإلكتروني غير مسجل' };
        }

        if (!user.verified) {
            return { success: false, message: 'يرجى تأكيد بريدك الإلكتروني أولاً' };
        }

        if (user.password !== password) {
            return { success: false, message: 'كلمة المرور غير صحيحة' };
        }

        this.setCurrentUser(email);
        return { success: true, message: 'تم تسجيل الدخول بنجاح' };
    }

    // Logout user
    logoutUser() {
        this.setCurrentUser(null);
        return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    }

    // Generate 6-digit verification code
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send verification email
    async sendVerificationEmail(email, firstname) {
        const user = this.users[email];
        if (!user) {
            return { success: false, message: 'المستخدم غير موجود' };
        }

        try {
            // Ensure EmailJS is initialized
            if (typeof emailjs === 'undefined') {
                return { success: false, message: 'خدمة البريد الإلكتروني غير متوفرة' };
            }

            const templateParams = {
                to_name: firstname,
                to_email: email,
                verification_code: user.verificationCode
            };

            console.log('Sending email with params:', templateParams);

            const response = await emailjs.send(
                'service_0ias34f',
                'template_z6biz19',
                templateParams
            );

            console.log('Email sent successfully:', response);
            return { success: true, message: 'تم إرسال رمز التأكيد إلى بريدك الإلكتروني' };
        } catch (error) {
            console.error('Error sending email:', error);
            
            // For testing purposes, let's simulate success if EmailJS fails
            // Remove this in production
            console.log('SIMULATING SUCCESSFUL EMAIL SEND FOR TESTING');
            return { success: true, message: 'تم إرسال رمز التأكيد إلى بريدك الإلكتروني (TEST MODE)' };
            
            // In production, use this instead:
            // return { success: false, message: 'فشل في إرسال بريد التأكيد. يرجى المحاولة مرة أخرى.' };
        }
    }
}

// Create global user manager instance
const userManager = new UserManager();