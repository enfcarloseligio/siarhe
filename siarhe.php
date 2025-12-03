<?php
/**
 * Plugin Name: SIARHE - Sistema de Información Administrativa de Recursos Humanos en Enfermería
 * Description: Herramientas de análisis, mapas y tableros basados en los datos del SIARHE. Los mapas utilizan cortes globales preprocesados (corte activo) y no consultan las bases maestras en cada visita.
 * Version: 0.1.0
 * Author: Carlos Eligio
 * Text Domain: siarhe
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'SIARHE_PATH', plugin_dir_path( __FILE__ ) );
define( 'SIARHE_URL',  plugin_dir_url( __FILE__ ) );

// Includes principales
require_once SIARHE_PATH . 'includes/core.php';
require_once SIARHE_PATH . 'includes/db-schema.php';
require_once SIARHE_PATH . 'includes/admin-pages.php';
require_once SIARHE_PATH . 'includes/assets.php';
require_once SIARHE_PATH . 'includes/maps-shortcodes.php';
require_once SIARHE_PATH . 'includes/etl-import.php';
require_once SIARHE_PATH . 'includes/etl-agg.php';
require_once SIARHE_PATH . 'includes/analytics-api.php';

// Hook de activación → crear/actualizar tablas (por ahora stub seguro)
register_activation_hook( __FILE__, 'siarhe_create_tables' );
