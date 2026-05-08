package com.banquito.core.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchResponseDTO {
    private Integer id;
    private String branchCode;
    private String name;
    private String city;
}
