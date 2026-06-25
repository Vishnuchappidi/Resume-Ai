package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.response.ApiResponse;
import com.resumeanalyzer.dto.response.ResumeAnalysisResponse;
import com.resumeanalyzer.security.UserPrincipal;
import com.resumeanalyzer.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        ResumeAnalysisResponse response = resumeService.analyzeResume(file, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume analyzed successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ResumeAnalysisResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        List<ResumeAnalysisResponse> history =
                resumeService.getAnalysisHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> getAnalysis(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        ResumeAnalysisResponse response =
                resumeService.getAnalysisById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnalysis(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        resumeService.deleteAnalysis(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Analysis deleted successfully", null));
    }
}
