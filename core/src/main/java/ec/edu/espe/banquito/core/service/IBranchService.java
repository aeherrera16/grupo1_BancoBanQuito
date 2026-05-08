package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.dto.BranchRequestDTO;
import ec.edu.espe.banquito.core.dto.BranchResponseDTO;

import java.util.List;

public interface IBranchService {

    List<BranchResponseDTO> findAll();

    BranchResponseDTO findByCode(String code);

    BranchResponseDTO create(BranchRequestDTO request);
}
