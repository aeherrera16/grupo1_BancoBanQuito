package com.banquito.core.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BranchResponseDTO {

    private Integer id;
    private String branchCode;
    private String name;
    private String city;
    private LocalDateTime creationDate;

    public BranchResponseDTO() {
    }

    public BranchResponseDTO(Integer id, String branchCode, String name, String city, LocalDateTime creationDate) {
        this.id = id;
        this.branchCode = branchCode;
        this.name = name;
        this.city = city;
        this.creationDate = creationDate;
    }
}
