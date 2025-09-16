document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION & GLOBAL VARS ---
    const API_BASE_URL = 'http://localhost:8082/api';
    const token = localStorage.getItem('jwtToken');

    // ** CRITICAL SECURITY CHECK **
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // --- STATE MANAGEMENT ---
    let interviewSetupId = null;
    let questions = [];
    let currentQuestionIndex = 0;
    let mediaRecorder;
    let audioChunks = [];

    // --- DOM ELEMENT SELECTORS ---
    const setupContainer = document.getElementById('setup-container');
    const questionContainer = document.getElementById('question-container');
    const endContainer = document.getElementById('end-container');
    
    const setupForm = document.getElementById('interview-setup-form');
    const startInterviewBtn = document.querySelector('#interview-setup-form button[type="submit"]');
    const setupMessage = document.getElementById('message');
    
    const questionText = document.getElementById('question-text');
    const questionCounter = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');
    const answerArea = document.getElementById('answer-area');
    const mainActionBtnContainer = document.getElementById('main-action-btn-container');
    const questionMessage = document.getElementById('question-message');
    const viewResultsBtn = document.getElementById('view-results-btn');
    const restartInterviewBtn = document.getElementById('restart-interview-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // --- EVENT LISTENERS ---

    if (setupForm) {
        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            setupMessage.textContent = 'Setting up your session...';
            startInterviewBtn.disabled = true;
            startInterviewBtn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;

            const formData = {
                domain: setupForm.domain.value,
                skills: setupForm.skills.value,
                experience: setupForm.experience.value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/interview/setup`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    if (response.status === 403) throw new Error('Authentication failed. Please log in again.');
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to create interview session.');
                }
                
                const data = await response.json();
                interviewSetupId = data.interviewSetupId;
                
                setupContainer.classList.add('hidden');
                questionContainer.classList.remove('hidden');
                
                await generateQuestions();

            } catch (error) {
                setupMessage.textContent = error.message;
            } finally {
                startInterviewBtn.disabled = false;
                startInterviewBtn.textContent = 'Start Interview';
            }
        });
    }

    if(restartInterviewBtn) {
        restartInterviewBtn.addEventListener('click', () => window.location.reload());
    }
    
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            window.location.href = 'index.html';
        });
    }


    // --- CORE FUNCTIONS ---

    async function generateQuestions() {
        questionText.innerHTML = `<div class="text-gray-400 animate-pulse">Generating questions with AI... Please wait.</div>`;
        try {
            const response = await fetch(`${API_BASE_URL}/interview/${interviewSetupId}/generate-questions`, {
                method: 'POST',
                headers,
            });

            if (!response.ok) {
                 if (response.status === 403) throw new Error('Authentication failed. Please log in again.');
                 throw new Error('Could not fetch questions from the server.');
            }

            questions = await response.json();
            if(!questions || questions.length === 0) throw new Error('AI could not generate questions. Please try a different topic.');

            currentQuestionIndex = 0;
            displayCurrentQuestion();

        } catch (error) {
            questionText.textContent = error.message;
        }
    }

    function displayCurrentQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endInterview();
            return;
        }
        
        const question = questions[currentQuestionIndex];
        questionText.textContent = question;
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;

        setupRecordingUI();
    }

    function endInterview() {
        progressBar.style.width = '100%';
        questionContainer.classList.add('hidden');
        endContainer.classList.remove('hidden');
        viewResultsBtn.href = `feedback.html?id=${interviewSetupId}`;
    }

    // --- AUDIO RECORDING LOGIC ---

    function setupRecordingUI() {
        answerArea.innerHTML = `
            <button id="start-recording-btn" class="btn-gradient text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                Start Recording Answer
            </button>
        `;
        if (mainActionBtnContainer) mainActionBtnContainer.innerHTML = '';
        document.getElementById('start-recording-btn').addEventListener('click', startRecording);
    }
    
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunks = [];

            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            mediaRecorder.onstop = submitAudio;

            mediaRecorder.start();
            updateUIRecording();
        } catch (error) {
            console.error("Microphone Error:", error);
            if (questionMessage) questionMessage.textContent = "Could not access microphone. Please enable it in your browser settings.";
        }
    }

    function updateUIRecording() {
        answerArea.innerHTML = `
            <div class="flex items-center justify-center space-x-3 text-red-400">
                <div class="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording...</span>
            </div>
        `;
        if (mainActionBtnContainer) {
            mainActionBtnContainer.innerHTML = `
                <button id="stop-recording-btn" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300">
                    Stop Recording
                </button>
            `;
            document.getElementById('stop-recording-btn').addEventListener('click', () => {
                 if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            });
        }
    }

    async function submitAudio() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'answer.webm');
        formData.append('question', questions[currentQuestionIndex]);

        answerArea.innerHTML = `<div class="text-gray-400 animate-pulse">Processing your answer...</div>`;
        if (mainActionBtnContainer) mainActionBtnContainer.innerHTML = '';
        
        try {
            // **FIXED:** Added a token check before submitting
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`${API_BASE_URL}/interview/${interviewSetupId}/submit-answer`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                 if (response.status === 403) throw new Error('Authentication failed. Please log in again.');
                 throw new Error('Failed to submit answer.');
            }
            
            currentQuestionIndex++;
            displayCurrentQuestion();
        } catch (error) {
            if (questionMessage) questionMessage.textContent = error.message;
            setupRecordingUI();
        }
    }
});