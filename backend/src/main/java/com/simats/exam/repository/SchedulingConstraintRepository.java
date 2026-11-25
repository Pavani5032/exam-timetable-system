package com.simats.exam.repository;

import com.simats.exam.entity.SchedulingConstraint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchedulingConstraintRepository extends JpaRepository<SchedulingConstraint, Long> {
    Optional<SchedulingConstraint> findByConstraintKey(String constraintKey);
    boolean existsByConstraintKey(String constraintKey);
}

