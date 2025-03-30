package com.mealmanager.api.model;

import javax.persistence.*;

@Entity
@Table(name = "sysuser")
public class SysUser {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(name = "firstname", nullable = false)
    private String firstName;

    @Column(name = "lastname", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "defaultchecked", nullable = false, columnDefinition = "boolean default true")
    private Boolean defaultChecked;
    
    @Column(name = "clerk_user_id", unique = true)
    private String clerkUserId;

    public SysUser() {}

    public SysUser(String firstname, String lastname, String email, Boolean defaultChecked) {
        this.firstName = firstname;
        this.lastName = lastname;
        this.email = email;
        this.defaultChecked = defaultChecked;
    }
    
    public SysUser(String firstname, String lastname, String email, Boolean defaultChecked, String clerkUserId) {
        this.firstName = firstname;
        this.lastName = lastname;
        this.email = email;
        this.defaultChecked = defaultChecked;
        this.clerkUserId = clerkUserId;
    }

    public long getId() {
        return this.id;
    }

    public void setFirstName(String name) {
        this.firstName = name;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public void setLastName(String name) {
        this.lastName = name;
    }

    public String getLastName() {
        return this.lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return this.email;
    }

    public void setDefaultChecked(Boolean defaultChecked) {
        this.defaultChecked = defaultChecked;
    }

    public Boolean getDefaultChecked() {
        return this.defaultChecked;
    }
    
    public void setClerkUserId(String clerkUserId) {
        this.clerkUserId = clerkUserId;
    }
    
    public String getClerkUserId() {
        return this.clerkUserId;
    }
}
