const form = document.getElementById("form");

const firstname_input = document.getElementById("firstname-input");

const email_input = document.getElementById("email-input");

const password_input = document.getElementById("password-input");

const rpi = document.getElementById("repeat-password-input");

const error_message = document.getElementById("error-message");

form.addEventListener('submit', (e) => {
    
    let errors = []
    
    if (firstname_input) {
        errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, rpi.value)
    } else {
        errors = getLoginFormErrors(email_input.value, password_input.value)
    }
    
    if (errors.length > 0) {
        e.preventDefault()
        error_message.innerText = errors.join(' ')
    }
})

function getSignupFormErrors(firstname, email, password, rp){
    let errors = []
    
    if (firstname === '' || firstname == null) {
        errors.push('رجاءا أدخل إسماً!')
        firstname_input.parentElement.classList.add('incorrect')
    }
    
    if (email === '' || email == null) {
        errors.push('رجاءا أدخل بريداً إلكترونياً!')
        email_input.parentElement.classList.add('incorrect')
    }
    
    if (password === '' || password == null) {
        errors.push('رجاءا أدخل كلمة مرور!')
        password_input.parentElement.classList.add('incorrect')
    }
    
    if (rp === '' || rp == null) {
        errors.push('رجاءا أكِّد كلمة المرور!')
        rpi.parentElement.classList.add('incorrect')
    }
    
    if(password.length < 6){
        errors.push('كلمة المرور يجب أن تحتوي على ٦ عناصر على الأقل!')
        password_input.parentElement.classList.add('incorrect')
    }
    
    if(password !== rp){
        errors.push('كلمتا المرور ليستا متطابقتين!')
        password_input.parentElement.classList.add('incorrect')
        rpi.parentElement.classList.add('incorrect')
    }
    
    return errors;
}

function getLoginFormErrors(email, password){
    let errors = []
    
    if (email === '' || email == null) {
        errors.push('رجاءا أدخل بريدك الإلكتروني!')
        email_input.parentElement.classList.add('incorrect')
    }
    
    if (password === '' || password == null) {
        errors.push('رجاءا أدخل كلمة مرور!')
        password_input.parentElement.classList.add('incorrect')
    }
    
    if(password.length < 6){
        errors.push('كلمة المرور يجب أن تحتوي على ٦ عناصر على الأقل!')
        password_input.parentElement.classList.add('incorrect')
    }
    
    return errors;
}

const allInput = [firstname_input, email_input, password_input, rpi].filter(input => input != null)

allInput.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect')
            error_message.innerText = ''
        }
    })
})