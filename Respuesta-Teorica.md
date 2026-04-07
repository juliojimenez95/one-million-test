Respuesta a Prueba Teórica: Automatización y Escalabilidad de Contenido con IA
1. Automatización de Hallazgo de Videos Virales (Instagram)
Para identificar contenido viral de manera programática en nichos específicos y en idioma español, el flujo técnico óptimo es el siguiente:

API Principal: Instagram Graph API, específicamente el endpoint de Business Discovery. Este permite consultar métricas de cuentas de la competencia o referentes de un nicho sin necesidad de permisos directos de esas cuentas.

Proceso de Filtrado:

Extracción de Media: Se realiza un fetch de los últimos REELS de una lista de cuentas semilla (seeds) del nicho.

Cálculo de Engagement Rate (ER): Se filtran aquellos videos donde la suma de likes y comments dividida por el número de followers de la cuenta sea superior al promedio del nicho (indicador de viralidad).

Detección de Idioma y Nicho: Se utilizan librerías de NLP (Natural Language Processing) como LangDetect o el servicio de AWS Comprehend para analizar el caption y los hashtags, asegurando que el contenido sea en español y corresponda al nicho objetivo.

Análisis de Tendencia: Mediante el conteo de palabras clave recurrentes en los videos con alto ER, se identifican los "hooks" (ganchos) que están reteniendo a la audiencia en ese momento.

2. Extensión de Video y Consistencia de Marca con IA
Para extender un video hasta 60 segundos manteniendo la identidad visual y auditiva de forma automatizada, se integran las siguientes APIs:

Consistencia de Personaje y Fondo (Visual):

Herramienta: API de HeyGen o D-ID.

Técnica: Se utiliza el concepto de Avatar Pro o Custom Avatar. Al enviar una imagen de referencia (source_image) y un ID de personaje único, la IA genera el video manteniendo los rasgos faciales, la vestimenta y el entorno constantes. Para asegurar la consistencia en clips largos, se utiliza una misma semilla (seed) y parámetros de configuración de cámara idénticos en cada llamada a la API.

Consistencia de Voz (Audio):

Herramienta: API de ElevenLabs.

Técnica: Se utiliza Professional Voice Cloning. Mediante un voice_id generado a partir de una muestra de voz del personaje, se garantiza que el tono, la cadencia y la emoción sean uniformes durante los 60 segundos de locución, sin importar cuántas veces se fragmente el guion.

Orquestación Técnica:

Un script (Node.js/Python) divide el guion largo en segmentos lógicos.

Se envía el texto a la API de ElevenLabs para obtener los archivos de audio.

Los audios y la imagen/ID del avatar se envían a la API de HeyGen para la generación del video con sincronización labial (Lip-sync).

Finalmente, se concatenan los clips resultantes mediante una herramienta como FFmpeg (vía comando en el servidor) para generar el archivo final de 60 segundos.