package com.example.ai_interview.dto;

import com.example.ai_interview.entity.InterviewAnswer;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnswerDTO {

    private Long id;
    private String question;
    private String userAnswer;
    private String idealAnswer;
    private String feedback;
    private double accuracyScore;

    public InterviewAnswerDTO(InterviewAnswer answer) {
        this.id = answer.getId();
        this.question = answer.getQuestion();
        this.userAnswer = answer.getUserAnswer();
        this.idealAnswer = answer.getIdealAnswer();
        this.feedback = answer.getFeedback();
        this.accuracyScore = answer.getAccuracyScore();
    }
}