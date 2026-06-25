package com.resumeanalyzer.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.ai.AnalysisResult;
import com.resumeanalyzer.ai.GeminiAiService;
import com.resumeanalyzer.dto.response.ResumeAnalysisResponse;
import com.resumeanalyzer.entity.ResumeAnalysis;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.repository.ResumeAnalysisRepository;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.service.ResumeService;
import com.resumeanalyzer.util.PdfExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeServiceImpl implements ResumeService {

    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;
    private final PdfExtractor pdfExtractor;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ResumeAnalysisResponse analyzeResume(MultipartFile file, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        log.info("Starting resume analysis for user: {}, file: {}",
                userId, file.getOriginalFilename());

        // Phase 2: Extract text from PDF
        String resumeText = pdfExtractor.extractText(file);

        // Phase 3: Analyze with Gemini AI
        AnalysisResult analysisResult = geminiAiService.analyzeResume(resumeText);

        // Persist the analysis
        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .user(user)
                .resumeText(resumeText)
                .fileName(file.getOriginalFilename())
                .atsScore(analysisResult.getAtsScore())
                .strengths(toJson(analysisResult.getStrengths()))
                .missingSkills(toJson(analysisResult.getMissingSkills()))
                .suggestions(toJson(analysisResult.getSuggestions()))
                .recommendedTechnologies(toJson(analysisResult.getRecommendedTechnologies()))
                .recommendedProjects(toJson(analysisResult.getRecommendedProjects()))
                .jobRoles(toJson(analysisResult.getJobRoles()))
                .build();

        ResumeAnalysis saved = resumeAnalysisRepository.save(analysis);
        log.info("Resume analysis saved with id: {}, ATS score: {}",
                saved.getId(), saved.getAtsScore());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeAnalysisResponse> getAnalysisHistory(Long userId) {
        List<ResumeAnalysis> analyses =
                resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return analyses.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeAnalysisResponse getAnalysisById(Long analysisId, Long userId) {
        ResumeAnalysis analysis = resumeAnalysisRepository
                .findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Analysis", "id", analysisId));
        return mapToResponse(analysis);
    }

    @Override
    @Transactional
    public void deleteAnalysis(Long analysisId, Long userId) {
        ResumeAnalysis analysis = resumeAnalysisRepository
                .findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Analysis", "id", analysisId));
        resumeAnalysisRepository.delete(analysis);
        log.info("Analysis {} deleted by user {}", analysisId, userId);
    }

    private ResumeAnalysisResponse mapToResponse(ResumeAnalysis analysis) {
        return ResumeAnalysisResponse.builder()
                .id(analysis.getId())
                .fileName(analysis.getFileName())
                .atsScore(analysis.getAtsScore())
                .strengths(fromJson(analysis.getStrengths()))
                .missingSkills(fromJson(analysis.getMissingSkills()))
                .suggestions(fromJson(analysis.getSuggestions()))
                .recommendedTechnologies(fromJson(analysis.getRecommendedTechnologies()))
                .recommendedProjects(fromJson(analysis.getRecommendedProjects()))
                .jobRoles(fromJson(analysis.getJobRoles()))
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    private String toJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize list to JSON", e);
            return "[]";
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse JSON list, attempting plain split: {}", json);
            return Arrays.asList(json.split(","));
        }
    }
}
