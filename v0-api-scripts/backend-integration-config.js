/**
 * Backend Integration Configuration for V0 Auto-Download
 * Ensures seamless integration between downloaded components and existing backend
 */

const fs = require('fs');
const path = require('path');

/**
 * Backend Integration Configuration
 * This ensures your auto-downloaded components work with your existing backend
 */
const BACKEND_INTEGRATION_CONFIG = {
  // API Routes that components will call
  requiredApiRoutes: [
    '/api/analytics/query',
    '/api/analytics/save-query', 
    '/api/analytics/saved-queries',
    '/api/admin/users',
    '/api/admin/users/[id]'
  ],
  
  // Database schema requirements
  requiredTables: [
    'call_analytics',
    'calls', 
    'agents',
    'users',
    'saved_queries'
  ],
  
  // Environment variables that must be present
  requiredEnvVars: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL'
  ],
  
  // TypeScript interfaces that components expect
  requiredInterfaces: {
    QueryConfig: {
      metrics: 'string[]',
      filters: 'QueryFilter[]',
      groupBy: 'string[]',
      dateRange: '{ start: string; end: string }'
    },
    QueryFilter: {
      id: 'string',
      field: 'string', 
      operator: 'string',
      value: 'string'
    },
    AnalyticsResult: {
      success: 'boolean',
      data: 'any[]',
      totalRecords: 'number',
      error: 'string?'
    }
  },
  
  // Component import paths that should be maintained
  standardImportPaths: [
    '@/components/ui/',
    '@/lib/supabase/',
    '@/components/'
  ],
  
  // Supabase client patterns
  supabasePatterns: {
    clientImport: 'import { createClient } from "@/lib/supabase/client"',
    serverImport: 'import { createClient } from "@/lib/supabase/server"',
    authCheck: 'const { data: { user } } = await supabase.auth.getUser()'
  }
};

/**
 * Post-download integration hook
 * This function runs after each v0 download to ensure backend compatibility
 */
async function ensureBackendIntegration(downloadedFiles, outputDir) {
  console.log('\n🔧 BACKEND INTEGRATION: Ensuring compatibility...');
  
  try {
    // 1. Validate API route contracts
    await validateApiContracts(downloadedFiles);
    
    // 2. Check environment variables
    await validateEnvironmentVariables();
    
    // 3. Ensure import paths are correct
    await fixImportPaths(downloadedFiles, outputDir);
    
    // 4. Validate TypeScript interfaces
    await validateTypeScriptInterfaces(downloadedFiles);
    
    // 5. Create middleware integration
    await ensureMiddlewareIntegration();
    
    // 6. Generate API client helpers
    await generateApiHelpers(outputDir);
    
    console.log('✅ Backend integration validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Backend integration warning:', error.message);
    console.log('💡 Components may need manual adjustments for full backend compatibility');
  }
}

/**
 * Validate that downloaded components use correct API contracts
 */
async function validateApiContracts(downloadedFiles) {
  console.log('🔍 Validating API contracts...');
  
  for (const filePath of downloadedFiles) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for API calls and validate endpoints
      const apiCalls = content.match(/fetch\(['"`]([^'"`]*api[^'"`]*)['"]/g);
      if (apiCalls) {
        apiCalls.forEach(call => {
          const endpoint = call.match(/['"`]([^'"`]*)['"]/)[1];
          if (!BACKEND_INTEGRATION_CONFIG.requiredApiRoutes.some(route => 
            endpoint.includes(route.replace('[id]', '')))) {
            console.log(`⚠️  Warning: ${filePath} uses non-standard API endpoint: ${endpoint}`);
          }
        });
      }
    }
  }
}

/**
 * Validate environment variables are present
 */
async function validateEnvironmentVariables() {
  console.log('🔍 Validating environment variables...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found, creating template...');
    await createEnvTemplate();
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  BACKEND_INTEGRATION_CONFIG.requiredEnvVars.forEach(envVar => {
    if (!envContent.includes(envVar)) {
      console.log(`⚠️  Missing environment variable: ${envVar}`);
    }
  });
}

/**
 * Fix import paths to match project structure
 */
async function fixImportPaths(downloadedFiles, outputDir) {
  console.log('🔧 Fixing import paths...');
  
  for (const filePath of downloadedFiles) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix common import path issues
      const importFixes = {
        'from "components/': 'from "@/components/',
        'from "lib/': 'from "@/lib/',
        'from "./ui/': 'from "@/components/ui/',
        'from "../ui/': 'from "@/components/ui/'
      };
      
      Object.entries(importFixes).forEach(([wrongPath, correctPath]) => {
        if (content.includes(wrongPath)) {
          content = content.replace(new RegExp(wrongPath, 'g'), correctPath);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed imports in: ${path.basename(filePath)}`);
      }
    }
  }
}

/**
 * Validate TypeScript interfaces match backend expectations
 */
async function validateTypeScriptInterfaces(downloadedFiles) {
  console.log('🔍 Validating TypeScript interfaces...');
  
  // This is a simplified check - in production you might use TypeScript compiler API
  for (const filePath of downloadedFiles) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for QueryConfig interface usage
      if (content.includes('QueryConfig') && !content.includes('interface QueryConfig')) {
        console.log(`💡 ${path.basename(filePath)} uses QueryConfig - ensure it matches backend expectations`);
      }
    }
  }
}

/**
 * Ensure middleware integration exists
 */
async function ensureMiddlewareIntegration() {
  console.log('🔧 Checking middleware integration...');
  
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  if (!fs.existsSync(middlewarePath)) {
    console.log('📝 Creating middleware.ts...');
    await createMiddlewareFile();
  }
}

/**
 * Generate API client helpers for consistent backend communication
 */
async function generateApiHelpers(outputDir) {
  console.log('📝 Generating API helpers...');
  
  const helpersDir = path.join(outputDir, 'lib', 'api');
  if (!fs.existsSync(helpersDir)) {
    fs.mkdirSync(helpersDir, { recursive: true });
  }
  
  const apiHelperContent = `
/**
 * Auto-generated API helpers for Query Engine Studio
 * Ensures consistent backend communication
 */

import { createClient } from "@/lib/supabase/client";

export interface QueryConfig {
  metrics: string[];
  filters: Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
  }>;
  groupBy: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface AnalyticsResult {
  success: boolean;
  data: any[];
  totalRecords: number;
  error?: string;
}

/**
 * Execute analytics query with proper error handling
 */
export async function executeQuery(config: QueryConfig): Promise<AnalyticsResult> {
  try {
    const response = await fetch('/api/analytics/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Query failed');
    }
    
    return result;
  } catch (error) {
    console.error('Query execution error:', error);
    return {
      success: false,
      data: [],
      totalRecords: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Save query configuration
 */
export async function saveQuery(queryName: string, queryConfig: QueryConfig, isShared: boolean = false) {
  try {
    const response = await fetch('/api/analytics/save-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queryName,
        queryConfig,
        isShared,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Save failed');
    }
    
    return result;
  } catch (error) {
    console.error('Save query error:', error);
    throw error;
  }
}

/**
 * Get saved queries
 */
export async function getSavedQueries() {
  try {
    const response = await fetch('/api/analytics/saved-queries');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch queries');
    }
    
    return result;
  } catch (error) {
    console.error('Get saved queries error:', error);
    throw error;
  }
}

/**
 * Get current user profile with role information
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Not authenticated');
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }
    
    return { user, profile };
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
}
`;

  fs.writeFileSync(path.join(helpersDir, 'client.ts'), apiHelperContent, 'utf8');
  console.log('✅ Created API helpers at lib/api/client.ts');
}

/**
 * Create environment template
 */
async function createEnvTemplate() {
  const envTemplate = `
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# V0 API Configuration  
V0_API_KEY=your_v0_api_key_here

# Development
NODE_ENV=development
`;

  fs.writeFileSync('.env.template', envTemplate, 'utf8');
  console.log('📝 Created .env.template - copy to .env and fill in your values');
}

/**
 * Create middleware file
 */
async function createMiddlewareFile() {
  const middlewareContent = `
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
`;

  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  fs.writeFileSync(middlewarePath, middlewareContent, 'utf8');
  console.log('✅ Created middleware.ts');
}

module.exports = {
  BACKEND_INTEGRATION_CONFIG,
  ensureBackendIntegration,
  validateApiContracts,
  validateEnvironmentVariables,
  fixImportPaths,
  generateApiHelpers
};
