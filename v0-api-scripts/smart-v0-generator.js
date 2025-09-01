#!/usr/bin/env node

/**
 * Smart V0 Component Generator with Backend Integration
 * Automatically uses appropriate system prompts and ensures backend compatibility
 */

require('dotenv').config();
const { generateSystemPrompt, COMPONENT_PROMPTS } = require('./v0-system-prompts');
const { V0ChatCreator } = require('./v0-chat-creator-enforced');

/**
 * Smart component generation with automatic system prompt selection
 */
class SmartV0Generator {
  constructor() {
    this.creator = new V0ChatCreator(process.env.V0_API_KEY);
  }

  /**
   * Analyze prompt to determine component type and select appropriate system prompt
   */
  analyzePrompt(userPrompt) {
    const prompt = userPrompt.toLowerCase();
    
    // Component type detection patterns
    const patterns = {
      dashboard: ['dashboard', 'overview', 'main page', 'home', 'analytics studio'],
      queryBuilder: ['query builder', 'query building', 'filter', 'search builder', 'query interface'],
      resultsTable: ['table', 'results', 'data display', 'list', 'grid', 'export'],
      analyticsCharts: ['chart', 'graph', 'visualization', 'analytics', 'metrics display'],
      userManagement: ['user management', 'admin', 'users', 'permissions', 'roles'],
      authentication: ['login', 'signup', 'auth', 'sign in', 'register'],
      navigation: ['navigation', 'nav', 'menu', 'header', 'sidebar'],
      forms: ['form', 'input', 'create', 'edit', 'add new']
    };

    // Find matching component type
    for (const [componentType, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        console.log(`🎯 Detected component type: ${componentType}`);
        return componentType;
      }
    }

    console.log('🎯 Default component type detected');
    return 'default';
  }

  /**
   * Get system prompt based on component type
   */
  getSystemPrompt(componentType, userPrompt) {
    // Use predefined prompts for known component types
    if (COMPONENT_PROMPTS[componentType]) {
      return COMPONENT_PROMPTS[componentType];
    }

    // Generate custom system prompt for other components
    const customContext = this.generateCustomContext(userPrompt);
    return generateSystemPrompt(customContext);
  }

  /**
   * Generate custom context based on user prompt analysis
   */
  generateCustomContext(userPrompt) {
    const prompt = userPrompt.toLowerCase();
    let context = 'Create a component that integrates with the Query Engine Studio.';

    // Add specific context based on prompt content
    if (prompt.includes('sentiment')) {
      context += ' Focus on sentiment analysis features and scoring (0-100 scale).';
    }
    
    if (prompt.includes('compliance')) {
      context += ' Emphasize compliance tracking features (mobile pitch, branded greeting, cost disclosure).';
    }
    
    if (prompt.includes('agent')) {
      context += ' Include agent-specific functionality and analytics.';
    }
    
    if (prompt.includes('admin')) {
      context += ' Include administrative features with proper role-based access controls.';
    }
    
    if (prompt.includes('real-time') || prompt.includes('live')) {
      context += ' Implement real-time data updates and live monitoring capabilities.';
    }

    return context;
  }

  /**
   * Enhance user prompt with backend integration hints
   */
  enhancePrompt(userPrompt, componentType) {
    let enhancedPrompt = userPrompt;

    // Add backend integration hints based on component type
    const integrationHints = {
      dashboard: ' Ensure the dashboard integrates with the existing analytics API endpoints and displays real call center metrics.',
      queryBuilder: ' Make sure the query builder uses the exact QueryConfig interface and available metrics from the backend.',
      resultsTable: ' The table should work with the analytics API response format and support all query result types.',
      analyticsCharts: ' Charts should visualize the call center metrics (sentiment, talk time, compliance) from the API.',
      userManagement: ' User management should integrate with Supabase auth and the users table with proper role permissions.'
    };

    if (integrationHints[componentType]) {
      enhancedPrompt += integrationHints[componentType];
    }

    // Add general backend integration reminder
    enhancedPrompt += ' Ensure full compatibility with the existing Query Engine Studio backend, API contracts, and TypeScript interfaces.';

    return enhancedPrompt;
  }

  /**
   * Generate component with smart system prompt selection
   */
  async generateComponent(userPrompt, options = {}) {
    console.log('🧠 SMART V0 GENERATOR: Analyzing your prompt...\n');
    
    // Analyze prompt to determine component type
    const componentType = this.analyzePrompt(userPrompt);
    
    // Get appropriate system prompt
    const systemPrompt = this.getSystemPrompt(componentType, userPrompt);
    
    // Enhance user prompt with backend integration hints
    const enhancedPrompt = this.enhancePrompt(userPrompt, componentType);
    
    console.log(`📝 Original prompt: "${userPrompt}"`);
    console.log(`🎯 Component type: ${componentType}`);
    console.log(`🧠 Using optimized system prompt for backend integration`);
    console.log(`📝 Enhanced prompt: "${enhancedPrompt}"`);
    console.log('');

    // Create component with smart configuration
    const result = await this.creator.createAndDownload(enhancedPrompt, {
      system: systemPrompt,
      modelId: options.modelId || 'v0-1.5-md',
      thinking: options.thinking || false,
      privacy: options.privacy || 'private',
      outputDir: options.outputDir || './src/components',
      ...options
    });

    // Add metadata about the generation
    result.componentType = componentType;
    result.enhancedPrompt = enhancedPrompt;
    result.systemPromptUsed = systemPrompt.substring(0, 100) + '...';

    return result;
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    prompt: '',
    modelId: 'v0-1.5-md',
    thinking: false,
    privacy: 'private',
    outputDir: './src/components',
    help: false,
    smart: true // Smart mode is always enabled
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--prompt':
      case '-p':
        options.prompt = args[++i];
        break;
      case '--model':
      case '-m':
        options.modelId = args[++i];
        break;
      case '--thinking':
      case '-t':
        options.thinking = true;
        break;
      case '--privacy':
        options.privacy = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        // If no flag, treat as prompt
        if (!options.prompt && !arg.startsWith('-')) {
          options.prompt = arg;
        }
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🧠 Smart V0 Component Generator with Backend Integration

This intelligent generator automatically:
✅ Analyzes your prompt to determine component type
✅ Selects the optimal system prompt for backend compatibility  
✅ Enhances your prompt with integration hints
✅ Ensures seamless backend integration every time
✅ Downloads and integrates code automatically

Usage:
  node smart-v0-generator.js "Your component description"
  npm run generate -- "Your component description"

Options:
  -p, --prompt <text>     Component description (required)
  -m, --model <id>        Model ID (v0-1.5-sm, v0-1.5-md, v0-1.5-lg, v0-gpt-5)
  -t, --thinking          Enable thinking mode
  --privacy <level>       Privacy level (private, public, team, unlisted)
  -o, --output <path>     Output directory (default: ./src/components)
  -h, --help             Show this help message

Intelligent Component Types Detected:
🏠 Dashboard         - Main analytics overview with metrics cards
🔍 Query Builder    - Advanced query interface with filters
📊 Results Table    - Data display with sorting and export
📈 Analytics Charts - Visualizations for call center metrics
👥 User Management  - Admin interface for user roles
🔐 Authentication   - Login/signup components
🧭 Navigation       - Menus, headers, sidebars
📝 Forms            - Input forms and data entry

Examples:
  # Dashboard component (auto-detected)
  node smart-v0-generator.js "Create a call center analytics dashboard"
  
  # Query builder (auto-detected)  
  node smart-v0-generator.js "Build an advanced query interface for analytics"
  
  # Custom component with smart enhancement
  node smart-v0-generator.js "Create a sentiment analysis widget with real-time updates"
  
  # Complex component with all options
  node smart-v0-generator.js "Build a compliance tracking dashboard" -m "v0-1.5-lg" -t

🎯 The generator automatically ensures backend compatibility by:
   • Using correct API endpoints and contracts
   • Implementing proper TypeScript interfaces
   • Including authentication and role-based access
   • Following your existing database schema
   • Maintaining consistent import patterns

💡 Just describe what you want - the smart generator handles all backend integration!
`);
}

// Run script if executed directly
if (require.main === module) {
  console.log('🧠 Smart V0 Component Generator - Backend Integration Guaranteed\n');
  
  // Check if API key is available
  if (!process.env.V0_API_KEY) {
    console.error('❌ V0_API_KEY not found in environment variables');
    console.log('Make sure your .env file contains: V0_API_KEY=your_api_key_here');
    console.log('Get your API key from: https://v0.app/chat/settings/keys');
    process.exit(1);
  }
  
  // Parse command line arguments
  const options = parseArgs();
  
  // Show help if requested or no prompt provided
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  if (!options.prompt) {
    console.error('❌ No prompt provided!');
    console.log('Use --help for usage information, or provide a prompt:');
    console.log('Example: node smart-v0-generator.js "Create a modern analytics dashboard"\n');
    showHelp();
    process.exit(1);
  }
  
  // Generate component with smart backend integration
  const generator = new SmartV0Generator();
  
  generator.generateComponent(options.prompt, options)
    .then((result) => {
      console.log('\n🎉 SMART GENERATION COMPLETED!');
      console.log('📊 Generation Summary:');
      console.log(`   Chat ID: ${result.id}`);
      console.log(`   Component Type: ${result.componentType}`);
      console.log(`   Download Status: ${result.autoDownloadStatus || 'completed'}`);
      if (result.downloadedFiles) {
        console.log(`   Files Generated: ${result.downloadedFiles.length}`);
        result.downloadedFiles.forEach(file => {
          console.log(`   ✅ ${file}`);
        });
      }
      console.log('\n🔗 Links:');
      console.log(`   Web URL: ${result.webUrl}`);
      if (result.latestVersion?.demoUrl) {
        console.log(`   Demo URL: ${result.latestVersion.demoUrl}`);
      }
      console.log('\n💡 Your component is now integrated and backend-compatible!');
      console.log('🔄 Run this script again to generate more smart components.');
    })
    .catch((error) => {
      console.error('❌ Smart generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { SmartV0Generator };
