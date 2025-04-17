// Handle user authentication
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.checkAuthStatus();
    }

    // Check if user is already logged in
    checkAuthStatus() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            this.updateUI();
        }
    }

    // Update UI based on auth status
    updateUI() {
        const loginBtn = document.querySelector('.nav-link[data-bs-target="#loginModal"]');
        const userDropdown = document.getElementById('userDropdown');
        
        if (this.isAuthenticated && this.currentUser) {
            // Hide login button, show user dropdown
            if (loginBtn) loginBtn.style.display = 'none';
            if (userDropdown) {
                userDropdown.style.display = 'block';
                const userNameElement = userDropdown.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = this.currentUser.name;
                }
            }
        } else {
            // Show login button, hide user dropdown
            if (loginBtn) loginBtn.style.display = 'block';
            if (userDropdown) userDropdown.style.display = 'none';
        }
    }

    // Handle login
    async login(email, password) {
        try {
            const response = await fetch('data/users.json');
            const data = await response.json();
            
            const user = data.users.find(u => 
                u.email === email && u.password === this.hashPassword(password)
            );

            if (user) {
                this.isAuthenticated = true;
                this.currentUser = {
                    name: user.name,
                    email: user.email
                };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.updateUI();
                return { success: true, message: 'Login successful!' };
            } else {
                return { success: false, message: 'Invalid email or password.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    }

    // Handle signup
    async signup(name, email, password) {
        try {
            const response = await fetch('data/users.json');
            const data = await response.json();
            
            // Check if user already exists
            if (data.users.some(u => u.email === email)) {
                return { success: false, message: 'Email already registered.' };
            }

            // Add new user
            const newUser = {
                name,
                email,
                password: this.hashPassword(password),
                createdAt: new Date().toISOString()
            };

            data.users.push(newUser);

            // In a real application, you would save this to the server
            // For this demo, we'll just simulate a successful signup
            this.isAuthenticated = true;
            this.currentUser = {
                name: newUser.name,
                email: newUser.email
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUI();

            return { success: true, message: 'Signup successful!' };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'An error occurred during signup.' };
        }
    }

    // Handle logout
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        window.location.href = 'index.html';
    }

    // Simple password hashing (for demo purposes only)
    hashPassword(password) {
        return btoa(password); // In a real app, use a proper hashing algorithm
    }

    // Add this to the Auth class
    async handleForgotPassword(email) {
        try {
            // In a real application, this would make an API call to send a reset email
            // For this demo, we'll simulate the process
            
            // Check if email exists in users
            const response = await fetch('data/users.json');
            const data = await response.json();
            
            const user = data.users.find(u => u.email === email);
            
            if (user) {
                // Show success message
                const modal = document.getElementById('forgotPasswordModal');
                const modalBody = modal.querySelector('.modal-body');
                modalBody.innerHTML = `
                    <div class="password-reset-success">
                        <div class="success-checkmark">
                            <i class="fas fa-check"></i>
                        </div>
                        <h4>Reset Link Sent!</h4>
                        <p class="text-muted">We've sent password reset instructions to your email address. Please check your inbox.</p>
                        <button class="btn btn-auth mt-3" onclick="$('#forgotPasswordModal').modal('hide')">Close</button>
                    </div>
                `;
                return { success: true, message: 'Password reset instructions sent to your email.' };
            } else {
                return { success: false, message: 'No account found with this email address.' };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, message: 'An error occurred. Please try again.' };
        }
    }
}

// Initialize auth
const auth = new Auth();

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await auth.login(email, password);
    
    if (result.success) {
        // Hide modal and show success message
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();
        showToast(result.message, 'success');
    } else {
        // Show error message
        showToast(result.message, 'error');
    }
});

// Handle signup form submission
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
    }
    
    const result = await auth.signup(name, email, password);
    
    if (result.success) {
        // Hide modal and show success message
        const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        modal.hide();
        showToast(result.message, 'success');
    } else {
        // Show error message
        showToast(result.message, 'error');
    }
});

// Show toast messages
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification animate__animated animate__fadeInRight ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate__fadeOutRight');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Add this after the existing event listeners
document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    
    // Add loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const result = await auth.handleForgotPassword(email);
    
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    if (!result.success) {
        showToast(result.message, 'error');
    }
});

// Add this to handle modal state reset
document.getElementById('forgotPasswordModal')?.addEventListener('hidden.bs.modal', function () {
    // Reset form and clear any success message
    const form = this.querySelector('#forgotPasswordForm');
    if (form) form.reset();
    
    // Reset modal content if it was showing success message
    const modalBody = this.querySelector('.modal-body');
    if (!modalBody.querySelector('#forgotPasswordForm')) {
        modalBody.innerHTML = `
            <div class="text-center mb-4">
                <div class="auth-icon-circle mb-4">
                    <i class="fas fa-envelope"></i>
                </div>
                <h4>Forgot your password?</h4>
                <p class="text-muted">Enter your email address and we'll send you instructions to reset your password.</p>
            </div>
            <form id="forgotPasswordForm">
                <div class="form-group mb-4">
                    <label for="resetEmail" class="form-label">Email Address</label>
                    <input type="email" class="form-control" id="resetEmail" required placeholder="Enter your email">
                </div>
                <button type="submit" class="btn btn-auth mb-4">Send Reset Link</button>
                <div class="text-center">
                    <p class="mb-0" style="color: var(--text-secondary);">
                        Remember your password? 
                        <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal" style="color: var(--teal);">Login</a>
                    </p>
                </div>
            </form>
        `;
    }
}); 