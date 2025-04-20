package com.mealmanager.api.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "recipeorderrecipient")
public class RecipeOrderRecipient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "orderid")
    private long orderId;

    @Column(name = "sysuserid")
    private long sysUserId;

    @ManyToOne
    @JoinColumn(name = "orderid", referencedColumnName = "id", insertable = false, updatable = false)
    private RecipeOrder recipeOrder;

    @ManyToOne
    @JoinColumn(name = "sysuserid", referencedColumnName = "id", insertable = false, updatable = false)
    private SysUser sysUser;

    public RecipeOrderRecipient() {}

    public RecipeOrderRecipient(Long orderId, Long sysUserId) {
        this.orderId = orderId;
        this.sysUserId = sysUserId;
    }

    public SysUser getSysUser() {
        return this.sysUser;
    }
}
