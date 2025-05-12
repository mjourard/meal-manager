package com.mealmanager.api.controller;

import com.mealmanager.api.model.Equipment;
import com.mealmanager.api.repository.EquipmentRepository;
import com.mealmanager.api.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class EquipmentController {

    private final Logger logger = LoggerFactory.getLogger(EquipmentController.class);

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all equipment items
     * 
     * @param name Optional name filter
     * @param category Optional category filter
     * @return List of equipment items
     */
    @GetMapping("/equipment")
    public ResponseEntity<List<Equipment>> getAllEquipment(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Equipment> equipmentList = new ArrayList<>();

            if (name != null && !name.isEmpty()) {
                equipmentList.addAll(equipmentRepository.findByNameContainingIgnoreCase(name));
            } else if (category != null && !category.isEmpty()) {
                equipmentList.addAll(equipmentRepository.findByCategoryIgnoreCase(category));
            } else {
                equipmentList.addAll(equipmentRepository.findAll());
            }

            if (equipmentList.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(equipmentList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving equipment", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get an equipment item by ID
     * 
     * @param id Equipment ID
     * @return Equipment
     */
    @GetMapping("/equipment/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable("id") long id) {
        if (!securityUtils.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Optional<Equipment> equipmentData = equipmentRepository.findById(id);

        if (equipmentData.isPresent()) {
            return new ResponseEntity<>(equipmentData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Create a new equipment item
     * 
     * @param equipment Equipment to create
     * @return Created equipment
     */
    @PostMapping("/equipment")
    public ResponseEntity<Equipment> createEquipment(@RequestBody Equipment equipment) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if equipment with same name already exists
            Optional<Equipment> existingEquipment = equipmentRepository.findByNameIgnoreCase(equipment.getName());
            if (existingEquipment.isPresent()) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }

            Equipment savedEquipment = equipmentRepository.save(equipment);
            return new ResponseEntity<>(savedEquipment, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating equipment", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an existing equipment item
     * 
     * @param id Equipment ID
     * @param equipment Equipment data to update
     * @return Updated equipment
     */
    @PutMapping("/equipment/{id}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable("id") long id, 
            @RequestBody Equipment equipment) {
        
        if (!securityUtils.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Optional<Equipment> equipmentData = equipmentRepository.findById(id);

        if (equipmentData.isPresent()) {
            Equipment existingEquipment = equipmentData.get();
            
            // Update fields
            if (equipment.getName() != null) {
                existingEquipment.setName(equipment.getName());
            }
            
            if (equipment.getDescription() != null) {
                existingEquipment.setDescription(equipment.getDescription());
            }
            
            if (equipment.getCategory() != null) {
                existingEquipment.setCategory(equipment.getCategory());
            }
            
            return new ResponseEntity<>(equipmentRepository.save(existingEquipment), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Delete an equipment item
     * 
     * @param id Equipment ID
     * @return Status
     */
    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<HttpStatus> deleteEquipment(@PathVariable("id") long id) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // TODO: Check if equipment is used in any recipes before allowing deletion

            equipmentRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting equipment", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get equipment by category
     * 
     * @param category Equipment category
     * @return List of equipment items in the category
     */
    @GetMapping("/equipment/category/{category}")
    public ResponseEntity<List<Equipment>> getEquipmentByCategory(@PathVariable("category") String category) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Equipment> equipmentList = equipmentRepository.findByCategoryIgnoreCase(category);

            if (equipmentList.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(equipmentList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving equipment by category", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
