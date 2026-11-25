package com.simats.exam.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_conflicts")
public class ScheduleConflict {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private TimetableSchedule schedule;

    @Column(nullable = false, length = 50)
    private String conflictType; // STUDENT_OVERLAP, ROOM_CAPACITY_EXCEEDED, ROOM_DOUBLE_BOOKING, FACULTY_UNAVAILABLE, FACULTY_OVERLAP, MAX_DAILY_EXAMS

    @Column(nullable = false, length = 20)
    private String severity; // "HARD", "SOFT"

    @Column(nullable = false, length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "examination1_id", nullable = true)
    private Examination examination1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "examination2_id", nullable = true)
    private Examination examination2;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = true)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = true)
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = true)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "time_slot_id", nullable = true)
    private TimeSlot timeSlot;

    @Column(length = 1000)
    private String suggestedResolution;

    private LocalDateTime detectedAt = LocalDateTime.now();

    public ScheduleConflict() {}

    public ScheduleConflict(TimetableSchedule schedule, String conflictType, String severity, String description,
                            Examination examination1, Examination examination2, Student student,
                            Room room, Faculty faculty, TimeSlot timeSlot, String suggestedResolution) {
        this.schedule = schedule;
        this.conflictType = conflictType;
        this.severity = severity;
        this.description = description;
        this.examination1 = examination1;
        this.examination2 = examination2;
        this.student = student;
        this.room = room;
        this.faculty = faculty;
        this.timeSlot = timeSlot;
        this.suggestedResolution = suggestedResolution;
        this.detectedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TimetableSchedule getSchedule() { return schedule; }
    public void setSchedule(TimetableSchedule schedule) { this.schedule = schedule; }

    public String getConflictType() { return conflictType; }
    public void setConflictType(String conflictType) { this.conflictType = conflictType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Examination getExamination1() { return examination1; }
    public void setExamination1(Examination examination1) { this.examination1 = examination1; }

    public Examination getExamination2() { return examination2; }
    public void setExamination2(Examination examination2) { this.examination2 = examination2; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public TimeSlot getTimeSlot() { return timeSlot; }
    public void setTimeSlot(TimeSlot timeSlot) { this.timeSlot = timeSlot; }

    public String getSuggestedResolution() { return suggestedResolution; }
    public void setSuggestedResolution(String suggestedResolution) { this.suggestedResolution = suggestedResolution; }

    public LocalDateTime getDetectedAt() { return detectedAt; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
}

