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

    public Recipe() {}

    public Recipe(String name, String description, String recipeURL) {
        this.name = name;
        this.description = description;
        this.recipeURL = recipeURL;
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
}
