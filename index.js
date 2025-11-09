// Check login status and update UI
        function checkAuthStatus() {
            const authSection = document.getElementById('auth-section');
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (currentUser) {
                // User is logged in - show welcome message and logout button
                authSection.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span class="welcome-message">Welcome, ${currentUser.username}!</span>
                        <button class="logout-btn" onclick="logout()">Logout</button>
                    </div>
                `;
            } else {
                // User is not logged in - show login button
                authSection.innerHTML = `
                    <button class="login-btn">
                        <a href="login.html" style="color: white; text-decoration: none;">Login</a>
                    </button>
                `;
            }
        }
        
        // Logout function
        function logout() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html'; // Reload the page
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', checkAuthStatus);