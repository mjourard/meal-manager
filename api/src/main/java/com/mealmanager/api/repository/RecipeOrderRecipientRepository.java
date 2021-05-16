package com.mealmanager.api.repository;

import com.mealmanager.api.model.RecipeOrderRecipient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeOrderRecipientRepository extends JpaRepository<RecipeOrderRecipient, Long> {
    List<RecipeOrderRecipient> findByOrderId(long id);
}
