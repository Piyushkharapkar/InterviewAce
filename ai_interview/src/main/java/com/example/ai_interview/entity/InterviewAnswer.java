package com.example.ai_interview.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class InterviewAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_setup_id", nullable = false)
    @JsonBackReference
    private InterviewSetup interviewSetup;

    @Lob
    @Column(nullable = false)
    private String question;

    @Lob
    private String userAnswer;

    @Lob
    private String idealAnswer;

    private double accuracyScore;

    @Lob
    private String feedback;

    private String audioFilePath;

    private LocalDateTime submissionTime;
}

