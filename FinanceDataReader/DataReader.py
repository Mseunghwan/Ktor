# KOSPI, NYSE, NASDAQ 데이터를 로컬 mariaDB에 넣어 사용하기 위해 제작
import FinanceDataReader as fdr
import pymysql

# MariaDB 연결 설정
conn = pymysql.connect(
    host='localhost',
    user='m1',
    password='123456',
    database='vacation_ktor',
    charset='utf8mb4'
)
cursor = conn.cursor()

# 데이터 가져오기
nasdaq = fdr.StockListing('NASDAQ')
nyse = fdr.StockListing('NYSE')
kospi = fdr.StockListing('KOSPI-DESC')

# 컬럼 이름 소문자로 변환
nasdaq.columns = nasdaq.columns.str.lower()
nyse.columns = nyse.columns.str.lower()
kospi.columns = kospi.columns.str.lower()

# 데이터 정리 함수
def preprocess_data(df, source):
    df = df.copy()  # SettingWithCopyWarning 방지
    if source in ['nasdaq', 'nyse']:
        # NASDAQ과 NYSE 데이터 정리
        df['sector'] = 'N/A'  # Sector 기본값 설정 -- kospi와 다르게 섹터가 없기에
        df = df[['symbol', 'name', 'sector', 'industry']]  # 필요한 컬럼만 선택
    elif source == 'kospi':
        # KOSPI 데이터 정리
        df = df[['code', 'name', 'sector', 'industry']]  # 필요한 컬럼 선택
        df.rename(columns={'code': 'symbol'}, inplace=True)  # 컬럼 이름 변경
    return df

# 데이터프레임 정리
nasdaq = preprocess_data(nasdaq, 'nasdaq')
nyse = preprocess_data(nyse, 'nyse')
kospi = preprocess_data(kospi, 'kospi')

# 데이터 삽입 함수
def insert_data(table_name, data):
    for i, row in data.iterrows():
        try:
            sql = f"INSERT IGNORE INTO {table_name} (symbol, name, sector, industry) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (row['symbol'], row['name'], row['sector'], row['industry']))
        except Exception as e:
            print(f"Error inserting row {i} into {table_name}: {row}")
            print(e)
    conn.commit()

# 데이터 삽입
print("NASDAQ 데이터 삽입 중...")
insert_data('nasdaq', nasdaq)

print("NYSE 데이터 삽입 중...")
insert_data('nyse', nyse)

print("KOSPI 데이터 삽입 중...")
insert_data('kospi', kospi)

print("데이터 삽입 완료!")

# 연결 종료
cursor.close()
conn.close()
