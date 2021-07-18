package com.mealmanager.api.model;

import javax.persistence.*;

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

    public Recipe() {}

    public Recipe(String name, String description, String recipeURL, boolean disabled) {
        this.name = name;
        this.description = description;
        this.recipeURL = recipeURL;
        this.disabled = disabled;
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

    public void setRecipeURL(String url) { this.recipeURL = url; }

    public String getRecipeURL() {
        return this.recipeURL;
    }

    public boolean getDisabled() {
        return this.disabled;
    }

    public void setDisabled(boolean disabled) {
        this.disabled = disabled;
    }
}
