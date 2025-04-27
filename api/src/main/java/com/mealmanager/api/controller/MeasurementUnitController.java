package com.mealmanager.api.controller;

import com.mealmanager.api.model.MeasurementUnit;
import com.mealmanager.api.repository.MeasurementUnitRepository;
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
public class MeasurementUnitController {

    private final Logger logger = LoggerFactory.getLogger(MeasurementUnitController.class);

    @Autowired
    private MeasurementUnitRepository measurementUnitRepository;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all measurement units
     * 
     * @param system Optional system filter (metric, imperial, universal)
     * @param type Optional type filter (volume, weight, count)
     * @return List of measurement units
     */
    @GetMapping("/units")
    public ResponseEntity<List<MeasurementUnit>> getAllMeasurementUnits(
            @RequestParam(required = false) String system,
            @RequestParam(required = false) String type) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<MeasurementUnit> units = new ArrayList<>();

            if (system != null && !system.isEmpty() && type != null && !type.isEmpty()) {
                units.addAll(measurementUnitRepository.findBySystemAndType(system, type));
            } else if (system != null && !system.isEmpty()) {
                units.addAll(measurementUnitRepository.findBySystem(system));
            } else if (type != null && !type.isEmpty()) {
                units.addAll(measurementUnitRepository.findByType(type));
            } else {
                units.addAll(measurementUnitRepository.findAll());
            }

            if (units.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(units, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving measurement units", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a measurement unit by ID
     * 
     * @param id Measurement unit ID
     * @return Measurement unit
     */
    @GetMapping("/units/{id}")
    public ResponseEntity<MeasurementUnit> getMeasurementUnitById(@PathVariable("id") long id) {
        if (!securityUtils.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Optional<MeasurementUnit> unitData = measurementUnitRepository.findById(id);

        if (unitData.isPresent()) {
            return new ResponseEntity<>(unitData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Create a new measurement unit
     * 
     * @param unit Measurement unit to create
     * @return Created measurement unit
     */
    @PostMapping("/units")
    public ResponseEntity<MeasurementUnit> createMeasurementUnit(@RequestBody MeasurementUnit unit) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if measurement unit with same name or abbreviation already exists
            Optional<MeasurementUnit> existingUnitByName = measurementUnitRepository
                .findByNameIgnoreCase(unit.getName());
            Optional<MeasurementUnit> existingUnitByAbbreviation = measurementUnitRepository
                .findByAbbreviationIgnoreCase(unit.getAbbreviation());
            
            if (existingUnitByName.isPresent() || existingUnitByAbbreviation.isPresent()) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }

            // Handle standard unit if specified
            if (unit.getStandardUnit() != null && unit.getStandardUnit().getId() != null) {
                Optional<MeasurementUnit> standardUnit = measurementUnitRepository.findById(unit.getStandardUnit().getId());
                if (standardUnit.isPresent()) {
                    unit.setStandardUnit(standardUnit.get());
                } else {
                    unit.setStandardUnit(null);
                }
            }

            MeasurementUnit savedUnit = measurementUnitRepository.save(unit);
            return new ResponseEntity<>(savedUnit, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating measurement unit", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an existing measurement unit
     * 
     * @param id Measurement unit ID
     * @param unit Measurement unit data to update
     * @return Updated measurement unit
     */
    @PutMapping("/units/{id}")
    public ResponseEntity<MeasurementUnit> updateMeasurementUnit(
            @PathVariable("id") long id, 
            @RequestBody MeasurementUnit unit) {
        
        if (!securityUtils.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Optional<MeasurementUnit> unitData = measurementUnitRepository.findById(id);

        if (unitData.isPresent()) {
            MeasurementUnit existingUnit = unitData.get();
            
            // Update fields
            if (unit.getName() != null) {
                existingUnit.setName(unit.getName());
            }
            
            if (unit.getAbbreviation() != null) {
                existingUnit.setAbbreviation(unit.getAbbreviation());
            }
            
            if (unit.getSystem() != null) {
                existingUnit.setSystem(unit.getSystem());
            }
            
            if (unit.getType() != null) {
                existingUnit.setType(unit.getType());
            }
            
            if (unit.getConversionFactor() != null) {
                existingUnit.setConversionFactor(unit.getConversionFactor());
            }
            
            // Handle standard unit if specified
            if (unit.getStandardUnit() != null && unit.getStandardUnit().getId() != null) {
                Optional<MeasurementUnit> standardUnit = measurementUnitRepository.findById(unit.getStandardUnit().getId());
                if (standardUnit.isPresent()) {
                    existingUnit.setStandardUnit(standardUnit.get());
                }
            } else if (unit.getStandardUnit() == null) {
                existingUnit.setStandardUnit(null);
            }
            
            return new ResponseEntity<>(measurementUnitRepository.save(existingUnit), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Delete a measurement unit
     * 
     * @param id Measurement unit ID
     * @return Status
     */
    @DeleteMapping("/units/{id}")
    public ResponseEntity<HttpStatus> deleteMeasurementUnit(@PathVariable("id") long id) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // TODO: Check if measurement unit is used in any recipes before allowing deletion
            // TODO: Also check if it's used as a standard unit for other units

            measurementUnitRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting measurement unit", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get measurement units by system
     * 
     * @param system Measurement system (metric, imperial, universal)
     * @return List of measurement units in the system
     */
    @GetMapping("/units/system/{system}")
    public ResponseEntity<List<MeasurementUnit>> getMeasurementUnitsBySystem(@PathVariable("system") String system) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<MeasurementUnit> units = measurementUnitRepository.findBySystem(system);

            if (units.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(units, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving measurement units by system", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get measurement units by type
     * 
     * @param type Measurement type (volume, weight, count)
     * @return List of measurement units of the type
     */
    @GetMapping("/units/type/{type}")
    public ResponseEntity<List<MeasurementUnit>> getMeasurementUnitsByType(@PathVariable("type") String type) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<MeasurementUnit> units = measurementUnitRepository.findByType(type);

            if (units.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(units, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving measurement units by type", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get derived units for a standard unit
     * 
     * @param id Standard unit ID
     * @return List of derived units
     */
    @GetMapping("/units/{id}/derived")
    public ResponseEntity<List<MeasurementUnit>> getDerivedUnits(@PathVariable("id") long id) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<MeasurementUnit> standardUnit = measurementUnitRepository.findById(id);
            
            if (standardUnit.isPresent()) {
                List<MeasurementUnit> derivedUnits = new ArrayList<>(standardUnit.get().getDerivedUnits());
                
                if (derivedUnits.isEmpty()) {
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
                }
                
                return new ResponseEntity<>(derivedUnits, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error retrieving derived measurement units", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
