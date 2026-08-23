/**
 * Artes Visuales - Trayectoria Pedagógica Santa Fe
 * Grados 1-7, organizados por Eje
 */

export const ARTES_VISUALES = {
  "1": {
    "Producción Visual": [
      "Creación de imágenes efímeras y permanentes a partir de la observación visual y/o táctil, de la imaginación, de la memoria, el azar y el juego (según la propuesta de enseñanza).",
      "Nombres y distintos modos de uso de las herramientas, soportes y materiales en una misma producción y en distintas producciones. Organización y cuidado del espacio y de los materiales.",
      "Características y posibilidades de las formas: grandes, pequeñas, abiertas y cerradas, alargadas, redondeadas y angulosas o rectilíneas. Creación de formas mediante manchas, recortes, trazos y/o estampados, entre otras posibilidades.",
      "El color en experiencias pictóricas. Exploración de las variaciones de un mismo tono a través de mezclas de pintura, de la superposición de capas de lápices, tizas u otros materiales. Organización, cuidados y distintos modos de uso de los pinceles, espátulas, lápices, etcétera.",
      "Texturas táctiles y visuales, sus posibilidades descriptivas y expresivas. Diferentes calidades de las superficies: lisa/rugosa, brillante/mate, artificial/natural. Uso de las texturas en experiencias de monocopia, collagraph, collage, etcétera.",
      "Posibilidades expresivo-narrativas que brindan los distintos soportes. Diversidad de tamaños, formatos y superficies (regulares / irregulares, grandes/medianos, claros/oscuros) y sus posibilidades de transformación.",
      "Imagen múltiple: procedimientos simples que posibilitan la seriación de una forma o producción (estampación de elementos naturales o industriales, dibujo sobre papel carbónico, fotocopiado e intervención de las copias logradas). Juegos de intervención, intercambio y/o creación grupal a partir de las copias o estampas logradas.",
      "Variados usos de las herramientas y materiales en una misma y en distintas producciones: organización y cuidado del espacio y materiales.",
      "Aproximación a la noción de escultura. Exploración del volumen, peso, espacio y puntos de apoyo en modelados, construcciones, ensambles y/o encastres. Organización del espacio y de los materiales de trabajo en la creación de esculturas, relieves, máscaras, etc.",
      "Exploración y resignificación de pequeños y medianos espacios (cajas, rincones, baldosas, entre otros), de objetos y elementos naturales mediante la creación de pequeñas instalaciones. Reconocimiento y uso de espacios abiertos, cerrados, ocupados, vacíos. Espacios y objetos cotidianos como recursos para el juego simbólico y la narración visual y multisensorial.",
      "Posibilidades procedimentales en la producción escultórica: modelado, ensambles, bajorrelieves y/o encastres. Exploración de técnicas para crear y combinar formas: agregar, quitar, cortar, perforar, atar, encintar, pegar, etcétera.",
      "Los materiales en la producción tridimensional: diferenciación entre elementos naturales (arcilla, ramas, cortezas, etc.) y materiales industriales (papel, cartón, plásticos) con los que se pueden crear esculturas e instalaciones. Criterios de clasificación, uso y guardado responsable que posibilitan la reutilización y la preservación del ambiente.",
      "La luz como material para la creación visual. Cambios de color y de intensidad de la luz natural y artificial mediante la exploración de filtros cromáticos traslúcidos en ventanas, linternas, proyectores, entre otras posibilidades.",
    ],
    "Apreciación": [
      "Manifestación de ideas y sensaciones sobre las propias producciones y las de pares.",
      "Percepción de entornos cercanos (la escuela, el barrio, la casa) mediante la vista, el tacto, el desplazamiento, el oído y/o el olfato. Identificación de la presencia del color, la forma y la textura en espacios próximos abiertos y cerrados.",
      "Observación de creaciones locales (tejidos, grabados, pinturas, entre otras); identificación de algunas características expresivas y procedimentales.",
      "Observación de cualidades estéticas, narrativas y visuales de obras creadas mediante diferentes disciplinas. Características distintivas de pinturas, esculturas, instalaciones, cerámicas, grabados y/o fotografías.",
      "Manifestación de ideas y sensaciones personales sobre producciones visuales creadas en diferentes épocas y lugares del mundo. Aceptación de diferentes reflexiones en los intercambios grupales.",
      "Diferentes tiempos, actitudes y posibilidades corporales requeridas para la observación de producciones tridimensionales, bidimensionales, digitales (de cerca, de lejos, desde diversas ubicaciones, en quietud, en movimiento, etc.).",
    ],
    "Artes Visuales en Contexto": [
      "Las obras de arte en contextos cotidianos. Reconocimiento de pinturas y esculturas en la vía pública, reproducciones de obras en el entorno familiar, producciones infantiles y/o artísticas en la escuela, entre otros.",
      "Características que diferencian las obras originales y de las reproducciones (impresas o digitales).",
      "Las producciones artísticas tradicionales: rasgos distintivos de la pintura, el dibujo, el grabado, la cerámica y la escultura (importancia del saber técnico, perdurabilidad de los materiales y rol contemplativo del público, entre otros).",
      "Aproximación a los diversos modos de trabajo de los y las artistas: en sus talleres, en la vía pública, en ambientes donde realizan intervenciones.",
      "Formulación de preguntas y escucha atenta sobre relatos vinculados a las obras y a los procesos de creación en encuentros presenciales o virtuales con ceramistas, pintores/as, tejedoras/es, escultores/as, diseñadoras/es, grabadores/as, artesanas/os, escenógrafos/as y mascareros/as.",
    ],
  },
  // Nota: Grados 2-7 se pueden agregar de la misma forma
} as const;

export function getArtesVisualesForGrade(grade: number) {
  return ARTES_VISUALES[String(grade) as keyof typeof ARTES_VISUALES] || {};
}
