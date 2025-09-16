package com.example.ai_interview.service;

import com.example.ai_interview.dto.NlpEvaluationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // **FIXED:** Injects the model name from application.properties
    @Value("${gemini.model.name}")
    private String modelName;

    private final WebClient webClient;

    public GeminiService(@Value("${gemini.api.key}") String geminiApiKey, @Value("${gemini.model.name}") String modelName) {
        this.webClient = WebClient.builder()
                // **FIXED:** Uses the injected modelName
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + geminiApiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public List<String> generateQuestions(String domain, String skills, int experience) {
        String prompt = String.format(
                "You are an expert interviewer. Generate 5 unique technical interview questions for a %s with %d years of experience. The questions should focus on the following key skills: %s. The response should be a JSON array of strings, with each string being a single question. No additional text.",
                domain, experience, skills
        );

        JsonNode response = webClient.post()
                .bodyValue("{\"contents\": [{\"parts\": [{\"text\": \"" + prompt + "\"}]}]}")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        JsonNode parts = response.get("candidates").get(0).get("content").get("parts").get(0);
        String jsonText = parts.get("text").asText();

        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.lastIndexOf("```"));
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonArray = mapper.readTree(jsonText);

            if (jsonArray.isArray()) {
                List<String> questions = new ArrayList<>();
                for (JsonNode questionNode : jsonArray) {
                    questions.add(questionNode.asText());
                }
                return questions;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return Arrays.asList("Failed to generate questions. Please try again.");
    }

    public NlpEvaluationResult generateIdealAnswerAndFeedback(String question, String userAnswer) {
        String prompt = String.format(
                "You are an expert interviewer. A candidate answered the following question. Analyze their answer for accuracy and provide constructive feedback. Also, provide an ideal answer. Your response should be a JSON object with three keys: 'accuracyScore' (a number from 0.0 to 1.0), 'feedback' (a string with constructive criticism), and 'idealAnswer' (a string with a detailed, ideal response). The question was: \"%s\". The candidate's answer was: \"%s\". No additional text.",
                question, userAnswer
        );

        JsonNode response = webClient.post()
                .bodyValue("{\"contents\": [{\"parts\": [{\"text\": \"" + prompt + "\"}]}]}")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        JsonNode parts = response.get("candidates").get(0).get("content").get("parts");
        if (parts.isArray() && parts.size() > 0) {
            String jsonText = parts.get(0).get("text").asText();
            try {
                if (jsonText.startsWith("```json")) {
                    jsonText = jsonText.substring(7, jsonText.lastIndexOf("```"));
                }
                ObjectMapper mapper = new ObjectMapper();
                JsonNode json = mapper.readTree(jsonText);
                return new NlpEvaluationResult(
                        json.get("accuracyScore").asDouble(),
                        json.get("feedback").asText(),
                        json.get("idealAnswer").asText()
                );
            } catch (IOException e) {
                return new NlpEvaluationResult(0.0, "API returned an invalid response format.", "No ideal answer available.");
            }
        }

        return new NlpEvaluationResult(0.0, "Failed to get a response from the API.", "No ideal answer available.");
    }
}