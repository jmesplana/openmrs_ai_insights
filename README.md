# OpenMRS AI Insights

![OpenMRS AI Insights](https://img.shields.io/badge/OpenMRS-AI%20Insights-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

An AI-powered assistant for OpenMRS that enhances clinical workflows by providing intelligent insights from patient data through a conversational interface.

## 🌟 Features

- **AI-Assisted Patient Review**: Ask questions about patient data in natural language
- **Multiple AI Provider Options**: 
  - OpenAI integration for cloud-based processing
  - Ollama support for local, privacy-focused AI processing
  - Mock AI for development and testing
- **Real-time Streaming Responses**: Responses stream in real-time as they're generated
- **Markdown Support**: Rich formatting with Markdown for better readability
- **Expandable Chat Interface**: Resize the chat window for a better viewing experience
- **Secure Data Handling**: Patient data remains secure with local processing options
- **Proxy Server**: Local proxy for handling cross-origin requests and streaming
- **Comprehensive Patient Data**: View demographics, conditions, encounters, and observations

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- OpenMRS instance (or use included mock data)
- OpenAI API key (optional)
- Ollama installation (optional, for local AI processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jmesplana/openmrs_ai_insights.git
   cd openmrs_ai_insights
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. In a separate terminal, start the proxy server:
   ```bash
   npm run proxy
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Local Development Options

When running locally, the application offers two modes:

1. **Mock Data Mode** (default):
   - Uses built-in mock patient data instead of connecting to an OpenMRS server
   - No need to handle CORS issues during development
   - Just click "Connect" with any credentials to get started
   - Includes three sample patients for testing
   - Search for "Smith" or "Johnson" to find patients

2. **Local Proxy Mode**:
   - Toggle off the "Use mock data" switch in Settings to use this mode
   - Connects to the real OpenMRS API through a local proxy server
   - Requires running the proxy server in a separate terminal:
     ```bash
     npm run proxy
     ```
   - Requires valid OpenMRS credentials

## 💡 Use Cases

### Clinical Decision Support
- Quick review of patient history, conditions, vitals, and trends
- Natural language querying for specific medical information
- Highlight potential issues or concerning values

### Medical Education
- Interactive learning with realistic patient scenarios
- Explore medical relationships and causations
- Practice clinical reasoning in a safe environment

### Research and Analysis
- Extract insights from complex patient data
- Identify patterns that may not be immediately apparent
- Generate summaries of patient history for case studies

### Administrative Efficiency
- Quickly gather information for reporting purposes
- Summarize relevant patient information for referrals
- Reduce time spent manually reviewing charts

## 🔧 Configuration

### Using OpenAI

1. Open the settings panel in the application
2. Select "OpenAI" as the AI provider
3. Enter your OpenAI API key
4. Save settings

### Using Ollama (Local AI)

1. [Install Ollama](https://ollama.ai/download) on your local machine
2. Pull a model: `ollama pull llama3` (or other model of your choice)
3. Start Ollama locally
4. In the application settings, select "Ollama (Local)" as the AI provider
5. Set the endpoint (default: `http://localhost:11434`)
6. Select your preferred model
7. Save settings

### Using Mock AI

- No configuration needed - this is the default when no API keys are provided
- Great for UI testing and development
- Can answer basic questions about the patient data

## 📈 Key Problem Solved

OpenMRS AI Insights addresses several critical challenges in healthcare information systems:

1. **Information Overload**: Healthcare providers often struggle to quickly find relevant information in patient records. This tool allows natural language queries to extract only the needed information.

2. **Limited Accessibility**: Traditional EMR interfaces can be complex and difficult to navigate. A conversational interface makes patient data more accessible to all users.

3. **Privacy Concerns**: By offering Ollama integration for local AI processing, the tool provides advanced AI capabilities without sending sensitive patient data to external services.

4. **Integration Challenges**: The application's proxy server simplifies integration with existing OpenMRS installations, addressing common CORS and authentication issues.

5. **Resource Constraints**: In resource-limited settings, the ability to run locally and use mock data allows for training and demonstration without requiring constant internet connectivity or API usage costs.

## 🧰 Architecture

```
├── public/              # Static assets
├── server.cjs           # Proxy server for handling CORS and streaming
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── services/        # API and business logic
│   │   ├── aiService.js # AI integration (OpenAI, Ollama)
│   │   └── mockData.js  # Mock data for testing
│   └── utils/           # Utility functions
```

## 🔒 Security & Privacy

- API keys are stored locally in the browser and never transmitted to third parties
- Ollama integration allows for completely local AI processing with no data sent to external services
- All API requests go through a local proxy to prevent exposing credentials
- No patient data is stored outside your local environment

## Usage

1. **Connect to OpenMRS**:
   - Enter your OpenMRS server URL, username, and password
   - Default values are provided for the demo server:
     - URL: https://o2.openmrs.org/openmrs
     - Username: admin
     - Password: Admin123
   - For local development, you can use mock data with any credentials

2. **Search for Patients**:
   - Enter a search term (at least 3 characters)
   - Select a patient from the results
   - For mock data mode, try searching for "Smith" or "Johnson"

3. **View Patient Data**:
   - Browse through the tabs to view different aspects of the patient's data
   - Expand/collapse sections to see more details

4. **Ask AI Questions**:
   - Configure your preferred AI provider in Settings
   - Type questions about the patient in the input field
   - View AI-generated responses based on the patient data

## Technology Stack

- React with Vite
- Chakra UI for styling
- Axios for API requests
- React Query for data fetching
- OpenAI API for cloud AI functionality
- Ollama for local AI processing
- Express local proxy server for development

## How CORS Issues Are Handled

This application handles CORS issues in several ways:

1. **For local development**: 
   - Default: Mock data mode that doesn't require API connections
   - Alternative: Local proxy server that forwards requests to OpenMRS API

2. **For production**:
   - Direct API connections (when deployed on domains allowed by the OpenMRS server)
   - Create serverless functions to proxy the requests (recommended for Vercel deployment)
   - Configure the OpenMRS server to allow CORS from your domain

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenMRS](https://openmrs.org/) for their open-source healthcare platform
- [React](https://reactjs.org/) for the UI framework
- [Chakra UI](https://chakra-ui.com/) for the component library
- [OpenAI](https://openai.com/) for AI capabilities
- [Ollama](https://ollama.ai/) for local LLM support

## 📊 Future Roadmap

- Implement fine-tuned healthcare-specific AI models
- Add support for medical image analysis
- Integrate with more OpenMRS modules and APIs
- Develop visualization features for patient trends
- Add support for multilingual interactions