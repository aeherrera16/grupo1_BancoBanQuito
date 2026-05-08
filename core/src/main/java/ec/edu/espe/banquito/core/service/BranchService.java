package ec.edu.espe.banquito.core.service;

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
public class BranchService {

    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    public List<Branch> findAll() {
        return branchRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Branch findByCode(String code) {
        return branchRepository.findByBranchCode(code)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada: " + code));
    }

    @Transactional
    public Branch create(Branch branch) {
        log.info("Creando sucursal con código: {}", branch.getBranchCode());
        return branchRepository.save(branch);
    }
}
