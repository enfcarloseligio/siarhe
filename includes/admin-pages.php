<?php
/**
 * Páginas de administración del plugin SIARHE.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Catálogo de entidades federativas (slug => nombre).
 * Usado en la página de configuración.
 */
function siarhe_get_catalogo_entidades() {
    return [
        'aguascalientes'      => 'Aguascalientes',
        'baja-california'     => 'Baja California',
        'baja-california-sur' => 'Baja California Sur',
        'campeche'            => 'Campeche',
        'chiapas'             => 'Chiapas',
        'chihuahua'           => 'Chihuahua',
        'ciudad-de-mexico'    => 'Ciudad de México',
        'coahuila'            => 'Coahuila de Zaragoza',
        'colima'              => 'Colima',
        'durango'             => 'Durango',
        'guanajuato'          => 'Guanajuato',
        'guerrero'            => 'Guerrero',
        'hidalgo'             => 'Hidalgo',
        'jalisco'             => 'Jalisco',
        'estado-de-mexico'    => 'Estado de México',
        'michoacan'           => 'Michoacán de Ocampo',
        'morelos'             => 'Morelos',
        'nayarit'             => 'Nayarit',
        'nuevo-leon'          => 'Nuevo León',
        'oaxaca'              => 'Oaxaca',
        'puebla'              => 'Puebla',
        'queretaro'           => 'Querétaro',
        'quintana-roo'        => 'Quintana Roo',
        'san-luis-potosi'     => 'San Luis Potosí',
        'sinaloa'             => 'Sinaloa',
        'sonora'              => 'Sonora',
        'tabasco'             => 'Tabasco',
        'tamaulipas'          => 'Tamaulipas',
        'tlaxcala'            => 'Tlaxcala',
        'veracruz'            => 'Veracruz de Ignacio de la Llave',
        'yucatan'             => 'Yucatán',
        'zacatecas'           => 'Zacatecas',
    ];
}

/**
 * Registrar menú principal y submenús de SIARHE.
 */
function siarhe_register_admin_menu() {
    // Menú principal (icono del lado izquierdo)
    add_menu_page(
        'SIARHE',
        'SIARHE',
        'manage_options',
        'siarhe_dashboard',
        'siarhe_admin_dashboard_page',
        'dashicons-chart-area',
        25
    );

    // Submenú: Dashboard (apunta al mismo slug del principal)
    add_submenu_page(
        'siarhe_dashboard',
        'Dashboard SIARHE',
        'Dashboard',
        'manage_options',
        'siarhe_dashboard',
        'siarhe_admin_dashboard_page'
    );

    // Submenú: Shortcodes
    add_submenu_page(
        'siarhe_dashboard',
        'Shortcodes SIARHE',
        'Shortcodes',
        'manage_options',
        'siarhe_shortcodes',
        'siarhe_admin_shortcodes_page'
    );

    // Submenú: Configuración
    add_submenu_page(
        'siarhe_dashboard',
        'Configuración SIARHE',
        'Configuración',
        'manage_options',
        'siarhe_settings',
        'siarhe_admin_settings_page'
    );
}
add_action( 'admin_menu', 'siarhe_register_admin_menu' );

/**
 * Página: Dashboard.
 * Aquí después podemos poner tarjetas con totales, estado de importaciones, etc.
 */
function siarhe_admin_dashboard_page() {
    ?>
    <div class="wrap">
        <h1>Dashboard SIARHE</h1>

        <p>
            Este dashboard mostrará información general del sistema SIARHE dentro de WordPress:
            estado de las importaciones, último corte procesado, número de entidades con página
            asignada, etc.
        </p>

        <p>
            <strong>Año de corte activo para mapas:</strong>
            <?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?>
        </p>

        <ul>
            <li>➤ Revisa los shortcodes disponibles en el submenú <strong>Shortcodes</strong>.</li>
            <li>➤ Configura las páginas por entidad en el submenú <strong>Configuración</strong>.</li>
        </ul>

        <p style="margin-top:1em;color:#777;">
            (Por ahora es solo un panel informativo. En futuras versiones aquí podremos mostrar
            métricas agregadas y gráficas rápidas.)
        </p>
    </div>
    <?php
}

/**
 * Página: Shortcodes.
 * (Es la tabla que ya tenías, la movemos aquí.)
 */
function siarhe_admin_shortcodes_page() {
    ?>
    <div class="wrap">
        <h1>Shortcodes SIARHE</h1>

        <p>
            El parámetro <code>anio</code> se utiliza actualmente solo para el texto visible
            (títulos, etiquetas de año). Los datos provienen siempre del corte activo
            preprocesado. En futuras versiones se podrán habilitar consultas históricas.
        </p>

        <p>
            <strong>Año de corte activo para mapas:</strong>
            <?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?>
        </p>

        <h2>Shortcodes disponibles (versión mínima)</h2>

        <table class="widefat striped">
            <thead>
                <tr>
                    <th>Shortcode</th>
                    <th>Descripción</th>
                    <th>Ejemplo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>[siarhe_entidad slug="aguascalientes" anio="2025"]</code></td>
                    <td>Mapa + tabla de una entidad (estructura conjunta; por ahora placeholder).</td>
                    <td><code>[siarhe_entidad slug="aguascalientes" anio="<?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?>"]</code></td>
                </tr>
                <tr>
                    <td><code>[siarhe_entidad_mapa slug="aguascalientes" anio="2025"]</code></td>
                    <td>Solo mapa interactivo de la entidad (placeholder).</td>
                    <td><code>[siarhe_entidad_mapa slug="chiapas" anio="<?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?>"]</code></td>
                </tr>
                <tr>
                    <td><code>[siarhe_entidad_tabla slug="aguascalientes" anio="2025"]</code></td>
                    <td>Solo tabla municipal con tasas (placeholder).</td>
                    <td><code>[siarhe_entidad_tabla slug="yucatan" anio="<?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?>"]</code></td>
                </tr>
                <tr>
                    <td><code>[siarhe_mapa_nacional anio="2025"]</code></td>
                    <td>Mapa nacional por entidad federativa (placeholder).</td>
                    <td><code>[siarhe_mapa_nacional anio="<?php echo esc_html( SIARHE_ACTIVE_YEAR ); ?>"]</code></td>
                </tr>
            </tbody>
        </table>

        <p>Inserta estos shortcodes en cualquier página o entrada utilizando el editor de bloques o Elementor.</p>
    </div>
    <?php
}

/**
 * Página: Configuración.
 * Aquí se define qué página de WordPress corresponde a cada entidad,
 * para que los mapas nacionales puedan redirigir correctamente al hacer doble clic.
 */
function siarhe_admin_settings_page() {

    $catalogo = siarhe_get_catalogo_entidades();
    $entidad_pages = get_option( 'siarhe_entidad_pages', [] );
    $pages = get_pages();

    // Guardar cambios
    if ( isset( $_POST['siarhe_settings_nonce'] ) && wp_verify_nonce( $_POST['siarhe_settings_nonce'], 'siarhe_save_settings' ) ) {
        $nuevo_mapeo = [];

        foreach ( $catalogo as $slug => $nombre ) {
            $campo = 'siarhe_page_' . $slug;
            $page_id = isset( $_POST[ $campo ] ) ? intval( $_POST[ $campo ] ) : 0;
            $nuevo_mapeo[ $slug ] = $page_id;
        }

        update_option( 'siarhe_entidad_pages', $nuevo_mapeo );

        echo '<div class="updated"><p>Configuración guardada correctamente.</p></div>';

        $entidad_pages = $nuevo_mapeo;
    }

    ?>
    <div class="wrap">
        <h1>Configuración SIARHE</h1>

        <p>
            Desde esta pantalla puedes definir qué <strong>página de WordPress</strong> corresponde
            a cada entidad federativa. Esto servirá, por ejemplo, para que el
            <strong>mapa nacional</strong> sepa a qué URL redirigir cuando se haga doble clic
            sobre una entidad.
        </p>

        <p>
            Más adelante, este mapeo se expondrá también hacia JavaScript para que los
            scripts de los mapas puedan usarlo directamente.
        </p>

        <form method="post">
            <?php wp_nonce_field( 'siarhe_save_settings', 'siarhe_settings_nonce' ); ?>

            <table class="widefat striped">
                <thead>
                    <tr>
                        <th>Entidad</th>
                        <th>Slug</th>
                        <th>Página asignada</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ( $catalogo as $slug => $nombre ) : ?>
                    <tr>
                        <td><?php echo esc_html( $nombre ); ?></td>
                        <td><code><?php echo esc_html( $slug ); ?></code></td>
                        <td>
                            <select name="siarhe_page_<?php echo esc_attr( $slug ); ?>">
                                <option value="0">(Sin página asignada)</option>
                                <?php foreach ( $pages as $page ) : ?>
                                    <?php
                                    $selected = '';
                                    $saved_id = isset( $entidad_pages[ $slug ] ) ? intval( $entidad_pages[ $slug ] ) : 0;
                                    if ( $saved_id === intval( $page->ID ) ) {
                                        $selected = 'selected';
                                    }
                                    ?>
                                    <option value="<?php echo esc_attr( $page->ID ); ?>" <?php echo $selected; ?>>
                                        <?php echo esc_html( $page->post_title ); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>

            <p>
                <button type="submit" class="button button-primary">Guardar configuración</button>
            </p>
        </form>
    </div>
    <?php
}
