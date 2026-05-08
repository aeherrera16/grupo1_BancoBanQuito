package ec.edu.espe.banquito.core.model;


import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "ACCOUNT_SUBTYPE")
public class AccountSubtype {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "code", nullable = false, length = 20, unique = true)
    private String code;

    @Column(name = "description", nullable = false, length = 100)
    private String description;

    public AccountSubtype() {}

    public AccountSubtype(Integer id) {
        this.id = id;
    }
    // GETTERS & SETTERS
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AccountSubtype)) return false;
        AccountSubtype that = (AccountSubtype) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
