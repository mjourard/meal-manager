package com.mealmanager.api.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "recipeorder")
public class RecipeOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    
    @Column(name = "message", nullable = true)
    private String message;
    
    @Column(name = "createdat", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "fulfilled", nullable = false)
    private boolean fulfilled = false;

    public RecipeOrder() {
        this.createdAt = new Date();
    }

    public RecipeOrder(String message) {
        this();
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
    
    public Date getCreatedAt() {
        return this.createdAt;
    }
    
    public boolean isFulfilled() {
        return this.fulfilled;
    }
    
    public void setFulfilled(boolean fulfilled) {
        this.fulfilled = fulfilled;
    }
}
