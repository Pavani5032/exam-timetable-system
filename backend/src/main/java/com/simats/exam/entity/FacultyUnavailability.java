package com.simats.exam.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "faculty_unavailability")
public class FacultyUnavailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(nullable = false)
    private LocalDate unavailableDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "time_slot_id", nullable = true)
    private TimeSlot timeSlot; // null means all day unavailable

    @Column(length = 200)
    private String reason;

    public FacultyUnavailability() {}

    public FacultyUnavailability(Faculty faculty, LocalDate unavailableDate, TimeSlot timeSlot, String reason) {
        this.faculty = faculty;
        this.unavailableDate = unavailableDate;
        this.timeSlot = timeSlot;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public LocalDate getUnavailableDate() { return unavailableDate; }
    public void setUnavailableDate(LocalDate unavailableDate) { this.unavailableDate = unavailableDate; }

    public TimeSlot getTimeSlot() { return timeSlot; }
    public void setTimeSlot(TimeSlot timeSlot) { this.timeSlot = timeSlot; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

