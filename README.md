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



**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
