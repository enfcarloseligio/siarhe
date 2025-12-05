// assets/js/utils/marcadores.js
// =======================================================
// Estilos y helpers para marcadores de clínicas (puntos)
// =======================================================
import { MAP_HEIGHT } from "./config-mapa.js";

// Catálogo de tipos
export const MARCADORES_TIPOS = {
  CATETER: "CATETER",
  HERIDAS: "HERIDAS",
};

// Nombres legibles
export const MARCADOR_NOMBRES = {
  [MARCADORES_TIPOS.CATETER]: "Clínicas de catéteres",
  [MARCADORES_TIPOS.HERIDAS]: "Clínicas de heridas",
};

// Estilos visuales
export const MARCADOR_ESTILOS = {
  [MARCADORES_TIPOS.CATETER]: {
    fill: "#00695c",
    hover: "#004d40",
    stroke: "#00332c",
  },
  [MARCADORES_TIPOS.HERIDAS]: {
    fill: "#c2185b",
    hover: "#880e4f",
    stroke: "#5c102f",
  },
};

// Devuelve estilo según tipo
export function estiloPorTipo(tipo) {
  return MARCADOR_ESTILOS[tipo] || {
    fill: "#424242",
    hover: "#212121",
    stroke: "#000000",
  };
}

// =======================================================
// PINTAR MARCADORES
// =======================================================
export function pintarMarcadores(
  g,
  puntos,
  projection,
  {
    tipo = MARCADORES_TIPOS.CATETER,
    radioBase = 4.5,
    strokeBase = 1.5,
  } = {}
) {
  if (!g || !projection || !Array.isArray(puntos)) {
    console.warn("[marcadores] Parámetros inválidos.");
    return { selection: null, updateZoom() {}, recolor() {}, layer: null };
  }

  let kActual = 1;
  let tipoActual = tipo;

  const layer = g
    .append("g")
    .attr("class", `capa-clinicas capa-${String(tipoActual).toLowerCase()}`);

  const estilo = () => estiloPorTipo(tipoActual);

  const radioEscalado = (el) => {
    const isHover = el && el.classList && el.classList.contains("is-hover");
    const factorHover = isHover ? 1.35 : 1;
    return (radioBase * factorHover) / kActual;
  };

  const bordeEscalado = (el) => {
    const isHover = el && el.classList && el.classList.contains("is-hover");
    const factorHover = isHover ? 1.35 : 1;
    return (strokeBase * factorHover) / kActual;
  };

  const sel = layer
    .selectAll("circle")
    .data(puntos)
    .enter()
    .append("circle")
    .attr("cx", (d) => projection([d.lon, d.lat])[0])
    .attr("cy", (d) => projection([d.lon, d.lat])[1])
    .attr("r", function () {
      return radioEscalado(this);
    })
    .attr("fill", estilo().fill)
    .attr("stroke", estilo().stroke)
    .attr("stroke-width", function () {
      return bordeEscalado(this);
    })
    .style("cursor", "pointer")
    .on("mouseover", function () {
      this.classList.add("is-hover");
      d3.select(this)
        .attr("fill", estilo().hover)
        .attr("r", () => radioEscalado(this))
        .attr("stroke-width", () => bordeEscalado(this));
    })
    .on("mouseout", function () {
      this.classList.remove("is-hover");
      d3.select(this)
        .attr("fill", estilo().fill)
        .attr("r", () => radioEscalado(this))
        .attr("stroke-width", () => bordeEscalado(this));
    });

  // Zoom dinámico: se llama desde el manejador de zoom del mapa
  function updateZoom(k) {
    kActual = k || 1;
    sel
      .attr("r", function () {
        return radioEscalado(this);
      })
      .attr("stroke-width", function () {
        return bordeEscalado(this);
      });
  }

  // Recolorear si el usuario activa más tipos
  function recolor(nuevoTipo) {
    if (!nuevoTipo) return;
    tipoActual = nuevoTipo;
    sel.attr("fill", estilo().fill).attr("stroke", estilo().stroke);
  }

  return { selection: sel, updateZoom, recolor, layer };
}

// =======================================================
// LEYENDA
// =======================================================
export function crearLeyendaMarcadores(
  host,
  tiposPresentes,
  {
    x = 20,
    y = MAP_HEIGHT - 100,
    title = "Marcadores",
    dx = 0,
    dyStep = 18,
  } = {}
) {
  const hostSel =
    host && typeof host.select === "function" ? host : d3.select(host || "svg");

  // Limpiamos leyenda anterior
  hostSel.selectAll(".leyenda-marcadores").remove();

  // Si no hay tipos, no dibujamos nada (para que desaparezca la palabra "Marcadores")
  if (!tiposPresentes || !tiposPresentes.length) {
    return null;
  }

  const g = hostSel
    .append("g")
    .attr("class", "leyenda-marcadores")
    .attr("transform", `translate(${x},${y})`);

  if (title) {
    g.append("text")
      .attr("x", dx)
      .attr("y", 0)
      .style("font-weight", "bold")
      .text(title);
  }

  const baseY = title ? dyStep : 0;

  tiposPresentes.forEach((tipo, i) => {
    const est = estiloPorTipo(tipo);
    const nombre = MARCADOR_NOMBRES[tipo] || tipo;

    const gy = g
      .append("g")
      .attr("transform", `translate(${dx},${baseY + i * dyStep})`);

    gy.append("circle")
      .attr("cx", 0)
      .attr("cy", -4)
      .attr("r", 5)
      .attr("fill", est.fill)
      .attr("stroke", est.stroke);

    gy.append("text").attr("x", 12).attr("y", 0).text(nombre);
  });

  return g;
}

// =======================================================
// Nombre amigable
// =======================================================
export function nombreTipoMarcador(tipo) {
  return MARCADOR_NOMBRES[tipo] || tipo;
}
