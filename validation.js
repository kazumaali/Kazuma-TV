const form = document.getElementById("form");
const error_message = document.getElementById("error-message");

// Get input elements
const firstname_input = document.getElementById("firstname-input");
const email_input = document.getElementById("email-input");
const password_input = document.getElementById("password-input");
const rpi = document.getElementById("repeat-password-input");

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let errors = [];
    
    // Wait for userManager to be available
    while (typeof userManager === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (firstname_input) {
        // Signup form validation
        errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, rpi.value);
        
        if (errors.length === 0) {
            // Check if user already exists
            if (userManager.userExists(email_input.value)) {
                errors.push('البريد الإلكتروني مسجل مسبقاً!');
                email_input.parentElement.classList.add('incorrect');
            }
        }

        if (errors.length === 0) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'جاري الإنشاء...';
            submitBtn.disabled = true;

            try {
                // Register user
                const result = userManager.registerUser(
                    firstname_input.value, 
                    email_input.value, 
                    password_input.value
                );
                
                if (result.success) {
                    // Store email for verification page
                    sessionStorage.setItem('verification_email', email_input.value);
                    sessionStorage.setItem('verification_firstname', firstname_input.value);
                    
                    // Send verification email
                    const emailResult = await userManager.sendVerificationEmail(
                        email_input.value, 
                        firstname_input.value
                    );
                    
                    if (emailResult.success) {
                        window.location.href = "verify.html";
                    } else {
                        showError(emailResult.message);
                    }
                } else {
                    showError(result.message);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                showError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
            } finally {
                // Restore button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } else {
            showError(errors.join(' '));
        }
    } else {
        // Login form validation
        errors = getLoginFormErrors(email_input.value, password_input.value);
        
        if (errors.length === 0) {
            const result = userManager.loginUser(email_input.value, password_input.value);
            
            if (result.success) {
                window.location.href = "index.html";
            } else {
                showError(result.message);
                if (password_input) password_input.parentElement.classList.add('incorrect');
            }
        } else {
            showError(errors.join(' '));
        }
    }
});

function getSignupFormErrors(firstname, email, password, rp){
    let errors = [];
    
    if (!firstname || firstname.trim() === '') {
        errors.push('يرجى إدخال الاسم الأول!');
        if(firstname_input) firstname_input.parentElement.classList.add('incorrect');
    }
    
    if (!email || email.trim() === '') {
        errors.push('يرجى إدخال البريد الإلكتروني!');
        if(email_input) email_input.parentElement.classList.add('incorrect');
    } else if (!isValidEmail(email)) {
        errors.push('يرجى إدخال بريد إلكتروني صحيح!');
        if(email_input) email_input.parentElement.classList.add('incorrect');
    }
    
    if (!password || password.trim() === '') {
        errors.push('يرجى إدخال كلمة المرور!');
        if(password_input) password_input.parentElement.classList.add('incorrect');
    }
    
    if (!rp || rp.trim() === '') {
        errors.push('يرجى تأكيد كلمة المرور!');
        if(rpi) rpi.parentElement.classList.add('incorrect');
    }
    
    if(password && password.length < 6){
        errors.push('يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل!');
        if(password_input) password_input.parentElement.classList.add('incorrect');
    }
    
    if(password && rp && password !== rp){
        errors.push('كلمتا المرور غير متطابقتين!');
        if(password_input) password_input.parentElement.classList.add('incorrect');
        if(rpi) rpi.parentElement.classList.add('incorrect');
    }
    
    return errors;
}

function getLoginFormErrors(email, password){
    let errors = [];
    
    if (!email || email.trim() === '') {
        errors.push('يرجى إدخال البريد الإلكتروني!');
        if(email_input) email_input.parentElement.classList.add('incorrect');
    }
    
    if (!password || password.trim() === '') {
        errors.push('يرجى إدخال كلمة المرور!');
        if(password_input) password_input.parentElement.classList.add('incorrect');
    }
    
    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    error_message.innerText = message;
    error_message.style.display = 'block';
}

// Clear error styling on input
const allInput = [firstname_input, email_input, password_input, rpi].filter(input => input != null);

allInput.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect');
            if(error_message) error_message.style.display = 'none';
        }
    });
});