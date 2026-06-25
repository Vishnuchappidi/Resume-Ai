package com.resumeanalyzer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisResponse {

    private Long id;
    private String fileName;
    private Integer atsScore;
    private List<String> strengths;
    private List<String> missingSkills;
    private List<String> suggestions;
    private List<String> recommendedTechnologies;
    private List<String> recommendedProjects;
    private List<String> jobRoles;
    private LocalDateTime createdAt;
}
