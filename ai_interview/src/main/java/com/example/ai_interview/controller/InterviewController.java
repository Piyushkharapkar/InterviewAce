package com.example.ai_interview.controller;

import com.example.ai_interview.entity.InterviewAnswer;
import com.example.ai_interview.entity.InterviewSetup;
import com.example.ai_interview.entity.User;
import com.example.ai_interview.repository.InterviewAnswerRepository;
import com.example.ai_interview.repository.InterviewSetupRepository;
import com.example.ai_interview.repository.UserRepository;
import com.example.ai_interview.service.AssemblyAiService;
import com.example.ai_interview.service.GeminiService;
import com.example.ai_interview.dto.NlpEvaluationResult;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    @Autowired
    private InterviewSetupRepository interviewSetupRepository;

    @Autowired
    private InterviewAnswerRepository interviewAnswerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private AssemblyAiService assemblyAiService;

    @PostMapping("/setup")
    public ResponseEntity<?> setupInterview(@RequestBody Map<String, Object> setupData, Authentication authentication) {

        // **FIXED:** Correctly getting the user entity from the database
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterviewSetup setup = new InterviewSetup();
        setup.setUser(user);
        setup.setDomain((String) setupData.get("domain"));
        setup.setSkills((String) setupData.get("skills"));

        Object experienceObj = setupData.get("experience");
        if (experienceObj instanceof Integer) {
            setup.setExperience((Integer) experienceObj);
        } else if (experienceObj instanceof Double) {
            setup.setExperience(((Double) experienceObj).intValue());
        } else if (experienceObj instanceof String) {
            try {
                setup.setExperience(Integer.parseInt((String) experienceObj));
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Invalid format for 'experience'");
            }
        }

        setup.setCreationTime(LocalDateTime.now());
        InterviewSetup savedSetup = interviewSetupRepository.save(setup);
        Map<String, Long> response = new HashMap<>();
        response.put("interviewSetupId", savedSetup.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{interviewSetupId}/generate-questions")
    public ResponseEntity<?> generateQuestions(@PathVariable Long interviewSetupId) {
        InterviewSetup setup = interviewSetupRepository.findById(interviewSetupId)
                .orElseThrow(() -> new RuntimeException("Interview session not found."));

        List<String> questions = geminiService.generateQuestions(setup.getDomain(), setup.getSkills(), setup.getExperience());

        return ResponseEntity.ok(questions);
    }

    @PostMapping("/{interviewSetupId}/submit-answer")
    public ResponseEntity<?> submitAnswer(@PathVariable Long interviewSetupId,
                                          @RequestPart("audio") MultipartFile audioFile,
                                          @RequestPart("question") String question) throws IOException {

        String transcribedText = assemblyAiService.transcribeAudio(audioFile);

        NlpEvaluationResult evaluation = geminiService.generateIdealAnswerAndFeedback(question, transcribedText);

        InterviewSetup setup = interviewSetupRepository.findById(interviewSetupId)
                .orElseThrow(() -> new RuntimeException("Interview session not found."));

        InterviewAnswer answer = new InterviewAnswer();
        answer.setInterviewSetup(setup);
        answer.setQuestion(question);
        answer.setUserAnswer(transcribedText);
        answer.setIdealAnswer(evaluation.getIdealAnswer());
        answer.setAccuracyScore(evaluation.getScore());
        answer.setFeedback(evaluation.getFeedback());
        answer.setSubmissionTime(LocalDateTime.now());

        interviewAnswerRepository.save(answer);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{interviewSetupId}/feedback")
    public ResponseEntity<List<InterviewAnswer>> getFeedback(@PathVariable Long interviewSetupId) {
        List<InterviewAnswer> answers = interviewAnswerRepository.findByInterviewSetupId(interviewSetupId);
        return ResponseEntity.ok(answers);
    }
}