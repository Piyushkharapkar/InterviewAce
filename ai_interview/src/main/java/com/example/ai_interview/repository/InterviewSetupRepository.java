package com.example.ai_interview.repository;

import com.example.ai_interview.entity.InterviewSetup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewSetupRepository extends JpaRepository<InterviewSetup, Long> {
}