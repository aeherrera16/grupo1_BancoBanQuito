package com.banquito.core.repository;

import com.banquito.core.model.AccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    // Soporte para la Idempotencia: Buscar si el Switch ya mandó este UUID
    Optional<AccountTransaction> findByTransactionUuid(String transactionUuid);

    // Para buscar los últimos N movimientos de una cuenta (El índice de BD ayudará aquí)
    List<AccountTransaction> findTop10ByAccount_IdOrderByTransactionDateDesc(Integer accountId);
}
