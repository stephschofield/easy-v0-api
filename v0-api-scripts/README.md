# V0 API Scripts - Standalone Component Generator

A complete, standalone system for generating React components using the Vercel v0 API with intelligent backend integration and enforced auto-download capabilities.

## 🚀 Features

- **Smart Generation**: Intelligent component type detection and optimized prompts
- **Enforced Auto-Download**: Guaranteed code integration every time
- **Backend Compatibility**: Automatic API validation and import fixing
- **Multiple Generation Modes**: Choose the right tool for your needs
- **Standalone Operation**: Works independently from any project

## 📦 Files Included

### Core Scripts
- `smart-v0-generator.js` - **RECOMMENDED** - Intelligent generator with backend integration
- `v0-chat-creator-enforced.js` - Enforced auto-download system  
- `v0-chat-creator-sdk.js` - Official SDK implementation
- `v0-chat-creator.js` - Basic v0 integration

### Configuration
- `v0-system-prompts.js` - Optimized prompts for different component types
- `backend-integration-config.js` - Backend compatibility validation
- `.env` - Environment variables (V0 API key, Supabase config)
- `package.json` - Dependencies and npm scripts

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd v0-api-scripts
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your V0 API key:
```env
V0_API_KEY=your_v0_api_key_here
```

Get your API key from: https://v0.app/chat/settings/keys

### 3. Generate Components

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
- `v0-1.5-sm` - Small, fast
- `v0-1.5-md` - Medium, balanced (default)
- `v0-1.5-lg` - Large, most capable
- `v0-gpt-5` - Latest GPT model

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
- Check your V0_API_KEY in `.env`
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
