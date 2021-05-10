package com.mealmanager.api.controller;

import com.mealmanager.api.dto.RecipeOrderDTO;
import com.mealmanager.api.model.*;
import com.mealmanager.api.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class RecipeOrderController {

    private final Logger logger = LoggerFactory.getLogger(RecipeOrderController.class);

    @Autowired
    SysUserRepository sysUserRepository;

    @Autowired
    RecipeOrderRepository recipeOrderRepository;

    @Autowired
    RecipeRepository recipeRepository;

    @Autowired
    RecipeOrderItemRepository recipeOrderItemRepository;

    @Autowired
    RecipeOrderRecipientRepository recipeOrderRecipientRepository;

    @PostMapping("/orders")
    public ResponseEntity<RecipeOrder> placeOrder(@RequestBody RecipeOrderDTO recipeOrder) {
        try {
            //verify the users are correct
            List<SysUser> users = sysUserRepository.findAllById(recipeOrder.getSelectedUserIds());
            if (users.isEmpty()) {
                logger.error("No valid user ids passed in");
                return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            //verify the recipes are correct
            List<Recipe> recipes = recipeRepository.findAllById(recipeOrder.getSelectedRecipes());
            if (recipes.isEmpty()) {
                logger.error("No valid recipe ids passed in");
                return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            //save the order
            RecipeOrder newOrder = recipeOrderRepository.save(new RecipeOrder(recipeOrder.getMessage()));
            for(Recipe recipe : recipes) {
                recipeOrderItemRepository.save(new RecipeOrderItem(newOrder.getId(), recipe.getId()));
            }
            for(SysUser user : users) {
                recipeOrderRecipientRepository.save(new RecipeOrderRecipient(newOrder.getId(), user.getId()));
            }

            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("error while trying to add multiple recipes", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}