// assets/js/componentes/indicador-control.js
// ==============================
// Componente: Control de Métrica
// (mismo layout que Marcadores)
// ==============================

/**
 * Renderiza el control de indicador/métrica.
 *
 * @param {string|HTMLElement} target - Selector CSS o nodo donde montar el control.
 * @param {Object} options
 * @param {string} [options.defaultValue="tasa_total"] - Valor por defecto (modo simple).
 * @param {Object} [options.metricas=null]           - Catálogo METRICAS (opcional, por compatibilidad).
 * @param {string} [options.current=null]           - Métrica actual (si se usa desde el mapa).
 * @param {Function} [options.onChange=null]        - Callback al cambiar la métrica.
 */
export function renderIndicadorControl(
  target,
  {
    defaultValue = "tasa_total",
    metricas = null,   // no obligatorio, solo por compatibilidad
    current = null,
    onChange = null,
  } = {}
) {
  // Permitir pasar selector o elemento
  const container =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!container) return;

  // Valor inicial (prioriza `current` y cae a `defaultValue`)
  const initialValue = current || defaultValue || "tasa_total";

  // Opciones estándar (mantener estas claves para sincronizar mapa/tabla)
  const opciones = [
    { value: "tasa_total",         label: "Tasa total" },
    { value: "poblacion",          label: "Población" },
    { value: "tasa_primer",        label: "Tasa 1er nivel" },
    { value: "tasa_segundo",       label: "Tasa 2º nivel" },
    { value: "tasa_tercer",        label: "Tasa 3er nivel" },
    { value: "tasa_apoyo",         label: "Tasa en establecimientos de apoyo" },
    { value: "tasa_escuelas",      label: "Tasa en escuelas" },
    { value: "tasa_administrativas", label: "Tasa en áreas administrativas" },
    { value: "tasa_no_aplica",     label: "Tasa no aplica" },
    { value: "tasa_no_asignado",   label: "Tasa no asignado" },
  ];

  // Si algún día quisieras generar opciones dinámicas desde `metricas`,
  // aquí podríamos hacer un merge, pero por ahora mantenemos el catálogo fijo.

  container.innerHTML = `
    <div class="ic-row">
      <label for="sel-metrica" class="ic-label">Indicador:</label>
      <select id="sel-metrica" class="ic-select">
        ${opciones
          .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
          .join("")}
      </select>
    </div>
  `;

  const sel = container.querySelector("#sel-metrica");
  if (!sel) return;

  // Set inicial
  sel.value = initialValue;

  // Disparar callback si viene definido
  if (typeof onChange === "function") {
    // Llamada inicial para que el mapa se pinte con la métrica actual
    onChange(sel.value);

    sel.addEventListener("change", () => {
      const value = sel.value;
      onChange(value);
    });
  }
}
