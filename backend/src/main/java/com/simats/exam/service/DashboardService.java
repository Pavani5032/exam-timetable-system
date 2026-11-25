package com.simats.exam.service;

import com.simats.exam.entity.*;
import com.simats.exam.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private ExaminationRepository examinationRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private TimetableScheduleRepository scheduleRepository;
    @Autowired private ScheduleConflictRepository conflictRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalStudents = studentRepository.count();
        long totalCourses = courseRepository.count();
        long totalExams = examinationRepository.count();
        long totalRooms = roomRepository.count();
        long activeRooms = roomRepository.findByIsActiveTrue().size();
        long totalFaculty = facultyRepository.count();
        long totalSlots = timeSlotRepository.count();
        long totalSchedules = scheduleRepository.count();

        List<TimetableSchedule> schedules = scheduleRepository.findAllByOrderByCreatedAtDesc();
        long publishedSchedules = schedules.stream().filter(s -> "PUBLISHED".equals(s.getStatus())).count();

        stats.put("totalStudents", totalStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("totalExaminations", totalExams);
        stats.put("totalRooms", totalRooms);
        stats.put("activeRooms", activeRooms);
        stats.put("totalFaculty", totalFaculty);
        stats.put("totalTimeSlots", totalSlots);
        stats.put("totalSchedules", totalSchedules);
        stats.put("publishedSchedules", publishedSchedules);

        // Latest schedule info & conflict summary
        if (!schedules.isEmpty()) {
            TimetableSchedule latest = schedules.getFirst();
            stats.put("latestSchedule", latest);

            List<ScheduleConflict> conflicts = conflictRepository.findByScheduleId(latest.getId());
            long hardCount = conflicts.stream().filter(c -> "HARD".equalsIgnoreCase(c.getSeverity())).count();
            long softCount = conflicts.stream().filter(c -> "SOFT".equalsIgnoreCase(c.getSeverity())).count();

            stats.put("activeConflicts", conflicts.size());
            stats.put("hardConflicts", hardCount);
            stats.put("softConflicts", softCount);

            Map<String, Long> conflictTypeBreakdown = conflicts.stream()
                    .collect(Collectors.groupingBy(ScheduleConflict::getConflictType, Collectors.counting()));
            stats.put("conflictTypeBreakdown", conflictTypeBreakdown);
        } else {
            stats.put("latestSchedule", null);
            stats.put("activeConflicts", 0);
            stats.put("hardConflicts", 0);
            stats.put("softConflicts", 0);
            stats.put("conflictTypeBreakdown", Collections.emptyMap());
        }

        // Department distribution
        Map<String, Long> studentsByDept = studentRepository.findAll().stream()
                .collect(Collectors.groupingBy(Student::getDepartment, Collectors.counting()));
        stats.put("studentsByDept", studentsByDept);

        Map<String, Long> coursesByDept = courseRepository.findAll().stream()
                .collect(Collectors.groupingBy(Course::getDepartment, Collectors.counting()));
        stats.put("coursesByDept", coursesByDept);

        // Room capacity distribution
        List<Room> allRooms = roomRepository.findAll();
        Map<String, Integer> roomCapacityTiers = new HashMap<>();
        roomCapacityTiers.put("Small (< 40)", 0);
        roomCapacityTiers.put("Medium (40 - 60)", 0);
        roomCapacityTiers.put("Large (> 60)", 0);

        for (Room r : allRooms) {
            if (r.getCapacity() < 40) roomCapacityTiers.put("Small (< 40)", roomCapacityTiers.get("Small (< 40)") + 1);
            else if (r.getCapacity() <= 60) roomCapacityTiers.put("Medium (40 - 60)", roomCapacityTiers.get("Medium (40 - 60)") + 1);
            else roomCapacityTiers.put("Large (> 60)", roomCapacityTiers.get("Large (> 60)") + 1);
        }
        stats.put("roomCapacityTiers", roomCapacityTiers);

        // Recent Audit Logs
        stats.put("recentAuditLogs", auditLogRepository.findTop20ByOrderByTimestampDesc());

        return stats;
    }
}

