import requests
import datetime
import os

# 1. 환율 API 호출 (엔화 -> 원화)
url = "https://api.frankfurter.app/latest?from=JPY&to=KRW"

try:
    response = requests.get(url)
    data = response.json()
    rate = data['rates']['KRW']
    
    today = datetime.datetime.now().strftime("%Y-%m-%d")

    # 2. JS 파일 내용 생성
    js_content = f"""// 이 파일은 GitHub Actions에 의해 매일 자동으로 업데이트됩니다.
// Update Time: {today}
export const currencyData = {{
    rate: {rate},
    updatedAt: "{today}"
}};
"""

    # 3. currency.js 파일 덮어쓰기 (같은 폴더 내)
    # GitHub Actions 실행 위치에 따라 다르지만, 스크립트와 같은 위치라고 가정
    file_path = "currency.js"
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"Success: Updated rate to {rate} KRW/JPY")

except Exception as e:
    print(f"Error: {e}")
    exit(1)
