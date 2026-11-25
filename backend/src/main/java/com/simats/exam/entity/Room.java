package com.simats.exam.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String roomNumber; // e.g. "LH-101", "HALL-A", "LAB-302"

    @Column(nullable = false, length = 100)
    private String building; // e.g. "Main Academic Block", "IT Block"

    @Column(nullable = false)
    private Integer capacity; // Seating capacity

    @Column(nullable = false, length = 50)
    private String roomType; // "LECTURE_HALL", "EXAM_HALL", "COMPUTER_LAB"

    private Boolean hasProjector = true;

    @Column(nullable = false)
    private Boolean isActive = true;

    public Room() {}

    public Room(String roomNumber, String building, Integer capacity, String roomType, Boolean hasProjector, Boolean isActive) {
        this.roomNumber = roomNumber;
        this.building = building;
        this.capacity = capacity;
        this.roomType = roomType;
        this.hasProjector = hasProjector != null ? hasProjector : true;
        this.isActive = isActive != null ? isActive : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Boolean getHasProjector() { return hasProjector; }
    public void setHasProjector(Boolean hasProjector) { this.hasProjector = hasProjector; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

