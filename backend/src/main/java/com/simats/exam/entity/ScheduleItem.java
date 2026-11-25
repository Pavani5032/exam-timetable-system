package com.simats.exam.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "schedule_items")
public class ScheduleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private TimetableSchedule schedule;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "examination_id", nullable = false)
    private Examination examination;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "time_slot_id", nullable = true)
    private TimeSlot timeSlot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = true)
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = true)
    private Faculty faculty;

    @Column(nullable = false)
    private Integer studentCount = 0;

    @Column(nullable = false, length = 50)
    private String status = "SCHEDULED"; // "SCHEDULED", "CONFLICT", "ALTERNATIVE_SUGGESTED"

    @Column(length = 500)
    private String conflictReason;

    @Column(length = 500)
    private String alternativeSuggestion;

    public ScheduleItem() {}

    public ScheduleItem(TimetableSchedule schedule, Examination examination, TimeSlot timeSlot, Room room, Faculty faculty, Integer studentCount, String status) {
        this.schedule = schedule;
        this.examination = examination;
        this.timeSlot = timeSlot;
        this.room = room;
        this.faculty = faculty;
        this.studentCount = studentCount != null ? studentCount : 0;
        this.status = status != null ? status : "SCHEDULED";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TimetableSchedule getSchedule() { return schedule; }
    public void setSchedule(TimetableSchedule schedule) { this.schedule = schedule; }

    public Examination getExamination() { return examination; }
    public void setExamination(Examination examination) { this.examination = examination; }

    public TimeSlot getTimeSlot() { return timeSlot; }
    public void setTimeSlot(TimeSlot timeSlot) { this.timeSlot = timeSlot; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getConflictReason() { return conflictReason; }
    public void setConflictReason(String conflictReason) { this.conflictReason = conflictReason; }

    public String getAlternativeSuggestion() { return alternativeSuggestion; }
    public void setAlternativeSuggestion(String alternativeSuggestion) { this.alternativeSuggestion = alternativeSuggestion; }
}

