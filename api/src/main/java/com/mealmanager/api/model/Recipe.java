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
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "recipe")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "recipeurl", nullable = true)
    private String recipeURL;

    @Column(name = "disabled", nullable = false)
    @org.hibernate.annotations.ColumnDefault("false")
    private boolean disabled;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sysuser_id")
    private SysUser owner;
    
    @Column(name = "instructions")
    private String instructions;
    
    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes;
    
    @Column(name = "cook_time_minutes")
    private Integer cookTimeMinutes;
    
    @Column(name = "portion_size")
    private String portionSize;
    
    @Column(name = "portion_count")
    private Integer portionCount;
    
    @Column(name = "is_vegetarian", nullable = false)
    private boolean vegetarian;
    
    @Column(name = "is_vegan", nullable = false)
    private boolean vegan;
    
    @Column(name = "is_dairy_free", nullable = false)
    private boolean dairyFree;
    
    @Column(name = "is_nut_free", nullable = false)
    private boolean nutFree;
    
    @Column(name = "is_private", nullable = false)
    private boolean isPrivate;
    
    @Column(name = "is_link_dead", nullable = false)
    private boolean linkDead;
    
    @OneToMany(mappedBy = "recipe", fetch = FetchType.LAZY)
    private Set<RecipeIngredient> ingredients = new HashSet<>();
    
    @OneToMany(mappedBy = "recipe", fetch = FetchType.LAZY)
    private Set<RecipeEquipment> equipment = new HashSet<>();

    public Recipe() {}

    public Recipe(String name, String description, String recipeURL, boolean disabled) {
        this.name = name;
        this.description = description;
        this.recipeURL = recipeURL;
        this.disabled = disabled;
        this.isPrivate = true;
        this.linkDead = false;
        this.vegetarian = false;
        this.vegan = false;
        this.dairyFree = false;
        this.nutFree = false;
    }

    public long getId() {
        return this.id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescription() {
        return this.description;
    }

    public void setRecipeURL(String url) { 
        this.recipeURL = url; 
    }

    public String getRecipeURL() {
        return this.recipeURL;
    }

    public boolean getDisabled() {
        return this.disabled;
    }

    public void setDisabled(boolean disabled) {
        this.disabled = disabled;
    }
    
    public SysUser getOwner() {
        return owner;
    }

    public void setOwner(SysUser owner) {
        this.owner = owner;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Integer getPrepTimeMinutes() {
        return prepTimeMinutes;
    }

    public void setPrepTimeMinutes(Integer prepTimeMinutes) {
        this.prepTimeMinutes = prepTimeMinutes;
    }

    public Integer getCookTimeMinutes() {
        return cookTimeMinutes;
    }

    public void setCookTimeMinutes(Integer cookTimeMinutes) {
        this.cookTimeMinutes = cookTimeMinutes;
    }

    public String getPortionSize() {
        return portionSize;
    }

    public void setPortionSize(String portionSize) {
        this.portionSize = portionSize;
    }

    public Integer getPortionCount() {
        return portionCount;
    }

    public void setPortionCount(Integer portionCount) {
        this.portionCount = portionCount;
    }

    public boolean isVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        this.vegetarian = vegetarian;
    }

    public boolean isVegan() {
        return vegan;
    }

    public void setVegan(boolean vegan) {
        this.vegan = vegan;
    }

    public boolean isDairyFree() {
        return dairyFree;
    }

    public void setDairyFree(boolean dairyFree) {
        this.dairyFree = dairyFree;
    }

    public boolean isNutFree() {
        return nutFree;
    }

    public void setNutFree(boolean nutFree) {
        this.nutFree = nutFree;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public boolean isLinkDead() {
        return linkDead;
    }

    public void setLinkDead(boolean linkDead) {
        this.linkDead = linkDead;
    }
    
    public Set<RecipeIngredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(Set<RecipeIngredient> ingredients) {
        this.ingredients = ingredients;
    }
    
    public Set<RecipeEquipment> getEquipment() {
        return equipment;
    }

    public void setEquipment(Set<RecipeEquipment> equipment) {
        this.equipment = equipment;
    }
}
