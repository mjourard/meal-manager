package com.mealmanager.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.util.Date;

@Entity
@Table(name = "recipeorder")
public class RecipeOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    
    @Column(name = "message", nullable = true)
    private String message;
    
    @Column(name = "createdat", nullable = true)
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Date createdAt;
    
    @Column(name = "fulfilled", nullable = true)
    private Boolean fulfilled;

    public RecipeOrder() {
        this.createdAt = new Date();
        this.fulfilled = false;
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
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public boolean isFulfilled() {
        return this.fulfilled != null ? this.fulfilled : false;
    }
    
    public void setFulfilled(Boolean fulfilled) {
        this.fulfilled = fulfilled;
    }
}
