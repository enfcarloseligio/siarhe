// assets/js/utils/cargar-indicadores.js

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor-indicadores");
  if (!contenedor) return;

  // Ruta mínima correcta según estructura del plugin
  const RUTA_INDICADORES = "../../data/indicators/indicadores-clave.csv";

  d3.csv(RUTA_INDICADORES)
    .then(data => {
      if (!data || !data.length) return;

      const fila = data[0];

      const etiquetas = {
        enfermeras: { nombre: "Enfermeras registradas", unidad: "" },
        tasa: { nombre: "Tasa nacional", unidad: "" },
        edad: { nombre: "Promedio de edad", unidad: "años" },
        profesional: { nombre: "Con nivel profesional", unidad: "%" },
      };

      const format = new Intl.NumberFormat("es-MX", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

      for (const key in fila) {
        const valor = fila[key];
        if (valor === "" || valor === undefined || valor === null) continue;

        const meta = etiquetas[key] || { nombre: key, unidad: "" };

        const numeric = parseFloat(valor);
        const mostrado = Number.isFinite(numeric) ? format.format(numeric) : valor;

        const div = document.createElement("div");
        div.className = "indicador";

        div.innerHTML = `
          <strong>${mostrado}</strong><br>
          ${meta.nombre}${meta.unidad ? ` (${meta.unidad})` : ""}
        `;

        contenedor.appendChild(div);
      }
    })
    .catch(err => console.error("Error al cargar los indicadores:", err));
});
