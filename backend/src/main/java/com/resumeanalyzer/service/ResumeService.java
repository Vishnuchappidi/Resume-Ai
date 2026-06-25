package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.response.ResumeAnalysisResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {

    ResumeAnalysisResponse analyzeResume(MultipartFile file, Long userId);

    List<ResumeAnalysisResponse> getAnalysisHistory(Long userId);

    ResumeAnalysisResponse getAnalysisById(Long analysisId, Long userId);

    void deleteAnalysis(Long analysisId, Long userId);
}
