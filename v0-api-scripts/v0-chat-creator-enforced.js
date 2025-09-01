/**
 * V0 Chat Creator Script with ENFORCED Auto-Download
 * Creates a new chat using the official v0-sdk and ALWAYS downloads generated code
 */

// Load environment variables and backend integration
require('dotenv').config();
const { v0 } = require('v0-sdk');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { ensureBackendIntegration } = require('./backend-integration-config');

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
        console.log('📁 Using files from chat root');
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
        
        // BACKEND INTEGRATION: Ensure compatibility with existing backend
        await ensureBackendIntegration(savedFiles, outputDir);
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
   * ENFORCED wait for chat generation to complete and then download code
   * This version is more aggressive and has multiple retry strategies
   * @param {string} chatId - The chat ID
   * @param {string} outputDir - Output directory
   * @param {number} maxWaitTime - Maximum wait time in seconds (default: 300)
   * @returns {Promise<Array>} Array of saved file paths
   */
  async waitAndDownloadEnforced(chatId, outputDir = './src/components', maxWaitTime = 300) {
    console.log(`⏳ ENFORCED DOWNLOAD: Waiting for chat generation to complete...`);
    
    const startTime = Date.now();
    const maxWaitMs = maxWaitTime * 1000;
    let attempts = 0;
    let lastStatus = 'unknown';
    
    while (Date.now() - startTime < maxWaitMs) {
      try {
        attempts++;
        const chat = await this.getChat(chatId);
        const currentStatus = chat.latestVersion?.status || 'unknown';
        
        if (currentStatus !== lastStatus) {
          console.log(`\n📊 Status update: ${lastStatus} → ${currentStatus}`);
          lastStatus = currentStatus;
        }
        
        if (currentStatus === 'completed') {
          console.log('\n✅ Generation completed! Downloading code...');
          const files = await this.downloadGeneratedCode(chatId, outputDir);
          if (files.length > 0) {
            return files;
          } else {
            console.log('⚠️  No files found, but generation marked complete. Retrying...');
          }
        } else if (currentStatus === 'failed') {
          console.log('\n❌ Generation failed, but attempting download anyway...');
          try {
            return await this.downloadGeneratedCode(chatId, outputDir);
          } catch (error) {
            throw new Error('Generation failed and no files available');
          }
        }
        
        // More aggressive status checking for auto-download
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        if (attempts % 10 === 0) {
          console.log(`\n⏳ Still waiting... (${elapsed}s elapsed, attempt ${attempts}, status: ${currentStatus})`);
        } else if (attempts % 5 === 0) {
          process.stdout.write(`\n⏳ ${elapsed}s...`);
        } else {
          process.stdout.write('.');
        }
        
        // Shorter wait interval for more responsive updates
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`\n❌ Error checking generation status (attempt ${attempts}):`, error.message);
        
        // Don't give up easily - continue trying
        if (attempts % 5 === 0) {
          console.log('🔄 Retrying in 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    console.log('\n⏰ Maximum wait time reached. Attempting final download strategies...');
    
    // Multiple final download strategies
    const strategies = [
      () => this.downloadGeneratedCode(chatId, outputDir),
      () => new Promise(resolve => setTimeout(() => resolve(this.downloadGeneratedCode(chatId, outputDir)), 5000)),
      () => new Promise(resolve => setTimeout(() => resolve(this.downloadGeneratedCode(chatId, outputDir)), 15000)),
    ];
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Final attempt ${i + 1}/${strategies.length}...`);
        const files = await strategies[i]();
        if (files.length > 0) {
          console.log(`✅ Final attempt ${i + 1} successful!`);
          return files;
        }
      } catch (error) {
        console.log(`❌ Final attempt ${i + 1} failed: ${error.message}`);
      }
    }
    
    console.log(`💡 All automatic attempts exhausted. Manual download available:`);
    console.log(`   npm run download -- ${chatId}`);
    return [];
  }

  /**
   * Create a chat for UI component generation with ENFORCED auto-download
   * @param {string} prompt - Component description
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Chat creation response with enforced download
   */
  async createAndDownload(prompt, options = {}) {
    const defaultSystem = "You are an expert React developer. Create modern, responsive components using Tailwind CSS. Follow best practices for accessibility and performance.";
    
    console.log('🎨 Creating chat with ENFORCED auto-download...\n');
    console.log(`📝 Prompt: "${prompt}"`);
    if (options.system) console.log(`🧠 System: "${options.system}"`);
    console.log(`🤖 Model: ${options.modelId || 'v0-1.5-md'}`);
    console.log(`🔒 Privacy: ${options.privacy || 'private'}`);
    console.log(`💾 Auto-download: ENFORCED (cannot be disabled)`);
    console.log(`📁 Output: ${options.outputDir || './src/components'}\n`);
    
    // Create the chat
    const chat = await this.createChat({
      message: prompt,
      system: options.system || defaultSystem,
      modelConfiguration: {
        modelId: options.modelId || 'v0-1.5-md',
        imageGenerations: options.imageGenerations || false,
        thinking: options.thinking || false,
        responseMode: options.responseMode || 'sync'
      },
      chatPrivacy: options.privacy || 'private',
      projectId: options.projectId,
      designSystemId: options.designSystemId
    });
    
    console.log('✅ Chat created successfully!\n');
    console.log('🔗 Links:');
    console.log(`   Chat ID: ${chat.id}`);
    console.log(`   Web URL: ${chat.webUrl}`);
    if (chat.apiUrl) console.log(`   API URL: ${chat.apiUrl}`);
    if (chat.latestVersion?.demoUrl) console.log(`   Demo URL: ${chat.latestVersion.demoUrl}`);
    if (chat.demo) console.log(`   Preview URL: ${chat.demo}`);
    
    // ENFORCED AUTO-DOWNLOAD - this ALWAYS runs
    console.log('\n🔄 ENFORCED AUTO-DOWNLOAD: Starting integration process...');
    
    try {
      let savedFiles = [];
      
      if (chat.latestVersion?.status === 'completed') {
        console.log('✅ Generation already completed, downloading immediately...');
        savedFiles = await this.downloadGeneratedCode(chat.id, options.outputDir || './src/components');
      } else {
        console.log('⏳ Waiting for generation to complete with enforced download...');
        savedFiles = await this.waitAndDownloadEnforced(chat.id, options.outputDir || './src/components', 300);
      }
      
      if (savedFiles.length > 0) {
        console.log('\n🎉 ENFORCED DOWNLOAD SUCCESSFUL!');
        console.log('📁 Generated files integrated into your codebase:');
        savedFiles.forEach(file => {
          console.log(`   ✅ ${file}`);
        });
        
        console.log('\n💡 Your codebase has been automatically updated!');
        console.log('🔄 Run this script again to generate more updates - they will always be auto-integrated.');
        
        // Add to chat result for reference
        chat.downloadedFiles = savedFiles;
        chat.autoDownloadStatus = 'success';
      } else {
        console.log('\n⚠️  ENFORCED DOWNLOAD: No files downloaded yet, but process continues...');
        
        // Try additional aggressive retry strategies
        console.log('🔄 Attempting additional retry strategies...');
        
        for (let retry = 1; retry <= 5; retry++) {
          console.log(`🔄 Aggressive retry ${retry}/5...`);
          await new Promise(resolve => setTimeout(resolve, 10000 + (retry * 5000))); // Progressive delay
          
          try {
            savedFiles = await this.downloadGeneratedCode(chat.id, options.outputDir || './src/components');
            if (savedFiles.length > 0) {
              console.log(`✅ Aggressive retry ${retry} successful!`);
              console.log('📁 Files downloaded:');
              savedFiles.forEach(file => console.log(`   ✅ ${file}`));
              chat.downloadedFiles = savedFiles;
              chat.autoDownloadStatus = 'retry_success';
              break;
            }
          } catch (retryError) {
            console.log(`❌ Aggressive retry ${retry} failed: ${retryError.message}`);
          }
        }
        
        if (savedFiles.length === 0) {
          console.log('\n⚠️  All automatic download attempts completed.');
          console.log(`💡 Manual download available: npm run download -- ${chat.id}`);
          console.log('🎯 Or run this script again to retry auto-download.');
          chat.autoDownloadStatus = 'failed_will_retry';
        }
      }
      
    } catch (downloadError) {
      console.error('\n❌ ENFORCED DOWNLOAD ERROR:', downloadError.message);
      console.log('🔄 This is part of the enforced download process.');
      console.log(`💡 You can manually download using: npm run download -- ${chat.id}`);
      console.log('🎯 Or run this script again to retry the enforced auto-download.');
      
      chat.autoDownloadStatus = 'error';
      chat.downloadError = downloadError.message;
    }
    
    console.log('\n🎉 Visit the Web URL to see your generated component!');
    console.log('💡 Remember: Every time you run this script, code will be automatically downloaded and integrated!');
    
    return chat;
  }
}

/**
 * Parse command line arguments with enforced defaults
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    prompt: '',
    system: '',
    modelId: 'v0-1.5-md',
    thinking: false,
    privacy: 'private',
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
🚀 V0 Chat Creator - ENFORCED Auto-Download Edition

⚠️  IMPORTANT: This version ENFORCES automatic code downloading!
    Every time you create a component, the code will be automatically
    integrated into your codebase. This cannot be disabled.

Usage:
  node v0-chat-creator-enforced.js "Your prompt here"
  npm run create-enforced -- "Your prompt here"

Options:
  -p, --prompt <text>     The prompt for your component (required)
  -s, --system <text>     System context for the AI
  -m, --model <id>        Model ID (v0-1.5-sm, v0-1.5-md, v0-1.5-lg, v0-gpt-5)
  -t, --thinking          Enable thinking mode
  --privacy <level>       Privacy level (private, public, team, unlisted)
  -o, --output <path>     Output directory for generated code (default: ./src/components)
  -h, --help             Show this help message

Examples:
  # Simple prompt with enforced auto-download
  node v0-chat-creator-enforced.js "Create a modern button component"
  
  # Custom output directory
  node v0-chat-creator-enforced.js -p "Create a login form" -o "./components"
  
  # Advanced usage
  node v0-chat-creator-enforced.js -p "Create a complex component" -s "You are a senior developer" -m "v0-1.5-lg" -t

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

🔄 ENFORCED Auto-Download Features:
  ✅ ALWAYS downloads and integrates generated code
  ✅ Cannot be disabled - ensures fresh code every time
  ✅ Multiple retry strategies for robust downloading
  ✅ Extended timeouts and aggressive retry attempts
  ✅ Automatic directory structure creation
  ✅ Index file generation for easy imports
  ✅ Perfect for iterative development workflows

💡 Why ENFORCED downloading?
  - Ensures you never miss code updates
  - Perfect for rapid prototyping and iteration
  - Keeps your local codebase in sync with v0 changes
  - Eliminates manual download steps
`);
}

// Export for use in other modules
module.exports = { V0ChatCreator };

// Run script if executed directly
if (require.main === module) {
  console.log('🚀 V0 Chat Creator - ENFORCED Auto-Download Edition\n');
  
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
    console.log('Example: node v0-chat-creator-enforced.js "Create a modern button component"\n');
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
  
  // Create chat with ENFORCED auto-download
  const creator = new V0ChatCreator(process.env.V0_API_KEY);
  
  creator.createAndDownload(options.prompt, options)
    .then((result) => {
      console.log('\n✨ ENFORCED DOWNLOAD PROCESS COMPLETED!');
      console.log('📊 Summary:');
      console.log(`   Chat ID: ${result.id}`);
      console.log(`   Download Status: ${result.autoDownloadStatus || 'completed'}`);
      if (result.downloadedFiles) {
        console.log(`   Files Downloaded: ${result.downloadedFiles.length}`);
      }
      console.log('🔄 Run this script again to create more components with automatic integration!');
    })
    .catch((error) => {
      console.error('❌ Process failed:', error.message);
      process.exit(1);
    });
}
