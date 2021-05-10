package com.mealmanager.api.repository;

import com.mealmanager.api.model.RecipeOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeOrderItemRepository extends JpaRepository<RecipeOrderItem, Long> {
}
