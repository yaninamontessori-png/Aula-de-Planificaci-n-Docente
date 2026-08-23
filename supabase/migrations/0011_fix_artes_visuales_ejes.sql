-- Corregir ejes de Artes Visuales con nombres completos

UPDATE public.curriculum_contents
SET eje = 'Producción Visual'
WHERE area = 'artes-visuales' AND eje = 'producci-n-visual';

UPDATE public.curriculum_contents
SET eje = 'Apreciación'
WHERE area = 'artes-visuales' AND eje = 'apreciaci-n';

UPDATE public.curriculum_contents
SET eje = 'Artes Visuales en Contexto'
WHERE area = 'artes-visuales' AND eje = 'artes-visuales-en-contexto';
