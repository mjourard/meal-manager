package com.mealmanager.api.dto.templatedata;

import java.util.Map;

public interface ITemplateData {
    public Map<String, Object> getTemplateDataMapping();
    public String getTemplateName();
}
