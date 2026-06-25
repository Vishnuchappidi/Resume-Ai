package com.resumeanalyzer.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {

    private int atsScore;
    private List<String> strengths;
    private List<String> missingSkills;
    private List<String> suggestions;
    private List<String> recommendedTechnologies;
    private List<String> recommendedProjects;
    private List<String> jobRoles;
}
