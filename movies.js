const moviesContainer = document.getElementById('moviesContainer');
const videoInput = document.getElementById('videoInput');
const story = document.getElementById('story');
const movieType = document.getElementById('movieType');
const ageRange = document.getElementById('ageRange');
const addMovie = document.getElementById("addMovie");
const genre = document.getElementById('genre');
const movieName = document.getElementById('movieName');
const saveMovieBtn = document.getElementById("saveMovieBtn");
const cancelMovieBtn = document.getElementById("cancelMovieBtn");
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

function saveMovie(movieData) {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    movies.push(movieData);
    localStorage.setItem('movies', JSON.stringify(movies));
}

// Function to display a movie card
function displayMovie(movieData) {
    
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = `
        ${movieData.poster ? `<img src="${movieData.poster}" class="movie-poster" alt="${movieData.name}">` : '<div class="movie-poster" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">لا يوجد بوستر</div>'}
        <div class="movie-info">
            <h3 class="movie-title">${movieData.name}</h3>
            <p class="movie-story">${movieData.story || 'لا توجد قصة متاحة'}</p>
            <div class="movie-details">
                <span>${movieData.type === 'series' ? 'مسلسل' : 'فيلم'}</span>
                <span>${getAgeRangeText(movieData.ageRange)}</span>
            </div>
            <div class="movie-genres">
                ${movieData.genres.map(genre => `<span class="genre-tag">${getGenreText(genre)}</span>`).join('')}
            </div>
        </div>
    `;
    
    moviesContainer.appendChild(movieCard);
}

// Helper function to get age range text
function getAgeRangeText(ageRange) {
    const ageMap = {
        'forEveryone': 'للجميع',
        'up12': '+12',
        'up18': '+18'
    };
    return ageMap[ageRange] || ageRange;
}

// Helper function to get genre text
function getGenreText(genre) {
    // You can create a mapping similar to ageRange if needed
    return genre;
}

// Load existing movies when page loads
function loadExistingMovies() {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    movies.forEach(movie => displayMovie(movie));
}

cancelMovieBtn.addEventListener('click', function(e) {
    
    addMovieForm.reset();
    
});

saveMovieBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Check if user is admin
    const currentUser = userManager.getCurrentUser();
    if (currentUser !== isAdmin) {
        alert("غير مصرح لك بإضافة عروض!");
        return;
    }
    
    // Collect movie data
    const movieData = {
        id: Date.now(), // Simple unique ID
        name: movieName.value,
        genres: Array.from(genre.selectedOptions).map(opt => opt.value),
        ageRange: ageRange.value,
        type: movieType.value,
        story: story.value,
        createdAt: new Date().toISOString()
    };
    
    // Process image if available
    if (canvas.style.display !== 'none') {
        movieData.poster = canvas.toDataURL('image/jpeg', 0.8);
    }
    
    // Process video if available
    const videoFile = videoInput.files[0];
    if (videoFile) {
        // For now, we'll store the file name. In a real app, you'd upload this to a server.
        movieData.videoName = videoFile.name;
    }
    
    // Save the movie
    saveMovie(movieData);
    
    // Display the movie to audience
    displayMovie(movieData);
    
    // Reset and hide the form
    addMovieForm.reset();
    canvas.style.display = 'none';
    addMovieForm.style.display = 'none';
    
    console.log('Movie saved and displayed:', movieData);
});

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadExistingMovies();
    // ... your existing code
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded"); // Debug log
    
    loadExistingMovies();
    
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