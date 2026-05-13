package ec.edu.espe.banquito.switchpagos.service;

import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Servicio para manejar la lógica de horarios de corte.
 */
@Service
public class CutoffTimeService implements ICutoffTimeService {

    @Value("${app.ingest.cutoff-hour:18}")
    private int cutoffHour;

    /**
     * Verifica si el tiempo actual está dentro de la ventana de ingesta.
     * @return true si está antes de la hora de corte, false otherwise
     */
    public boolean isWithinIngestionWindow() {
        LocalTime now = LocalTime.now();
        LocalTime cutoff = LocalTime.of(cutoffHour, 0);
        return now.isBefore(cutoff);
    }

    /**
     * Obtiene la hora de corte configurada.
     * @return LocalTime con la hora de corte
     */
    public LocalTime getCutoffTime() {
        return LocalTime.of(cutoffHour, 0);
    }

    /**
     * Verifica si un tiempo específico está dentro de la ventana de ingesta.
     * @param time tiempo a verificar
     * @return true si está antes de la hora de corte, false otherwise
     */
    public boolean isWithinIngestionWindow(LocalTime time) {
        LocalTime cutoff = LocalTime.of(cutoffHour, 0);
        return time.isBefore(cutoff);
    }
}
