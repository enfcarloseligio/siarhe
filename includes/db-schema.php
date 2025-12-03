<?php
/**
 * Definición y creación de tablas del SIARHE en MySQL.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Crear / actualizar tablas de SIARHE.
 * 
 * Versión mínima:
 * - No crea aún tablas, solo deja el hook preparado para futuras versiones.
 * - Esto permite activar el plugin sin errores.
 */
function siarhe_create_tables() {
    global $wpdb;

    // Aquí, en versiones posteriores, usaremos dbDelta() para crear:
    // - siarhe_registros_anuales
    // - siarhe_formaciones
    // - siarhe_agg_entidad_anio
    // - siarhe_agg_municipio_anio
}
