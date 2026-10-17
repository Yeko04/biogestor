# Logic Rules - Centro Comunitario de Aprovechamiento de Biomasa Vegetal

This document defines the business rules, validations, calculations and traceability criteria for the system. Designed for JSON + localStorage (no database).

## 1. General Principles

- **No automatic assignment.** During classification, the process is NEVER assigned automatically based solely on wet/dry, soft/hard or humidity. The decision must be made manually by the operator (operational criteria).
- **Estimated vs. Received.** `cantidad.estimada_kg` (estimated) and `cantidad.recibida_kg` (received) must always be kept separately and visibly. They are never added together.
- **Traceability.** Every reception keeps its origin (`solicitud_id`). Lots keep the list of reception IDs (`recepciones_ids`) to preserve traceability of origins.
- **Lot maintenance.** Editing a lot keeps its follow-up history and recalculates its composition from linked receptions. Process or reception links cannot change after follow-ups, subproducts or outputs exist. Deleting a lot releases its linked receptions and is blocked while subproducts or outputs still reference it. Follow-up records can be edited or deleted individually; changes recalculate accumulated losses and the usable mass balance.
- **Real / Simulated.** Any biological/thermal stage not actually executed must be marked as `medicion.simulado = true` and `medicion.real = false`. Stages executed with real measurements must be `real = true`, `simulado = false`.
- **Do not mix units.** Never add `kg` and `m³`. Indicators must keep estimated and verified quantities separated by unit.
- **Justified rejections.** If `cantidad.rechazada_kg > 0`, rejection must be justified with at least one reason and `rechazo.justificado = true`.
- **Only active categories visible.** Only materials with `estado = "aceptado"` and `mostrar_inicio_publico = true` appear in the public view. `Poda y ramas` must keep its `protagonista = true` status.
- **No automatic activation.** Not all categories are activated by default. The Administrator must confirm which ones the center can process.

## 2. Proposed Flow

- **Húmedo / Blando** (fruits, market residues, vegetable preparation residues) → Direct to Biodigestor → Biogás + Biol
- **Seco / Duro** (pruning, woody branches) → Triturado / Machecado → Pirólisis (Kon-Tiki elevado) → Biochar
- **Mezcla final** → (Biol + Biochar) registered as subproduct `mezcla_biol_biochar` for documented distribution
