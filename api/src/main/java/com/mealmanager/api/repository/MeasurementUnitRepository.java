package com.mealmanager.api.repository;

import com.mealmanager.api.model.MeasurementUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeasurementUnitRepository extends JpaRepository<MeasurementUnit, Long> {
    
    Optional<MeasurementUnit> findByNameIgnoreCase(String name);
    
    Optional<MeasurementUnit> findByAbbreviationIgnoreCase(String abbreviation);
    
    List<MeasurementUnit> findBySystem(String system);
    
    List<MeasurementUnit> findByType(String type);
    
    List<MeasurementUnit> findBySystemAndType(String system, String type);
} 
