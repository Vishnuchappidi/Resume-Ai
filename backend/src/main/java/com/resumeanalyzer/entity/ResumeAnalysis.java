package com.resumeanalyzer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resume_text", nullable = false, columnDefinition = "LONGTEXT")
    private String resumeText;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    @Column(name = "recommended_technologies", columnDefinition = "TEXT")
    private String recommendedTechnologies;

    @Column(name = "recommended_projects", columnDefinition = "TEXT")
    private String recommendedProjects;

    @Column(name = "job_roles", columnDefinition = "TEXT")
    private String jobRoles;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
