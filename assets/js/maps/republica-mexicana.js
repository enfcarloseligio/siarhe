// assets/js/maps/republica-mexicana.js
// Mapa nacional SIARHE (entidades federativas)

// ==============================
// IMPORTACIONES (según estructura del plugin)
// ==============================
import {
  crearTooltip,
  mostrarTooltip,
  ocultarTooltip,
  mostrarTooltipClinica,
} from '../utils/tooltip.js';

import {
  crearSVGBase,
  MAP_WIDTH,
  MAP_HEIGHT,
  crearLeyenda,
  descargarComoPNG,
  construirTitulo,
  prepararEscalaYLeyenda,
  COLOR_CERO,
  COLOR_SIN,
} from '../utils/config-mapa.js';

import { renderZoomControles } from '../componentes/zoom-controles.js';
import { renderTablaNacional, attachExcelButton } from '../utils/tablas.js';
import { normalizarDataset } from '../utils/normalizacion.js';
import { urlEntidad } from '../utils/enlaces.js';

import { renderMarcadoresControl } from '../componentes/marcadores-control.js';
import { RUTAS_MARCADORES, normalizarClinicaRow } from '../utils/marcadores.config.js';
import {
  MARCADORES_TIPOS,
  pintarMarcadores,
  crearLeyendaMarcadores,
  nombreTipoMarcador
} from '../utils/marcadores.js';

import {
  METRICAS,
  metricLabel,
  metricPalette,
  tasaKey,
  isPopulation
} from '../utils/metricas.js';

// ==============================
// SVG BASE + TOOLTIP + LEYENDA
// ==============================
const { svg, g } = crearSVGBase("#mapa-nacional", "Mapa de distribución nacional de enfermeras");
const tooltip = crearTooltip();
const legendHost = svg.append("g").attr("id", "legend-host");

// ==============================
// CONSTANTES / CONFIG
// ==============================

// Paletas base
const COLORES_TASAS     = ['#9b2247', 'orange', '#e6d194', 'green', 'darkgreen'];
const COLORES_POBLACION = ['#e5f5e0', '#a1d99b', '#74c476', '#31a354', '#006d2c'];

// Estado
let currentMetric = "tasa_total";  // clave de METRICAS
let dataByEstado = {};
let scale = null;
let legendCfg = null;

let gMarcadores = svg.append("g").attr("class", "layer-marcadores");
let marcadoresCtl = null;

// ==============================
// HELPERS MÉTRICAS
// ==============================
function esPoblacion(metricKey) {
  return isPopulation(metricKey);
}

function getPalette(metricKey) {
  const pal = metricPalette(metricKey);

  // Si metricPalette devolviera directamente un arreglo de colores
  if (Array.isArray(pal)) return pal;

  // Si devuelve solo el tipo ('poblacion' / 'tasas')
  if (pal === "poblacion") return COLORES_POBLACION;

  // Cualquier otra cosa (incluye 'tasas' por defecto)
  return COLORES_TASAS;
}

// ==============================
// CARGA DE DATOS
// ==============================
//
// Prefijo hacia los datos del plugin.
const DATA_BASE = "/wp-content/plugins/siarhe/assets/data/";

Promise.all([
  d3.json(DATA_BASE + "maps/republica-mexicana.geojson"),
  d3.csv(DATA_BASE + "nacional/republica-mexicana.csv")
]).then(([geoData, tasasRaw]) => {

  // ==============================
  // AÑO Y TOTALES
  // ==============================
  const year = new Date().getFullYear();
  document.querySelectorAll(".year").forEach(el => el.textContent = year);

  const fila9999 = tasasRaw.find(d => String(d.id) === "9999");
  const totalNacional = fila9999
    ? (Number(fila9999.enfermeras_total ?? fila9999.enfermeras) || 0)
    : 0;
  const spanTotalNac = document.getElementById("total-enfermeras-nac");
  if (spanTotalNac) spanTotalNac.textContent = totalNacional.toLocaleString("es-MX");

  const NUM_ENTIDADES_FED = 32;
  function contarEntidadesFederativas(geo) {
    try {
      const nombresUnicos = new Set(
        (geo?.features ?? [])
          .map(f => (f.properties?.NOMBRE || f.properties?.nom_ent || "").trim())
          .filter(Boolean)
      );
      const n = nombresUnicos.size;
      return n >= 20 && n <= 40 ? n : NUM_ENTIDADES_FED;
    } catch {
      return NUM_ENTIDADES_FED;
    }
  }
  const numEntidades = contarEntidadesFederativas(geoData);
  const spanEnt = document.getElementById("total-entidades");
  if (spanEnt) spanEnt.textContent = numEntidades.toLocaleString("es-MX");

  document.title = `SIARHE | Distribución de Profesionales de Enfermería en México ${year}`;

  // ==============================
  // NORMALIZACIÓN
  // ==============================
  const tasas = normalizarDataset(tasasRaw, { scope: "nacional", extras: [] });

  dataByEstado = {};
  tasas.forEach(d => {
    const nombre = (d.estado || d.nombre_estado || d.NOMBRE || "").trim();
    if (!nombre) return;
    dataByEstado[nombre] = d;
  });

  // ==============================
  // PROYECCIÓN Y PATHS
  // ==============================
  const projection = d3.geoMercator()
    .fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);

  const path = d3.geoPath().projection(projection);

  const estados = g.selectAll("path.estado")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("class", "estado")
    .attr("d", path)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.5)
    .attr("fill", COLOR_SIN);

  // ==============================
  // TOOLTIP ENTIDADES
  // ==============================
  estados
    .on("mouseover", function (event, d) {
      const nombre = (d.properties.NOMBRE || "").trim();
      const item = dataByEstado[nombre];
      mostrarTooltip(tooltip, event, {
        nombre,
        data: item,
        metricKey: currentMetric
      });
      d3.select(this).classed("hover", true);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      ocultarTooltip(tooltip);
      d3.select(this).classed("hover", false);
    })
    .on("dblclick", function (event, d) {
      const nombre = (d.properties.NOMBRE || "").trim();
      const href = urlEntidad(nombre);
      if (href) window.location.href = href;
    });

  // ==============================
  // ZOOM + CONTROLES
  // ==============================
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      if (marcadoresCtl && marcadoresCtl.updateZoom) {
        marcadoresCtl.updateZoom(event.transform.k);
      }
    });

  svg.call(zoom);

  renderZoomControles(".zoom-controles", {
    svg,
    g,
    zoom
    // sin showHome → en nacional no aparece botón Home
  });

  // ==============================
  // REPINTAR MAPA POR MÉTRICA
  // ==============================
  function actualizarMapaPorMetrica(metricKey) {
    currentMetric = metricKey;

    const esPobl = esPoblacion(metricKey);
    const palette = getPalette(metricKey);

    ({ scale, legendCfg } = prepararEscalaYLeyenda(
      tasas,
      METRICAS,
      metricKey,
      {
        palette,
        titulo: metricLabel(metricKey),
        idKey: "id",
        excludeIds: ["8888", "9999"],
        clamp: true
      }
    ));

    g.selectAll("path.estado")
      .transition().duration(350)
      .attr("fill", d => {
        const nombre = (d.properties.NOMBRE || "").trim();
        const item = dataByEstado[nombre];
        if (!item) return COLOR_SIN;
        const v = +item[tasaKey(metricKey)];
        if (!Number.isFinite(v)) return COLOR_SIN;
        if (!esPobl && v <= 0) return COLOR_CERO;
        return scale(v);
      });

    legendHost.selectAll("*").remove();
    crearLeyenda(legendCfg ? legendHost : null, legendCfg);
  }

  // ==============================
  // CONTROL DE INDICADOR (selector)
// ==============================
  const indicadorMount = document.getElementById("indicador-control");
  if (indicadorMount) {
    import('../componentes/indicador-control.js').then(mod => {
      const { renderIndicadorControl } = mod;
      renderIndicadorControl(indicadorMount, {
        metricas: METRICAS,
        current: currentMetric,
        onChange: (key) => {
          actualizarMapaPorMetrica(key);
          renderTabla();
        }
      });

      actualizarMapaPorMetrica(currentMetric);
      renderTabla();
    });
  } else {
    actualizarMapaPorMetrica(currentMetric);
    renderTabla();
  }

  // ==============================
  // TABLA NACIONAL + EXCEL
  // ==============================
  function renderTabla() {
    const mount = document.getElementById("tabla-contenido");
    if (!mount) return;

    renderTablaNacional(mount, {
      data: tasas,
      metricKey: currentMetric,
      metricLabel: metricLabel(currentMetric)
    });

    attachExcelButton("#descargar-excel", {
      data: tasas,
      metricKey: currentMetric,
      metricLabel: metricLabel(currentMetric),
      filename: `siarhe_mapa_nacional_${currentMetric}_${year}.xlsx`
    });
  }

  // ==============================
  // MARCADORES (CLÍNICAS, ETC.)
// ==============================
  async function cargarYPintarTipo(tipo) {
    const ruta = RUTAS_MARCADORES[tipo];
    if (!ruta) return null;

    const raw = await d3.csv(ruta);
    const puntos = raw
      .map(d => normalizarClinicaRow(d, tipo))
      .filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lon));

    const ctl = pintarMarcadores(gMarcadores, puntos, projection, { tipo });

    ctl.selection
      .on("mouseover", function (event, d) {
        event.stopPropagation();
        mostrarTooltipClinica(tooltip, event, d);
      })
      .on("mousemove", function (event) {
        event.stopPropagation();
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top",  (event.pageY - 28) + "px");
      })
      .on("mouseout", function (event) {
        event.stopPropagation();
        ocultarTooltip(tooltip);
      });

    return ctl;
  }

  function limpiarMarcadores() {
    gMarcadores.selectAll("*").remove();
  }

  async function actualizarMarcadores(tiposSeleccionados) {
    limpiarMarcadores();

    if (!tiposSeleccionados.length) {
      if (marcadoresCtl && marcadoresCtl.actualizarLeyenda) {
        marcadoresCtl.actualizarLeyenda([]);
      }
      return;
    }

    const controlesPorTipo = [];
    for (const tipo of tiposSeleccionados) {
      const ctl = await cargarYPintarTipo(tipo);
      if (ctl) controlesPorTipo.push({ tipo, ctl });
    }

    if (marcadoresCtl && marcadoresCtl.actualizarLeyenda) {
      const items = tiposSeleccionados.map(tipo => ({
        tipo,
        nombre: nombreTipoMarcador(tipo)
      }));
      marcadoresCtl.actualizarLeyenda(items);
    }
  }

  const mountMarcadores = document.getElementById("control-marcadores");
  if (mountMarcadores) {
    marcadoresCtl = renderMarcadoresControl(mountMarcadores, {
      tiposDisponibles: [
        MARCADORES_TIPOS.CATETER,
        MARCADORES_TIPOS.HERIDAS,
      ],
      onChange: (tipos) => {
        actualizarMarcadores(tipos);
      }
    });

    const leyendaMarcadoresMount = d3.select("#mapa-nacional")
      .append("div")
      .attr("class", "leyenda-marcadores");

    crearLeyendaMarcadores(leyendaMarcadoresMount, []);
  }

  // ==============================
  // DESCARGAS PNG
  // ==============================
  const btnSinEtiquetas = document.getElementById("btn-png-sin-etiquetas");
  const btnConEtiquetas = document.getElementById("btn-png-con-etiquetas");

  if (btnSinEtiquetas) {
    btnSinEtiquetas.addEventListener("click", () => {
      const titulo = construirTitulo({
        anio: year,
        ambito: "nacional",
        descripcion: metricLabel(currentMetric),
        incluirCita: true
      });

      descargarComoPNG(
        "#mapa-nacional svg",
        "mapa-enfermeras-mexico.png",
        MAP_WIDTH,
        MAP_HEIGHT,
        { titulo }
      );
    });
  }

  if (btnConEtiquetas) {
    btnConEtiquetas.addEventListener("click", () => {
      const titulo = construirTitulo({
        anio: year,
        ambito: "nacional",
        descripcion: metricLabel(currentMetric),
        incluirCita: true
      });

      const etiquetas = svg.selectAll(".etiqueta-municipio");
      etiquetas.style.display = "block";

      setTimeout(() => {
        descargarComoPNG(
          "#mapa-nacional svg",
          "mapa-enfermeras-mexico-con-nombres.png",
          MAP_WIDTH,
          MAP_HEIGHT,
          { titulo }
        );
        etiquetas.style.display = "none";
      }, 100);
    });
  }

}).catch(error => {
  console.error("Error al cargar los datos del mapa nacional:", error);
});
