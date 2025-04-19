package com.mealmanager.api.dto.templatedata;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;

public class GroceryMealOrderData implements ITemplateData {
    public static final String TEMPLATE_NAME = "grocery-meal-order";

    public String getStandardSubject() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("LLLL dd")
                .withLocale(Locale.CANADA)
                .withZone(ZoneId.of("America/New_York"));
        return String.format("Grocery Meal Order for %s", formatter.format(creationDate));
    }

    public enum VARIABLES {
        MEALS("meals"),
        MESSAGE("message"),
        CREATION_DATE("creationDate");

        private String name;

        VARIABLES(String name) {
            this.name = name;
        }
        public String getName() {
            return this.name;
        }
    }

    private SortedSet<String> meals = new TreeSet<>();

    private Instant creationDate = Instant.now();

    private String additionalMessage;

    public void addMeal(String meal) {
        meals.add(meal);
    }

    public void setMessage(String message) {
        additionalMessage = message;
    }

    @Override
    public Map<String, Object> getTemplateDataMapping() {
        Map<String, Object> temp = new HashMap<>();
        temp.put(VARIABLES.MEALS.getName(), this.meals);
        temp.put(VARIABLES.CREATION_DATE.getName(), this.creationDate);
        temp.put(VARIABLES.MESSAGE.getName(), this.additionalMessage);
        return temp;
    }

    @Override
    public String getTemplateName() {
        return TEMPLATE_NAME;
    }
}
