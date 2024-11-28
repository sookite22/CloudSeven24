##24.11.28 중간 업데이트 하였습니다 <br>

dynamodb를 이용한 회원가입을 구현해 회원가입란에 데이터 입력시 dynamodb 테이블에 저장하게 하였습니다
그 데이터를 통한 login 구현은 아직 성공하지 못했습니다.

투표 또한 이번 주 내 구현 시 업데이트 예정입니다

lambda_create/node_modules 는 lambda에서 회원가입 구현 시 사용한 함수입니다
lambda_login/node_modules 는 lambda에서 로그인 구현 시 사용한 함수입니다
lambda_vote/node_modules 는 lambda에서 투표 구현 시 사용한 함수입니다


##24.11.28 20시 업데이트 <br>

dynamodb를 이용한 회원가입과 로그인 구현하였습니다
회원가입시 비밀번호 해쉬화 및 저장은 구현하지 못했습니다.