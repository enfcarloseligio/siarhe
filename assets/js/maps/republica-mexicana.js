// assets/js/maps/republica-mexicana.js
// Mapa nacional SIARHE (entidades federativas)

// ==============================
// IMPORTACIONES
// ==============================
import {
  crearTooltip,
  mostrarTooltip,
  ocultarTooltip,
  mostrarTooltipClinica,
} from "../utils/tooltip.js";

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
} from "../utils/config-mapa.js";

import { renderZoomControles } from "../componentes/zoom-controles.js";
import { renderTablaNacional, attachExcelButton } from "../utils/tablas.js";
import { normalizarDataset } from "../utils/normalizacion.js";
import { urlEntidad } from "../utils/enlaces.js";

import { renderMarcadoresControl } from "../componentes/marcadores-control.js";
import {
  RUTAS_MARCADORES,
  normalizarClinicaRow,
} from "../utils/marcadores.config.js";
import {
  MARCADORES_TIPOS,
  pintarMarcadores,
  crearLeyendaMarcadores,
  nombreTipoMarcador,
} from "../utils/marcadores.js";

import {
  METRICAS,
  metricLabel,
  metricPalette,
  tasaKey,
  isPopulation,
} from "../utils/metricas.js";

// ==============================
// SVG BASE + TOOLTIP + LEYENDA
// ==============================
const { svg, g } = crearSVGBase(
  "#mapa-nacional",
  "Mapa de distribución nacional de enfermeras"
);
const tooltip = crearTooltip();
const legendHost = svg.append("g").attr("id", "legend-host");

// ==============================
// CONSTANTES / CONFIG
// ==============================
const COLORES_TASAS = ["#9b2247", "orange", "#e6d194", "green", "darkgreen"];
const COLORES_POBLACION = ["#e5f5e0", "#a1d99b", "#74c476", "#31a354", "#006d2c"];

// Estado
let currentMetric = "tasa_total";
let dataByEstado = {};
let scale = null;
let legendCfg = null;

// Marcadores dentro de `g` para seguir zoom/pan
let gMarcadores = g.append("g").attr("class", "layer-marcadores");
// Controladores activos de marcadores (para el zoom)
let marcadoresActivos = [];

// ==============================
// HELPERS MÉTRICAS
// ==============================
function esPoblacion(metricKey) {
  return isPopulation(metricKey);
}

function getPalette(metricKey) {
  const pal = metricPalette(metricKey);
  if (Array.isArray(pal)) return pal;
  if (pal === "poblacion") return COLORES_POBLACION;
  return COLORES_TASAS;
}

// ==============================
// CARGA DE DATOS
// ==============================
const DATA_BASE = "/wp-content/plugins/siarhe/assets/data/";

Promise.all([
  d3.json(DATA_BASE + "maps/republica-mexicana.geojson"),
  d3.csv(DATA_BASE + "nacional/republica-mexicana.csv"),
])
  .then(([geoData, tasasRaw]) => {
    // ==============================
    // AÑO Y TOTALES
    // ==============================
    const year = new Date().getFullYear();
    document.querySelectorAll(".year").forEach((el) => (el.textContent = year));

    const fila9999 = tasasRaw.find((d) => String(d.id) === "9999");
    const totalNacional = fila9999
      ? Number(fila9999.enfermeras_total ?? fila9999.enfermeras) || 0
      : 0;
    const spanTotalNac = document.getElementById("total-enfermeras-nac");
    if (spanTotalNac)
      spanTotalNac.textContent = totalNacional.toLocaleString("es-MX");

    const NUM_ENTIDADES_FED = 32;
    function contarEntidadesFederativas(geo) {
      try {
        const nombresUnicos = new Set(
          (geo?.features ?? [])
            .map(
              (f) =>
                (f.properties?.NOMBRE || f.properties?.nom_ent || "").trim()
            )
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
    tasas.forEach((d) => {
      const nombre =
        (d.estado || d.nombre_estado || d.NOMBRE || "").trim();
      if (!nombre) return;
      dataByEstado[nombre] = d;
    });

    // ==============================
    // PROYECCIÓN Y PATHS
    // ==============================
    const projection = d3
      .geoMercator()
      .fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);

    const path = d3.geoPath().projection(projection);

    const estados = g
      .selectAll("path.estado")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("class", "estado")
      .attr("d", path)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5)
      .attr("fill", COLOR_SIN);

    // Asegurar que los marcadores queden por ENCIMA de los estados
    gMarcadores.raise();

    // ==============================
    // TOOLTIP ENTIDADES
    // ==============================
    estados
      .on("mouseover", function (event, d) {
        const nombre = (d.properties.NOMBRE || "").trim();
        const item = dataByEstado[nombre];

        mostrarTooltip(tooltip, event, nombre, item || {}, {
          metricKey: currentMetric,
          label: metricLabel(currentMetric),
        });

        d3.select(this).classed("hover", true);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
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
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);

        // Escalamos marcadores según el nivel de zoom
        const k = event.transform.k;
        marcadoresActivos.forEach((ctl) => {
          if (ctl && typeof ctl.updateZoom === "function") {
            ctl.updateZoom(k);
          }
        });
      });

    // Vincular zoom al SVG y a los botones
    svg.call(zoom);
    renderZoomControles("#mapa-nacional", {
      svg,
      g,
      zoom,
      showHome: false,
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
          clamp: true,
        }
      ));

      g.selectAll("path.estado")
        .transition()
        .duration(350)
        .attr("fill", (d) => {
          const nombre = (d.properties.NOMBRE || "").trim();
          const item = dataByEstado[nombre];
          if (!item) return COLOR_SIN;
          const v = +item[tasaKey(metricKey)];
          if (!Number.isFinite(v)) return COLOR_SIN;
          if (!esPobl && v <= 0) return COLOR_CERO;
          return scale(v);
        });

      legendHost.selectAll("*").remove();
      crearLeyenda(legendCfg ? legendHost : svg, legendCfg);
    }

    // ==============================
    // CONTROL DE INDICADOR
    // ==============================
    const indicadorMount = document.getElementById("indicador-control");
    if (indicadorMount) {
      import("../componentes/indicador-control.js").then((mod) => {
        const { renderIndicadorControl } = mod;
        renderIndicadorControl(indicadorMount, {
          metricas: METRICAS,
          current: currentMetric,
          onChange: (key) => {
            actualizarMapaPorMetrica(key);
            renderTabla();
          },
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
        metricLabel: metricLabel(currentMetric),
      });

      attachExcelButton("#descargar-excel", {
        data: tasas,
        metricKey: currentMetric,
        metricLabel: metricLabel(currentMetric),
        filename: `siarhe_mapa_nacional_${currentMetric}_${year}.xlsx`,
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
        .map((d) => normalizarClinicaRow(d, tipo))
        .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lon));

      const ctl = pintarMarcadores(gMarcadores, puntos, projection, { tipo });

      if (ctl && ctl.selection) {
        ctl.selection
          .on("mouseover", function (event, d) {
            event.stopPropagation();
            mostrarTooltipClinica(tooltip, event, d);
          })
          .on("mousemove", function (event) {
            event.stopPropagation();
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mouseout", function (event) {
            event.stopPropagation();
            ocultarTooltip(tooltip);
          });
      }

      return ctl;
    }

    function limpiarMarcadores() {
      gMarcadores.selectAll("*").remove();
      marcadoresActivos = [];
      // También limpiamos la leyenda
      crearLeyendaMarcadores(svg, []);
    }

    async function actualizarMarcadores(tiposSeleccionados) {
      limpiarMarcadores();

      if (!tiposSeleccionados.length) {
        return;
      }

      // Leyenda con los tipos seleccionados
      crearLeyendaMarcadores(svg, tiposSeleccionados);

      for (const tipo of tiposSeleccionados) {
        const ctl = await cargarYPintarTipo(tipo);
        if (ctl) {
          marcadoresActivos.push(ctl);
        }
      }
    }

    // ==============================
    // CONTROL DE MARCADORES
    // ==============================
    const mountMarcadores = document.getElementById("control-marcadores");
    if (mountMarcadores) {
      const itemsMarcadores = [
        {
          value: MARCADORES_TIPOS.CATETER,
          label: nombreTipoMarcador(MARCADORES_TIPOS.CATETER),
        },
        {
          value: MARCADORES_TIPOS.HERIDAS,
          label: nombreTipoMarcador(MARCADORES_TIPOS.HERIDAS),
        },
      ];

      const ctl = renderMarcadoresControl(mountMarcadores, {
        items: itemsMarcadores,
        label: "Marcadores",
        placeholder: "Selecciona uno o varios marcadores.",
      });

      ctl.onChange((tiposSeleccionados) => {
        actualizarMarcadores(tiposSeleccionados);
      });
    }

    // ==============================
    // DESCARGAS PNG
    // ==============================
    const btnSinEtiquetas = document.getElementById("descargar-sin-etiquetas");
    const btnConEtiquetas = document.getElementById("descargar-con-etiquetas");

    if (btnSinEtiquetas) {
      btnSinEtiquetas.addEventListener("click", () => {
        const titulo = construirTitulo({
          anio: year,
          ambito: "nacional",
          descripcion: metricLabel(currentMetric),
          incluirCita: true,
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
          incluirCita: true,
        });

        const etiquetas = svg.selectAll(".etiqueta-municipio");
        etiquetas.style("display", "block");

        setTimeout(() => {
          descargarComoPNG(
            "#mapa-nacional svg",
            "mapa-enfermeras-mexico-con-nombres.png",
            MAP_WIDTH,
            MAP_HEIGHT,
            { titulo }
          );
          etiquetas.style("display", "none");
        }, 100);
      });
    }
  })
  .catch((error) => {
    console.error("Error al cargar los datos del mapa nacional:", error);
  });
