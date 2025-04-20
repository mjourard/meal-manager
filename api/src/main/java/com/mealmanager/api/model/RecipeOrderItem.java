package com.mealmanager.api.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "recipeorderitem")
public class RecipeOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "orderid")
    private long orderId;

    @Column(name = "recipeid")
    private long recipeId;

    @ManyToOne
    @JoinColumn(name = "orderid", referencedColumnName = "id", insertable = false, updatable = false)
    private RecipeOrder recipeOrder;

    @ManyToOne
    @JoinColumn(name = "recipeid", referencedColumnName = "id", insertable = false, updatable = false)
    private Recipe recipe;

    public RecipeOrderItem() {}

    public RecipeOrderItem(Long orderId, Long recipeId) {
        this.orderId = orderId;
        this.recipeId = recipeId;
    }

    public Recipe getRecipe() {
        return this.recipe;
    }
}
