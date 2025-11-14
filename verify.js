const form = document.getElementById("form");
const verify_input = document.getElementById("verify-input");
const error_message = document.getElementById("error-message");
const sendCode_btn = document.getElementById("sendC");

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const code = verify_input.value;
    const email = sessionStorage.getItem('verification_email');
    
    if (!code || code.trim() === '') {
        showError('يرجى إدخال رمز التأكيد!');
        return;
    }
    
    if (!email) {
        showError('انتهت الجلسة. يرجى التسجيل مرة أخرى.');
        return;
    }
    
    const result = userManager.verifyUser(email, code);
    
    if (result.success) {
        // Auto login after verification
        const user = userManager.users[email];
        const loginResult = userManager.loginUser(email, user.password);
        
        if (loginResult.success) {
            // Clear session storage
            sessionStorage.removeItem('verification_email');
            sessionStorage.removeItem('verification_firstname');
            window.location.href = "index.html";
        } else {
            showError(loginResult.message);
        }
    } else {
        showError(result.message);
    }
});

sendCode_btn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = sessionStorage.getItem('verification_email');
    const firstname = sessionStorage.getItem('verification_firstname');
    
    if (!email) {
        showError('انتهت الجلسة. يرجى التسجيل مرة أخرى.');
        return;
    }
    
    // Generate new verification code
    userManager.users[email].verificationCode = userManager.generateVerificationCode();
    userManager.saveUsers();
    
    const result = await userManager.sendVerificationEmail(email, firstname);
    
    if (result.success) {
        showSuccess('تم إرسال رمز التأكيد بنجاح!');
    } else {
        showError(result.message);
    }
});

function showError(message) {
    error_message.innerText = message;
    error_message.style.backgroundColor = 'red';
    error_message.style.display = 'block';
}

function showSuccess(message) {
    error_message.innerText = message;
    error_message.style.backgroundColor = 'green';
    error_message.style.display = 'block';
    setTimeout(() => {
        error_message.style.display = 'none';
    }, 3000);
}