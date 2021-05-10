package com.mealmanager.api.model;

import javax.persistence.*;

@Entity
@Table(name = "recipeorder")
public class RecipeOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    
    @Column(name = "message", nullable = true)
    private String message;

    public RecipeOrder() {}

    public RecipeOrder(String message) {
        this.message = message;
    }

    public long getId() {
        return this.id;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return this.message;
    }
    
}
