// assets/js/utils/enlaces.js
// ========================================================
// Enlaces centralizados para entidades y clínicas
// ========================================================

/** Slug básico para URLs (acentos, espacios, etc.) */
export function slugify(str = "") {
  return String(str)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")   // separa por guiones
    .replace(/^-+|-+$/g, "");      // recorta guiones extremos
}

/** Mapa de enlaces para las 32 entidades
 *  (ajusta rutas si tu estructura cambia)
 */
export const ENLACES_ENTIDAD = {
  "Aguascalientes": "../siarhe-entidades-aguascalientes",
  "Baja California": "../siarhe-entidades-baja-california",
  "Baja California Sur": "../siarhe-entidades-baja-california-sur",
  "Campeche": "../siarhe-entidades-campeche",
  "Chiapas": "../siarhe-entidades-chiapas",
  "Chihuahua": "../siarhe-entidades-chihuahua",
  "Ciudad de México": "../siarhe-entidades-ciudad-de-mexico",
  "Coahuila de Zaragoza": "../siarhe-entidades-coahuila",
  "Colima": "../siarhe-entidades-colima",
  "Durango": "../siarhe-entidades-durango",
  "Estado de México": "../siarhe-entidades-estado-de-mexico",
  "Guanajuato": "../siarhe-entidades-guanajuato",
  "Guerrero": "../siarhe-entidades-guerrero",
  "Hidalgo": "../siarhe-entidades-hidalgo",
  "Jalisco": "../siarhe-entidades-jalisco",
  "Michoacán": "../siarhe-entidades-michoacan",
  "Morelos": "../siarhe-entidades-morelos",
  "Nayarit": "../siarhe-entidades-nayarit",
  "Nuevo León": "../siarhe-entidades-nuevo-leon",
  "Oaxaca": "../siarhe-entidades-oaxaca",
  "Puebla": "../siarhe-entidades-puebla",
  "Querétaro": "../siarhe-entidades-queretaro",
  "Quintana Roo": "../siarhe-entidades-quintana-roo",
  "San Luis Potosí": "../siarhe-entidades-san-luis-potosi",
  "Sinaloa": "../siarhe-entidades-sinaloa",
  "Sonora": "../siarhe-entidades-sonora",
  "Tabasco": "../siarhe-entidades-tabasco",
  "Tamaulipas": "../siarhe-entidades-tamaulipas",
  "Tlaxcala": "../siarhe-entidades-tlaxcala",
  "Veracruz de Ignacio de la Llave": "../siarhe-entidades-veracruz",
  "Yucatán": "../siarhe-entidades-yucatan",
  "Zacatecas": "../siarhe-entidades-zacatecas"
};

/** URL para una entidad; usa el mapa anterior y, si no encuentra,
 *  hace fallback a slug en ../entidades/<slug>.html
 */
export function urlEntidad(nombreEntidad) {
  const limpio = (nombreEntidad || "").trim();
  if (!limpio) return null;
  if (ENLACES_ENTIDAD[limpio]) return ENLACES_ENTIDAD[limpio];

  // Fallback por si agregas entidades/variantes nuevas
  return `../entidades/${slugify(limpio)}.html`;
}

/** URL para una clínica.
 *  Preferimos CLUES si existe (estable y único).
 *  Estructura sugerida: ../clinicas/clinica-<clues>.html
 *  Fallback: ../clinicas/clinica-<slug-unidad>-<slug-entidad>.html
 */
export function urlClinica(d = {}, opts = {}) {
  const base = opts.base || "../clinicas";
  const clues = (d.clues || d.CLUES || "").trim().toUpperCase();
  if (clues) return `${base}/clinica-${clues}.html`;

  const unidad = (d.unidad || d.NOMBRE_UNIDAD || "").trim();
  const entidad = (d.entidad || d.Entidad || "").trim();
  if (!unidad && !entidad) return null;

  return `${base}/clinica-${slugify(unidad)}-${slugify(entidad)}.html`;
}
