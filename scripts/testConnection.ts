import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('====================================================');
console.log('MEDBLUE-AI PLATFORM & SUPABASE CONNECTION AUDIT');
console.log('====================================================');
console.log('Supabase URL:', url);
console.log('Service Role Key:', serviceKey ? 'Loaded (Length: ' + serviceKey.length + ')' : 'MISSING');
console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Loaded' : 'MISSING');
console.log('----------------------------------------------------');

const supabase = createClient(url, serviceKey);

const tablesToTest = [
  'organizations',
  'profiles',
  'medicines',
  'batches',
  'hologram_references',
  'unit_serials',
  'shipments',
  'temperature_logs',
  'custody_nodes',
  'supply_chain_events',
  'hologram_checks',
  'inventory',
  'stock_scan_sessions',
  'stock_scan_items',
  'regulatory_incidents',
  'incident_timeline_events',
  'regulatory_cases',
  'regulatory_submissions',
  'entity_profiles',
  'notifications',
  'alerts',
  'reports',
  'blockchain_records',
];

async function runAudit() {
  let passedTables = 0;
  let failedTables = 0;

  console.log('Auditing Supabase Tables (23 Total)...');

  for (const table of tablesToTest) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ [TABLE] ${table.padEnd(25)} -> Error: ${error.message} (${error.code})`);
        failedTables++;
      } else {
        console.log(`✅ [TABLE] ${table.padEnd(25)} -> Connected! Row Count: ${count ?? 0}`);
        passedTables++;
      }
    } catch (err: any) {
      console.log(`❌ [TABLE] ${table.padEnd(25)} -> Exception: ${err.message}`);
      failedTables++;
    }
  }

  console.log('----------------------------------------------------');
  console.log(`SUMMARY: ${passedTables}/${tablesToTest.length} Tables Connected Successfully.`);
  
  if (failedTables === 0) {
    console.log('✨ ALL 23 TABLES ARE LIVE & ACCESSIBLE IN SUPABASE!');
  } else {
    console.log(`⚠️ ${failedTables} tables returned an error or missing relation.`);
  }
  console.log('====================================================');
}

runAudit();
