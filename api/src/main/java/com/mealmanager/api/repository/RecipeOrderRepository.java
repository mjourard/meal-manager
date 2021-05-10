package com.mealmanager.api.repository;

import com.mealmanager.api.model.RecipeOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeOrderRepository extends JpaRepository<RecipeOrder, Long> {
}
