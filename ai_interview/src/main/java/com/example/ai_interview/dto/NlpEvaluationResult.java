package com.example.ai_interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NlpEvaluationResult {
    private double score;
    private String feedback;
    private String idealAnswer;
}