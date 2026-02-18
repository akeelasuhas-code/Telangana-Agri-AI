1. Core Frontend & Infrastructure
React 19 (Latest): Used for building a highly responsive, component-based user interface.
TypeScript 5: Ensures strict type safety, which is critical for handling complex financial predictions and market data without bugs.
Vite 6: A next-generation build tool that provides lightning-fast development and optimized production bundles.
Tailwind CSS: For a utility-first, "mobile-first" design. The UI is inspired by WhatsApp and high-end FinTech apps to ensure farmers feel comfortable using it.
2. Artificial Intelligence (The Brain)
Gemini 3 Pro (Reasoning Engine): We use the latest gemini-3-pro-preview model for its advanced reasoning capabilities. It acts as the "Market Analyst" that evaluates crop prices versus inflation and demand.
Google Search Grounding: This is a crucial feature. Unlike standard AI that "hallucinates," our app uses Live Google Search tools to pull real-time Mandi prices directly from Telangana’s agricultural portals during the query.
Multimodal Quality Grading: Using Gemini’s vision capabilities, the app analyzes uploaded photos of crops (like tomatoes or paddy) to assign a Quality Grade (A, B, or C) which directly affects the price prediction.
3. Voice & Accessibility (Regional Optimization)
Gemini 2.5 TTS (Text-to-Speech): We use gemini-2.5-flash-preview-tts with the Zephyr voice model to convert AI market advice into natural-sounding audio.
Web Speech API: Utilizes the browser's native speech recognition (supporting te-IN Telugu locale) so farmers can speak naturally instead of typing.
Web Audio API (PCM Processing): Custom implementation to decode and play back raw 24kHz PCM audio streams returned by the Gemini API for high-fidelity voice output.
4. Data Visualization
Recharts: A composable charting library used to generate the 7-Day Price Forecast. It uses Area Charts with linear gradients to help farmers visually see if the price "curve" is going up (Wait) or down (Sell).
5. Key Dependencies (Technical List)
@google/genai: The official SDK for interacting with Google’s Gemini models.
lucide-react: For high-quality, recognizable agricultural and navigation icons.
recharts: For the price prediction trend visualization.
process.env Injection: Secured API key management via Vite’s environment variables.
6. Deployment & Hosting
Vercel: The app is optimized for Vercel’s Edge Network, ensuring low latency for users in the Telangana/Hyderabad region.
PWA Ready: The architecture is designed to be easily converted into a Progressive Web App (PWA) so farmers can "install" it on their Android home screens without an App Store.
1. Prerequisites
Before you start, make sure you have the following installed:
Node.js (LTS Version): Download from nodejs.org
Git: Download from git-scm.com
Google Gemini API Key: Get one for free from Google AI Studio
2. Step-by-Step Installation
Step 1: Clone the Repository
Open your terminal (Command Prompt, PowerShell, or Terminal) and run:
code
Bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
Step 2: Install Dependencies
This will download all the required libraries (React, Gemini SDK, Tailwind, etc.) listed in your package.json.
code
Bash
npm install
Step 3: Set Up the API Key
The application needs your Gemini API key to function. You must set this as an environment variable so Vite can pick it up.
For Windows (PowerShell):
code
Powershell
$env:API_KEY="your_actual_api_key_here"
For Mac/Linux:
code
Bash
export API_KEY="your_actual_api_key_here"
(Alternatively, you can create a file named .env in the root folder and add VITE_API_KEY=your_key, but you would need to update the code to use import.meta.env.VITE_API_KEY. The method above is safer for your current configuration).
Step 4: Run the Development Server
Start the app locally:
code
Bash
npm run dev
Step 5: Open in Browser
Once the terminal shows a link (usually http://localhost:5173), hold Ctrl (or Cmd) and click the link to open the app.
3. Troubleshooting Common Issues
"npm is not recognized": You haven't installed Node.js yet. Download it from the link in Step 1.
API Key Error: If the AI says "Invalid API Key," make sure you restarted your terminal after setting the environment variable, or ensure the key has no spaces around it.
Port already in use: If 5173 is busy, Vite will automatically try 5174. Just click the new link provided in the terminal.


**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
