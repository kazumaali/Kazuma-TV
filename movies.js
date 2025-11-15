const addMovie = document.getElementById("addMovie");
const isAdmin = "kazumasatou20021423@gmail.com";
const addMovieForm = document.getElementById("addMovieForm");

function checkAuth() {
    console.log("checkAuth called"); // Debug log
    
    // Check if userManager exists
    if (typeof userManager === 'undefined') {
        console.error('userManager is not defined');
        if (addMovie) addMovie.style.display = "none";
        return;
    }
    
    const currentUser = userManager.getCurrentUser();
    console.log("Current user:", currentUser); // Debug log
    console.log("Admin email:", isAdmin); // Debug log
    
    if (!addMovie) {
        console.error('addMovie element not found');
        return;
    }
    
    if (currentUser === isAdmin) {
        console.log("User is admin, showing button"); // Debug log
        addMovie.style.display = "flex";
    } else {
        console.log("User is not admin, hiding button"); // Debug log
        addMovie.style.display = "none";
    }
}

function addMovies() {
    
    if (addMovieForm.style.display === "none" || addMovieForm.style.display === "") {
        addMovieForm.style.display = "block"
    } else {
        addMovieForm.style.display = "none"
    }
    
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded"); // Debug log
    
    // Check auth immediately
    checkAuth();
    
    // Also check again after a short delay in case userManager loads slowly
    setTimeout(checkAuth, 500);
});

// Also check when the window fully loads
window.addEventListener('load', function() {
    console.log("Window loaded"); // Debug log
    setTimeout(checkAuth, 1000);
});