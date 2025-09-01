/**
 * V0 Chat Creator Script using Official SDK
 * Creates a new chat using the official v0-sdk
 */

// Load environment variables
require('dotenv').config();
const { v0 } = require('v0-sdk');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

class V0ChatCreator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // The v0 SDK automatically uses V0_API_KEY environment variable
    // but we can also pass it explicitly if needed
  }

  /**
   * Create a new chat with v0 using the official SDK
   * @param {Object} options - Chat creation options
   * @param {string} options.message - Required. The user message/prompt
   * @param {string} [options.system] - System context for the chat
   * @param {string} [options.projectId] - Project ID to associate with the chat
   * @param {string} [options.chatPrivacy='private'] - Chat privacy setting
   * @param {Object} [options.modelConfiguration] - Model configuration
   * @param {Array} [options.attachments] - File attachments
   * @param {string} [options.designSystemId] - Design system ID
   * @returns {Promise<Object>} Chat creation response
   */
  async createChat(options = {}) {
    const {
      message,
      system,
      projectId,
      chatPrivacy = 'private',
      modelConfiguration = {
        modelId: 'v0-1.5-md',
        imageGenerations: false,
        thinking: false,
        responseMode: 'sync'
      },
      attachments = [],
      designSystemId = null
    } = options;

    // Validate required fields
    if (!message) {
      throw new Error('Message is required to create a chat');
    }

    // Prepare request options for v0 SDK
    const chatOptions = {
      message,
      modelConfiguration,
      ...(system && { system }),
      ...(projectId && { projectId }),
      ...(attachments.length > 0 && { attachments }),
      ...(designSystemId && { designSystemId })
    };

    try {
      console.log('🔗 Creating chat with v0 SDK...');
      console.log('📝 Chat options:', JSON.stringify(chatOptions, null, 2));
      
      const result = await v0.chats.create(chatOptions);
      
      console.log('✅ Success! Chat created with ID:', result.id);
      return result;
    } catch (error) {
      console.error('Error creating chat with v0 SDK:', error);
      
      // Enhanced error handling
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Authentication failed. Please check your V0_API_KEY in the .env file');
      } else if (error.message.includes('400')) {
        throw new Error('Bad request. Please check your prompt format or model configuration');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection');
      }
      
      throw error;
    }
  }

  /**
   * Create a chat for UI component generation
   * @param {string} prompt - Component description
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Chat creation response
   */
  async createComponentChat(prompt, options = {}) {
    const defaultSystem = "You are an expert React developer. Create modern, responsive components using Tailwind CSS. Follow best practices for accessibility and performance.";
    
    return this.createChat({
      message: prompt,
      system: options.system || defaultSystem,
      modelConfiguration: {
        modelId: options.modelId || 'v0-1.5-md',
        imageGenerations: options.imageGenerations || false,
        thinking: options.thinking || false,
        responseMode: options.responseMode || 'sync'
      },
      chatPrivacy: options.chatPrivacy || 'private',
      projectId: options.projectId,
      designSystemId: options.designSystemId
    });
  }

  /**
   * Get chat details including generated files
   * @param {string} chatId - The chat ID
   * @returns {Promise<Object>} Chat details with files
   */
  async getChat(chatId) {
    try {
      console.log(`🔍 Fetching chat details for ID: ${chatId}`);
      
      // Try different methods to get chat details
      let chat;
      if (v0.chats.getById) {
        chat = await v0.chats.getById({ chatId });
      } else if (v0.chats.get) {
        chat = await v0.chats.get({ chatId });
      } else {
        // Try direct API call as fallback
        const response = await fetch(`https://api.v0.app/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        chat = await response.json();
      }
      
      return chat;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw error;
    }
  }

  /**
   * Download and save generated files to local workspace
   * @param {string} chatId - The chat ID
   * @param {string} outputDir - Output directory (default: './src/components')
   * @returns {Promise<Array>} Array of saved file paths
   */
  async downloadGeneratedCode(chatId, outputDir = './src/components') {
    try {
      console.log(`📥 Downloading generated code from chat: ${chatId}`);
      
      // Get chat details with files
      const chat = await this.getChat(chatId);
      
      console.log('🔍 Debug: Chat structure:', JSON.stringify(chat, null, 2));
      
      // Try to get files from both possible locations
      let files = [];
      
      if (chat.latestVersion?.files && chat.latestVersion.files.length > 0) {
        console.log('📁 Using files from latestVersion');
        files = chat.latestVersion.files;
      } else if (chat.files && chat.files.length > 0) {
        console.log('� Using files from chat root');
        files = chat.files;
      }
      
      if (files.length === 0) {
        console.log('⚠️  No generated files found in this chat');
        return [];
      }
      
      // Create output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
      }
      
      const savedFiles = [];
      
      // Save each generated file
      files.forEach((file, index) => {
        console.log(`🔍 Debug: File ${index + 1}:`, file);
        
        // Handle different file structures
        let fileName, fileContent;
        
        if (file.name && file.content) {
          // latestVersion.files structure
          fileName = file.name;
          fileContent = file.content;
        } else if (file.meta?.file && file.source) {
          // chat.files structure
          fileName = file.meta.file;
          fileContent = file.source;
        }
        
        if (fileName && fileContent) {
          const filePath = path.join(outputDir, fileName);
          
          // Create subdirectories if needed
          const fileDir = path.dirname(filePath);
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }
          
          // Write file content
          fs.writeFileSync(filePath, fileContent, 'utf8');
          
          console.log(`✅ Saved: ${filePath} (${fileContent.length} characters)`);
          savedFiles.push(filePath);
        } else {
          console.log(`⚠️  Skipping file ${index + 1}: missing name or content`);
          console.log(`    File object:`, file);
        }
      });
      
      if (savedFiles.length > 0) {
        console.log(`\n🎉 Successfully saved ${savedFiles.length} files to: ${outputDir}`);
        
        // Create index file for easy imports
        this.createIndexFile(outputDir, savedFiles);
      }
      
      return savedFiles;
      
    } catch (error) {
      console.error('❌ Failed to download generated code:', error.message);
      throw error;
    }
  }

  /**
   * Create an index.js file for easy component imports
   * @param {string} outputDir - The output directory
   * @param {Array} savedFiles - Array of saved file paths
   */
  createIndexFile(outputDir, savedFiles) {
    try {
      const componentFiles = savedFiles.filter(file => 
        file.endsWith('.jsx') || file.endsWith('.tsx') || 
        (file.endsWith('.js') && !file.includes('index'))
      );
      
      if (componentFiles.length === 0) return;
      
      const indexContent = componentFiles.map(filePath => {
        const fileName = path.basename(filePath, path.extname(filePath));
        const relativePath = `./${fileName}`;
        return `export { default as ${fileName} } from '${relativePath}';`;
      }).join('\n');
      
      const indexPath = path.join(outputDir, 'index.js');
      fs.writeFileSync(indexPath, indexContent + '\n', 'utf8');
      
      console.log(`📝 Created index file: ${indexPath}`);
    } catch (error) {
      console.error('⚠️  Failed to create index file:', error.message);
    }
  }

  /**
   * Wait for chat generation to complete and then download code
   * @param {string} chatId - The chat ID
   * @param {string} outputDir - Output directory
   * @param {number} maxWaitTime - Maximum wait time in seconds (default: 180)
   * @returns {Promise<Array>} Array of saved file paths
   */
  async waitAndDownload(chatId, outputDir = './src/components', maxWaitTime = 180) {
    console.log(`⏳ Waiting for chat generation to complete...`);
    
    const startTime = Date.now();
    const maxWaitMs = maxWaitTime * 1000;
    let attempts = 0;
    
    while (Date.now() - startTime < maxWaitMs) {
      try {
        attempts++;
        const chat = await this.getChat(chatId);
        
        if (chat.latestVersion?.status === 'completed') {
          console.log('\n✅ Generation completed! Downloading code...');
          return await this.downloadGeneratedCode(chatId, outputDir);
        } else if (chat.latestVersion?.status === 'failed') {
          throw new Error('Generation failed');
        }
        
        // More aggressive status checking for auto-download
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        if (attempts % 5 === 0) {
          console.log(`\n⏳ Still waiting... (${elapsed}s elapsed, status: ${chat.latestVersion?.status || 'unknown'})`);
        } else {
          process.stdout.write('.');
        }
        
        // Shorter wait interval for more responsive updates
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('\n❌ Error checking generation status:', error.message);
        // Continue trying instead of failing immediately
        console.log('🔄 Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n⏰ Generation is taking longer than expected.');
    console.log('🔄 Attempting one final download...');
    
    // Try one final download attempt
    try {
      return await this.downloadGeneratedCode(chatId, outputDir);
    } catch (error) {
      console.log(`💡 You can manually download later using:`);
      console.log(`   npm run download -- ${chatId}`);
      return [];
    }
  }
}

// Example usage functions
async function createSimpleChat() {
  const creator = new V0ChatCreator(process.env.V0_API_KEY);
  
  try {
    const chat = await creator.createChat({
      message: "Create a modern landing page hero section with a gradient background",
      system: "You are a skilled frontend developer specializing in modern web design"
    });
    
    console.log('✅ Chat created successfully!');
    console.log('Chat ID:', chat.id);
    console.log('Web URL:', chat.webUrl);
    console.log('API URL:', chat.apiUrl);
    
    if (chat.latestVersion && chat.latestVersion.demoUrl) {
      console.log('Demo URL:', chat.latestVersion.demoUrl);
    }
    
    return chat;
  } catch (error) {
    console.error('❌ Failed to create chat:', error.message);
    throw error;
  }
}

async function createComponentChat() {
  const creator = new V0ChatCreator(process.env.V0_API_KEY);
  
  try {
    const chat = await creator.createComponentChat(
      "Create a responsive dashboard card component with metrics display, including a chart placeholder and action buttons",
      {
        modelId: 'v0-1.5-md',
        thinking: true
      }
    );
    
    console.log('✅ Component chat created successfully!');
    console.log('Chat ID:', chat.id);
    console.log('Web URL:', chat.webUrl);
    
    return chat;
  } catch (error) {
    console.error('❌ Failed to create component chat:', error.message);
    throw error;
  }
}

async function createAdvancedChat() {
  const creator = new V0ChatCreator(process.env.V0_API_KEY);
  
  try {
    const chat = await creator.createChat({
      message: "Build a complete user authentication form with validation, including login and signup modes",
      system: "You are an expert in React, TypeScript, and form validation. Create secure, accessible components with proper error handling.",
      modelConfiguration: {
        modelId: 'v0-1.5-lg',
        imageGenerations: false,
        thinking: true,
        responseMode: 'sync'
      },
      chatPrivacy: 'private'
    });
    
    console.log('✅ Advanced chat created successfully!');
    console.log('Chat details:', {
      id: chat.id,
      webUrl: chat.webUrl,
      createdAt: chat.createdAt,
      privacy: chat.privacy
    });
    
    return chat;
  } catch (error) {
    console.error('❌ Failed to create advanced chat:', error.message);
    throw error;
  }
}

// Export for use in other modules
module.exports = { V0ChatCreator, createSimpleChat, createComponentChat, createAdvancedChat };

/**
 * Standalone function to download code from a chat ID
 */
async function downloadFromChatId(chatId, outputDir = './src/components') {
  console.log(`📥 Downloading code from chat: ${chatId}`);
  
  if (!process.env.V0_API_KEY) {
    console.error('❌ V0_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  const creator = new V0ChatCreator(process.env.V0_API_KEY);
  
  try {
    const savedFiles = await creator.downloadGeneratedCode(chatId, outputDir);
    
    if (savedFiles.length > 0) {
      console.log('\n🎉 Download completed successfully!');
    } else {
      console.log('\n⚠️  No files were downloaded');
    }
    
    return savedFiles;
  } catch (error) {
    console.error('\n❌ Download failed:', error.message);
    process.exit(1);
  }
}

/**
 * List recent chats
 */
async function listRecentChats() {
  console.log('📋 Fetching your recent chats...');
  
  if (!process.env.V0_API_KEY) {
    console.error('❌ V0_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  try {
    let chats;
    
    // Try different methods to get chats
    if (v0.chats.find) {
      chats = await v0.chats.find({ limit: 10 });
    } else if (v0.chats.list) {
      chats = await v0.chats.list({ limit: 10 });
    } else {
      // Try direct API call as fallback
      const response = await fetch('https://api.v0.app/chats?limit=10', {
        headers: {
          'Authorization': `Bearer ${process.env.V0_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      chats = data.chats || data;
    }
    
    if (!chats || chats.length === 0) {
      console.log('📭 No chats found');
      return;
    }
    
    console.log('\n📋 Your Recent Chats:');
    chats.forEach((chat, index) => {
      console.log(`\n${index + 1}. Chat ID: ${chat.id}`);
      console.log(`   Created: ${new Date(chat.createdAt).toLocaleString()}`);
      console.log(`   Status: ${chat.latestVersion?.status || 'Unknown'}`);
      console.log(`   Web URL: ${chat.webUrl}`);
      if (chat.text) {
        const preview = chat.text.length > 80 ? chat.text.substring(0, 80) + '...' : chat.text;
        console.log(`   Prompt: "${preview}"`);
      }
    });
    
    console.log('\n💡 To download code from any chat:');
    console.log('   npm run download -- <chat-id>');
    
  } catch (error) {
    console.error('❌ Failed to fetch chats:', error.message);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    prompt: '',
    system: '',
    modelId: 'v0-1.5-md',
    thinking: false,
    privacy: 'private',
    autoDownload: true, // ALWAYS enforce auto-download
    forceDownload: true, // Force download even if it fails initially
    outputDir: './src/components',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--prompt':
      case '-p':
        options.prompt = args[++i];
        break;
      case '--system':
      case '-s':
        options.system = args[++i];
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
      case '--no-download':
        console.log('⚠️  Warning: Auto-download is enforced and cannot be disabled');
        console.log('💡 All generated code will be automatically downloaded');
        // Keep autoDownload true - don't allow disabling
        break;
      case '--download':
      case '-d':
        options.autoDownload = true;
        options.forceDownload = true;
        break;
      case '--force':
      case '-f':
        options.forceDownload = true;
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
🚀 V0 Chat Creator - Official SDK Version with ENFORCED Auto-Download

Usage:
  node v0-chat-creator-sdk.js "Your prompt here"
  npm run create-sdk -- "Your prompt here"

Options:
  -p, --prompt <text>     The prompt for your component (required)
  -s, --system <text>     System context for the AI
  -m, --model <id>        Model ID (v0-1.5-sm, v0-1.5-md, v0-1.5-lg, v0-gpt-5)
  -t, --thinking          Enable thinking mode
  --privacy <level>       Privacy level (private, public, team, unlisted)
  -o, --output <path>     Output directory for generated code (default: ./src/components)
  -f, --force             Force aggressive download attempts
  -h, --help             Show this help message

⚠️  NOTE: Auto-download is ENFORCED and cannot be disabled!
    All generated code will be automatically integrated into your codebase.

Examples:
  # Simple prompt with enforced auto-download
  node v0-chat-creator-sdk.js "Create a modern button component"
  
  # Custom output directory
  node v0-chat-creator-sdk.js -p "Create a login form" -o "./components"
  
  # Force aggressive downloading
  node v0-chat-creator-sdk.js -p "Create a dashboard" --force
  
  # Advanced usage
  node v0-chat-creator-sdk.js -p "Create a complex component" -s "You are a senior developer" -m "v0-1.5-lg" -t -o "./src/ui"

Available Models:
  - v0-1.5-sm   (Small, fast)
  - v0-1.5-md   (Medium, balanced - default)
  - v0-1.5-lg   (Large, most capable)
  - v0-gpt-5    (Latest GPT model)

Privacy Levels:
  - private     (Only you can see - default)
  - public      (Anyone can see)
  - team        (Team members can see)
  - unlisted    (Hidden but accessible via link)

ENFORCED Auto-Download Features:
  ✅ ALWAYS saves generated code to your local workspace
  ✅ Cannot be disabled - ensures you never miss updates
  ✅ Creates proper directory structure
  ✅ Generates index.js for easy imports
  ✅ Waits for generation completion with extended timeouts
  ✅ Multiple retry attempts for robust downloading
  ✅ Integrates seamlessly into your codebase every time
`);
}

/**
 * Create chat with dynamic prompt from command line
 */
async function createDynamicChat(options) {
  const creator = new V0ChatCreator(process.env.V0_API_KEY);
  
  console.log('🎨 Creating chat with your prompt...\n');
  console.log(`📝 Prompt: "${options.prompt}"`);
  if (options.system) console.log(`🧠 System: "${options.system}"`);
  console.log(`🤖 Model: ${options.modelId}`);
  console.log(`🧩 Thinking: ${options.thinking ? 'Enabled' : 'Disabled'}`);
  console.log(`🔒 Privacy: ${options.privacy}`);
  console.log(`💾 Auto-download: ENFORCED (always enabled)`);
  console.log(`🔄 Force download: ${options.forceDownload ? 'Enabled' : 'Disabled'}\n`);
  
  try {
    const chat = await creator.createChat({
      message: options.prompt,
      system: options.system || "You are an expert React developer. Create modern, responsive components using Tailwind CSS. Follow best practices for accessibility and performance.",
      modelConfiguration: {
        modelId: options.modelId,
        imageGenerations: false,
        thinking: options.thinking,
        responseMode: 'sync'
      },
      chatPrivacy: options.privacy
    });
    
    console.log('✅ Chat created successfully!\n');
    console.log('🔗 Links:');
    console.log(`   Web URL: ${chat.webUrl}`);
    
    if (chat.apiUrl) {
      console.log(`   API URL: ${chat.apiUrl}`);
    }
    
    if (chat.latestVersion && chat.latestVersion.demoUrl) {
      console.log(`   Demo URL: ${chat.latestVersion.demoUrl}`);
    }
    
    // Check if there's a demo property directly on the chat object
    if (chat.demo) {
      console.log(`   Preview URL: ${chat.demo}`);
    }
    
    console.log('\n📊 Details:');
    console.log(`   Chat ID: ${chat.id}`);
    console.log(`   Created: ${new Date(chat.createdAt).toLocaleString()}`);
    console.log(`   Status: ${chat.latestVersion?.status || 'Pending'}`);
    
    // Auto-download generated code if enabled
    if (options.autoDownload) {
      console.log('\n� Auto-downloading generated code...');
      
      try {
        let savedFiles = [];
        
        if (chat.latestVersion?.status === 'completed') {
          // If already completed, download immediately
          savedFiles = await creator.downloadGeneratedCode(chat.id, options.outputDir);
        } else {
          // Wait for completion and then download
          savedFiles = await creator.waitAndDownload(chat.id, options.outputDir);
        }
        
        if (savedFiles.length > 0) {
          console.log('\n🎉 Code successfully integrated into your codebase!');
          console.log('📁 Generated files:');
          savedFiles.forEach(file => {
            console.log(`   - ${file}`);
          });
        }
        
      } catch (downloadError) {
        console.error('\n⚠️  Auto-download failed:', downloadError.message);
        console.log(`💡 You can manually download later using:`);
        console.log(`   npm run download -- ${chat.id}`);
      }
    } else {
      // Show manual download instructions
      console.log('\n💡 To download the generated code later, run:');
      console.log(`   npm run download -- ${chat.id}`);
    }
    
    console.log('\n🎉 Visit the Web URL to see your generated component!');
    return chat;
    
  } catch (error) {
    console.error('\n❌ Failed to create chat:', error.message);
    
    // Provide helpful error suggestions
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n💡 Suggestion: Check your V0_API_KEY in the .env file');
      console.log('Get your API key from: https://v0.app/chat/settings/keys');
    } else if (error.message.includes('400')) {
      console.log('\n💡 Suggestion: Check your prompt format or model configuration');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.log('\n💡 Suggestion: Check your internet connection');
    }
    
    throw error;
  }
}

// Run script if executed directly
if (require.main === module) {
  console.log('🚀 V0 Chat Creator - Official SDK Version with Auto-Download\n');
  
  // Check if API key is available
  if (!process.env.V0_API_KEY) {
    console.error('❌ V0_API_KEY not found in environment variables');
    console.log('Make sure your .env file contains: V0_API_KEY=your_api_key_here');
    console.log('Get your API key from: https://v0.app/chat/settings/keys');
    process.exit(1);
  }
  
  // Check for special commands
  const args = process.argv.slice(2);
  
  if (args[0] === 'download' && args[1]) {
    // Download command: node script.js download <chat-id> [output-dir]
    const chatId = args[1];
    const outputDir = args[2] || './src/components';
    downloadFromChatId(chatId, outputDir).then(() => process.exit(0));
    return;
  }
  
  if (args[0] === 'list') {
    // List command: node script.js list
    listRecentChats().then(() => process.exit(0));
    return;
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
    console.log('Example: node v0-chat-creator-sdk.js "Create a modern button component"\n');
    showHelp();
    process.exit(1);
  }
  
  // Validate model ID
  const validModels = ['v0-1.5-sm', 'v0-1.5-md', 'v0-1.5-lg', 'v0-gpt-5'];
  if (!validModels.includes(options.modelId)) {
    console.error(`❌ Invalid model ID: ${options.modelId}`);
    console.log(`Valid models: ${validModels.join(', ')}`);
    process.exit(1);
  }
  
  // Validate privacy level
  const validPrivacy = ['private', 'public', 'team', 'team-edit', 'unlisted'];
  if (!validPrivacy.includes(options.privacy)) {
    console.error(`❌ Invalid privacy level: ${options.privacy}`);
    console.log(`Valid privacy levels: ${validPrivacy.join(', ')}`);
    process.exit(1);
  }
  
  // Create chat with dynamic prompt
  createDynamicChat(options)
    .then(() => console.log('\n✨ Chat creation completed successfully!'))
    .catch(() => process.exit(1));
}
