document.addEventListener('DOMContentLoaded', () => {

    // --- AUTHENTICATION & GLOBAL VARS ---
    const API_BASE_URL = 'http://localhost:8082/api/interview';
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = './login.html';
        return;
    }
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // --- DOM Elements ---
    const loadingContainer = document.getElementById('loading-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const resultsList = document.getElementById('results-list');
    const logoutBtn = document.getElementById('logout-btn');


    /**
     * Creates the HTML for a single question's feedback card.
     * @param {object} result - The result item for one question.
     * @param {number} index - The question number (0-based).
     * @returns {HTMLElement} - The created card element.
     */
    function createFeedbackCard(result, index) {
        // **FIXED:** Using accuracyScore
        const score = Math.round(result.accuracyScore * 100);
        let scoreColorClass;
        if (score >= 70) scoreColorClass = 'text-green-600';
        else if (score >= 40) scoreColorClass = 'text-yellow-600';
        else scoreColorClass = 'text-red-600';

        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02]';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">Question ${index + 1}</h3>
                    <p class="text-gray-700 mt-1">${result.question}</p>
                </div>
                <div class="text-center ml-4 flex-shrink-0">
                    <p class="font-bold text-3xl ${scoreColorClass}">${score}%</p>
                    <p class="text-sm text-gray-500">Accuracy</p>
                </div>
            </div>

            <div class="mb-4">
                <h4 class="font-semibold text-gray-700 mb-2">Your Answer:</h4>
                <p class="bg-gray-100 p-4 rounded-md text-gray-800 border border-gray-200 text-sm leading-relaxed">
                    ${result.userAnswer}
                </p>
            </div>

            <div class="mb-4">
                <h4 class="font-semibold text-gray-700 mb-2">Ideal Answer:</h4>
                <p class="bg-green-50 p-4 rounded-md text-gray-800 border border-green-200 text-sm leading-relaxed">
                    ${result.idealAnswer}
                </p>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">AI Feedback:</h4>
                <p class="bg-indigo-50 p-4 rounded-md text-gray-800 border border-indigo-200 text-sm leading-relaxed">
                    ${result.feedback}
                </p>
            </div>
        `;
        return card;
    }

    /**
     * Fetches and displays the feedback results from the backend.
     * @param {string} setupId - The ID of the interview session.
     */
    async function fetchFeedback(setupId) {
        try {
            // **FIXED:** Corrected the endpoint URL
            const response = await fetch(`${API_BASE_URL}/${setupId}/feedback`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error('Authentication failed. Please log in again.');
                throw new Error('Could not fetch results.');
            }

            // **FIXED:** The response is a JSON array, not a nested object
            const answers = await response.json();

            // Clear previous results and render new ones
            resultsList.innerHTML = '';
            if (answers.length > 0) {
                 // **FIXED:** The backend does not return domain/skills, so we cannot populate this line
                answers.forEach((result, index) => {
                    const card = createFeedbackCard(result, index);
                    resultsList.appendChild(card);
                });
            } else {
                 resultsList.innerHTML = `<p class="text-gray-500 text-center font-semibold p-8">No feedback available for this session.</p>`;
            }

            // Show the feedback container and hide the loader
            loadingContainer.classList.add('hidden');
            feedbackContainer.classList.remove('hidden');

        } catch (error) {
            loadingContainer.innerHTML = `<p class="text-red-500 font-semibold p-8">Error: ${error.message}</p>`;
            loadingContainer.classList.remove('hidden');
        }
    }

    // --- INITIALIZATION ---
    const params = new URLSearchParams(window.location.search);
    const setupId = params.get('id');

    if (setupId) {
        fetchFeedback(setupId);
    } else {
        loadingContainer.innerHTML = `<p class="text-red-500 font-semibold p-8">Error: No interview session ID was provided in the URL.</p>`;
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            window.location.href = '../login.html';
        });
    }
});