package com.resumeanalyzer.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiAiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.groq.api-key}")
    private String apiKey;

    public GeminiAiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.groq.com")
                .build();
        this.objectMapper = objectMapper;
    }

    public AnalysisResult analyzeResume(String resumeText) {
        String prompt = buildPrompt(resumeText);
        String rawResponse = callGroqApi(prompt);
        return parseAnalysisResult(rawResponse);
    }

    private String buildPrompt(String resumeText) {
        return """
                You are an expert ATS (Applicant Tracking System) and resume analyst with 15+ years of experience in HR and technical recruitment.

                Analyze the following resume and provide a comprehensive evaluation in strict JSON format.

                RESUME TEXT:
                ===
                %s
                ===

                Provide your analysis as a valid JSON object with EXACTLY these fields:
                {
                    "atsScore": <integer between 0 and 100>,
                    "strengths": [<list of 4-6 specific strengths as strings>],
                    "missingSkills": [<list of 4-8 important missing skills or keywords>],
                    "suggestions": [<list of 5-8 actionable improvement suggestions as strings>],
                    "recommendedTechnologies": [<list of 6-10 technologies to learn based on career trajectory>],
                    "recommendedProjects": [<list of 4-6 project ideas that would strengthen this resume>],
                    "jobRoles": [<list of 5-8 suitable job roles based on the resume>]
                }

                ATS Score Criteria:
                - 90-100: Exceptional - highly optimized with keywords, clear structure, quantified achievements
                - 75-89: Good - solid resume with minor gaps
                - 60-74: Average - needs improvement in keywords and structure
                - 40-59: Below average - significant missing elements
                - 0-39: Poor - major restructuring needed

                IMPORTANT: Return ONLY the JSON object. No markdown, no code blocks, no explanation. Pure JSON only.
                """.formatted(resumeText.length() > 8000 ? resumeText.substring(0, 8000) : resumeText);
    }

    private String callGroqApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3,
                "max_tokens", 2048
        );

        try {
            Map response = webClient.post()
                    .uri("/openai/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                throw new RuntimeException("Empty response from Groq API");
            }

            List<Map> choices = (List<Map>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No choices in Groq response");
            }

            Map message = (Map) choices.get(0).get("message");
            String content = (String) message.get("content");

            log.debug("Raw Groq response: {}", content);
            return content;

        } catch (WebClientResponseException e) {
            log.error("Groq API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to call Groq AI: " + e.getMessage());
        }
    }

    private AnalysisResult parseAnalysisResult(String jsonResponse) {
        try {
            String cleaned = jsonResponse.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            }

            JsonNode root = objectMapper.readTree(cleaned);

            return AnalysisResult.builder()
                    .atsScore(clampScore(root.path("atsScore").asInt(50)))
                    .strengths(parseStringList(root, "strengths"))
                    .missingSkills(parseStringList(root, "missingSkills"))
                    .suggestions(parseStringList(root, "suggestions"))
                    .recommendedTechnologies(parseStringList(root, "recommendedTechnologies"))
                    .recommendedProjects(parseStringList(root, "recommendedProjects"))
                    .jobRoles(parseStringList(root, "jobRoles"))
                    .build();

        } catch (JsonProcessingException e) {
            log.error("Failed to parse Groq response as JSON: {}", jsonResponse, e);
            return buildFallbackResult();
        }
    }

    private List<String> parseStringList(JsonNode root, String fieldName) {
        List<String> result = new ArrayList<>();
        JsonNode array = root.path(fieldName);
        if (array.isArray()) {
            array.forEach(node -> {
                String value = node.asText().trim();
                if (!value.isEmpty()) result.add(value);
            });
        }
        return result;
    }

    private int clampScore(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private AnalysisResult buildFallbackResult() {
        return AnalysisResult.builder()
                .atsScore(50)
                .strengths(List.of("Analysis encountered an issue. Please try again."))
                .missingSkills(List.of("Unable to determine at this time"))
                .suggestions(List.of("Please re-upload your resume for a fresh analysis"))
                .recommendedTechnologies(List.of("Unable to determine at this time"))
                .recommendedProjects(List.of("Unable to determine at this time"))
                .jobRoles(List.of("Unable to determine at this time"))
                .build();
    }
}
