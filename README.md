# V0 API Scripts - Enhanced SDK Wrapper 🔧

**A powerful wrapper around Vercel's v0 API that makes component generation and backend integration effortless.**

This enhanced SDK wrapper simplifies the v0 API workflow by adding intelligent features on top of the official v0 SDK. It automatically handles component type detection, optimizes prompts for better results, enforces reliable downloads, and ensures seamless integration with your existing backend systems.

Instead of manually managing v0 API calls, prompt engineering, and file downloads, this wrapper provides a streamlined interface that handles all the complexity behind the scenes. Perfect for developers who want the power of v0 without the integration hassles.

## 🚀 Features

- **Smart Generation**: Intelligent component type detection and optimized prompts
- **Enforced Auto-Download**: Guaranteed code integration every time
- **Backend Compatibility**: Automatic API validation and import fixing
- **Multiple Generation Modes**: Choose the right tool for your needs
- **Standalone Operation**: Works independently from any project

## 📦 Files Included

### Core Scripts
- `smart-v0-generator.js` - **RECOMMENDED** - Intelligent generator with seamless backend integration
- `v0-chat-creator-enforced.js` - Enforced auto-download system  
- `v0-chat-creator-sdk.js` - Official SDK implementation
- `v0-chat-creator.js` - Basic v0 integration

### Configuration
- `v0-system-prompts.js` - Optimized prompts for different component types
- `backend-integration-config.js` - Backend compatibility validation
- `package.json` - Dependencies and npm scripts

## 📋 Required Dependencies

### System Requirements
- **Node.js**: Version 14.0.0 or higher
- **npm**: Latest version recommended

### NPM Packages
The following packages will be automatically installed:

- **`dotenv`** (^16.0.0) - Environment variable management
- **`node-fetch`** (^3.3.0) - HTTP request handling for API calls  
- **`v0-sdk`** (^0.8.0) - Official Vercel v0 SDK for component generation

All dependencies are production-ready and actively maintained. The system is designed to work with minimal external dependencies for maximum reliability.

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd v0-api-scripts
npm install
```

### 2. Configure Environment
Add your V0 API key to your environment file:
```env
V0_API_KEY=your_v0_api_key_here
```

Get your API key from: https://v0.app/chat/settings/keys

### 3. Choose Your Model
You can select which AI models you'd like to use for component generation. The system supports various models with different capabilities and performance characteristics. For a complete list of available models and providers, see the [AI SDK documentation](http://ai-sdk.dev/docs/foundations/providers-and-models).

### 4. Generate Components

#### Smart Generator (Recommended)
```bash
npm run generate -- "Create a call center analytics dashboard"
```

#### Enforced Auto-Download
```bash
npm run create-enforced -- "Create a modern button component"
```

#### Basic SDK Usage
```bash
npm run create-sdk -- "Create a login form"
```

## 🎯 Usage Examples

### Smart Generation with Auto-Detection
```bash
# Dashboard (auto-detected)
npm run generate -- "Create a call center analytics dashboard with metrics"

# Query Builder (auto-detected)  
npm run generate -- "Build an advanced query interface for analytics"

# Charts (auto-detected)
npm run generate -- "Create sentiment analysis charts with real-time data"

# User Management (auto-detected)
npm run generate -- "Build user management interface with roles"
```

### Advanced Options
```bash
# Use larger model for complex components
node smart-v0-generator.js "Create complex dashboard" -m "v0-1.5-lg" -t

# Custom output directory
node smart-v0-generator.js "Create button" -o "./custom-components"

# Enable thinking mode
node smart-v0-generator.js "Create form" --thinking
```

## 🛠 Available Commands

| Command | Description |
|---------|-------------|
| `npm run generate` | Smart generator with backend integration |
| `npm run create-enforced` | Enforced auto-download |
| `npm run create-sdk` | Official SDK implementation |
| `npm run create` | Basic v0 integration |
| `npm run help` | Show detailed help for smart generator |
| `npm run example` | Run example generation |

## 🧠 Smart Generator Features

### Automatic Component Type Detection
The smart generator analyzes your prompt and automatically selects optimized system prompts:

- **Dashboard** - Keywords: dashboard, overview, analytics studio
- **Query Builder** - Keywords: query builder, filter, search builder  
- **Results Table** - Keywords: table, results, data display, grid
- **Analytics Charts** - Keywords: chart, graph, visualization, metrics
- **User Management** - Keywords: user management, admin, permissions
- **Authentication** - Keywords: login, signup, auth, register
- **Navigation** - Keywords: navigation, menu, header, sidebar
- **Forms** - Keywords: form, input, create, edit

### Backend Integration
Automatically ensures:
- ✅ Correct API endpoints and contracts
- ✅ Proper TypeScript interfaces  
- ✅ Authentication and role-based access
- ✅ Existing database schema compatibility
- ✅ Consistent import patterns

## 🔧 Configuration Options

### Model Selection
Choose from various AI models based on your needs:
- `v0-1.5-sm` - Small, fast
- `v0-1.5-md` - Medium, balanced (default)
- `v0-1.5-lg` - Large, most capable
- `v0-gpt-5` - Latest GPT model

**Example Usage:**
```bash
# Use v0 1.5 md model (default)
npm run generate -- "Create a dashboard" -m "v0-1.5-md"

# Use Claude Sonnet 4 model
npm run generate -- "Create a form component" -m "claude-sonnet-4-latest"
```

For a comprehensive list of all available models and providers, including detailed information about their capabilities and performance characteristics, refer to the [AI SDK documentation on providers and models](http://ai-sdk.dev/docs/foundations/providers-and-models).

### Privacy Levels
- `private` - Only you can see (default)
- `public` - Anyone can see
- `team` - Team members can see
- `unlisted` - Hidden but accessible via link

## 🔗 Integration with Existing Projects

To use these scripts in an existing project:

1. Copy the entire `v0-api-scripts` folder to your project
2. Update the output directory in commands: `-o "./src/components"`
3. Ensure your project has the required dependencies

## 🚀 Generation Workflow

1. **Prompt Analysis** - Smart detection of component type
2. **System Prompt Selection** - Optimized prompts for backend compatibility
3. **Prompt Enhancement** - Integration hints added automatically
4. **Component Generation** - v0 API creates the component
5. **Auto-Download** - Code automatically integrated (enforced mode)
6. **Backend Validation** - API compatibility checks
7. **File Integration** - Index files and imports created

## 🎯 Why Use This System?

- **Zero Manual Downloads** - Code always auto-integrates
- **Backend Compatibility** - Never breaks existing APIs
- **Intelligent Generation** - Right prompts for each component type
- **Production Ready** - Follows best practices automatically
- **Standalone** - Works anywhere, anytime

## 📈 Tips for Best Results

1. **Be Specific** - "Create a call center dashboard" vs "Create a dashboard"
2. **Include Context** - Mention your domain (analytics, admin, etc.)
3. **Use Keywords** - Include words that trigger smart detection
4. **Iterate Quickly** - Enforced download makes iteration seamless

## 🔄 Troubleshooting

### No Files Downloaded
- Check your V0_API_KEY (ensure it's set and valid)
- Try the enforced download mode: `npm run create-enforced`
- Wait longer - complex components take time

### Backend Integration Issues  
- The system automatically validates compatibility
- Check console output for integration warnings
- Review generated imports and API calls

### API Errors
- Verify your V0 API key is valid
- Check network connection
- Try different models if rate-limited

## 📖 Additional Help

Run help commands for detailed information:
```bash
npm run help          # Smart generator help
npm run help-enforced # Enforced download help  
npm run help-sdk      # SDK implementation help
```

---

**Ready to generate components with guaranteed backend integration!** 🎯
