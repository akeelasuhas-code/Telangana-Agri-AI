
import streamlit as st
import google.generativeai as genai
import json
import base64
from datetime import datetime

# Page configuration
st.set_page_config(
    page_title="Raithu Sell Smart AI",
    page_icon="🌱",
    layout="centered"
)

# Initialize Gemini
# Note: Streamlit uses st.secrets for environment variables
api_key = st.secrets.get("API_KEY")
if not api_key:
    st.error("API_KEY not found in Streamlit Secrets!")
    st.stop()

genai.configure(api_key=api_key)

# Custom Styling
st.markdown("""
    <style>
    .main { background-color: #f8fafc; }
    .stButton>button {
        width: 100%;
        border-radius: 12px;
        height: 3em;
        background-color: #059669;
        color: white;
        font-weight: bold;
    }
    .prediction-card {
        background-color: white;
        padding: 20px;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }
    </style>
    """, unsafe_allow_html=True)

def get_market_analysis(crop, quantity, unit, location, image_bytes=None):
    model = genai.GenerativeModel('gemini-2.0-flash') # Using flash for speed/cost
    
    prompt = f"""
    Act as a professional Indian Agricultural Market Analyst. 
    Focus on real-time market data for {location}, Telangana.

    CROP: {crop}
    QUANTITY: {quantity} {unit}

    CORE REQUIREMENTS:
    1. Use Google Search to find ACTUAL TODAY'S PRICE for {crop} in Telangana mandis.
    2. Provide a 7-day trend.
    3. Return ONLY JSON.
    
    JSON Structure:
    {{
        "currentPrice": number,
        "predictedPrice": number,
        "recommendation": "SELL_NOW" or "WAIT",
        "risk": "LOW" or "MEDIUM" or "HIGH",
        "explanation": "English summary",
        "explanationTelugu": "Telugu summary",
        "profitDelta": number,
        "daysToWait": number
    }}
    """
    
    content = [prompt]
    if image_bytes:
        content.append({
            "mime_type": "image/jpeg",
            "data": image_bytes
        })
        
    response = model.generate_content(content, tools=[{'google_search': {}}])
    # Extracting JSON from the response text
    try:
        # Simple cleanup in case of markdown blocks
        json_str = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(json_str)
    except:
        return None

def generate_voice(text):
    # Use Gemini TTS model
    model = genai.GenerativeModel('gemini-2.5-flash-preview-tts')
    response = model.generate_content(
        f"Say this naturally in Telugu: {text}",
        generation_config={"response_modalities": ["AUDIO"]}
    )
    # Extract audio bytes
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            return part.inline_data.data
    return None

# --- UI START ---

st.title("🌱 Raithu Sell Smart AI")
st.subheader("తెలుగు రైతులకు స్మార్ట్ మార్కెట్ సలహాదారు")

with st.expander("📝 Enter Crop Details (పంట వివరాలు)", expanded=True):
    col1, col2 = st.columns(2)
    with col1:
        crop = st.selectbox("Crop (పంట)", ["Paddy (వరి)", "Tomato (టమోటా)", "Cotton (ప్రత్తి)", "Chili (మిర్చి)", "Maize (మొక్కజొన్న)"])
    with col2:
        location = st.selectbox("Location (ప్రాంతం)", ["Warangal", "Nizamabad", "Khammam", "Karimnagar", "Hyderabad"])
    
    qty_col1, qty_col2 = st.columns(2)
    with qty_col1:
        qty = st.number_input("Quantity", min_value=1, value=50)
    with qty_col2:
        unit = st.selectbox("Unit", ["Quintals", "Bags", "KG"])

    uploaded_file = st.file_uploader("Upload Crop Photo (Optional Quality Check)", type=['jpg', 'jpeg', 'png'])

if st.button("Get Market Advice (సలహా పొందండి)"):
    with st.spinner("Analyzing Live Market Data..."):
        img_data = None
        if uploaded_file:
            img_data = uploaded_file.getvalue()
        
        analysis = get_market_analysis(crop, qty, unit, location, img_data)
        
        if analysis:
            st.success("Analysis Complete!")
            
            # Display Prediction Card
            color = "#10b981" if analysis['recommendation'] == "SELL_NOW" else "#4f46e5"
            rec_text = "అమ్మండి (SELL NOW)" if analysis['recommendation'] == "SELL_NOW" else "ఆగండి (WAIT)"
            
            st.markdown(f"""
                <div class="prediction-card" style="border-left: 10px solid {color}">
                    <h2 style="color: {color}; margin-top:0;">{rec_text}</h2>
                    <p><b>Today's Price:</b> ₹{analysis['currentPrice']} per {unit}</p>
                    <p><b>Predicted Price (7 days):</b> ₹{analysis['predictedPrice']} per {unit}</p>
                    <hr>
                    <p style="font-size: 1.1em;">{analysis['explanationTelugu']}</p>
                    <p style="color: gray; font-size: 0.8em;">{analysis['explanation']}</p>
                </div>
            """, unsafe_allow_html=True)
            
            if analysis['recommendation'] == "WAIT":
                st.info(f"💰 Potential Extra Profit: **₹{analysis['profitDelta']:,}**")

            # Generate and Play Audio
            audio_bytes = generate_voice(analysis['explanationTelugu'])
            if audio_bytes:
                st.audio(base64.b64decode(audio_bytes), format="audio/wav")
        else:
            st.error("Could not fetch market data. Please try again.")

st.divider()
st.caption("Raithu Sell Smart AI © 2025 | Real-time Mandi Intelligence")
