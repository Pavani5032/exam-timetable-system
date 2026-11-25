package com.simats.exam.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "faculty")
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String facultyCode; // e.g. "FAC-IT-01"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 100)
    private String designation; // e.g. "Professor", "Associate Professor", "Assistant Professor"

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private Integer maxInvigilationPerDay = 1;

    public Faculty() {}

    public Faculty(String facultyCode, String name, String department, String designation, String email, String phone, Integer maxInvigilationPerDay) {
        this.facultyCode = facultyCode;
        this.name = name;
        this.department = department;
        this.designation = designation;
        this.email = email;
        this.phone = phone;
        this.maxInvigilationPerDay = maxInvigilationPerDay != null ? maxInvigilationPerDay : 1;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFacultyCode() { return facultyCode; }
    public void setFacultyCode(String facultyCode) { this.facultyCode = facultyCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Integer getMaxInvigilationPerDay() { return maxInvigilationPerDay; }
    public void setMaxInvigilationPerDay(Integer maxInvigilationPerDay) { this.maxInvigilationPerDay = maxInvigilationPerDay; }
}

