const addMovie = document.getElementById("addMovie");

const isAdmin = "kazumasatou20021423@gmail.com";

let currentUser = null;

function checkAuth() {
    if (currentUser !== isAdmin) {
        addMovie.style.display = "none";
    } else {
        addMovie.style.display = "flex";
    }
}

checkAuth();