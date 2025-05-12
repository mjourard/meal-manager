package com.mealmanager.api.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "category")
    private String category;

    @OneToMany(mappedBy = "equipment")
    private Set<RecipeEquipment> recipeEquipment = new HashSet<>();

    public Equipment() {
    }

    public Equipment(String name, String category) {
        this.name = name;
        this.category = category;
    }

    public Equipment(String name, String description, String category) {
        this.name = name;
        this.description = description;
        this.category = category;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Set<RecipeEquipment> getRecipeEquipment() {
        return recipeEquipment;
    }

    public void setRecipeEquipment(Set<RecipeEquipment> recipeEquipment) {
        this.recipeEquipment = recipeEquipment;
    }
} 
