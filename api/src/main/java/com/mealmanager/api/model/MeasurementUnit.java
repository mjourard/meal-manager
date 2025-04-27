package com.mealmanager.api.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "measurement_unit")
public class MeasurementUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "abbreviation", nullable = false)
    private String abbreviation;

    @Column(name = "system", nullable = false)
    private String system; // "metric", "imperial", "universal"

    @Column(name = "type", nullable = false)
    private String type; // "volume", "weight", "count"

    @Column(name = "conversion_factor")
    private BigDecimal conversionFactor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "standard_measurement_unit_id")
    private MeasurementUnit standardUnit;

    @OneToMany(mappedBy = "standardUnit")
    private Set<MeasurementUnit> derivedUnits = new HashSet<>();

    @OneToMany(mappedBy = "measurementUnit")
    private Set<RecipeIngredient> recipeIngredients = new HashSet<>();

    public MeasurementUnit() {
    }

    public MeasurementUnit(String name, String abbreviation, String system, String type) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.system = system;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAbbreviation() {
        return abbreviation;
    }

    public void setAbbreviation(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getSystem() {
        return system;
    }

    public void setSystem(String system) {
        this.system = system;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getConversionFactor() {
        return conversionFactor;
    }

    public void setConversionFactor(BigDecimal conversionFactor) {
        this.conversionFactor = conversionFactor;
    }

    public MeasurementUnit getStandardUnit() {
        return standardUnit;
    }

    public void setStandardUnit(MeasurementUnit standardUnit) {
        this.standardUnit = standardUnit;
    }

    public Set<MeasurementUnit> getDerivedUnits() {
        return derivedUnits;
    }

    public void setDerivedUnits(Set<MeasurementUnit> derivedUnits) {
        this.derivedUnits = derivedUnits;
    }

    public Set<RecipeIngredient> getRecipeIngredients() {
        return recipeIngredients;
    }

    public void setRecipeIngredients(Set<RecipeIngredient> recipeIngredients) {
        this.recipeIngredients = recipeIngredients;
    }
} 
