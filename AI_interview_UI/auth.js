document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8082/api/auth';

    // --- LOGIN FORM LOGIC ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const messageDiv = document.getElementById('login-message');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Login failed. Please check your credentials.');
                }

                const data = await response.json();
                // ** FIXED: Corrected the key to 'jwtToken' **
                localStorage.setItem('jwtToken', data.jwtToken);
                window.location.href = 'dashboard.html';

            } catch (error) {
                messageDiv.textContent = error.message;
                messageDiv.classList.remove('hidden');
            }
        });
    }

    // --- REGISTRATION FORM LOGIC ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const messageDiv = document.getElementById('register-message');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value; // **FIXED: Added email field**
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;

            if (password !== confirmPassword) {
                messageDiv.textContent = 'Passwords do not match.';
                messageDiv.classList.remove('hidden');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // ** FIXED: Added email and confirmPassword to the body **
                    body: JSON.stringify({ username, email, password, confirmPassword })
                });

                if (!response.ok) {
                    // ** FIXED: Improved error handling for validation messages **
                    const errorResponse = await response.json();
                    if (errorResponse && Object.keys(errorResponse).length > 0) {
                        const errorMessages = Object.values(errorResponse).join('\n');
                        throw new Error(errorMessages);
                    } else {
                        throw new Error('Registration failed. Please check your credentials.');
                    }
                }
                
                messageDiv.textContent = 'Registration successful! You can now log in.';
                messageDiv.classList.remove('text-red-500', 'hidden');
                messageDiv.classList.add('text-green-500');
                registerForm.reset();

            } catch (error) {
                messageDiv.textContent = error.message;
                messageDiv.classList.remove('hidden');
            }
        });
    }
});