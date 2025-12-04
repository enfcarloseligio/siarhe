// assets/js/utils/marcadores.config.js
import { MARCADORES_TIPOS } from "./marcadores.js";

// Base de datos para marcadores dentro del plugin SIARHE
const DATA_BASE = "/wp-content/plugins/siarhe/assets/data/";

// Rutas de datasets por tipo de marcador
// Tus CSV están en assets/data/clinicas/
export const RUTAS_MARCADORES = {
  [MARCADORES_TIPOS.CATETER]:
    DATA_BASE + "clinicas/clinicas-cateteres.csv",
  [MARCADORES_TIPOS.HERIDAS]:
    DATA_BASE + "clinicas/clinicas-heridas.csv",
  // Si agregas más tipos:
  // [MARCADORES_TIPOS.X]: DATA_BASE + "clinicas/clinicas-x.csv",
};

/**
 * Normaliza una fila de cualquier catálogo de clínicas a un esquema común.
 * d: fila original
 * tipo: uno de MARCADORES_TIPOS
 */
export function normalizarClinicaRow(d, tipo) {
  return {
    clues: (d.CLUES || d.clues || "").trim(),
    clues_nombre: (d.NOMBRE_CLUES || d.nombre_clues || "").trim(),
    institucion: (d.Institucion || d.institucion || "").trim(),
    ent_cod: String(d.Clave_Entidad || d.ent_cod || "").padStart(2, "0"),
    entidad: (d.Entidad || d.entidad || "").trim(),
    mun_cod: String(d.CLAVE_MUNICIPIO || d.mun_cod || "").padStart(3, "0"),
    municipio: (d.MUNICIPIO || d.municipio || "").trim(),
    loc_cod: String(d.CLAVE_LOCALIDAD || d.loc_cod || "").padStart(4, "0"),
    localidad: (d.LOCALIDAD || d.localidad || "").trim(),
    unidad: (d.NOMBRE_UNIDAD || d.unidad || d.clinica || "").trim(),
    lat: +String(d.LATITUD || d.lat || "").replace(",", "."),
    lon: +String(d.LONGITUD || d.lon || "").replace(",", "."),
    observaciones: (d.Observaciones || d.observaciones || "").trim(),
    tipo,
  };
}
