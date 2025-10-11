
Bamsil Supabase v9_3 (v7_9 스타일 전면 복원, 갤러리/게시판 제거)
=================================================================
1) 로컬 실행
   python -m http.server 8080
   http://localhost:8080/index.html
   http://localhost:8080/admin.html

2) Supabase 준비
   - Storage: 버킷 'images' 생성 (Public)
   - SQL Editor: SCHEMA_v9_3.sql 실행 (테이블/정책/RPC/함수)
   - 관리자 계정 생성 후 profiles.is_admin=true 설정
     INSERT INTO public.profiles(id,email,is_admin)
     SELECT id,email,true FROM auth.users WHERE email='관리자이메일'
     ON CONFLICT (id) DO UPDATE SET is_admin=true;

3) 주요 변경
   - v7_9 스타일 복원(색/여백/카드/그리드/슬라이드)
   - 로그인/로그아웃 안정화, 관리자 권한 체크
   - 홈: 슬라이드 고정높이, 공지(링크), 설문 투표, 집합장소 지도 버튼(G/N/K)
   - 일정: 메타(제목/일자/시작/종료) + 항목(시작/종료/활동/장소)
           *DB 컬럼이 time만 있는 경우도 자동 호환(start_time가 없으면 time 사용)*
   - 방문지: 2열 카드, 상세 슬라이드/본문/지도, 관리자 이미지 업/삭
   - 설문: 사용자 투표(anon/ auth), 결과는 관리자 탭에서 집계

4) 환경 키 교체
   assets/js/supabase.js 의 URL/ANON_KEY를 본인 프로젝트 값으로 교체
