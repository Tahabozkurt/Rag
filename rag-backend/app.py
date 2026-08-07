# Dosya Adı: app.py
import streamlit as st
import os
import config
from database import create_or_get_vectordb, retrieve_documents
from llm_service import generate_answer
from document_manager import save_uploaded_files

# 1. Sayfa Ayarları ve Gelişmiş Dark/Modern Tema
st.set_page_config(page_title="Kurumsal Mevzuat Asistanı", page_icon="🏛️", layout="centered")

st.markdown("""
<style>
    .stApp { background-color: #0f172a; color: #f8fafc; }
    [data-testid="stSidebar"] { background-color: #1e293b; border-right: 1px solid #334155; }
    
    /* İŞTE DÜZELTİLEN KISIM: header görünürlüğünü açtık, sadece arka planını şeffaf yaptık */
    #MainMenu {visibility: hidden;} 
    footer {visibility: hidden;} 
    header {background-color: transparent !important;}
    
    /* Sol paneldeki açma/kapama butonunun rengini temaya uydurma */
    button[kind="header"] { color: #cbd5e1 !important; }

    .main-title { color: #f1f5f9; font-weight: 700; font-size: 2.4rem; text-align: center; margin-bottom: 5px; letter-spacing: -0.5px; }
    .sub-title { text-align: center; color: #94a3b8; font-size: 1.05rem; margin-bottom: 2.5rem; }
    div[data-testid="stPopover"] > button { background-color: #1e293b; border: 1px solid #334155; color: #cbd5e1; border-radius: 8px; transition: all 0.2s ease; }
    div[data-testid="stPopover"] > button:hover { border-color: #38bdf8; color: #38bdf8; }
    .stChatMessage { background-color: #1e293b !important; border: 1px solid #334155 !important; border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem; }
</style>
""", unsafe_allow_html=True)

# 2. Belge Yükleme ve Yönetimi (MODÜLER)
with st.sidebar:
    st.header("📂 Kaynak Yönetimi")
    st.caption("Yeni mevzuat veya yönetmelik PDF'lerini buraya sürükleyip bırakın.")
    
    uploaded_files = st.file_uploader("Belge Yükle", type=["pdf"], accept_multiple_files=True, label_visibility="collapsed")
    
    if uploaded_files:
        if st.button("Sisteme Entegre Et", use_container_width=True, type="primary"):
            with st.spinner("Belgeler işleniyor ve hafızaya alınıyor..."):
                saved_count = save_uploaded_files(uploaded_files, config.FOLDER_NAME)
                st.cache_resource.clear()
                st.success(f"{saved_count} yeni belge sisteme eklendi!")
                import time
                time.sleep(1.5)
                st.rerun()

# 3. Veritabanını Başlatma
@st.cache_resource(show_spinner=False)
def init_db():
    return create_or_get_vectordb()

with st.spinner("Mevzuat kaynakları yükleniyor..."):
    vectordb = init_db()

# 4. Sağ Üst Ayarlar Menüsü
col1, col2 = st.columns([5.5, 1.5])
with col2:
    with st.popover("⚙️ Ayarlar"):
        st.caption("Sistem Durumu")
        st.markdown(f"**Yapay Zeka:**\n`{config.AZURE_DEPLOYMENT_NAME}`")
        st.markdown(f"**Arama:**\n`{config.EMBEDDING_MODEL}`")
        st.divider()
        if st.button("Sohbeti Temizle", use_container_width=True):
            st.session_state.messages = []
            st.rerun()

# 5. Ana Karşılama Ekranı
st.markdown("<h1 class='main-title'>🏛️ Kurumsal Mevzuat Asistanı</h1>", unsafe_allow_html=True)
st.markdown("<p class='sub-title'>Bankacılık Servisleri ve Operasyonel Yönergeler İçin Akıllı Çözüm</p>", unsafe_allow_html=True)

if vectordb is None:
    st.warning("⚠️ Sistemde kaynak bulunamadı. Lütfen sol panelden PDF belgelerinizi yükleyin.")
    st.stop()
    
st.divider()

# 6. Sohbet Geçmişi Yönetimi
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    avatar = "👤" if message["role"] == "user" else "🏛️"
    with st.chat_message(message["role"], avatar=avatar):
        st.markdown(message["content"])

# 7. Soru/Cevap Döngüsü
if query := st.chat_input("Mevzuatla ilgili sorunuzu yazın..."):
    
    st.session_state.messages.append({"role": "user", "content": query})
    with st.chat_message("user", avatar="👤"):
        st.markdown(query)

    with st.chat_message("assistant", avatar="🏛️"):
        response_placeholder = st.empty()
        
        with st.spinner("Mevzuat taranıyor ve yanıt hazırlanıyor..."):
            history_str = ""
            for msg in st.session_state.messages[-4:-1]:
                if msg["role"] == "user":
                    history_str += f"{msg['content']} "
            
            search_query = f"{history_str} {query}"
            source_docs, context_text = retrieve_documents(vectordb, search_query)
            
            result = generate_answer(query, context_text, history_str)
            response_placeholder.markdown(result)
            
            if "bulunmuyor" not in result.lower():
                with st.expander("🔍 Kaynaklar ve Hukuki Dayanaklar"):
                    for i, doc in enumerate(source_docs):
                        source_file = os.path.basename(doc.metadata.get('source', 'Bilinmeyen Belge'))
                        page_num = doc.metadata.get('page', 0) + 1
                        st.markdown(f"**{i+1}. {source_file}** (Sayfa {page_num})")
                        st.caption(f"> {doc.page_content[:250]}...")

        st.session_state.messages.append({"role": "assistant", "content": result})