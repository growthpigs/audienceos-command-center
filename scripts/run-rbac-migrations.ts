#!/usr/bin/env tsx
/**
 * RBAC Migration Runner
 *
 * Applies all RBAC schema migrations to Supabase
 * Run: npx tsx scripts/run-rbac-migrations.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSql(sql: string, description: string): Promise<boolean> {
  console.log(`\n🔄 Executing: ${description}`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error(`❌ Failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Success: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Starting RBAC Migrations\n');
  console.log(`📍 Database: ${SUPABASE_URL}\n`);

  const migrations = [
    {
      file: 'supabase/migrations/20260106_multi_org_roles.sql',
      description: 'RBAC Schema (tables, enums, functions)',
    },
    {
      file: 'supabase/migrations/20260106_seed_system_roles.sql',
      description: 'System Roles (Owner, Admin, Manager, Member)',
    },
    {
      file: 'supabase/migrations/20260106_seed_permissions.sql',
      description: 'Permissions (48 resource+action combinations)',
    },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const filePath = path.join(process.cwd(), migration.file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${migration.file}`);
      failCount++;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');
    const success = await executeSql(sql, migration.description);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Migration Results:`);
  console.log(`   ✅ Success: ${successCount}/${migrations.length}`);
  console.log(`   ❌ Failed:  ${failCount}/${migrations.length}`);

  if (failCount === 0) {
    console.log('\n🎉 All migrations completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some migrations failed. Check errors above.');
    process.exit(1);
  }
}

runMigrations();
