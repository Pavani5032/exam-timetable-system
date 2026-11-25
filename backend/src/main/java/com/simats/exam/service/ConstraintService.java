package com.simats.exam.service;

import com.simats.exam.entity.SchedulingConstraint;
import com.simats.exam.repository.SchedulingConstraintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConstraintService {

    @Autowired
    private SchedulingConstraintRepository constraintRepository;

    public List<SchedulingConstraint> getAllConstraints() {
        return constraintRepository.findAll();
    }

    public SchedulingConstraint getConstraintById(Long id) {
        return constraintRepository.findById(id).orElseThrow(() -> new RuntimeException("Constraint not found: " + id));
    }

    public SchedulingConstraint updateConstraint(Long id, SchedulingConstraint updated) {
        SchedulingConstraint existing = getConstraintById(id);
        existing.setConstraintName(updated.getConstraintName());
        existing.setDescription(updated.getDescription());
        existing.setConstraintValue(updated.getConstraintValue());
        existing.setIsHardConstraint(updated.getIsHardConstraint());
        existing.setIsEnabled(updated.getIsEnabled());
        return constraintRepository.save(existing);
    }

    public SchedulingConstraint toggleConstraint(Long id) {
        SchedulingConstraint existing = getConstraintById(id);
        existing.setIsEnabled(!existing.getIsEnabled());
        return constraintRepository.save(existing);
    }

    public Map<String, String> getActiveConstraintMap() {
        Map<String, String> map = new HashMap<>();
        for (SchedulingConstraint sc : constraintRepository.findAll()) {
            if (Boolean.TRUE.equals(sc.getIsEnabled())) {
                map.put(sc.getConstraintKey(), sc.getConstraintValue());
            }
        }
        return map;
    }
}

