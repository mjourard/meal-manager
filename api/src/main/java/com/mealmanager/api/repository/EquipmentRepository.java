package com.mealmanager.api.repository;

import com.mealmanager.api.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    
    Optional<Equipment> findByNameIgnoreCase(String name);
    
    List<Equipment> findByNameContainingIgnoreCase(String name);
    
    List<Equipment> findByCategoryIgnoreCase(String category);
} 
