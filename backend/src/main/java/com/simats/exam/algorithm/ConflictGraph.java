package com.simats.exam.algorithm;

import com.simats.exam.entity.Examination;
import com.simats.exam.entity.Student;

import java.util.*;

public class ConflictGraph {
    private final Map<Long, Examination> examMap = new HashMap<>();
    private final Map<Long, Set<Long>> examStudentsMap = new HashMap<>();
    private final Map<Long, Set<Long>> adjacencyList = new HashMap<>();
    private final Map<String, Set<Long>> edgeSharedStudentsMap = new HashMap<>();

    public ConflictGraph(List<Examination> examinations, Map<Long, Set<Long>> courseStudentIdsMap, Map<Long, Student> studentMap) {
        for (Examination exam : examinations) {
            examMap.put(exam.getId(), exam);
            Set<Long> studentIds = courseStudentIdsMap.getOrDefault(exam.getCourse().getId(), Collections.emptySet());
            examStudentsMap.put(exam.getId(), new HashSet<>(studentIds));
            adjacencyList.put(exam.getId(), new HashSet<>());
        }

        // Build conflict edges based on shared students
        List<Examination> examList = new ArrayList<>(examinations);
        for (int i = 0; i < examList.size(); i++) {
            Examination e1 = examList.get(i);
            Set<Long> s1 = examStudentsMap.get(e1.getId());
            if (s1 == null || s1.isEmpty()) continue;

            for (int j = i + 1; j < examList.size(); j++) {
                Examination e2 = examList.get(j);
                Set<Long> s2 = examStudentsMap.get(e2.getId());
                if (s2 == null || s2.isEmpty()) continue;

                Set<Long> shared = new HashSet<>(s1);
                shared.retainAll(s2);

                if (!shared.isEmpty()) {
                    adjacencyList.get(e1.getId()).add(e2.getId());
                    adjacencyList.get(e2.getId()).add(e1.getId());
                    String edgeKey = getEdgeKey(e1.getId(), e2.getId());
                    edgeSharedStudentsMap.put(edgeKey, shared);
                }
            }
        }
    }

    public static String getEdgeKey(Long id1, Long id2) {
        return id1 < id2 ? id1 + "_" + id2 : id2 + "_" + id1;
    }

    public Examination getExam(Long examId) {
        return examMap.get(examId);
    }

    public Set<Long> getExamStudentIds(Long examId) {
        return examStudentsMap.getOrDefault(examId, Collections.emptySet());
    }

    public Set<Long> getNeighbors(Long examId) {
        return adjacencyList.getOrDefault(examId, Collections.emptySet());
    }

    public int getDegree(Long examId) {
        return getNeighbors(examId).size();
    }

    public Set<Long> getSharedStudentIds(Long id1, Long id2) {
        return edgeSharedStudentsMap.getOrDefault(getEdgeKey(id1, id2), Collections.emptySet());
    }

    public int getSharedCount(Long id1, Long id2) {
        return getSharedStudentIds(id1, id2).size();
    }

    public boolean hasConflict(Long id1, Long id2) {
        return adjacencyList.getOrDefault(id1, Collections.emptySet()).contains(id2);
    }

    public Map<String, Object> getGraphSummary() {
        int totalVertices = examMap.size();
        int totalEdges = edgeSharedStudentsMap.size();
        int maxDegree = 0;
        int sumDegree = 0;
        for (Long id : examMap.keySet()) {
            int d = getDegree(id);
            sumDegree += d;
            if (d > maxDegree) maxDegree = d;
        }
        double avgDegree = totalVertices > 0 ? (double) sumDegree / totalVertices : 0.0;
        double density = totalVertices > 1 ? (2.0 * totalEdges) / (totalVertices * (totalVertices - 1)) : 0.0;

        List<Map<String, Object>> nodes = new ArrayList<>();
        for (Examination exam : examMap.values()) {
            Map<String, Object> node = new HashMap<>();
            node.put("id", exam.getId());
            node.put("label", exam.getCourse().getCode());
            node.put("title", exam.getTitle());
            node.put("studentCount", examStudentsMap.getOrDefault(exam.getId(), Collections.emptySet()).size());
            node.put("degree", getDegree(exam.getId()));
            nodes.add(node);
        }

        List<Map<String, Object>> links = new ArrayList<>();
        for (Map.Entry<String, Set<Long>> entry : edgeSharedStudentsMap.entrySet()) {
            String[] parts = entry.getKey().split("_");
            Long src = Long.parseLong(parts[0]);
            Long tgt = Long.parseLong(parts[1]);
            Map<String, Object> link = new HashMap<>();
            link.put("source", src);
            link.put("target", tgt);
            link.put("sharedCount", entry.getValue().size());
            links.add(link);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("totalVertices", totalVertices);
        res.put("totalEdges", totalEdges);
        res.put("maxDegree", maxDegree);
        res.put("avgDegree", Math.round(avgDegree * 100.0) / 100.0);
        res.put("density", Math.round(density * 1000.0) / 1000.0);
        res.put("nodes", nodes);
        res.put("links", links);
        return res;
    }
}

