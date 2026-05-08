package com.banquito.core.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "BRANCH")
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "branch_code", nullable = false, length = 10, unique = true)
    private String branchCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "city", nullable = false, length = 50)
    private String city;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "creation_date", insertable = false, updatable = false)
    private LocalDateTime creationDate;

    // Regla 6: Constructor vacío
    public Branch() {
    }

    // Regla 6: Constructor solo con la PK
    public Branch(Integer id) {
        this.id = id;
    }

    // --- GETTERS Y SETTERS ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    // Regla 5: equals() y hashCode() SOLO para la PK
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Branch branch = (Branch) o;
        return Objects.equals(id, branch.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    // Regla 7: Sobreescribir toString()
    @Override
    public String toString() {
        return "Branch{" +
                "id=" + id +
                ", branchCode='" + branchCode + '\'' +
                ", name='" + name + '\'' +
                ", city='" + city + '\'' +
                '}';
    }
}
