// DOM Elements
const signupContainer = document.getElementById('signup-container');
const loginContainer = document.getElementById('login-container');
const verificationContainer = document.getElementById('verification-container');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');
const notification = document.getElementById('notification');

// Backend API URL - Update this to your deployed backend URL
const API_BASE_URL = 'http://localhost:3000'; // Change when deploying

// Store temporary user data
let tempUserData = null;

// Check if user is already logged in
function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // User is already logged in, redirect to index.html
        window.location.href = 'index.html';
    }
}

// Save current user session
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Logout function (you can add this later if needed)
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Password toggle functionality
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// Show/hide forms
showLoginLink.addEventListener('click', () => {
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});

showSignupLink.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
});

// Show notification
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Save user to localStorage
function saveUser(user) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
    }
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true };
}

// Find user by email
function findUserByEmail(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.email === email);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

// Send verification email via backend
async function sendVerificationEmail(email, username) {
    try {
        const response = await fetch(`${API_BASE_URL}/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username })
        });

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error sending verification email:', error);
        return { 
            success: false, 
            message: 'Failed to connect to server. Please try again.' 
        };
    }
}

// Verify code via backend
async function verifyCode(email, code) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error verifying code:', error);
        return { 
            success: false, 
            message: 'Failed to connect to server. Please try again.' 
        };
    }
}

// Signup form submission
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    // Get form values
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    let hasErrors = false;
    
    // Validate username
    if (username.length < 3) {
        document.getElementById('username-error').textContent = 'Username must be at least 3 characters long';
        document.getElementById('username-error').style.display = 'block';
        hasErrors = true;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address';
        document.getElementById('email-error').style.display = 'block';
        hasErrors = true;
    }
    
    // Validate password
    if (!isStrongPassword(password)) {
        document.getElementById('password-error').textContent = 'Password must be at least 8 characters with uppercase, lowercase, and a number';
        document.getElementById('password-error').style.display = 'block';
        hasErrors = true;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        document.getElementById('confirm-password-error').style.display = 'block';
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Store temporary user data
    tempUserData = {
        username,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    // Send verification email
    showNotification('Sending verification code to your email...', 'info');
    
    const result = await sendVerificationEmail(email, username);
    
    if (result.success) {
        showNotification('Verification code sent to your email!', 'success');
        
        // Show verification form
        signupContainer.style.display = 'none';
        verificationContainer.style.display = 'block';
        
        // Set up verification code input
        setupVerificationInputs();
    } else {
        showNotification(result.message, 'error');
    }
});

// Setup verification code inputs
function setupVerificationInputs() {
    const inputs = document.querySelectorAll('.verification-code input');
    
    inputs.forEach((input, index) => {
        // Focus on first input
        if (index === 0) input.focus();
        
        // Handle input
        input.addEventListener('input', function() {
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

// Verify code button
document.getElementById('verify-btn').addEventListener('click', async function() {
    const inputs = document.querySelectorAll('.verification-code input');
    const enteredCode = Array.from(inputs).map(input => input.value).join('');
    
    if (enteredCode.length !== 6) {
        document.getElementById('verification-error').textContent = 'Please enter the complete 6-digit code';
        document.getElementById('verification-error').style.display = 'block';
        return;
    }
    
    const result = await verifyCode(tempUserData.email, enteredCode);
    
    if (result.success) {
        // Save user permanently
        const saveResult = saveUser(tempUserData);
        
        if (saveResult.success) {
            showNotification('Account created successfully! You can now login.', 'success');
            
            // Set current user session
            setCurrentUser(tempUserData);
            
            // Clear temporary data
            tempUserData = null;
            
            // Redirect to index.html after successful signup
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            showNotification(saveResult.message, 'error');
        }
    } else {
        document.getElementById('verification-error').textContent = result.message;
        document.getElementById('verification-error').style.display = 'block';
    }
});

// Resend verification code
document.getElementById('resend-code').addEventListener('click', async function() {
    if (!tempUserData) return;
    
    showNotification('Resending verification code...', 'info');
    
    const result = await sendVerificationEmail(tempUserData.email, tempUserData.username);
    
    if (result.success) {
        showNotification('New verification code sent to your email!', 'success');
        
        // Clear verification inputs
        document.querySelectorAll('.verification-code input').forEach(input => {
            input.value = '';
        });
        
        // Focus on first input
        document.getElementById('digit1').focus();
        
        // Hide error message
        document.getElementById('verification-error').style.display = 'none';
    } else {
        showNotification(result.message, 'error');
    }
});

// Login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    // Get form values
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Find user
    const user = findUserByEmail(email);
    
    if (!user) {
        document.getElementById('login-email-error').textContent = 'No account found with this email';
        document.getElementById('login-email-error').style.display = 'block';
        return;
    }
    
    if (user.password !== password) {
        document.getElementById('login-password-error').textContent = 'Incorrect password';
        document.getElementById('login-password-error').style.display = 'block';
        return;
    }
    
    // Successful login
    showNotification(`Welcome back, ${user.username}!`, 'success');
    
    // Set current user session
    setCurrentUser(user);
    
    // Redirect to index.html after successful login
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Initialize the app
function init() {
    // Check if user is already logged in
    checkLoginStatus();
    
    console.log('Kazuma TV Signup/Login System Initialized');
    console.log('Backend URL:', API_BASE_URL);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);