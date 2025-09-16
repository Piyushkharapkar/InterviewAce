package com.example.ai_interview.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

@Service
public class AssemblyAiService {

    private final WebClient webClient;

    public AssemblyAiService(@Value("${assemblyai.api.key}") String assemblyAiApiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.assemblyai.com/v2")
                .defaultHeader(HttpHeaders.AUTHORIZATION, assemblyAiApiKey)
                .build();
    }

    public String transcribeAudio(MultipartFile audioFile) throws IOException {
        // Step 1: Upload the audio file
        JsonNode uploadResponse = webClient.post()
                .uri("/upload")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                // **FIXED:** Correct way to send the InputStream in the body
                .body(BodyInserters.fromResource(new InputStreamResource(audioFile.getInputStream())))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        String uploadUrl = uploadResponse.get("upload_url").asText();

        // Step 2: Submit the transcription request
        JsonNode transcriptResponse = webClient.post()
                .uri("/transcript")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"audio_url\":\"" + uploadUrl + "\"}")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        String transcriptId = transcriptResponse.get("id").asText();
        String status = transcriptResponse.get("status").asText();

        // Step 3: Poll the API until the transcription is complete
        while (!"completed".equals(status) && !"error".equals(status)) {
            try {
                Thread.sleep(1000); // Poll every second
                transcriptResponse = webClient.get()
                        .uri("/transcript/" + transcriptId)
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .block();
                status = transcriptResponse.get("status").asText();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return "Transcription failed due to interruption.";
            }
        }

        if ("completed".equals(status)) {
            return transcriptResponse.get("text").asText();
        } else {
            return "Transcription failed.";
        }
    }
}