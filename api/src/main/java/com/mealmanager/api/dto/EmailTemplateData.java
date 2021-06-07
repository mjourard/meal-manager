package com.mealmanager.api.dto;

import com.mealmanager.api.dto.templatedata.ITemplateData;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EmailTemplateData implements Serializable {
    private static final long serialVersionUID = 1L;

    private Map<String, Object> dataMap;
    private final List<String> toAddresses;
    private final List<String> ccAddresses;
    private final List<String> bccAddresses;


    private String subject;

    private String templateName;

    public EmailTemplateData() {
        dataMap = new HashMap<>();
        toAddresses = new ArrayList<String>();
        ccAddresses = new ArrayList<String>();
        bccAddresses = new ArrayList<String>();
    }

    ;

    public EmailTemplateData setTemplateName(String templateName) {
        this.templateName = templateName;
        return this;
    }

    public String getTemplateName() {
        return this.templateName;
    }

    public EmailTemplateData setSubject(String subject) {
        this.subject = subject;
        return this;
    }

    public String getSubject() {
        return this.subject;
    }

    public EmailTemplateData addTo(List<String> targetEmails) {
        this.toAddresses.addAll(targetEmails);
        return this;
    }

    public EmailTemplateData addCC(List<String> targetEmails) {
        this.ccAddresses.addAll(targetEmails);
        return this;
    }

    public EmailTemplateData addBCC(List<String> targetEmails) {
        this.bccAddresses.addAll(targetEmails);
        return this;
    }

    public EmailTemplateData setTemplateData(String variableName, String value) {
        this.dataMap.put(variableName, value);
        return this;
    }

    public EmailTemplateData setTemplateData(ITemplateData data) {
        if (this.dataMap.isEmpty()) {
            this.dataMap = data.getTemplateDataMapping();
        } else {
            data.getTemplateDataMapping().forEach(
                    (key, value) -> this.dataMap.merge(key, value, (v1, v2) -> v2)
            );
        }
        return this;
    }

    public Map<String, Object> getDataMap() {
        return this.dataMap;
    }

    public List<String> getToAddresses() {
        return this.toAddresses;
    }
}
