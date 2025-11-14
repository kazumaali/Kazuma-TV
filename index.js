// Check login status and update UI
document.addEventListener('DOMContentLoaded', function() {
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');
    
    // Load user manager
    const userManager = new UserManager();
    
    if (userManager.currentUser) {
        // User is logged in
        const user = userManager.users[userManager.currentUser];
        userGreeting.textContent = `مرحباً، ${user.firstname}`;
        logoutBtn.style.display = 'inline-block';
        loginBtn.style.display = 'none';
    } else {
        // User is not logged in
        userGreeting.textContent = '';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'inline-block';
    }
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        userManager.logoutUser();
        window.location.reload();
    });
});