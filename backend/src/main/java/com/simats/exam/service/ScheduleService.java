package com.simats.exam.service;

import com.simats.exam.algorithm.ConflictGraph;
import com.simats.exam.algorithm.DsaturScheduler;
import com.simats.exam.algorithm.ScheduleValidator;
import com.simats.exam.entity.*;
import com.simats.exam.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    @Autowired private TimetableScheduleRepository scheduleRepository;
    @Autowired private ScheduleItemRepository itemRepository;
    @Autowired private ScheduleConflictRepository conflictRepository;
    @Autowired private ExaminationRepository examinationRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private FacultyUnavailabilityRepository unavailabilityRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private StudentRegistrationRepository registrationRepository;
    @Autowired private SchedulingConstraintRepository constraintRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    public List<TimetableSchedule> getAllSchedules() {
        return scheduleRepository.findAllByOrderByCreatedAtDesc();
    }

    public TimetableSchedule getScheduleById(Long id) {
        return scheduleRepository.findById(id).orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
    }

    public List<ScheduleItem> getScheduleItems(Long scheduleId) {
        return itemRepository.findByScheduleId(scheduleId);
    }

    public List<ScheduleConflict> getScheduleConflicts(Long scheduleId) {
        return conflictRepository.findByScheduleId(scheduleId);
    }

    @Transactional
    public Map<String, Object> generateSchedule(String title, String academicYear, Integer semester, String username) {
        List<Examination> exams = examinationRepository.findAll();
        List<TimeSlot> slots = timeSlotRepository.findAllByOrderByExamDateAscStartTimeAsc();
        List<Room> rooms = roomRepository.findByIsActiveTrue();
        List<Faculty> faculties = facultyRepository.findAll();
        List<FacultyUnavailability> unavailabilities = unavailabilityRepository.findAll();
        List<Student> students = studentRepository.findAll();

        Map<Long, Student> studentMap = students.stream()
                .collect(Collectors.toMap(Student::getId, s -> s));

        Map<Long, Set<Long>> courseStudentIdsMap = new HashMap<>();
        for (StudentRegistration reg : registrationRepository.findAll()) {
            courseStudentIdsMap.computeIfAbsent(reg.getCourse().getId(), k -> new HashSet<>())
                    .add(reg.getStudent().getId());
        }

        // Active constraints
        Map<String, String> constraintMap = new HashMap<>();
        for (SchedulingConstraint sc : constraintRepository.findAll()) {
            if (Boolean.TRUE.equals(sc.getIsEnabled())) {
                constraintMap.put(sc.getConstraintKey(), sc.getConstraintValue());
            }
        }

        // 1. Build Conflict Graph
        ConflictGraph conflictGraph = new ConflictGraph(exams, courseStudentIdsMap, studentMap);

        // 2. Create Schedule Entity
        TimetableSchedule schedule = new TimetableSchedule(
                title != null && !title.isBlank() ? title : "Examination Schedule - " + academicYear,
                academicYear != null ? academicYear : "2026-2027",
                semester != null ? semester : 5,
                "GENERATED"
        );
        schedule.setTotalExams(exams.size());
        schedule = scheduleRepository.save(schedule);

        // 3. Run DSATUR Algorithm & Resource Allocator
        DsaturScheduler scheduler = new DsaturScheduler();
        DsaturScheduler.SchedulingResult result = scheduler.schedule(
                schedule, exams, slots, rooms, faculties, unavailabilities,
                conflictGraph, studentMap, constraintMap
        );

        // Save items
        for (ScheduleItem item : result.items) {
            item.setSchedule(schedule);
            itemRepository.save(item);
        }

        // 4. Run Independent Constraint Validator to catch any interactive issues
        ScheduleValidator.ValidationReport validationReport = ScheduleValidator.validate(
                schedule, result.items, courseStudentIdsMap, studentMap, unavailabilities, constraintMap
        );

        // Merge conflicts
        Set<String> existingDesc = new HashSet<>();
        List<ScheduleConflict> allConflicts = new ArrayList<>();
        for (ScheduleConflict c : result.conflicts) {
            c.setSchedule(schedule);
            existingDesc.add(c.getDescription());
            allConflicts.add(conflictRepository.save(c));
        }
        for (ScheduleConflict c : validationReport.getConflicts()) {
            if (!existingDesc.contains(c.getDescription())) {
                c.setSchedule(schedule);
                allConflicts.add(conflictRepository.save(c));
            }
        }

        int hardConflicts = (int) allConflicts.stream().filter(c -> "HARD".equalsIgnoreCase(c.getSeverity())).count();
        int scheduledCount = (int) result.items.stream().filter(i -> "SCHEDULED".equals(i.getStatus())).count();

        schedule.setScheduledExams(scheduledCount);
        schedule.setConflictCount(allConflicts.size());
        if (hardConflicts > 0) {
            schedule.setStatus("CONFLICT_DETECTED");
            schedule.setSummary("DSATUR completed with " + hardConflicts + " unresolved hard constraint(s). Requires administrator review.");
        } else {
            schedule.setStatus("FEASIBLE");
            schedule.setSummary("Schedule generated successfully with 0 hard conflicts using DSATUR algorithm.");
        }
        scheduleRepository.save(schedule);

        // Audit Log
        auditLogRepository.save(new AuditLog(
                "SCHEDULE_GENERATED",
                "Generated schedule ID " + schedule.getId() + " ('" + schedule.getTitle() + "') with " +
                        scheduledCount + "/" + exams.size() + " exams scheduled and " + hardConflicts + " hard conflicts.",
                username != null ? username : "ADMIN"
        ));

        Map<String, Object> response = new HashMap<>();
        response.put("schedule", schedule);
        response.put("items", result.items);
        response.put("conflicts", allConflicts);
        response.put("statistics", result.statistics);
        response.put("validationReport", validationReport);
        response.put("graphSummary", conflictGraph.getGraphSummary());
        return response;
    }

    @Transactional
    public Map<String, Object> editScheduleItem(Long scheduleId, Long itemId, Long newSlotId, Long newRoomId, Long newFacultyId, String username) {
        TimetableSchedule schedule = getScheduleById(scheduleId);
        ScheduleItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Schedule item not found: " + itemId));

        if (!item.getSchedule().getId().equals(scheduleId)) {
            throw new RuntimeException("Item does not belong to the specified schedule");
        }

        if (newSlotId != null) {
            TimeSlot slot = timeSlotRepository.findById(newSlotId)
                    .orElseThrow(() -> new RuntimeException("Time slot not found: " + newSlotId));
            item.setTimeSlot(slot);
        }
        if (newRoomId != null) {
            Room room = roomRepository.findById(newRoomId)
                    .orElseThrow(() -> new RuntimeException("Room not found: " + newRoomId));
            item.setRoom(room);
        }
        if (newFacultyId != null) {
            Faculty fac = facultyRepository.findById(newFacultyId)
                    .orElseThrow(() -> new RuntimeException("Faculty not found: " + newFacultyId));
            item.setFaculty(fac);
        }

        item.setStatus("SCHEDULED");
        item.setConflictReason(null);
        item.setAlternativeSuggestion(null);
        itemRepository.save(item);

        // Revalidate all constraints across the schedule after this manual edit
        return revalidateSchedule(scheduleId, username);
    }

    @Transactional
    public Map<String, Object> revalidateSchedule(Long scheduleId, String username) {
        TimetableSchedule schedule = getScheduleById(scheduleId);
        List<ScheduleItem> items = itemRepository.findByScheduleId(scheduleId);
        List<FacultyUnavailability> unavailabilities = unavailabilityRepository.findAll();
        List<Student> students = studentRepository.findAll();

        Map<Long, Student> studentMap = students.stream()
                .collect(Collectors.toMap(Student::getId, s -> s));

        Map<Long, Set<Long>> courseStudentIdsMap = new HashMap<>();
        for (StudentRegistration reg : registrationRepository.findAll()) {
            courseStudentIdsMap.computeIfAbsent(reg.getCourse().getId(), k -> new HashSet<>())
                    .add(reg.getStudent().getId());
        }

        Map<String, String> constraintMap = new HashMap<>();
        for (SchedulingConstraint sc : constraintRepository.findAll()) {
            if (Boolean.TRUE.equals(sc.getIsEnabled())) {
                constraintMap.put(sc.getConstraintKey(), sc.getConstraintValue());
            }
        }

        // Run validator
        ScheduleValidator.ValidationReport report = ScheduleValidator.validate(
                schedule, items, courseStudentIdsMap, studentMap, unavailabilities, constraintMap
        );

        // Clear and replace conflicts in DB
        conflictRepository.deleteByScheduleId(scheduleId);
        List<ScheduleConflict> savedConflicts = new ArrayList<>();
        for (ScheduleConflict c : report.getConflicts()) {
            c.setSchedule(schedule);
            savedConflicts.add(conflictRepository.save(c));
        }

        // Update schedule status
        int hardCount = report.getHardConflictCount();
        schedule.setConflictCount(savedConflicts.size());
        if (hardCount > 0) {
            schedule.setStatus("CONFLICT_DETECTED");
            schedule.setSummary("Schedule revalidated: " + hardCount + " hard conflict(s) detected.");
        } else {
            if ("PUBLISHED".equals(schedule.getStatus())) {
                schedule.setStatus("PUBLISHED");
            } else {
                schedule.setStatus("VALIDATED");
            }
            schedule.setSummary("Schedule validated: 0 hard conflicts. All constraints satisfied.");
        }
        schedule.setUpdatedAt(LocalDateTime.now());
        scheduleRepository.save(schedule);

        // Audit Log
        auditLogRepository.save(new AuditLog(
                "SCHEDULE_REVALIDATED",
                "Revalidated schedule ID " + scheduleId + ". Outcome: " + hardCount + " hard conflicts, " +
                        report.getSoftConflictCount() + " soft conflicts.",
                username != null ? username : "ADMIN"
        ));

        Map<String, Object> response = new HashMap<>();
        response.put("schedule", schedule);
        response.put("items", items);
        response.put("conflicts", savedConflicts);
        response.put("validationReport", report);
        return response;
    }

    @Transactional
    public TimetableSchedule publishSchedule(Long scheduleId, String username) {
        TimetableSchedule schedule = getScheduleById(scheduleId);
        Map<String, Object> reval = revalidateSchedule(scheduleId, username);
        ScheduleValidator.ValidationReport report = (ScheduleValidator.ValidationReport) reval.get("validationReport");

        if (report.getHardConflictCount() > 0) {
            throw new IllegalStateException("Cannot publish schedule! There are " +
                    report.getHardConflictCount() + " unresolved hard conflict(s). Please resolve them before publication.");
        }

        schedule.setStatus("PUBLISHED");
        schedule.setUpdatedAt(LocalDateTime.now());
        scheduleRepository.save(schedule);

        auditLogRepository.save(new AuditLog(
                "SCHEDULE_PUBLISHED",
                "Timetable schedule ID " + scheduleId + " ('" + schedule.getTitle() + "') was officially published.",
                username != null ? username : "ADMIN"
        ));

        return schedule;
    }

    @Transactional
    public TimetableSchedule unpublishSchedule(Long scheduleId, String username) {
        TimetableSchedule schedule = getScheduleById(scheduleId);
        schedule.setStatus("VALIDATED");
        schedule.setUpdatedAt(LocalDateTime.now());
        scheduleRepository.save(schedule);

        auditLogRepository.save(new AuditLog(
                "SCHEDULE_UNPUBLISHED",
                "Timetable schedule ID " + scheduleId + " was unpublished back to VALIDATED status.",
                username != null ? username : "ADMIN"
        ));

        return schedule;
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        conflictRepository.deleteByScheduleId(scheduleId);
        itemRepository.deleteByScheduleId(scheduleId);
        scheduleRepository.deleteById(scheduleId);
        auditLogRepository.save(new AuditLog("SCHEDULE_DELETED", "Deleted schedule ID " + scheduleId, "ADMIN"));
    }

    public Map<String, Object> getConflictGraphData() {
        List<Examination> exams = examinationRepository.findAll();
        List<Student> students = studentRepository.findAll();
        Map<Long, Student> studentMap = students.stream().collect(Collectors.toMap(Student::getId, s -> s));

        Map<Long, Set<Long>> courseStudentIdsMap = new HashMap<>();
        for (StudentRegistration reg : registrationRepository.findAll()) {
            courseStudentIdsMap.computeIfAbsent(reg.getCourse().getId(), k -> new HashSet<>())
                    .add(reg.getStudent().getId());
        }

        ConflictGraph graph = new ConflictGraph(exams, courseStudentIdsMap, studentMap);
        return graph.getGraphSummary();
    }
}

