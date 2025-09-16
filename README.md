-----

# InterviewAce: Your AI-Powered Interview Coach

An innovative full-stack application designed to help job seekers prepare for technical interviews. The system leverages artificial intelligence to generate personalized, domain-specific questions, evaluate verbal responses, and provide instant, actionable feedback.

The application simulates a real interview environment, allowing users to build confidence and improve their communication and technical skills.

## ✨ Features

  - **AI-Driven Question Generation:** Integrates with the Gemini API to create dynamic, unique interview questions based on the user's selected domain, skills, and experience level.
  - **Speech-to-Text Transcription:** Utilizes the AssemblyAI API to transcribe verbal answers into text in real-time.
  - **Intelligent Answer Evaluation:** The backend processes transcribed answers against an ideal response to provide a relevance score.
  - **Personalized Feedback:** Generates detailed feedback on knowledge gaps and provides suggestions for improvement.
  - **Secure Authentication:** A robust, JWT-based authentication system secures the backend API.
  - **Full-Stack Architecture:** A clean separation of concerns with a Spring Boot backend and an HTML, CSS, and JS frontend.

## 🚀 Technologies Used

### Backend (Spring Boot)

  - **Framework:** Spring Boot 
  - **Language:** Java 21
  - **API:** RESTful APIs
  - **Database:** MySQL 
  - **ORM:** Spring Data JPA
  - **Security:** Spring Security with JWT
  - **Web Client:** Spring WebFlux (for non-blocking API calls)
  - **Tools:** Lombok, Maven

### Frontend (HTML/CSS/JS)

  - **Languages:** HTML, CSS, JavaScript
  - **Styling:** Tailwind CSS (via CDN)
  - **API Client:** Fetch API
  - **Build Tool:** A simple web server (e.g., Live Server)

### External Services

  - **Gemini API:** For intelligent question generation and feedback.
  - **AssemblyAI API:** For accurate speech-to-text transcription.

## ⚙️ Setup and Installation

### Prerequisites

  - Java Development Kit (JDK) 17 or higher
  - Maven
  - A MySQL database instance
  - An API key for [AssemblyAI](https://www.assemblyai.com/dashboard/signup)
  - An API key for [Gemini](https://www.google.com/search?q=https://ai.google.dev/docs/get_started)

### 1\. Backend Setup

1.  Clone the repository:
    ```sh
    git clone https://github.com/Piyushkharapkar/interviewace.git
    cd interviewace/backend
    ```
2.  Configure your `application.properties` file:
      * Navigate to `src/main/resources/application.properties`.
      * Update the database credentials and add your API keys:
    <!-- end list -->
    ```properties
    # Database Configuration
    spring.datasource.url=jdbc:mysql://localhost:3306/ai_interview
    spring.datasource.username=your_db_username
    spring.datasource.password=your_db_password

    # Server Configuration
    server.port=8082

    # JWT Configuration (generate a secure 256-bit key)
    jwt.secret=your_super_secret_key_that_is_at_least_256_bits_long

    # External API Keys
    assemblyai.api.key=YOUR_ASSEMBLYAI_API_KEY
    gemini.api.key=YOUR_GEMINI_API_KEY
    ```
3.  Build and run the application using Maven:
    ```sh
    mvn clean install
    java -jar target/interviewace-backend-0.0.1-SNAPSHOT.jar
    ```

### 2\. Frontend Setup

1.  Navigate to the frontend directory:
    ```sh
    cd ../frontend
    ```
2.  Simply open `index.html` in your web browser. You can use an extension like "Live Server" for hot reloading during development.

## 📌 API Endpoints

| Method | Endpoint                             | Description                                                    |
| :----- | :----------------------------------- | :------------------------------------------------------------- |
| `POST` | `/api/auth/register`                 | Registers a new user with email and password.                  |
| `POST` | `/api/auth/login`                    | Authenticates a user and returns a JWT token.                  |
| `POST` | `/api/interview/setup`               | Sets up a new interview session and returns an ID.             |
| `POST` | `/api/interview/{id}/generate-questions` | Generates AI-powered questions for the session.                |
| `POST` | `/api/interview/{id}/submit-answer`      | Submits a user's audio answer for transcription and evaluation.  |
| `GET`  | `/api/interview/{id}/feedback`           | Retrieves the detailed feedback report for an interview session. |
