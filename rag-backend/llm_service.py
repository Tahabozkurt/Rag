# Dosya Adı: llm_service.py
import config
from langchain_openai import AzureChatOpenAI

def generate_answer(query, context_text, history_str):
    """Azure OpenAI modeline bağlanır ve niyete göre esnek cevap üretir."""
    
    llm = AzureChatOpenAI(
        azure_endpoint=config.AZURE_OPENAI_ENDPOINT,
        api_key=config.AZURE_OPENAI_API_KEY,
        azure_deployment=config.AZURE_DEPLOYMENT_NAME,
        api_version=config.AZURE_OPENAI_API_VERSION,
        temperature=config.LLM_TEMPERATURE,
    )
    
    clean_history = history_str.replace('- ', '').replace('\n', ' ')
    
    if clean_history.strip():
        final_question = f"Şu anki sorum: '{query}'. (Sohbet Bağlamı: {clean_history})"
    else:
        final_question = query
        
    prompt = f"""Sen üst düzey bir kurumsal mevzuat ve bankacılık asistanısın. 

GÖREV VE KURALLARIN:
1. Sohbet ve Nezaket: Kullanıcı sadece selamlama veya hal hatır soruyorsa, mevzuat aramadan nazikçe kendini tanıtarak cevap ver.
2. Niyet Okuma (Kritik): Kullanıcılar "banka nedir", "kredi kuruluşları ne demek" gibi günlük dilde veya çok kısa sorular sorabilir. Bu durumlarda kelimesi kelimesine bir eşleşme beklemek yerine, kullanıcının asıl öğrenmek istediği kavramı anla ve SADECE aşağıdaki MEVZUAT METNİ'ndeki bilgileri kullanarak mantıklı bir tanım veya açıklama oluştur.
3. Bilgi Sentezi: Sorunun tam cevabı tek bir cümlede yoksa ama verilen metin parçalarından (örneğin şartlar, tanımlar, istisnalar) birleştirilerek çıkarılabiliyorsa, bilgiyi harmanla ve net bir Türkçe ile sun.
4. Sınır Bilinci: Eğer kullanıcının sorduğu kavram sağlanan MEVZUAT METNİ içinde kesinlikle yoksa ve metinden çıkarılamıyorsa, sadece "Bu bilgi sağlanan dokümanlarda bulunmuyor." yaz. Asla uydurma.

MEVZUAT METNİ:
{context_text}

SORU: {final_question}
CEVAP:"""
    
    result = llm.invoke(prompt)
    return result.content.strip()