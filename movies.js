const addMovie = document.getElementById("addMovie");
const isAdmin = "kazumasatou20021423@gmail.com";

// Wait for userManager to be available and get current user
let currentUser = null;

function checkAuth() {
    // Get the current user from userManager
    if (typeof userManager !== 'undefined') {
        currentUser = userManager.getCurrentUser();
    }
    
    if (currentUser !== isAdmin) {
        addMovie.style.display = "none";
    } else {
        addMovie.style.display = "flex";
    }
}

// Wait for userManager to load, then check auth
if (typeof userManager !== 'undefined') {
    checkAuth();
} else {
    // If userManager isn't loaded yet, wait for it
    document.addEventListener('DOMContentLoaded', function() {
        // Try again after a short delay to ensure userManager is loaded
        setTimeout(checkAuth, 100);
    });
}

// Also call checkAuth when the page loads
document.addEventListener('DOMContentLoaded', checkAuth);