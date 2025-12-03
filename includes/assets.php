<?php
/**
 * Registro y carga de assets (CSS/JS) para los mapas SIARHE.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registrar estilos y scripts globales.
 *
 * Estructura esperada de archivos dentro del plugin:
 * - assets/css/styles.css
 * - assets/css/mapas.css
 * - assets/js/utils/*.js
 * - assets/js/maps/republica-mexicana.js
 *
 * Los módulos JS usan import/export ES6, por eso el mapa nacional se cargará como type="module".
 */
function siarhe_register_front_assets() {

    $css_base = SIARHE_URL . 'assets/css/';
    $js_base  = SIARHE_URL . 'assets/js/';

    // Estilos globales del proyecto de mapas
    wp_register_style(
        'siarhe-styles',
        $css_base . 'styles.css',
        [],
        '0.1.0'
    );

    wp_register_style(
        'siarhe-mapas',
        $css_base . 'mapas.css',
        ['siarhe-styles'],
        '0.1.0'
    );

    // D3 desde CDN (global window.d3)
    wp_register_script(
        'd3',
        'https://d3js.org/d3.v7.min.js',
        [],
        '7.9.0',
        true
    );

    // Módulo principal del mapa nacional (este a su vez importa utils/*)
    wp_register_script(
        'siarhe-mapa-nacional',
        $js_base . 'maps/republica-mexicana.js',
        ['d3'],
        '0.1.0',
        true
    );
}
add_action( 'wp_enqueue_scripts', 'siarhe_register_front_assets' );


/**
 * Asegura que estilos y scripts comunes de mapas estén cargados.
 */
function siarhe_enqueue_common_map_assets() {
    wp_enqueue_style( 'siarhe-styles' );
    wp_enqueue_style( 'siarhe-mapas' );
    wp_enqueue_script( 'd3' );
}

/**
 * Encola assets específicos del mapa nacional
 * y expone a JS la URL base de datos.
 */
function siarhe_enqueue_mapa_nacional_assets() {
    siarhe_enqueue_common_map_assets();

    // Encolamos el módulo de mapa nacional
    wp_enqueue_script( 'siarhe-mapa-nacional' );

    // Pasamos la URL base de datos hacia window.SIARHE_DATA_URL
    $data_url = trailingslashit( SIARHE_DATA_URL );

    $inline = 'window.SIARHE_DATA_URL = ' . wp_json_encode( $data_url ) . ';';
    wp_add_inline_script( 'siarhe-mapa-nacional', $inline, 'before' );
}

/**
 * Forzar type="module" para nuestros módulos ES6.
 */
function siarhe_modify_script_tag_type_module( $tag, $handle, $src ) {
    $module_handles = [
        'siarhe-mapa-nacional',
        // más adelante aquí agregaremos mapas estatales
    ];

    if ( in_array( $handle, $module_handles, true ) ) {
        // Script como módulo ES6
        $tag = '<script type="module" src="' . esc_url( $src ) . '"></script>';
    }

    return $tag;
}
add_filter( 'script_loader_tag', 'siarhe_modify_script_tag_type_module', 10, 3 );
