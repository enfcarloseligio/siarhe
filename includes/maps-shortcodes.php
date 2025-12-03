<?php
/**
 * Shortcodes de mapas y tablas del SIARHE.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Shortcode combinado: mapa + tabla de entidad.
 * Por ahora muestra un placeholder, luego conectaremos D3 + CSV reales.
 *
 * Uso:
 *   [siarhe_entidad slug="aguascalientes" anio="2025"]
 */
function siarhe_entidad_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'slug' => '',
            'anio' => '',
        ],
        $atts
    );

    $slug = sanitize_title( $atts['slug'] );
    $anio_visual = siarhe_resolver_anio_visual( $atts['anio'] );

    if ( empty( $slug ) ) {
        return '<p><strong>SIARHE:</strong> falta el parámetro <code>slug</code> en el shortcode.</p>';
    }

    ob_start();
    ?>
    <div class="siarhe-entidad-wrapper">
        <h2>SIARHE - Vista entidad (placeholder)</h2>
        <p>
            Entidad (slug): <strong><?php echo esc_html( $slug ); ?></strong><br>
            Año mostrado: <strong><?php echo esc_html( $anio_visual ); ?></strong><br>
            Año de corte activo de datos: <strong><?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?></strong>
        </p>
        <p>
            Aquí se mostrará el <strong>mapa + tabla</strong> de la entidad,
            utilizando los archivos agregados:
        </p>
        <ul>
            <li>GeoJSON: <code>assets/data/maps/<?php echo esc_html( $slug ); ?>.geojson</code></li>
            <li>CSV tasas: <code>assets/data/entidades/<?php echo esc_html( $slug ); ?>.csv</code></li>
        </ul>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'siarhe_entidad', 'siarhe_entidad_shortcode' );

/**
 * Solo mapa de entidad.
 *
 * Uso:
 *   [siarhe_entidad_mapa slug="aguascalientes" anio="2025"]
 */
function siarhe_entidad_mapa_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'slug' => '',
            'anio' => '',
        ],
        $atts
    );

    $slug = sanitize_title( $atts['slug'] );
    $anio_visual = siarhe_resolver_anio_visual( $atts['anio'] );

    if ( empty( $slug ) ) {
        return '<p><strong>SIARHE:</strong> falta el parámetro <code>slug</code> en el shortcode.</p>';
    }

    ob_start();
    ?>
    <div class="siarhe-entidad-mapa-wrapper">
        <h2>SIARHE - Mapa de entidad (placeholder)</h2>
        <p>
            Entidad (slug): <strong><?php echo esc_html( $slug ); ?></strong><br>
            Año mostrado: <strong><?php echo esc_html( $anio_visual ); ?></strong><br>
            Año de corte activo de datos: <strong><?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?></strong>
        </p>
        <p>
            Aquí se mostrará el <strong>mapa interactivo</strong> de la entidad usando:
        </p>
        <ul>
            <li>GeoJSON: <code>assets/data/maps/<?php echo esc_html( $slug ); ?>.geojson</code></li>
            <li>CSV tasas: <code>assets/data/entidades/<?php echo esc_html( $slug ); ?>.csv</code></li>
        </ul>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'siarhe_entidad_mapa', 'siarhe_entidad_mapa_shortcode' );

/**
 * Solo tabla de entidad.
 *
 * Uso:
 *   [siarhe_entidad_tabla slug="aguascalientes" anio="2025"]
 */
function siarhe_entidad_tabla_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'slug' => '',
            'anio' => '',
        ],
        $atts
    );

    $slug = sanitize_title( $atts['slug'] );
    $anio_visual = siarhe_resolver_anio_visual( $atts['anio'] );

    if ( empty( $slug ) ) {
        return '<p><strong>SIARHE:</strong> falta el parámetro <code>slug</code> en el shortcode.</p>';
    }

    ob_start();
    ?>
    <div class="siarhe-entidad-tabla-wrapper">
        <h2>SIARHE - Tabla municipal (placeholder)</h2>
        <p>
            Entidad (slug): <strong><?php echo esc_html( $slug ); ?></strong><br>
            Año mostrado: <strong><?php echo esc_html( $anio_visual ); ?></strong><br>
            Año de corte activo de datos: <strong><?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?></strong>
        </p>
        <p>
            Aquí se mostrará la <strong>tabla municipal con tasas</strong> y el botón de descarga Excel
            a partir del CSV:
        </p>
        <ul>
            <li><code>assets/data/entidades/<?php echo esc_html( $slug ); ?>.csv</code></li>
        </ul>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'siarhe_entidad_tabla', 'siarhe_entidad_tabla_shortcode' );

/**
 * Mapa nacional.
 *
 * Uso:
 *   [siarhe_mapa_nacional anio="2025"]
 */
function siarhe_mapa_nacional_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'anio' => '',
        ],
        $atts
    );

    $anio_visual = siarhe_resolver_anio_visual( $atts['anio'] );

    ob_start();
    ?>
    <div class="siarhe-mapa-nacional-wrapper">
        <h2>SIARHE - Mapa nacional (placeholder)</h2>
        <p>
            Año mostrado: <strong><?php echo esc_html( $anio_visual ); ?></strong><br>
            Año de corte activo de datos: <strong><?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?></strong>
        </p>
        <p>
            Aquí se mostrará el <strong>mapa nacional</strong> con tasas de enfermeras por entidad federativa,
            utilizando el archivo:
        </p>
        <ul>
            <li><code>assets/data/nacional/republica-mexicana.csv</code></li>
        </ul>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'siarhe_mapa_nacional', 'siarhe_mapa_nacional_shortcode' );
