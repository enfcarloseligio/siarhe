<?php
/**
 * Núcleo de constantes y helpers generales del plugin SIARHE.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Año de corte activo para los mapas.
 *
 * IMPORTANTE:
 * - Los mapas solo consumen CSV pequeños ya agregados.
 * - El corte (por ejemplo 2025) se recalcula desde las bases maestras
 *   mediante un proceso ETL separado (cron mensual).
 * - El parámetro "anio" de los shortcodes es, por ahora, solo visual.
 */
define( 'SIARHE_ACTIVE_YEAR', 2025 );

// Rutas internas de datos del plugin (mapas, tasas agregadas)
define( 'SIARHE_DATA_PATH', SIARHE_PATH . 'assets/data/' );
define( 'SIARHE_DATA_URL',  SIARHE_URL  . 'assets/data/' );

/**
 * Rutas a los datos crudos (pivotes / formaciones).
 * Ajusta "TUUSUARIO" cuando sepas tu ruta real en el servidor.
 * Estos archivos NO deben ser públicos.
 */
// define( 'SIARHE_RAW_PATH', '/home/TUUSUARIO/siarhe/raw/' );
// define( 'SIARHE_PIVOTES_PATH',     SIARHE_RAW_PATH . 'pivotes/' );
// define( 'SIARHE_FORMACIONES_PATH', SIARHE_RAW_PATH . 'formaciones/' );

/**
 * Helper sencillo para obtener el año a mostrar en front:
 * - Si el shortcode envía "anio", se usa ese para el texto.
 * - Si no, se usa SIARHE_ACTIVE_YEAR.
 */
function siarhe_resolver_anio_visual( $anio_atts ) {
    $anio_atts = trim( (string) $anio_atts );

    if ( $anio_atts !== '' ) {
        return $anio_atts;
    }

    return (string) SIARHE_ACTIVE_YEAR;
}
