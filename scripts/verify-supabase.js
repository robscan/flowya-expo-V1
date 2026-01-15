/**
 * Script de Verificación de Supabase
 * 
 * Verifica conexión y estructura de base de datos
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltante');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ Faltante');
  process.exit(1);
}

console.log('🔍 Verificando conexión a Supabase...');
console.log('URL:', supabaseUrl.substring(0, 30) + '...');
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  try {
    // Verificar tabla spots
    console.log('📋 Verificando tabla spots...');
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id')
      .limit(1);

    if (spotsError) {
      console.error('❌ Error accediendo a tabla spots:', spotsError.message);
      console.error('   Código:', spotsError.code);
      console.error('\n💡 Posibles soluciones:');
      console.error('   1. La tabla spots no existe - necesitas crearla primero');
      console.error('   2. Las credenciales no tienen permisos');
      console.error('   3. El proyecto de Supabase es diferente');
      return;
    }

    console.log('✅ Tabla spots existe\n');

    // Contar spots
    const { count, error: countError } = await supabase
      .from('spots')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('⚠️  Error contando spots:', countError.message);
    } else {
      console.log(`📊 Total de spots: ${count || 0}\n`);
    }

    // Verificar campo spot_type
    console.log('🔍 Verificando campo spot_type...');
    const { data: sampleSpot } = await supabase
      .from('spots')
      .select('spot_type')
      .limit(1)
      .single();

    if (sampleSpot && 'spot_type' in sampleSpot) {
      console.log('✅ Campo spot_type existe\n');
    } else {
      console.log('⚠️  Campo spot_type no existe o no se puede verificar');
      console.log('   Ejecuta: supabase/migrations/002_add_spot_type_column.sql\n');
    }

    // Verificar tabla pins
    console.log('📋 Verificando tabla pins...');
    const { data: pins, error: pinsError } = await supabase
      .from('pins')
      .select('id')
      .limit(1);

    if (pinsError) {
      console.warn('⚠️  Error accediendo a tabla pins:', pinsError.message);
    } else {
      const { count: pinsCount } = await supabase
        .from('pins')
        .select('*', { count: 'exact', head: true });
      console.log(`✅ Tabla pins existe (${pinsCount || 0} pins)\n`);
    }

    console.log('✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

verify();
