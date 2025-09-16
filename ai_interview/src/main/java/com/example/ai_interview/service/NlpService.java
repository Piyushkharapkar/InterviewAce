package com.example.ai_interview.service;

import com.example.ai_interview.dto.NlpEvaluationResult;
import org.springframework.stereotype.Service;

@Service
public class NlpService {

    /**
     * Simulates the NLP evaluation of a user's answer against an ideal answer.
     * In a real implementation, this would use libraries like CoreNLP, or call a microservice.
     *
     * @param userAnswer The transcribed text from the user.
     * @param idealAnswer The ideal or expected answer for the question.
     * @return A simulated accuracy score and feedback.
     */
    public NlpEvaluationResult evaluateAnswer(String userAnswer, String idealAnswer) {
        // --- START SIMULATION ---
        // You would replace this block with your actual NLP logic.

        double simulatedScore = 0.0;
        String simulatedFeedback = "";
        String simulatedIdealAnswer = "This is a simulated ideal answer based on the provided question.";

        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            simulatedScore = 0.0;
            simulatedFeedback = "Your answer was empty. Please provide a response for evaluation.";
        } else {
            if (userAnswer.length() > 50) {
                simulatedScore = 0.75 + (Math.random() * 0.25); // Score between 75% and 100%
                simulatedFeedback = "Your answer was comprehensive and relevant. Good job!";
            } else {
                simulatedScore = 0.10 + (Math.random() * 0.30); // Score between 10% and 40%
                simulatedFeedback = "Your answer was a good start, but was not detailed enough. Consider adding more technical specifics.";
            }
        }

        // **FIXED:** Now returning all three required fields
        return new NlpEvaluationResult(simulatedScore, simulatedFeedback, simulatedIdealAnswer);
        // --- END SIMULATION ---
    }
}