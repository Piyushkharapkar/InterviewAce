document.addEventListener('DOMContentLoaded', () => {
    // This script is specifically for the main landing page (index.html).
    // Its single purpose is to improve user experience by redirecting
    // users who are already logged in to their dashboard.

    const token = localStorage.getItem('jwtToken');

    // Check if a token exists in the browser's storage.
    if (token) {
        // If it does, the user is already logged in. Send them to the dashboard.
        console.log('User is already logged in. Redirecting to dashboard.');
        window.location.href = './dashboard.html';
    } else {
        // If no token is found, do nothing. The user stays on this landing page.
        console.log('User is not logged in. Showing landing page.');
    }
});