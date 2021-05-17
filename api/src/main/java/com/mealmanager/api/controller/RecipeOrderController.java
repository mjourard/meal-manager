package com.mealmanager.api.controller;

import com.mealmanager.api.dto.RecipeOrderDTO;
import com.mealmanager.api.dto.RecipeOrderDetailsDTO;
import com.mealmanager.api.model.*;
import com.mealmanager.api.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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

    @GetMapping("/orders")
    public ResponseEntity<List<RecipeOrder>> getOrders() {
        try {
            List<RecipeOrder> orders = recipeOrderRepository.findAll();
            if (orders.isEmpty()) {
                return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while retrieving orders", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<RecipeOrderDetailsDTO> getOrderDetails(@PathVariable("id") long id) {
        try {
            Optional<RecipeOrder> orderData = recipeOrderRepository.findById(id);
            if (orderData.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            RecipeOrder order = orderData.get();
            RecipeOrderDetailsDTO dto = new RecipeOrderDetailsDTO(order.getId());
            List<RecipeOrderItem> orderItems = recipeOrderItemRepository.findByOrderId(order.getId());
            for(RecipeOrderItem item : orderItems) {
                dto.addSelectedRecipe(item.getRecipe());
            }
            List<RecipeOrderRecipient> orderRecipients = recipeOrderRecipientRepository.findByOrderId(order.getId());
            for(RecipeOrderRecipient user : orderRecipients) {
                dto.addSelectedUser(user.getSysUser());
            }
            if (order.getMessage() != null) {
                dto.setMessage(order.getMessage());
            }
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error while retrieving orders", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}