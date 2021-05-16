package com.mealmanager.api.repository;

import com.mealmanager.api.model.RecipeOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeOrderItemRepository extends JpaRepository<RecipeOrderItem, Long> {
    List<RecipeOrderItem> findByOrderId(long id);
}
