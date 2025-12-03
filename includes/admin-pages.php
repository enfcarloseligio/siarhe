<?php
// includes/admin-page-config.php
// Pantalla de Configuración del plugin SIARHE
// Tabs: Páginas | Estilos
// Incluye sección de “Asignación por defecto” + futura tabla editable.

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Catálogo de entidades federativas (slug => nombre)
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
 * Registrar settings (pestaña de "Páginas")
 */
function siarhe_register_settings() {

    register_setting('siarhe_paginas', 'siarhe_page_mapa_nacional', [
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'default'           => 0
    ]);

    register_setting('siarhe_paginas', 'siarhe_page_clinicas_cateter', [
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'default'           => 0
    ]);

    register_setting('siarhe_paginas', 'siarhe_page_clinicas_heridas', [
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'default'           => 0
    ]);

    // *** FUTURO ***
    // No registramos aún “siarhe_entidad_pages” editable porque
    // el mapeo por defecto está basado en patrones.
}
add_action('admin_init', 'siarhe_register_settings');


/**
 * Página principal del menú Configuración
 */
function siarhe_render_config_page() {

    $active_tab = isset($_GET['tab']) ? sanitize_key($_GET['tab']) : 'paginas';
    if (!in_array($active_tab, ['paginas', 'estilos'], true)) {
        $active_tab = 'paginas';
    }
    ?>
    <div class="wrap">
        <h1>SIARHE – Configuración</h1>

        <p>
            Desde esta sección puedes configurar las páginas que se utilizarán para mostrar los
            diferentes mapas (nacional, clínicas especiales, entidades estatales), así como
            opciones futuras de estilo.
        </p>

        <h2 class="nav-tab-wrapper">
            <a href="<?php echo admin_url('admin.php?page=siarhe-config&tab=paginas'); ?>"
               class="nav-tab <?php echo $active_tab === 'paginas' ? 'nav-tab-active' : ''; ?>">
                Páginas
            </a>
            <a href="<?php echo admin_url('admin.php?page=siarhe-config&tab=estilos'); ?>"
               class="nav-tab <?php echo $active_tab === 'estilos' ? 'nav-tab-active' : ''; ?>">
                Estilos
            </a>
        </h2>

        <?php
        if ($active_tab === 'paginas') {
            siarhe_render_config_tab_paginas();
        } else {
            siarhe_render_config_tab_estilos();
        }
        ?>
    </div>
    <?php
}


/**
 * TAB: Páginas
 */
function siarhe_render_config_tab_paginas() {

    $catalogo = siarhe_get_catalogo_entidades();
    $pages = get_pages();

    $page_nacional = (int) get_option('siarhe_page_mapa_nacional', 0);
    $page_cateter  = (int) get_option('siarhe_page_clinicas_cateter', 0);
    $page_heridas  = (int) get_option('siarhe_page_clinicas_heridas', 0);
    ?>

    <form method="post" action="options.php">
        <?php settings_fields('siarhe_paginas'); ?>

        <h2>Asignación de páginas especiales</h2>

        <table class="form-table">
            <tr>
                <th><label for="siarhe_page_mapa_nacional">Página del mapa nacional</label></th>
                <td>
                    <?php
                    wp_dropdown_pages([
                        'name'              => 'siarhe_page_mapa_nacional',
                        'id'                => 'siarhe_page_mapa_nacional',
                        'show_option_none'  => '— Seleccionar —',
                        'option_none_value' => '0',
                        'selected'          => $page_nacional,
                    ]);
                    ?>
                    <p class="description">
                        También será utilizada por el botón “Home” en los mapas estatales.
                    </p>
                </td>
            </tr>

            <tr>
                <th><label for="siarhe_page_clinicas_cateter">Clínicas de catéteres</label></th>
                <td>
                    <?php
                    wp_dropdown_pages([
                        'name'              => 'siarhe_page_clinicas_cateter',
                        'id'                => 'siarhe_page_clinicas_cateter',
                        'show_option_none'  => '— Seleccionar —',
                        'option_none_value' => '0',
                        'selected'          => $page_cateter,
                    ]);
                    ?>
                </td>
            </tr>

            <tr>
                <th><label for="siarhe_page_clinicas_heridas">Clínicas de heridas</label></th>
                <td>
                    <?php
                    wp_dropdown_pages([
                        'name'              => 'siarhe_page_clinicas_heridas',
                        'id'                => 'siarhe_page_clinicas_heridas',
                        'show_option_none'  => '— Seleccionar —',
                        'option_none_value' => '0',
                        'selected'          => $page_heridas,
                    ]);
                    ?>
                </td>
            </tr>
        </table>

        <?php submit_button('Guardar configuración'); ?>

        <hr>

        <h2>Asignación de páginas por entidad (defecto + futura personalización)</h2>

        <p>
            Actualmente, SIARHE asume que las páginas por entidad siguen el patrón:
        </p>

        <pre style="background:#f1f1f1;padding:10px;border-radius:4px;">
/siarhe-entidad-{slug}
Ejemplo: /siarhe-entidad-aguascalientes
        </pre>

        <p>
            Los mapas estatales y el mapa nacional usarán automáticamente esta estructura mientras
            no se configure una tabla personalizada.
        </p>

        <p><strong>Próxima función:</strong> En una versión posterior podrás definir, desde esta tabla,
        cualquier página de WordPress como destino para cada entidad.</p>

        <table class="widefat striped">
            <thead>
                <tr>
                    <th>Entidad</th>
                    <th>Slug</th>
                    <th>Página por defecto asumida</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($catalogo as $slug => $nombre): ?>
                <tr>
                    <td><?php echo esc_html($nombre); ?></td>
                    <td><code><?php echo esc_html($slug); ?></code></td>
                    <td>
                        <code><?php echo home_url("/siarhe-entidad-" . $slug); ?></code>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>

        <p style="margin-top:10px;color:#777;">
            Esta tabla pasará a ser editable para permitir asignar páginas personalizadas.
        </p>

    </form>
    <?php
}


/**
 * TAB: Estilos
 */
function siarhe_render_config_tab_estilos() {
    ?>
    <h2>Estilos (en construcción)</h2>
    <p>
        En el futuro podrás configurar aquí:
    </p>

    <ul style="list-style:disc; margin-left:20px;">
        <li>Paletas de colores de los mapas (guinda, verde, dorado).</li>
        <li>Colores de los botones de zoom, home y descargas.</li>
        <li>Temas de borde, hover, tipografías y tamaños.</li>
    </ul>

    <p>
        De momento, los mapas utilizan los estilos definidos en:
    </p>

    <code>assets/css/styles.css</code><br>
    <code>assets/css/mapas.css</code>
    <?php
}
