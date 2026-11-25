package com.simats.exam.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "examinations")
public class Examination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(unique = true, nullable = false, length = 50)
    private String examCode; // e.g. "EXAM-CSA1016"

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String examType; // "END_SEMESTER", "MID_TERM", "PRACTICAL"

    @Column(nullable = false)
    private Integer durationMinutes; // e.g. 180 (3 hours)

    @Column(nullable = false)
    private Integer studentCount = 0; // Cached or calculated registered student count

    public Examination() {}

    public Examination(Course course, String examCode, String title, String examType, Integer durationMinutes, Integer studentCount) {
        this.course = course;
        this.examCode = examCode;
        this.title = title;
        this.examType = examType;
        this.durationMinutes = durationMinutes;
        this.studentCount = studentCount != null ? studentCount : 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getExamCode() { return examCode; }
    public void setExamCode(String examCode) { this.examCode = examCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }
}

