# Dosya Adı: document_manager.py
import os

def save_uploaded_files(uploaded_files, target_folder):
    """
    Streamlit üzerinden yüklenen dosyaları alır ve hedeflenen klasöre kaydeder.
    Başarıyla kaydedilen dosyaların sayısını döndürür.
    """
    saved_count = 0
    for file in uploaded_files:
        file_path = os.path.join(target_folder, file.name)
        with open(file_path, "wb") as f:
            f.write(file.getbuffer())
        saved_count += 1
        
    return saved_count