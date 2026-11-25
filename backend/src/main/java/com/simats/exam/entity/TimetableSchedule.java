package com.simats.exam.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "timetable_schedules")
public class TimetableSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title; // e.g. "End Semester Examinations - Fall 2026"

    @Column(nullable = false, length = 20)
    private String academicYear; // e.g. "2026-2027"

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false, length = 50)
    private String status; // "DRAFT", "GENERATED", "VALIDATED", "PUBLISHED"

    @Column(length = 100)
    private String algorithmUsed = "DSATUR_GRAPH_COLOURING";

    private Integer totalExams = 0;
    private Integer scheduledExams = 0;
    private Integer conflictCount = 0;

    @Column(length = 1000)
    private String summary;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TimetableSchedule() {}

    public TimetableSchedule(String title, String academicYear, Integer semester, String status) {
        this.title = title;
        this.academicYear = academicYear;
        this.semester = semester;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAlgorithmUsed() { return algorithmUsed; }
    public void setAlgorithmUsed(String algorithmUsed) { this.algorithmUsed = algorithmUsed; }

    public Integer getTotalExams() { return totalExams; }
    public void setTotalExams(Integer totalExams) { this.totalExams = totalExams; }

    public Integer getScheduledExams() { return scheduledExams; }
    public void setScheduledExams(Integer scheduledExams) { this.scheduledExams = scheduledExams; }

    public Integer getConflictCount() { return conflictCount; }
    public void setConflictCount(Integer conflictCount) { this.conflictCount = conflictCount; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

