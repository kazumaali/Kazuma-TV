const addMovie = document.getElementById("addMovie");
const saveMovieBtn = document.getElementById("saveMovieBtn");
const isAdmin = "kazumasatou20021423@gmail.com";
const addMovieForm = document.getElementById("addMovieForm");
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function checkAuth() {
    console.log("checkAuth called"); // Debug log
    
    // Check if userManager exists
    if (typeof userManager === 'undefined') {
        console.error('userManager is not defined');
        if (addMovie) addMovie.style.display = "none";
        if (addMovieForm) addMovieForm.style.display = "none";
        return;
    }
    
    const currentUser = userManager.getCurrentUser();
    console.log("Current user:", currentUser); // Debug log
    console.log("Admin email:", isAdmin); // Debug log
    
    if (!addMovie) {
        console.error('addMovie element not found');
        return;
    }
    
    if (!addMovieForm) {
        console.error('addMovieForm element not found');
        return;
    }
    
    if (currentUser === isAdmin) {
        console.log("User is admin, showing button"); // Debug log
        addMovie.style.display = "flex";
        addMovieForm.style.display = "block";
    } else {
        console.log("User is not admin, hiding button"); // Debug log
        addMovie.style.display = "none";
        addMovieForm.style.display = "none";
    }
}

function addMovies() {
    
    const hidden = window.getComputedStyle(addMovieForm).display === "none";
    addMovieForm.style.display = hidden ? "block" : "none";
    
}

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = function() {
        // Set canvas dimensions to 4:5 aspect ratio
        const targetWidth = 400;  // You can adjust this size
        const targetHeight = 500; // 4:5 ratio (400:500 = 4:5)
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to fill canvas while maintaining aspect ratio
        const imgAspectRatio = img.width / img.height;
        const targetAspectRatio = 4/5; // 0.8
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgAspectRatio > targetAspectRatio) {
            // Image is wider than 4:5 - fit to height
            drawHeight = targetHeight;
            drawWidth = img.width * (targetHeight / img.height);
            offsetX = (targetWidth - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller than 4:5 - fit to width
            drawWidth = targetWidth;
            drawHeight = img.height * (targetWidth / img.width);
            offsetX = 0;
            offsetY = (targetHeight - drawHeight) / 2;
        }
        
        // Draw image centered on canvas
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        // Show the canvas
        canvas.style.display = 'block';
    };
    
    img.src = URL.createObjectURL(file);
});

// Optional: Add image compression
function compressImage(img, quality = 0.8) {
    return canvas.toDataURL('image/jpeg', quality);
}

saveMovieBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (canvas.style.display !== 'none') {
        const processedImageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Processed image ready:', processedImageData);
    }
    
    
    
});

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