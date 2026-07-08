package com.banquito.core.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransactionPageResponseDTO {

    private List<TransactionResponseDTO> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public TransactionPageResponseDTO() {
    }

    public TransactionPageResponseDTO(List<TransactionResponseDTO> content, int page, int size,
                                      long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }
}
