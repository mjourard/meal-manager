package com.mealmanager.api.controller;

import com.mealmanager.api.dto.EmailTemplateData;
import com.mealmanager.api.dto.RecipeOrderDTO;
import com.mealmanager.api.dto.RecipeOrderDetailsDTO;
import com.mealmanager.api.dto.templatedata.GroceryMealOrderData;
import com.mealmanager.api.messagequeue.Sender;
import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.RecipeOrder;
import com.mealmanager.api.model.RecipeOrderItem;
import com.mealmanager.api.model.RecipeOrderRecipient;
import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.RecipeOrderItemRepository;
import com.mealmanager.api.repository.RecipeOrderRecipientRepository;
import com.mealmanager.api.repository.RecipeOrderRepository;
import com.mealmanager.api.repository.RecipeRepository;
import com.mealmanager.api.repository.SysUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;
import java.util.Optional;


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

    @Autowired
    Sender sender;

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

            //save the order and create the data DTO
            GroceryMealOrderData templateData = new GroceryMealOrderData();
            RecipeOrder newOrder = recipeOrderRepository.save(new RecipeOrder(recipeOrder.getMessage()));
            for (Recipe recipe : recipes) {
                recipeOrderItemRepository.save(new RecipeOrderItem(newOrder.getId(), recipe.getId()));
                templateData.addMeal(recipe.getName());
            }
            templateData.setMessage(recipeOrder.getMessage());

            EmailTemplateData emailData = new EmailTemplateData();
            for (SysUser user : users) {
                recipeOrderRecipientRepository.save(new RecipeOrderRecipient(newOrder.getId(), user.getId()));
                emailData.addTo(List.of(user.getEmail()));
            }

            emailData.setSubject(templateData.getStandardSubject())
                    .setTemplateName(templateData.getTemplateName())
                    .setTemplateData(templateData);
            sender.send(emailData);

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
            
            // Ensure all orders have createdAt and fulfilled values set
            for (RecipeOrder order : orders) {
                if (order.getCreatedAt() == null) {
                    order.setCreatedAt(new Date());
                }
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
            for (RecipeOrderItem item : orderItems) {
                dto.addSelectedRecipe(item.getRecipe());
            }
            List<RecipeOrderRecipient> orderRecipients = recipeOrderRecipientRepository.findByOrderId(order.getId());
            for (RecipeOrderRecipient user : orderRecipients) {
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
