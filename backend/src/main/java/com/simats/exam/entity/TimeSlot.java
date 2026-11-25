package com.simats.exam.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "time_slots")
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String slotName; // e.g. "Slot 1 (Morning)", "Slot 2 (Afternoon)"

    @Column(nullable = false)
    private LocalDate examDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 20)
    private String sessionType; // "FORENOON" (FN), "AFTERNOON" (AN)

    @Column(nullable = false)
    private Integer slotOrder; // Numeric sequence for chronological ordering / colour index

    public TimeSlot() {}

    public TimeSlot(String slotName, LocalDate examDate, LocalTime startTime, LocalTime endTime, String sessionType, Integer slotOrder) {
        this.slotName = slotName;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.sessionType = sessionType;
        this.slotOrder = slotOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlotName() { return slotName; }
    public void setSlotName(String slotName) { this.slotName = slotName; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public Integer getSlotOrder() { return slotOrder; }
    public void setSlotOrder(Integer slotOrder) { this.slotOrder = slotOrder; }
}

