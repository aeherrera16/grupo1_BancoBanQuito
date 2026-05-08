package ec.edu.espe.banquito.core.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "CORE_PARAMETER")
public class CoreParameter {

    @Id
    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "value_string", nullable = false, length = 255)
    private String valueString;

    @Column(name = "data_type", nullable = false, length = 20)
    private String dataType;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "last_update", insertable = false, updatable = false)
    private LocalDateTime lastUpdate;

    public CoreParameter() {}

    public CoreParameter(String code) {
        this.code = code;
    }

    // Getters y Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getValueString() { return valueString; }
    public void setValueString(String valueString) { this.valueString = valueString; }

    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getLastUpdate() { return lastUpdate; }
    public void setLastUpdate(LocalDateTime lastUpdate) { this.lastUpdate = lastUpdate; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CoreParameter)) return false;
        CoreParameter that = (CoreParameter) o;
        return Objects.equals(code, that.code);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(code);
    }

    @Override
    public String toString() {
        return "CoreParameter{" +
                "code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", dataType='" + dataType + '\'' +
                '}';
    }
}