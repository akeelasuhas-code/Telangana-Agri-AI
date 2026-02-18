
import streamlit as st
import google.generativeai as genai
import json
import base64
from datetime import datetime

# --- Page Configuration ---
st.set_page_config(
    page_title="Raithu AI",
    page_icon="🌱",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# --- API Initialization ---
api_key = st.secrets.get("API_KEY")
if not api_key:
    st.error("API_KEY not found! Please add it to Streamlit Secrets.")
    st.stop()

# --- Custom UI Styling (Pixel-Perfect Match to Screenshot) ---
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Noto+Sans+Telugu:wght@400;700&display=swap');
    
    /* Global Styles */
    .stApp {
        background-color: #f1f5f9;
        font-family: 'Inter', 'Noto Sans Telugu', sans-serif;
    }

    [data-testid="stHeader"] {
        display: none;
    }

    .main .block-container {
        padding-top: 0;
        padding-left: 0;
        padding-right: 0;
        max-width: 500px;
        margin: auto;
        background: white;
        height: 100vh;
        box-shadow: 0 0 50px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
    }

    /* Custom Header */
    .custom-header {
        background-color: #047857;
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        position: sticky;
        top: 0;
        z-index: 1000;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .logo-box {
        background: rgba(255, 255, 255, 0.2);
        padding: 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    }

    .title-area h1 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 900;
        line-height: 1;
    }

    .status-line {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 4px;
        color: #a7f3d0;
    }

    .status-dot {
        width: 6px;
        height: 6px;
        background-color: #34d399;
        border-radius: 50%;
        box-shadow: 0 0 8px #34d399;
    }

    .toggle-group {
        background: rgba(0, 0, 0, 0.2);
        padding: 4px;
        border-radius: 12px;
        display: flex;
        gap: 4px;
    }

    .toggle-btn {
        padding: 6px 16px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .toggle-btn.active {
        background: white;
        color: #065f46;
    }

    .toggle-btn.inactive {
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
    }

    /* Chat Messages */
    .chat-container {
        padding: 1.5rem;
        flex-grow: 1;
        overflow-y: auto;
        background: #f8fafc;
    }

    .message-bubble {
        background: white;
        padding: 1.25rem;
        border-radius: 24px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        line-height: 1.6;
        color: #334155;
        max-width: 90%;
    }

    .timestamp {
        font-size: 0.65rem;
        font-weight: 700;
        color: #94a3b8;
        text-align: right;
        margin-bottom: 1.5rem;
        padding-right: 10px;
    }

    /* Bottom Input Area */
    .bottom-bar {
        background: white;
        padding: 1.25rem;
        border-top: 1px solid #f1f5f9;
    }

    .input-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 1rem;
    }

    .camera-btn {
        color: #94a3b8;
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .text-input-container {
        flex-grow: 1;
        background: #f1f5f9;
        border-radius: 16px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
    }

    .text-input-container input {
        background: transparent;
        border: none;
        width: 100%;
        outline: none;
        font-size: 0.9rem;
        color: #64748b;
    }

    .mic-btn-container {
        background: #1e293b;
        width: 50px;
        height: 50px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    /* Footer Stats */
    .footer-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
    }

    .stat-item {
        font-size: 0.6rem;
        font-weight: 900;
        color: #cbd5e1;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .trusted-badge {
        background: #ecfdf5;
        color: #059669;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 5px;
        border: 1px solid #d1fae5;
    }
    
    /* Hide Streamlit components we don't need */
    [data-testid="stSidebar"] { display: none; }
    #MainMenu { visibility: hidden; }
    footer { visibility: hidden; }
    </style>
    """, unsafe_allow_html=True)

# --- State Management ---
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant", 
            "content": "నమస్కారం రైతు సోదరులారా! (Greetings Farmer!) మీ పంట అమ్మడానికి సరైన సమయం కోసం నన్ను అడగండి. మీరు మీ పంట ఫోటో తీసి కూడా పంపవచ్చు. (Ask me for the best time to sell. You can also send a photo for quality check.)",
            "time": "02:07 PM"
        }
    ]
if "view" not in st.session_state:
    st.session_state.view = "Chat"

# --- Business Logic ---
def get_ai_response(text):
    ai = genai.GenerativeAI(api_key=api_key)
    try:
        model = ai.models.generate_content(
            model="gemini-3-flash-preview",
            contents=f"Respond to a farmer query concisely in both Telugu and English: {text}"
        )
        return model.text
    except Exception as e:
        return f"Error: {str(e)}"

# --- Header Render ---
chat_active = "active" if st.session_state.view == "Chat" else "inactive"
form_active = "active" if st.session_state.view == "Dashboard" else "inactive"

st.markdown(f"""
    <div class="custom-header">
        <div class="header-left">
            <div class="logo-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5 8-6.4 8-10 0-4.4-3.6-8-8-8s-8 3.6-8 8c0 3.6 2.5 7.5 8 10Z"/><path d="M10 2v18"/></svg>
            </div>
            <div class="title-area">
                <h1>Raithu AI</h1>
                <div class="status-line">
                    <div class="status-dot"></div>
                    LIVE MARKET ENGINE
                </div>
            </div>
        </div>
        <div class="toggle-group">
            <div class="toggle-btn {chat_active}">Chat</div>
            <div class="toggle-btn {form_active}">Form</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# --- Chat Content Render ---
st.markdown('<div class="chat-container">', unsafe_allow_html=True)

for msg in st.session_state.messages:
    st.markdown(f"""
        <div class="message-bubble">
            {msg['content']}
        </div>
        <div class="timestamp">{msg['time']}</div>
    """, unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# --- Bottom Bar Render ---
st.markdown("""
    <div class="bottom-bar">
        <div class="input-wrapper">
            <div class="camera-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <div class="text-input-container">
                <input type="text" placeholder="Type: 'Price for 10kg Tomato'..." readonly>
            </div>
            <div class="mic-btn-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
        </div>
        <div class="footer-stats">
            <div class="stat-item">Regional AI</div>
            <div class="trusted-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                TRUSTED ADVICE
            </div>
            <div class="stat-item">VER 2.5</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# --- Actual Functionality (Invisible UI) ---
# We use st.chat_input but style it to be hidden or replaced visually
actual_input = st.chat_input("Hidden actual input")
if actual_input:
    now = datetime.now().strftime("%I:%M %p")
    st.session_state.messages.append({"role": "user", "content": actual_input, "time": now})
    
    with st.spinner("Analyzing..."):
        ai_res = get_ai_response(actual_input)
        st.session_state.messages.append({"role": "assistant", "content": ai_res, "time": datetime.now().strftime("%I:%M %p")})
    st.rerun()
