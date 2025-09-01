/**
 * V0 Chat Creator Script
 * Creates a new chat using the v0.app API based on the official documentation
 */

// Load environment variables
require('dotenv').config();

class V0ChatCreator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.v0.app';
  }

  /**
   * Create a new chat with v0
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
        modelId: 'v0-1.5-sm',
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

    // Prepare request body
    const requestBody = {
      message,
      modelConfiguration,
      chatPrivacy,
      ...(system && { system }),
      ...(projectId && { projectId }),
      ...(attachments.length > 0 && { attachments }),
      ...(designSystemId && { designSystemId })
    };

    try {
      console.log('🔗 Making request to:', `${this.baseUrl}/chats`);
      console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.baseUrl}/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📊 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log('❌ Error response:', errorData);
        throw new Error(
          `V0 API error: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }

      const result = await response.json();
      console.log('✅ Success! Chat created with ID:', result.id);
      return result;
    } catch (error) {
      console.error('Error creating chat:', error);
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
   * Create a chat with file attachments
   * @param {string} prompt - Chat prompt
   * @param {Array} fileUrls - Array of file URLs to attach
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Chat creation response
   */
  async createChatWithAttachments(prompt, fileUrls, options = {}) {
    const attachments = fileUrls.map(url => ({ url }));
    
    return this.createChat({
      message: prompt,
      attachments,
      ...options
    });
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
🚀 V0 Chat Creator - Dynamic Command Line Interface

Usage:
  node v0-chat-creator.js "Your prompt here"
  npm start -- "Your prompt here"

Options:
  -p, --prompt <text>     The prompt for your component (required)
  -s, --system <text>     System context for the AI
  -m, --model <id>        Model ID (v0-1.5-sm, v0-1.5-md, v0-1.5-lg, v0-gpt-5)
  -t, --thinking          Enable thinking mode
  --privacy <level>       Privacy level (private, public, team, unlisted)
  -h, --help             Show this help message

Examples:
  # Simple prompt
  node v0-chat-creator.js "Create a modern button component"
  
  # With custom system prompt
  node v0-chat-creator.js -p "Create a login form" -s "You are a security-focused developer"
  
  # With specific model and thinking enabled
  node v0-chat-creator.js -p "Create a dashboard" -m "v0-1.5-lg" -t
  
  # Using npm start
  npm start -- "Create a pricing card component"
  npm start -- -p "Create a navigation bar" -m "v0-1.5-md" -t

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
  console.log(`🔒 Privacy: ${options.privacy}\n`);
  
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
    console.log(`   API URL: ${chat.apiUrl}`);
    
    if (chat.latestVersion && chat.latestVersion.demoUrl) {
      console.log(`   Demo URL: ${chat.latestVersion.demoUrl}`);
    }
    
    console.log('\n📊 Details:');
    console.log(`   Chat ID: ${chat.id}`);
    console.log(`   Created: ${new Date(chat.createdAt).toLocaleString()}`);
    console.log(`   Status: ${chat.latestVersion?.status || 'Pending'}`);
    
    // Show generated files if available
    if (chat.latestVersion?.files && chat.latestVersion.files.length > 0) {
      console.log('\n📁 Generated Files:');
      chat.latestVersion.files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.content.length} characters)`);
      });
    }
    
    console.log('\n🎉 Visit the Web URL to see your generated component!');
    return chat;
    
  } catch (error) {
    console.error('\n❌ Failed to create chat:', error.message);
    
    // Provide helpful error suggestions
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n💡 Suggestion: Check your V0_API_KEY in the .env file');
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
  console.log('🚀 V0 Chat Creator - Dynamic Mode\n');
  
  // Check if API key is available
  if (!process.env.V0_API_KEY) {
    console.error('❌ V0_API_KEY not found in environment variables');
    console.log('Make sure your .env file contains: V0_API_KEY=your_api_key_here');
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
    console.log('Example: node v0-chat-creator.js "Create a modern button component"\n');
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
