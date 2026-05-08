package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.dto.BranchRequestDTO;
import ec.edu.espe.banquito.core.dto.BranchResponseDTO;
import ec.edu.espe.banquito.core.model.Branch;
import ec.edu.espe.banquito.core.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BranchService implements IBranchService {

    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    @Override
    public List<BranchResponseDTO> findAll() {
        return branchRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    @Override
    public BranchResponseDTO findByCode(String code) {
        Branch branch = branchRepository.findByBranchCode(code)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada: " + code));
        return toResponse(branch);
    }

    @Transactional
    @Override
    public BranchResponseDTO create(BranchRequestDTO request) {
        Branch branch = new Branch();
        branch.setBranchCode(request.getBranchCode());
        branch.setName(request.getName());
        branch.setCity(request.getCity());

        log.info("Creando sucursal con código: {}", branch.getBranchCode());
        return toResponse(branchRepository.save(branch));
    }

    private BranchResponseDTO toResponse(Branch branch) {
        return new BranchResponseDTO(
                branch.getId(),
                branch.getBranchCode(),
                branch.getName(),
                branch.getCity()
        );
    }
}
