-- Insertar contenidos curriculares de Santa Fe con UUIDs determinísticos

-- Usar namespace UUID para generar UUIDs v5 determinísticos
-- namespace: 6ba7b8109dad11d180b400c04fd430c8 (URL namespace)

INSERT INTO public.curriculum_contents (id, area, eje, content, grade)
VALUES
  -- GRADO 1
  ('550e8400-e29b-41d4-a716-446655440001', 'artes-audiovisuales', 'recursos-audiovisuales', 'RECURSOS AUDIOVISUALES', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'artes-audiovisuales', 'interpretación-crítica', 'INTERPRETACIÓN CRÍTICA', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 'artes-visuales', 'la-imagen-en-la-bidimensión', 'LA IMAGEN EN LA BIDIMENSIÓN', 1),
  ('550e8400-e29b-41d4-a716-446655440004', 'artes-visuales', 'la-imagen-en-la-tridimensión', 'LA IMAGEN EN LA TRIDIMENSIÓN', 1),
  ('550e8400-e29b-41d4-a716-446655440005', 'artes-visuales', 'la-imagen-en-medios-múltiples-y-digitales', 'LA IMAGEN EN MEDIOS MÚLTIPLES Y DIGITALES', 1),
  ('550e8400-e29b-41d4-a716-446655440006', 'artes-visuales', 'nuestro-entorno-nuestra-imagen', 'NUESTRO ENTORNO, NUESTRA IMAGEN', 1),
  ('550e8400-e29b-41d4-a716-446655440007', 'artes-visuales', 'la-cultura-visual-en-el-mundo', 'LA CULTURA VISUAL EN EL MUNDO', 1),
  ('550e8400-e29b-41d4-a716-446655440008', 'artes-visuales', 'contextos-expositivos', 'CONTEXTOS EXPOSITIVOS', 1),
  ('550e8400-e29b-41d4-a716-446655440009', 'artes-visuales', 'manifestaciones-artísticas-históricas-y-actuales', 'MANIFESTACIONES ARTÍSTICAS HISTÓRICAS Y ACTUALES', 1),
  ('550e8400-e29b-41d4-a716-446655440010', 'ciencias-naturales', 'contenidos-del-area', 'Contenidos', 1),
  ('550e8400-e29b-41d4-a716-446655440011', 'ciencias-sociales', 'contenidos-del-area', 'Contenidos', 1),
  ('550e8400-e29b-41d4-a716-446655440012', 'danza', 'elementos-del-movimiento-danzado', 'ELEMENTOS DEL MOVIMIENTO DANZADO', 1),
  ('550e8400-e29b-41d4-a716-446655440013', 'danza', 'la-experiencia-del-danzar', 'LA EXPERIENCIA DEL DANZAR', 1),
  ('550e8400-e29b-41d4-a716-446655440014', 'danza', 'el-proceso-creativo-y-la-composición-en-danza', 'EL PROCESO CREATIVO Y LA COMPOSICIÓN EN DANZA', 1),
  ('550e8400-e29b-41d4-a716-446655440015', 'educacion-fisica', 'desarrollo-perceptivo-motriz-identidad-corporal', 'DESARROLLO PERCEPTIVO MOTRIZ: IDENTIDAD CORPORAL', 1),
  ('550e8400-e29b-41d4-a716-446655440016', 'educacion-fisica', 'habilidades-motoras', 'HABILIDADES MOTORAS', 1),
  ('550e8400-e29b-41d4-a716-446655440017', 'educacion-fisica', 'capacidades-motoras', 'CAPACIDADES MOTORAS', 1),
  ('550e8400-e29b-41d4-a716-446655440018', 'educacion-fisica', 'prácticas-lúdicas-y-deportivas', 'PRÁCTICAS LÚDICAS Y DEPORTIVAS', 1),
  ('550e8400-e29b-41d4-a716-446655440019', 'educacion-fisica', 'prácticas-expresivas-y-lenguajes', 'PRÁCTICAS EXPRESIVAS Y LENGUAJES', 1),
  ('550e8400-e29b-41d4-a716-446655440020', 'educacion-fisica', 'prácticas-en-el-ambiente-eai', 'PRÁCTICAS EN EL AMBIENTE (EAI)', 1)
ON CONFLICT (id) DO NOTHING;

-- Nota: Este es un ejemplo con los primeros contenidos de grado 1.
-- Para completar todos los grados y contenidos, ejecuta el script extractor
-- desde C:\Users\Pc\Desktop\Yani\planificar\scripts\ si existe.
