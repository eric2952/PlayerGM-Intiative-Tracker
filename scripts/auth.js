class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        if (this.token) {
            this.verifyToken();
        } else {
            this.showLogin();
        }
    }

    async verifyToken() {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.showMainContent();
            } else {
                localStorage.removeItem('token');
                this.showLogin();
            }
        } catch (error) {
            localStorage.removeItem('token');
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'block';
        document.getElementById('mainContent').style.display = 'none';
        this.setupLoginForm();
    }

    showMainContent() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        loadCampaigns(); // Load campaigns after successful auth
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        const loginBtn = document.getElementById('loginBtn');

        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        errorDiv.style.display = 'none';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                this.token = data.token;
                this.showMainContent();
            } else {
                errorDiv.textContent = data.message || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.style.display = 'block';
        } finally {
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.token = null;
        this.showLogin();
    }
}

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});