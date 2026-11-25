package com.simats.exam.algorithm;

import com.simats.exam.entity.*;

import java.time.LocalDate;
import java.util.*;

public class DsaturScheduler {

    public static class SchedulingResult {
        public List<ScheduleItem> items = new ArrayList<>();
        public List<ScheduleConflict> conflicts = new ArrayList<>();
        public Map<String, Object> statistics = new HashMap<>();
        public boolean isFeasible = true;
    }

    public SchedulingResult schedule(
            TimetableSchedule schedule,
            List<Examination> examinations,
            List<TimeSlot> timeSlots,
            List<Room> rooms,
            List<Faculty> faculties,
            List<FacultyUnavailability> unavailabilities,
            ConflictGraph conflictGraph,
            Map<Long, Student> studentMap,
            Map<String, String> constraintMap
    ) {
        SchedulingResult result = new SchedulingResult();

        if (examinations.isEmpty()) {
            result.isFeasible = true;
            result.statistics.put("message", "No examinations to schedule.");
            return result;
        }

        if (timeSlots.isEmpty()) {
            result.isFeasible = false;
            ScheduleConflict conflict = new ScheduleConflict(
                    schedule, "TIME_SLOT_EXHAUSTION", "HARD",
                    "No time slots available in the system.",
                    null, null, null, null, null, null,
                    "Create time slots in Module 1 before running the timetable generator."
            );
            result.conflicts.add(conflict);
            return result;
        }

        // Parse constraints
        int maxExamsPerDay = 1;
        try {
            if (constraintMap.containsKey("MAX_EXAMS_PER_STUDENT_PER_DAY")) {
                maxExamsPerDay = Integer.parseInt(constraintMap.get("MAX_EXAMS_PER_STUDENT_PER_DAY"));
            }
        } catch (Exception ignored) {}

        boolean strictFacultyAvailability = true;
        if (constraintMap.containsKey("CHECK_FACULTY_AVAILABILITY")) {
            strictFacultyAvailability = Boolean.parseBoolean(constraintMap.get("CHECK_FACULTY_AVAILABILITY"));
        }

        // Sort time slots chronologically
        List<TimeSlot> sortedSlots = new ArrayList<>(timeSlots);
        sortedSlots.sort(Comparator.comparing(TimeSlot::getExamDate).thenComparing(TimeSlot::getSlotOrder));

        // State trackers
        Map<Long, TimeSlot> assignedExamSlot = new HashMap<>();
        Map<Long, Set<TimeSlot>> neighborColors = new HashMap<>(); // Saturation tracking
        Map<Long, Integer> unassignedDegrees = new HashMap<>();
        Set<Long> unassignedExamIds = new HashSet<>();

        for (Examination exam : examinations) {
            unassignedExamIds.add(exam.getId());
            neighborColors.put(exam.getId(), new HashSet<>());
            unassignedDegrees.put(exam.getId(), conflictGraph.getDegree(exam.getId()));
        }

        // Student daily exam counts: Map<StudentId, Map<LocalDate, Integer>>
        Map<Long, Map<LocalDate, Integer>> studentDailyExams = new HashMap<>();

        // Room allocations: Map<TimeSlotId, Set<Long>> (roomId)
        Map<Long, Set<Long>> slotBookedRooms = new HashMap<>();

        // Faculty allocations: Map<TimeSlotId, Set<Long>> (facultyId)
        Map<Long, Set<Long>> slotBookedFaculties = new HashMap<>();

        // Faculty daily count: Map<FacultyId, Map<LocalDate, Integer>>
        Map<Long, Map<LocalDate, Integer>> facultyDailyDuties = new HashMap<>();

        // DSATUR Main Loop
        long startTimeMs = System.currentTimeMillis();
        int step = 0;

        while (!unassignedExamIds.isEmpty()) {
            step++;
            // 1. Pick vertex with maximum saturation degree (size of neighborColors)
            // Tie-breaker: maximum degree in unassigned graph
            Long chosenExamId = null;
            int maxSaturation = -1;
            int maxUnassignedDegree = -1;

            for (Long examId : unassignedExamIds) {
                int saturation = neighborColors.get(examId).size();
                int unassignedDeg = unassignedDegrees.get(examId);

                if (saturation > maxSaturation || (saturation == maxSaturation && unassignedDeg > maxUnassignedDegree)) {
                    maxSaturation = saturation;
                    maxUnassignedDegree = unassignedDeg;
                    chosenExamId = examId;
                }
            }

            Examination chosenExam = conflictGraph.getExam(chosenExamId);
            Set<Long> examStudents = conflictGraph.getExamStudentIds(chosenExamId);

            // 2. Find lowest color (earliest suitable TimeSlot)
            TimeSlot feasibleSlot = null;
            List<String> slotRejectionReasons = new ArrayList<>();

            for (TimeSlot candidateSlot : sortedSlots) {
                // Check A: Does any neighbor already have this time slot?
                boolean neighborClash = false;
                for (Long neighborId : conflictGraph.getNeighbors(chosenExamId)) {
                    TimeSlot nSlot = assignedExamSlot.get(neighborId);
                    if (nSlot != null && nSlot.getId().equals(candidateSlot.getId())) {
                        neighborClash = true;
                        Examination neighborExam = conflictGraph.getExam(neighborId);
                        slotRejectionReasons.add("Clashes with " + (neighborExam != null ? neighborExam.getTitle() : "neighbor") + " sharing " + conflictGraph.getSharedCount(chosenExamId, neighborId) + " students");
                        break;
                    }
                }
                if (neighborClash) continue;

                // Check B: Does duration fit in slot?
                long slotMinutes = java.time.Duration.between(candidateSlot.getStartTime(), candidateSlot.getEndTime()).toMinutes();
                if (chosenExam.getDurationMinutes() > slotMinutes) {
                    slotRejectionReasons.add("Exam duration (" + chosenExam.getDurationMinutes() + "m) exceeds slot length (" + slotMinutes + "m)");
                    continue;
                }

                // Check C: Student daily exam limit
                boolean dailyLimitExceeded = false;
                LocalDate examDate = candidateSlot.getExamDate();
                for (Long sId : examStudents) {
                    Map<LocalDate, Integer> dayMap = studentDailyExams.getOrDefault(sId, Collections.emptyMap());
                    int currentCount = dayMap.getOrDefault(examDate, 0);
                    if (currentCount >= maxExamsPerDay) {
                        dailyLimitExceeded = true;
                        Student st = studentMap.get(sId);
                        slotRejectionReasons.add("Student " + (st != null ? st.getRollNumber() : sId) + " already has " + currentCount + " exam(s) on " + examDate);
                        break;
                    }
                }
                if (dailyLimitExceeded) continue;

                // If passed all, candidateSlot is feasible!
                feasibleSlot = candidateSlot;
                break;
            }

            ScheduleItem item = new ScheduleItem();
            item.setSchedule(schedule);
            item.setExamination(chosenExam);
            item.setStudentCount(examStudents.size());

            if (feasibleSlot != null) {
                // Assign slot
                assignedExamSlot.put(chosenExamId, feasibleSlot);
                item.setTimeSlot(feasibleSlot);

                // Update saturation of unassigned neighbors
                for (Long neighborId : conflictGraph.getNeighbors(chosenExamId)) {
                    if (unassignedExamIds.contains(neighborId)) {
                        neighborColors.get(neighborId).add(feasibleSlot);
                        unassignedDegrees.put(neighborId, unassignedDegrees.get(neighborId) - 1);
                    }
                }

                // Update student daily exam tracking
                for (Long sId : examStudents) {
                    studentDailyExams.computeIfAbsent(sId, k -> new HashMap<>())
                            .merge(feasibleSlot.getExamDate(), 1, Integer::sum);
                }

                // 3. Allocate Room (Best-Fit Decreasing: smallest room with capacity >= studentCount)
                Set<Long> bookedRoomsInSlot = slotBookedRooms.computeIfAbsent(feasibleSlot.getId(), k -> new HashSet<>());
                Room allocatedRoom = null;

                // Sort rooms by capacity ascending
                List<Room> candidateRooms = new ArrayList<>(rooms);
                candidateRooms.removeIf(r -> !Boolean.TRUE.equals(r.getIsActive()));
                candidateRooms.sort(Comparator.comparing(Room::getCapacity));

                for (Room room : candidateRooms) {
                    if (room.getCapacity() >= examStudents.size() && !bookedRoomsInSlot.contains(room.getId())) {
                        allocatedRoom = room;
                        break;
                    }
                }

                if (allocatedRoom != null) {
                    bookedRoomsInSlot.add(allocatedRoom.getId());
                    item.setRoom(allocatedRoom);
                } else {
                    // Room allocation failed!
                    result.isFeasible = false;
                    String reason = "No available room with capacity >= " + examStudents.size() + " in " + feasibleSlot.getSlotName();
                    item.setStatus("CONFLICT");
                    item.setConflictReason(reason);

                    // Suggest alternative: find a slot where a capable room is free
                    Room bestCapRoom = null;
                    TimeSlot altSlotForRoom = null;
                    for (TimeSlot altSlot : sortedSlots) {
                        if (altSlot.getId().equals(feasibleSlot.getId())) continue;
                        Set<Long> bRooms = slotBookedRooms.getOrDefault(altSlot.getId(), Collections.emptySet());
                        for (Room r : candidateRooms) {
                            if (r.getCapacity() >= examStudents.size() && !bRooms.contains(r.getId())) {
                                bestCapRoom = r;
                                altSlotForRoom = altSlot;
                                break;
                            }
                        }
                        if (bestCapRoom != null) break;
                    }

                    String altSuggestion = altSlotForRoom != null && bestCapRoom != null
                            ? "Move to " + altSlotForRoom.getSlotName() + " (" + altSlotForRoom.getExamDate() + ") in " + bestCapRoom.getRoomNumber() + " (Cap: " + bestCapRoom.getCapacity() + ")"
                            : "Increase seating capacity or add more examination halls.";
                    item.setAlternativeSuggestion(altSuggestion);

                    ScheduleConflict rConflict = new ScheduleConflict(
                            schedule, "ROOM_CAPACITY_EXCEEDED", "HARD",
                            reason + " for " + chosenExam.getTitle(),
                            chosenExam, null, null, null, null, feasibleSlot, altSuggestion
                    );
                    result.conflicts.add(rConflict);
                }

                // 4. Allocate Faculty / Invigilator
                Set<Long> bookedFacultyInSlot = slotBookedFaculties.computeIfAbsent(feasibleSlot.getId(), k -> new HashSet<>());
                Faculty allocatedFaculty = null;

                for (Faculty fac : faculties) {
                    // Check availability
                    if (bookedFacultyInSlot.contains(fac.getId())) continue;

                    // Check unavailabilities
                    boolean isUnavailable = false;
                    if (strictFacultyAvailability) {
                        for (FacultyUnavailability unav : unavailabilities) {
                            if (unav.getFaculty().getId().equals(fac.getId()) &&
                                    unav.getUnavailableDate().equals(feasibleSlot.getExamDate())) {
                                if (unav.getTimeSlot() == null || unav.getTimeSlot().getId().equals(feasibleSlot.getId())) {
                                    isUnavailable = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (isUnavailable) continue;

                    // Check daily max duties
                    int dailyDuties = facultyDailyDuties.computeIfAbsent(fac.getId(), k -> new HashMap<>())
                            .getOrDefault(feasibleSlot.getExamDate(), 0);
                    if (dailyDuties >= fac.getMaxInvigilationPerDay()) continue;

                    allocatedFaculty = fac;
                    break;
                }

                if (allocatedFaculty != null) {
                    bookedFacultyInSlot.add(allocatedFaculty.getId());
                    facultyDailyDuties.computeIfAbsent(allocatedFaculty.getId(), k -> new HashMap<>())
                            .merge(feasibleSlot.getExamDate(), 1, Integer::sum);
                    item.setFaculty(allocatedFaculty);
                } else {
                    result.isFeasible = false;
                    String fReason = "No available faculty invigilator for " + feasibleSlot.getSlotName();
                    if ("SCHEDULED".equals(item.getStatus())) {
                        item.setStatus("CONFLICT");
                        item.setConflictReason(fReason);
                    }
                    String fAlt = "Assign substitute faculty or relax daily duty limits.";
                    item.setAlternativeSuggestion(item.getAlternativeSuggestion() != null ? item.getAlternativeSuggestion() + " | " + fAlt : fAlt);

                    ScheduleConflict fConflict = new ScheduleConflict(
                            schedule, "FACULTY_UNAVAILABLE", "HARD",
                            fReason + " for " + chosenExam.getTitle(),
                            chosenExam, null, null, null, null, feasibleSlot, fAlt
                    );
                    result.conflicts.add(fConflict);
                }

            } else {
                // Time slot allocation failed! Hard constraint failure
                result.isFeasible = false;
                item.setStatus("CONFLICT");
                String reason = "Cannot find a conflict-free time slot. All slots rejected: " + String.join("; ", slotRejectionReasons.stream().limit(3).toList());
                item.setConflictReason(reason);

                // Find alternative suggestion: recommend adding a new slot or shifting an edge
                String alt = "Add an additional examination time slot or adjust student course registrations.";
                item.setAlternativeSuggestion(alt);

                ScheduleConflict slotConflict = new ScheduleConflict(
                        schedule, "STUDENT_OVERLAP", "HARD",
                        "No conflict-free time slot for " + chosenExam.getTitle() + " due to dense student overlaps.",
                        chosenExam, null, null, null, null, null, alt
                );
                result.conflicts.add(slotConflict);
            }

            result.items.add(item);
            unassignedExamIds.remove(chosenExamId);
        }

        long durationMs = System.currentTimeMillis() - startTimeMs;
        result.statistics.put("executionTimeMs", durationMs);
        result.statistics.put("totalExaminations", examinations.size());
        result.statistics.put("totalScheduled", result.items.stream().filter(i -> "SCHEDULED".equals(i.getStatus())).count());
        result.statistics.put("totalConflicts", result.conflicts.size());
        result.statistics.put("algorithm", "DSATUR (Degree of Saturation)");
        result.statistics.put("isFeasible", result.isFeasible);

        return result;
    }
}

