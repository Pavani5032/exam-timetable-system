package com.simats.exam.service;

import com.simats.exam.entity.Faculty;
import com.simats.exam.entity.FacultyUnavailability;
import com.simats.exam.entity.TimeSlot;
import com.simats.exam.repository.FacultyRepository;
import com.simats.exam.repository.FacultyUnavailabilityRepository;
import com.simats.exam.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FacultyService {

    @Autowired private FacultyRepository facultyRepository;
    @Autowired private FacultyUnavailabilityRepository unavailabilityRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;

    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    public Faculty getFacultyById(Long id) {
        return facultyRepository.findById(id).orElseThrow(() -> new RuntimeException("Faculty not found: " + id));
    }

    public Faculty createFaculty(Faculty faculty) {
        if (facultyRepository.existsByFacultyCode(faculty.getFacultyCode())) {
            throw new RuntimeException("Faculty code " + faculty.getFacultyCode() + " already exists");
        }
        return facultyRepository.save(faculty);
    }

    public Faculty updateFaculty(Long id, Faculty updated) {
        Faculty existing = getFacultyById(id);
        existing.setName(updated.getName());
        existing.setDepartment(updated.getDepartment());
        existing.setDesignation(updated.getDesignation());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setMaxInvigilationPerDay(updated.getMaxInvigilationPerDay());
        return facultyRepository.save(existing);
    }

    public void deleteFaculty(Long id) {
        facultyRepository.deleteById(id);
    }

    // Unavailability
    public List<FacultyUnavailability> getAllUnavailabilities() {
        return unavailabilityRepository.findAll();
    }

    public List<FacultyUnavailability> getUnavailabilityByFaculty(Long facultyId) {
        return unavailabilityRepository.findByFacultyId(facultyId);
    }

    public FacultyUnavailability addUnavailability(Long facultyId, LocalDate date, Long slotId, String reason) {
        Faculty faculty = getFacultyById(facultyId);
        TimeSlot slot = null;
        if (slotId != null) {
            slot = timeSlotRepository.findById(slotId).orElse(null);
        }
        FacultyUnavailability unav = new FacultyUnavailability(faculty, date, slot, reason);
        return unavailabilityRepository.save(unav);
    }

    public void deleteUnavailability(Long id) {
        unavailabilityRepository.deleteById(id);
    }
}

