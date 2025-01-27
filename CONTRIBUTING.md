# 기여 가이드

## 대회 정보 가져오기

`(개최연도)-(개최월).json`을 만드신 뒤, 아래 내용을 채워 주세요.

```json
{
  "date": "YYYY-MM-dd",
  "bojId": "1000"
}
```

이후 다음 명령어로 대회 정보를 불러옵니다.

```shell
# Fetch contest information of 2024-04
pnpm fetch-single-contest 2024-04
```
