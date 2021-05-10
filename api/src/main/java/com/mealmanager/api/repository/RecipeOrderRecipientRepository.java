package com.mealmanager.api.repository;

import com.mealmanager.api.model.RecipeOrderRecipient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeOrderRecipientRepository extends JpaRepository<RecipeOrderRecipient, Long> {
}
