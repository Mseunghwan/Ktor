import requests

API_KEY = "d9e10916798242b198db93055486f452"
BASE_URL = "https://api-v2.deepsearch.com/v1/articles"

# 종목 코드 및 날짜 설정
symbols = "KRX:000810"
date_from = "2025-01-06"
date_to = "2025-01-06"

# 요청 URL 생성
url = f"{BASE_URL}?symbols={symbols}&date_from={date_from}&date_to={date_to}&api_key={API_KEY}"

# API 요청
response = requests.get(url)

if response.status_code == 200:
    news = response.json()
    print("응답 데이터:", news)  # 전체 데이터 확인
    for article in news.get("data", []):
        print(f"제목: {article['title']}")
        print(f"요약: {article['summary']}\n\n\n")
else:
    print(f"API 요청 실패: {response.status_code}")
    print("응답 내용:", response.text)
