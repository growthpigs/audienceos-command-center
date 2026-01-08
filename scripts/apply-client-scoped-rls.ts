/**
 * Apply Client-Scoped RLS Migration
 * Executes 20260108_client_scoped_rls.sql migration using pg library
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Extract connection details from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD!;

// Parse project ref from URL
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];

const connectionString = `postgresql://postgres.${projectRef}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function applySqlStatement(client: Client, statement: string): Promise<{ success: boolean; error?: string }> {
  try {
    await client.query(statement);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function applyMigration() {
  console.log('🚀 Applying Client-Scoped RLS Migration\n');
  console.log('═'.repeat(60));
  console.log('\n');

  // Create and connect to database
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected\n');

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260108_client_scoped_rls.sql');

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Split into statements (basic split by semicolon, filtering out comments)
    const statements = migrationSql
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // Remove comment-only lines and empty lines
        if (!stmt) return false;
        if (stmt.startsWith('--')) return false;
        // Keep CREATE, DROP, COMMENT statements
        return stmt.length > 0;
      })
      .filter(stmt => stmt.length > 10); // Filter very short statements

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let failCount = 0;
    const errors: Array<{ statement: string; error: string }> = [];

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const shortStmt = stmt.substring(0, 60).replace(/\s+/g, ' ');

      console.log(`[${i + 1}/${statements.length}] Executing: ${shortStmt}...`);

      const result = await applySqlStatement(client, stmt + ';');

      if (result.success) {
        console.log(`   ✅ Success\n`);
        successCount++;
      } else {
        console.log(`   ❌ Failed: ${result.error}\n`);
        failCount++;
        errors.push({ statement: shortStmt, error: result.error! });
      }
    }

    console.log('\n');
    console.log('═'.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`\n✅ Successful: ${successCount}/${statements.length}`);
    console.log(`❌ Failed: ${failCount}/${statements.length}`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:\n');
      for (const err of errors) {
        console.log(`  Statement: ${err.statement}`);
        console.log(`  Error: ${err.error}\n`);
      }
      process.exit(1);
    }

    // Verify policies were created using pg client
    console.log('\n🔍 Verifying policies...\n');

    const policiesResult = await client.query(`
      SELECT tablename, policyname, cmd
      FROM pg_policies
      WHERE tablename IN ('client', 'communication', 'ticket')
        AND policyname LIKE '%member_scoped%'
    `);

    if (policiesResult.rows.length > 0) {
      console.log(`✅ Found ${policiesResult.rows.length} new policies:\n`);
      for (const policy of policiesResult.rows) {
        console.log(`   - ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      }
    } else {
      console.log('⚠️  No policies found (may indicate migration issue)');
    }

    console.log('\n✅ Migration applied successfully!\n');
  } finally {
    // Always close the connection
    await client.end();
    console.log('🔌 Database connection closed\n');
  }
}

applyMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
