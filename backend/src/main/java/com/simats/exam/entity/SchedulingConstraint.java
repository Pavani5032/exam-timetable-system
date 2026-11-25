package com.simats.exam.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "scheduling_constraints")
public class SchedulingConstraint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String constraintKey; // e.g. "MAX_EXAMS_PER_STUDENT_PER_DAY"

    @Column(nullable = false, length = 150)
    private String constraintName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 100)
    private String constraintValue; // "1", "true", "0.1"

    @Column(nullable = false)
    private Boolean isHardConstraint = true;

    @Column(nullable = false)
    private Boolean isEnabled = true;

    public SchedulingConstraint() {}

    public SchedulingConstraint(String constraintKey, String constraintName, String description, String constraintValue, Boolean isHardConstraint, Boolean isEnabled) {
        this.constraintKey = constraintKey;
        this.constraintName = constraintName;
        this.description = description;
        this.constraintValue = constraintValue;
        this.isHardConstraint = isHardConstraint != null ? isHardConstraint : true;
        this.isEnabled = isEnabled != null ? isEnabled : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConstraintKey() { return constraintKey; }
    public void setConstraintKey(String constraintKey) { this.constraintKey = constraintKey; }

    public String getConstraintName() { return constraintName; }
    public void setConstraintName(String constraintName) { this.constraintName = constraintName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getConstraintValue() { return constraintValue; }
    public void setConstraintValue(String constraintValue) { this.constraintValue = constraintValue; }

    public Boolean getIsHardConstraint() { return isHardConstraint; }
    public void setIsHardConstraint(Boolean isHardConstraint) { this.isHardConstraint = isHardConstraint; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
}

