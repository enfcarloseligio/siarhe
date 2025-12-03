<?php
/**
 * Shortcodes de mapas y tablas del SIARHE.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Shortcode combinado: mapa + tabla de entidad (placeholder).
 */
function siarhe_entidad_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'slug' => '',
            'anio' => '',
        ],
        $atts
    );

    $slug        = sanitize_title( $atts['slug'] );
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
 * Solo mapa de entidad (placeholder).
 */
function siarhe_entidad_mapa_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'slug' => '',
            'anio' => '',
        ],
        $atts
    );

    $slug        = sanitize_title( $atts['slug'] );
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
 * Solo tabla de entidad (placeholder).
 */
function siarhe_entidad_tabla_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'slug' => '',
            'anio' => '',
        ],
        $atts
    );

    $slug        = sanitize_title( $atts['slug'] );
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
 * Mapa nacional completo (mapa + controles + tabla).
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

    // Encolamos los assets necesarios (CSS + D3 + módulo de mapa nacional)
    if ( function_exists( 'siarhe_enqueue_mapa_nacional_assets' ) ) {
        siarhe_enqueue_mapa_nacional_assets();
    }

    ob_start();
    ?>
    <div class="siarhe-mapa-nacional-wrapper">

        <!-- Encabezado y resumen nacional -->
        <section class="mapa-entidad">
            <h1>¿Cuántas enfermeras hay en México en <span class="year"><?php echo esc_html( $anio_visual ); ?></span>?</h1>

            <p class="bienvenida">
                En el año <span class="year"><?php echo esc_html( $anio_visual ); ?></span>, México cuenta con un total de
                <strong><span id="total-enfermeras-nac">—</span> enfermeras</strong>
                distribuidas en <strong><span id="total-entidades">—</span> entidades federativas</strong>,
                de acuerdo con datos oficiales del Sistema de Información Administrativa de Recursos Humanos en Enfermería (SIARHE).
            </p>

            <h2>Distribución de enfermeras por entidad federativa en <span class="year"><?php echo esc_html( $anio_visual ); ?></span></h2>
            <p>
                Utiliza los botones de zoom (+/–) para acercar o alejar el mapa. Al colocar el cursor sobre una entidad federativa,
                podrás ver el valor del indicador seleccionado. Los controles de indicador y marcadores se encuentran en la parte superior.
            </p>

            <!-- Barra de controles -->
            <div id="barra-controles" class="controles-grid">
                <!-- Indicador: componente JS inyecta aquí <select id="sel-metrica"> -->
                <div id="indicador-control"></div>

                <!-- Selector de marcadores -->
                <div id="control-marcadores"></div>
            </div>

            <!-- Contenedor del mapa -->
            <div id="mapa-nacional" class="mapa-wrapper">
                <!-- Aquí se inyecta el SVG dinámicamente -->
                <div class="zoom-controles"></div>
            </div>

            <!-- Nota y fuente (texto estático, puedes editarlo luego si quieres) -->
            <p id="nota">
                <strong>Nota:</strong>
                Las tasas se calculan con base en la población censal más reciente disponible
                y en los registros del Sistema de Información Administrativa de Recursos Humanos en Enfermería (SIARHE).
                Los intervalos de color se establecen con base en el valor mínimo, los cuartiles (Q1, mediana y Q3) y el valor máximo de la distribución.
            </p>
        </section>

        <!-- Sección de tabla nacional -->
        <section class="tabla-nacional">
            <h2>Tasa de enfermeras por entidad federativa <span class="year"><?php echo esc_html( $anio_visual ); ?></span></h2>
            <p>
                La tabla se actualiza según el indicador seleccionado (por ejemplo, Tasa total, 1er nivel, 2º nivel, etc.).
                Al elegir <strong>Población</strong>, se muestra solo la población por entidad; las columnas de enfermeras/tasa se indican con <strong>–</strong>.
            </p>

            <div class="tabla-scroll">
                <div id="tabla-contenido">
                    <!-- La tabla se inyecta dinámicamente desde JS -->
                </div>
            </div>

            <div class="descarga-container">
                <button id="descargar-excel" class="boton">📥 Descargar Excel</button>
            </div>
        </section>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'siarhe_mapa_nacional', 'siarhe_mapa_nacional_shortcode' );
