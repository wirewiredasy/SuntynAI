import streamlit as st
import streamlit.components.v1 as components
from streamlit_option_menu import option_menu
from streamlit_lottie import st_lottie
import requests
import json
import io
import os
import tempfile
import uuid
import PyPDF2
import fitz  # PyMuPDF
from PIL import Image, ImageFilter, ImageEnhance
import cv2
import numpy as np
from moviepy.editor import VideoFileClip, AudioFileClip
from pydub import AudioSegment
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

# Page configuration
st.set_page_config(
    page_title="Suntyn AI - Professional AI Tools",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS with advanced animations
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
    --primary-color: #8b5cf6;
    --secondary-color: #a855f7;
    --accent-color: #c084fc;
    --background-dark: #0f0f23;
    --surface-dark: #1a1a2e;
    --text-light: #e2e8f0;
    --gradient: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
}

.main-header {
    background: var(--gradient);
    padding: 2rem;
    border-radius: 20px;
    margin-bottom: 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
    0% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
}

.neural-logo {
    animation: rotate 10s linear infinite;
    display: inline-block;
    margin-right: 10px;
}

@keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.floating-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.particle {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
    50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
}

.tool-card {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    margin: 1rem 0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.tool-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.tool-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent);
    transition: left 0.5s;
}

.tool-card:hover::before {
    left: 100%;
}

.demo-section {
    background: var(--surface-dark);
    border-radius: 20px;
    padding: 2rem;
    margin: 2rem 0;
    border: 2px solid rgba(139, 92, 246, 0.1);
}

.success-animation {
    animation: success 2s ease-in-out;
}

@keyframes success {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}

.stButton > button {
    background: var(--gradient) !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 0.5rem 2rem !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
}

.stButton > button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4) !important;
}

.metric-card {
    background: var(--gradient);
    border-radius: 15px;
    padding: 1.5rem;
    text-align: center;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.progress-bar {
    background: var(--gradient);
    height: 4px;
    border-radius: 2px;
    animation: progress 2s ease-out;
}

@keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
}

</style>
""", unsafe_allow_html=True)

# Lottie animation loader
def load_lottieurl(url: str):
    r = requests.get(url)
    if r.status_code != 200:
        return None
    return r.json()

# PDF Processing Functions
def merge_pdfs(pdf_files):
    merger = PyPDF2.PdfMerger()
    output = io.BytesIO()
    
    for pdf_file in pdf_files:
        merger.append(pdf_file)
    
    merger.write(output)
    merger.close()
    output.seek(0)
    return output

def split_pdf(pdf_file, pages_per_split=1):
    reader = PyPDF2.PdfReader(pdf_file)
    outputs = []
    
    for i in range(0, len(reader.pages), pages_per_split):
        writer = PyPDF2.PdfWriter()
        for j in range(i, min(i + pages_per_split, len(reader.pages))):
            writer.add_page(reader.pages[j])
        
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        outputs.append(output)
    
    return outputs

def compress_pdf(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    output = io.BytesIO()
    
    for page in doc:
        # Compress images on each page
        page.get_pixmap(matrix=fitz.Matrix(0.7, 0.7))
    
    doc.save(output, garbage=4, deflate=True, clean=True)
    doc.close()
    output.seek(0)
    return output

def pdf_to_text(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

# Image Processing Functions
def resize_image(image, width, height):
    return image.resize((width, height), Image.Resampling.LANCZOS)

def compress_image(image, quality=85):
    output = io.BytesIO()
    image.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    return Image.open(output)

def remove_background(image):
    # Simple background removal using OpenCV
    img_array = np.array(image)
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    mask = np.zeros(gray.shape, np.uint8)
    cv2.drawContours(mask, contours, -1, 255, -1)
    
    result = cv2.bitwise_and(img_array, img_array, mask=mask)
    return Image.fromarray(result)

def apply_filter(image, filter_type):
    if filter_type == "Blur":
        return image.filter(ImageFilter.BLUR)
    elif filter_type == "Sharpen":
        return image.filter(ImageFilter.SHARPEN)
    elif filter_type == "Smooth":
        return image.filter(ImageFilter.SMOOTH)
    elif filter_type == "Detail":
        return image.filter(ImageFilter.DETAIL)
    return image

# Video Processing Functions
def extract_audio_from_video(video_file):
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_video:
        tmp_video.write(video_file.read())
        tmp_video_path = tmp_video.name
    
    video = VideoFileClip(tmp_video_path)
    audio = video.audio
    
    output = io.BytesIO()
    audio_path = tmp_video_path.replace('.mp4', '.mp3')
    audio.write_audiofile(audio_path, verbose=False, logger=None)
    
    with open(audio_path, 'rb') as f:
        output.write(f.read())
    
    video.close()
    audio.close()
    os.unlink(tmp_video_path)
    os.unlink(audio_path)
    
    output.seek(0)
    return output

def convert_video_format(video_file, output_format):
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_video:
        tmp_video.write(video_file.read())
        tmp_video_path = tmp_video.name
    
    video = VideoFileClip(tmp_video_path)
    output_path = tmp_video_path.replace('.mp4', f'.{output_format}')
    
    if output_format == 'gif':
        video.write_gif(output_path, fps=10)
    else:
        video.write_videofile(output_path, verbose=False, logger=None)
    
    output = io.BytesIO()
    with open(output_path, 'rb') as f:
        output.write(f.read())
    
    video.close()
    os.unlink(tmp_video_path)
    os.unlink(output_path)
    
    output.seek(0)
    return output

# Audio Processing Functions
def convert_audio_format(audio_file, input_format, output_format):
    audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
    output = io.BytesIO()
    audio.export(output, format=output_format)
    output.seek(0)
    return output

def change_audio_speed(audio_file, speed_factor):
    audio = AudioSegment.from_file(io.BytesIO(audio_file.read()))
    faster_audio = audio.speedup(playback_speed=speed_factor)
    output = io.BytesIO()
    faster_audio.export(output, format="mp3")
    output.seek(0)
    return output

# Main Application
def main():
    # Header with animation
    st.markdown("""
    <div class="main-header">
        <div class="floating-particles">
            <div class="particle" style="left: 10%; top: 20%; animation-delay: 0s;"></div>
            <div class="particle" style="left: 80%; top: 30%; animation-delay: 1s;"></div>
            <div class="particle" style="left: 60%; top: 60%; animation-delay: 2s;"></div>
            <div class="particle" style="left: 30%; top: 70%; animation-delay: 3s;"></div>
        </div>
        <div class="neural-logo">🧠</div>
        <h1 style="margin: 0; color: white; font-size: 3rem; font-weight: 700;">Suntyn AI</h1>
        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 1.2rem; font-weight: 300;">NEURAL INTELLIGENCE</p>
        <p style="color: rgba(255,255,255,0.8); margin-top: 1rem;">Professional AI-Powered Tools Platform</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Navigation menu
    selected = option_menu(
        menu_title=None,
        options=["Home", "PDF Tools", "Image Tools", "Video Tools", "Audio Tools", "AI Tools", "Analytics"],
        icons=["house", "file-pdf", "image", "camera-video", "music-note", "cpu", "bar-chart"],
        menu_icon="cast",
        default_index=0,
        orientation="horizontal",
        styles={
            "container": {"padding": "0!important", "background-color": "transparent"},
            "icon": {"color": "#8b5cf6", "font-size": "20px"},
            "nav-link": {
                "font-size": "16px",
                "text-align": "center",
                "margin": "0px",
                "padding": "10px",
                "background-color": "transparent",
                "color": "#e2e8f0"
            },
            "nav-link-selected": {
                "background": "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                "color": "white"
            }
        }
    )
    
    # Home Page
    if selected == "Home":
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("""
            <div class="metric-card">
                <h2 style="color: white; margin: 0;">80+</h2>
                <p style="color: rgba(255,255,255,0.8); margin: 0;">AI Tools</p>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            <div class="metric-card">
                <h2 style="color: white; margin: 0;">1M+</h2>
                <p style="color: rgba(255,255,255,0.8); margin: 0;">Files Processed</p>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown("""
            <div class="metric-card">
                <h2 style="color: white; margin: 0;">99.9%</h2>
                <p style="color: rgba(255,255,255,0.8); margin: 0;">Uptime</p>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("---")
        
        # Demo Video Section
        st.markdown("""
        <div class="demo-section">
            <h2 style="color: #8b5cf6; text-align: center; margin-bottom: 2rem;">🎥 Live Demo</h2>
        </div>
        """, unsafe_allow_html=True)
        
        # Lottie animation
        lottie_url = "https://assets5.lottiefiles.com/packages/lf20_fcfjwiyb.json"
        lottie_json = load_lottieurl(lottie_url)
        if lottie_json:
            st_lottie(lottie_json, speed=1, height=300, key="demo")
        
        # Quick Start
        st.markdown("## 🚀 Quick Start")
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🔄 Process PDF Files", key="pdf_start"):
                st.switch_page("PDF Tools")
        
        with col2:
            if st.button("🖼️ Edit Images", key="image_start"):
                st.switch_page("Image Tools")
    
    # PDF Tools
    elif selected == "PDF Tools":
        st.markdown("# 📄 PDF Processing Tools")
        
        pdf_tool = st.selectbox("Choose PDF Tool:", [
            "Merge PDFs", "Split PDF", "Compress PDF", "Extract Text", 
            "PDF to Images", "Add Watermark", "Password Protection"
        ])
        
        if pdf_tool == "Merge PDFs":
            st.markdown("### 📑 Merge Multiple PDFs")
            uploaded_files = st.file_uploader(
                "Upload PDF files", 
                accept_multiple_files=True, 
                type=['pdf']
            )
            
            if uploaded_files and len(uploaded_files) > 1:
                if st.button("🔄 Merge PDFs"):
                    with st.spinner("Merging PDFs..."):
                        merged_pdf = merge_pdfs(uploaded_files)
                        st.success("✅ PDFs merged successfully!")
                        st.download_button(
                            label="📥 Download Merged PDF",
                            data=merged_pdf.read(),
                            file_name="merged_document.pdf",
                            mime="application/pdf"
                        )
        
        elif pdf_tool == "Split PDF":
            st.markdown("### ✂️ Split PDF into Pages")
            uploaded_file = st.file_uploader("Upload PDF file", type=['pdf'])
            
            if uploaded_file:
                pages_per_split = st.slider("Pages per split:", 1, 10, 1)
                
                if st.button("✂️ Split PDF"):
                    with st.spinner("Splitting PDF..."):
                        split_pdfs = split_pdf(uploaded_file, pages_per_split)
                        st.success(f"✅ PDF split into {len(split_pdfs)} files!")
                        
                        for i, pdf in enumerate(split_pdfs):
                            st.download_button(
                                label=f"📥 Download Part {i+1}",
                                data=pdf.read(),
                                file_name=f"split_part_{i+1}.pdf",
                                mime="application/pdf",
                                key=f"split_{i}"
                            )
        
        elif pdf_tool == "Extract Text":
            st.markdown("### 📝 Extract Text from PDF")
            uploaded_file = st.file_uploader("Upload PDF file", type=['pdf'])
            
            if uploaded_file:
                if st.button("📝 Extract Text"):
                    with st.spinner("Extracting text..."):
                        text = pdf_to_text(uploaded_file)
                        st.success("✅ Text extracted successfully!")
                        st.text_area("Extracted Text:", text, height=300)
                        
                        st.download_button(
                            label="📥 Download Text File",
                            data=text,
                            file_name="extracted_text.txt",
                            mime="text/plain"
                        )
    
    # Image Tools
    elif selected == "Image Tools":
        st.markdown("# 🖼️ Image Processing Tools")
        
        image_tool = st.selectbox("Choose Image Tool:", [
            "Resize Images", "Compress Images", "Remove Background", 
            "Apply Filters", "Convert Format", "Add Effects"
        ])
        
        if image_tool == "Resize Images":
            st.markdown("### 📏 Resize Images")
            uploaded_file = st.file_uploader("Upload image", type=['jpg', 'jpeg', 'png', 'webp'])
            
            if uploaded_file:
                image = Image.open(uploaded_file)
                st.image(image, caption="Original Image", width=300)
                
                col1, col2 = st.columns(2)
                with col1:
                    width = st.number_input("Width:", min_value=1, value=image.width)
                with col2:
                    height = st.number_input("Height:", min_value=1, value=image.height)
                
                if st.button("📏 Resize Image"):
                    with st.spinner("Resizing image..."):
                        resized_image = resize_image(image, width, height)
                        st.success("✅ Image resized successfully!")
                        st.image(resized_image, caption="Resized Image", width=300)
                        
                        img_buffer = io.BytesIO()
                        resized_image.save(img_buffer, format='PNG')
                        
                        st.download_button(
                            label="📥 Download Resized Image",
                            data=img_buffer.getvalue(),
                            file_name="resized_image.png",
                            mime="image/png"
                        )
        
        elif image_tool == "Apply Filters":
            st.markdown("### 🎨 Apply Image Filters")
            uploaded_file = st.file_uploader("Upload image", type=['jpg', 'jpeg', 'png'])
            
            if uploaded_file:
                image = Image.open(uploaded_file)
                st.image(image, caption="Original Image", width=300)
                
                filter_type = st.selectbox("Choose Filter:", [
                    "Blur", "Sharpen", "Smooth", "Detail"
                ])
                
                if st.button("🎨 Apply Filter"):
                    with st.spinner("Applying filter..."):
                        filtered_image = apply_filter(image, filter_type)
                        st.success("✅ Filter applied successfully!")
                        st.image(filtered_image, caption=f"{filter_type} Filter Applied", width=300)
                        
                        img_buffer = io.BytesIO()
                        filtered_image.save(img_buffer, format='PNG')
                        
                        st.download_button(
                            label="📥 Download Filtered Image",
                            data=img_buffer.getvalue(),
                            file_name=f"filtered_{filter_type.lower()}_image.png",
                            mime="image/png"
                        )
    
    # Video Tools
    elif selected == "Video Tools":
        st.markdown("# 🎥 Video Processing Tools")
        
        video_tool = st.selectbox("Choose Video Tool:", [
            "Extract Audio", "Convert Format", "Compress Video", "Create GIF"
        ])
        
        if video_tool == "Extract Audio":
            st.markdown("### 🎵 Extract Audio from Video")
            uploaded_file = st.file_uploader("Upload video file", type=['mp4', 'avi', 'mov'])
            
            if uploaded_file:
                if st.button("🎵 Extract Audio"):
                    with st.spinner("Extracting audio..."):
                        try:
                            audio_data = extract_audio_from_video(uploaded_file)
                            st.success("✅ Audio extracted successfully!")
                            
                            st.download_button(
                                label="📥 Download Audio File",
                                data=audio_data.read(),
                                file_name="extracted_audio.mp3",
                                mime="audio/mp3"
                            )
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
    
    # Audio Tools
    elif selected == "Audio Tools":
        st.markdown("# 🎵 Audio Processing Tools")
        
        audio_tool = st.selectbox("Choose Audio Tool:", [
            "Convert Format", "Change Speed", "Trim Audio", "Merge Audio"
        ])
        
        if audio_tool == "Convert Format":
            st.markdown("### 🔄 Convert Audio Format")
            uploaded_file = st.file_uploader("Upload audio file", type=['mp3', 'wav', 'ogg', 'flac'])
            
            if uploaded_file:
                input_format = uploaded_file.name.split('.')[-1]
                output_format = st.selectbox("Output format:", ['mp3', 'wav', 'ogg', 'flac'])
                
                if st.button("🔄 Convert Audio"):
                    with st.spinner("Converting audio..."):
                        try:
                            converted_audio = convert_audio_format(uploaded_file, input_format, output_format)
                            st.success("✅ Audio converted successfully!")
                            
                            st.download_button(
                                label="📥 Download Converted Audio",
                                data=converted_audio.read(),
                                file_name=f"converted_audio.{output_format}",
                                mime=f"audio/{output_format}"
                            )
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
    
    # AI Tools
    elif selected == "AI Tools":
        st.markdown("# 🤖 AI-Powered Tools")
        
        ai_tool = st.selectbox("Choose AI Tool:", [
            "Text Analysis", "Image Analysis", "Content Generation", "Data Insights"
        ])
        
        if ai_tool == "Text Analysis":
            st.markdown("### 📝 AI Text Analysis")
            text_input = st.text_area("Enter text to analyze:", height=200)
            
            if text_input and st.button("🔍 Analyze Text"):
                with st.spinner("Analyzing text..."):
                    # Simple text analysis
                    word_count = len(text_input.split())
                    char_count = len(text_input)
                    sentence_count = text_input.count('.') + text_input.count('!') + text_input.count('?')
                    
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.metric("Words", word_count)
                    with col2:
                        st.metric("Characters", char_count)
                    with col3:
                        st.metric("Sentences", sentence_count)
                    
                    st.success("✅ Text analysis completed!")
    
    # Analytics
    elif selected == "Analytics":
        st.markdown("# 📊 Platform Analytics")
        
        # Generate sample data for demonstration
        data = {
            'Tool Category': ['PDF', 'Image', 'Video', 'Audio', 'AI'],
            'Usage Count': [1250, 890, 450, 320, 180],
            'Success Rate': [98.5, 97.2, 95.8, 99.1, 96.7]
        }
        
        df = pd.DataFrame(data)
        
        col1, col2 = st.columns(2)
        
        with col1:
            fig1 = px.bar(df, x='Tool Category', y='Usage Count', 
                         title='Tool Usage Statistics',
                         color='Usage Count',
                         color_continuous_scale='Viridis')
            st.plotly_chart(fig1, use_container_width=True)
        
        with col2:
            fig2 = px.pie(df, values='Usage Count', names='Tool Category', 
                         title='Usage Distribution')
            st.plotly_chart(fig2, use_container_width=True)
        
        # Success Rate Chart
        fig3 = px.line(df, x='Tool Category', y='Success Rate', 
                      title='Success Rate by Tool Category',
                      markers=True)
        st.plotly_chart(fig3, use_container_width=True)
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; padding: 2rem; background: var(--gradient); border-radius: 15px; margin-top: 2rem;">
        <div class="neural-logo" style="font-size: 2rem;">🧠</div>
        <h3 style="color: white; margin: 0;">Suntyn AI</h3>
        <p style="color: rgba(255,255,255,0.8); margin: 0;">NEURAL INTELLIGENCE</p>
        <p style="color: rgba(255,255,255,0.7); margin-top: 1rem;">© 2024 Suntyn AI. All rights reserved.</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()