document.addEventListener('DOMContentLoaded', () => {
    const userGreeting = document.getElementById('user-greeting');
    const userInitial = document.getElementById('user-initial');
    const logoutButton = document.getElementById('logout-button');

    // 1. --- SECURITY CHECK ---
    // Immediately check for a token. If it doesn't exist, redirect to login.
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = './login.html';
        return; // Stop further execution
    }

    // 2. --- UI PERSONALIZATION ---
    // Function to decode the JWT and get user info
    const decodeJwt = (token) => {
        try {
            // The payload is the second part of the token
            const base64Url = token.split('.')[1];
            // Replace characters for correct base64 parsing
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Decode, parse as JSON, and return the payload
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Failed to decode JWT:", error);
            // If token is invalid, treat as logged out
            localStorage.removeItem('jwtToken');
            window.location.href = './login.html';
            return null;
        }
    };

    const userData = decodeJwt(token);

    if (userData && userData.sub) {
        const username = userData.sub; // 'sub' is typically the subject/username claim
        userGreeting.textContent = `Welcome, ${username}`;
        userInitial.textContent = username.charAt(0).toUpperCase();
    } else {
        // Handle case where token is present but invalid
        userGreeting.textContent = 'Welcome, Guest';
        userInitial.textContent = 'G';
    }


    // 3. --- EVENT LISTENERS ---
    // Handle logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear the token from storage
            localStorage.removeItem('jwtToken');
            // Redirect to the main page
            window.location.href = '../index.html';
        });
    }

    // 4. --- FUTURE FUNCTIONALITY (Placeholder) ---
    // In the future, a function like this would fetch real data from the backend.
    const fetchDashboardData = async () => {
        // Example:
        // const response = await fetch('http://localhost:8082/api/dashboard/stats', {
        //     headers: { 'Authorization': `Bearer ${token}` }
        // });
        // if (response.ok) {
        //     const data = await response.json();
        //     // Update stats and recent sessions list here...
        //     document.getElementById('sessions-completed').textContent = data.sessionsCompleted;
        // }
    };

    // Call the function to load data
    // fetchDashboardData();
});