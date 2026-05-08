package ec.edu.espe.banquito.core.model;


import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "TRANSACTION_SUBTYPE")
public class TransactionSubtype {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "description", nullable = false)
    private String description;

    public TransactionSubtype() {}

    public TransactionSubtype(Integer id) {
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
        if (!(o instanceof TransactionSubtype)) return false;
        TransactionSubtype that = (TransactionSubtype) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
