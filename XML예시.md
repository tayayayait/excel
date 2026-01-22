아래는 `상세서.md`(업무기록 기반 자동 요약·시각화 시스템 UI/UX 상세서, Excel MVP)의 구조를 **누락 없이** 계층화하여, AI가 파싱/이해하기 쉬운 형태로 정리한 **XML 예시**입니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<UIUXSpec
  id="excel-mvp-worklog-uiux-spec"
  lang="ko-KR"
  source="상세서.md"
  title="업무기록 기반 자동 요약·시각화 시스템 UI/UX 상세서 (Excel MVP)"
  version="v0.2"
  lastUpdated="2026-01-22">

  <Meta>
    <Audience>기획/디자인/개발(엑셀 구현) 공통</Audience>
    <CorePhilosophy>“얼마나 했는가”가 아니라 “올바른 방향으로 가고 있는가”를 기록 데이터로 확인한다.</CorePhilosophy>
  </Meta>

  <!-- 0. 문서 목적/범위 -->
  <Section no="0" id="S0" title="문서 목적/범위">
    <Paragraph>직원이 최소 입력(오늘 한 일, 소요시간)만 하면 월간·프로젝트·일간·주간 상태가 자동 요약/시각화되는 Excel 기반 업무 관리 시스템의 UI/UX 구현 기준을 정의한다.</Paragraph>
    <Paragraph>엑셀 MVP에서 바로 구현 가능한 규칙(레이아웃, 색상 팔레트, 컴포넌트 규격, 상호작용, 오류/빈데이터 처리)을 명세 수준으로 제공한다.</Paragraph>
    <Paragraph>추후 웹 확장 시에도 동일한 디자인 토큰(색/타이포/컴포넌트 규칙)을 재사용할 수 있도록 작성한다.</Paragraph>
  </Section>

  <!-- 1. UX 원칙(우선순위) -->
  <Section no="1" id="S1" title="UX 원칙(우선순위)">
    <OrderedList>
      <Item index="1">
        <Title>입력 최소화</Title>
        <Text>직원은 입력 시트 1개만 사용(기본 2필드). 다른 시트는 열람 전용.</Text>
      </Item>
      <Item index="2">
        <Title>판단 자동화</Title>
        <Text>체크/주간 평가 없음. 기록이 있으면 완료로 간주(반복업무), 흐름은 활동/정체로 표시(프로젝트).</Text>
      </Item>
      <Item index="3">
        <Title>이해는 시각화</Title>
        <Text>숫자표 + 추세(스파크라인) + 상태색(신호등)로 즉시 파악.</Text>
      </Item>
      <Item index="4">
        <Title>오류 예방</Title>
        <Text>유효성 검증/예시/자동서식으로 “잘못 쓰기 어렵게”.</Text>
      </Item>
      <Item index="5">
        <Title>일관성</Title>
        <Text>모든 대시보드는 동일한 상단 필터/카드 규격/색 의미를 공유.</Text>
      </Item>
      <Item index="6">
        <Title>확장성</Title>
        <Text>엑셀 UI 규칙을 웹 컴포넌트로 1:1 매핑 가능하도록 토큰화.</Text>
      </Item>
    </OrderedList>
  </Section>

  <!-- 2. 정보구조(Workbook IA) & 내비게이션 -->
  <Section no="2" id="S2" title="정보구조(Workbook IA) &amp; 내비게이션">

    <SubSection no="2.1" id="S2-1" title="시트 구성(권장)">
      <Sheets>
        <Sheet code="00_HOME" access="read-only">홈/설명/바로가기</Sheet>
        <Sheet code="10_INPUT" access="input-only">직원 입력 전용(유일한 입력 접점)</Sheet>
        <Sheet code="20_DAILY" access="read-only">일간 요약(오늘/선택일)</Sheet>
        <Sheet code="30_WEEKLY" access="read-only">주간 평균·비교(이번주 vs 지난주 등)</Sheet>
        <Sheet code="40_MONTHLY" access="read-only">월간 반복업무 이행/분포</Sheet>
        <Sheet code="50_PROJECTS" access="read-only">프로젝트 흐름 + 간트(활동/정체)</Sheet>
        <Sheet code="90_SETTINGS" access="admin">관리자 설정(프로젝트/반복업무/태그 규칙/임계치)</Sheet>
        <Sheet code="99_DATA" access="hidden-read-only">원천/가공 데이터(숨김 권장, 읽기 전용)</Sheet>
      </Sheets>
    </SubSection>

    <SubSection no="2.2" id="S2-2" title="시트 탭(Worksheet Tab) 색 규칙">
      <Rules>
        <Rule id="TAB-INPUT" category="input" colorFamily="Green">입력(직원): “여기만 쓰면 된다”</Rule>
        <Rule id="TAB-DASH" category="dashboard" colorFamily="Blue">대시보드: 열람/분석</Rule>
        <Rule id="TAB-ADMIN" category="admin" colorFamily="Gray">설정/데이터: 관리자 영역</Rule>
      </Rules>
    </SubSection>

    <SubSection no="2.3" id="S2-3" title="내비게이션 규칙">
      <Rules>
        <Rule id="NAV-BAR">
          <Text>모든 대시보드 상단 좌측에 고정 내비게이션 바(홈, 입력, 일간, 주간, 월간, 프로젝트) 버튼 배치.</Text>
          <Implementation>도형(사각형) + 하이퍼링크(해당 시트 A1로 이동)</Implementation>
        </Rule>
        <Rule id="HOME-ENTRY">00_HOME는 사용 안내 + 빠른 이동을 포함(초보자 진입점).</Rule>
        <Rule id="INPUT-MINIMAL">10_INPUT는 가장 단순하게: 메뉴 최소/시각 장식 최소(입력 방해 요소 제거).</Rule>
      </Rules>
    </SubSection>
  </Section>

  <!-- 3. 공통 레이아웃 규칙(Excel 구현 기준) -->
  <Section no="3" id="S3" title="공통 레이아웃 규칙(Excel 구현 기준)">

    <SubSection no="3.1" id="S3-1" title="캔버스(가시 영역) 규격">
      <Bullets>
        <Bullet>기준 해상도: 노트북 14~16&quot;에서 100% 확대(Windows 기본)</Bullet>
        <Bullet>대시보드 주요 콘텐츠는 A~AI 열(약 35~40열) 안에 들어오게 설계(가로 스크롤 최소화)</Bullet>
        <Bullet>각 시트 상단 1~6행은 공통 헤더 영역으로 사용(내비게이션/타이틀/필터/요약)</Bullet>
      </Bullets>
    </SubSection>

    <SubSection no="3.2" id="S3-2" title="공통 헤더 템플릿(행 기준)">
      <Note>모든 대시보드(20~50_*)는 아래 헤더 행 역할을 동일하게 유지.</Note>
      <HeaderRows>
        <Row index="1">패딩(빈 행 또는 얇은 라인)</Row>
        <Row index="2">내비게이션 버튼 영역</Row>
        <Row index="3">화면 타이틀(H1) + 설명 1줄(Caption)</Row>
        <Row index="4-5">필터 바(기간/팀원/프로젝트/초기화)</Row>
        <Row index="6">상단 요약(소형 KPI 또는 상태 메시지)</Row>
      </HeaderRows>
    </SubSection>

    <SubSection no="3.3" id="S3-3" title="틀 고정(Freeze Pane)">
      <Rules>
        <Rule target="dashboard">6행까지 고정(7행부터 스크롤)</Rule>
        <Rule target="input">입력 폼이 사라지지 않도록 8~10행까지 고정</Rule>
      </Rules>
    </SubSection>

    <SubSection no="3.4" id="S3-4" title="표준 행 높이/열 너비(권장값)">
      <Note>실제 화면/폰트에 따라 미세 조정 가능. “일관성”이 최우선이며, 시트별로 제각각이면 안 됨.</Note>
      <RowHeights unit="pt">
        <RowHeight name="패딩 행" range="6~10" />
        <RowHeight name="헤더 행(2~6)" range="20~26" />
        <RowHeight name="본문 기본" value="18" />
        <RowHeight name="카드 제목" value="20" />
        <RowHeight name="KPI 숫자 포함 카드" range="24~32" note="숫자가 잘리지 않도록" />
      </RowHeights>
      <ColumnWidths unit="characters">
        <ColumnWidth name="패딩 열(A)" value="2" />
        <ColumnWidth name="구터(카드 사이 빈 열)" range="2~3" />
        <ColumnWidth name="라벨 열" range="10~14" />
        <ColumnWidth name="KPI/숫자 열" range="8~10" />
        <ColumnWidth name="긴 텍스트 열(업무/프로젝트명)" range="24~40" wrap="true" />
      </ColumnWidths>
    </SubSection>

    <SubSection no="3.5" id="S3-5" title="보호(Protect Sheet) 원칙(권장)">
      <Rules>
        <Rule target="dashboard/settings">셀 잠금(편집 방지), 필터/슬라이서 조작은 허용</Rule>
        <Rule target="input">입력 셀/테이블 입력 열만 편집 허용(나머지 잠금)</Rule>
      </Rules>
    </SubSection>

    <SubSection no="3.6" id="S3-6" title="그리드라인/배경(시각 노이즈 최소화)">
      <Rules>
        <Rule target="dashboard">눈금선 숨김 + 시트 배경 Slate-50로 통일</Rule>
        <Rule target="input">눈금선은 선택(입력 정확도가 우선이면 표시), 배경은 White 유지</Rule>
      </Rules>
    </SubSection>

    <SubSection no="3.7" id="S3-7" title="레이아웃 좌표 표기(추천 기준)">
      <Paragraph>좌표는 Excel A1 기준 표기. 콘텐츠 시작 열은 B로 고정(열 A는 패딩)하며 모든 대시보드에 동일 적용.</Paragraph>
      <Coordinates>
        <Coordinate id="COORD-HEADER" scope="dashboard" value="B1:AI6">공통 헤더 영역</Coordinate>
        <Coordinate id="COORD-BODY-START" scope="dashboard" value="B8">공통 본문 시작 행(8행부터)</Coordinate>
        <Coordinate id="COORD-SPLIT" scope="dashboard" value="B:Q / R:AI">좌/우 2단 분할(권장)</Coordinate>
      </Coordinates>
    </SubSection>

  </Section>

  <!-- 4. 컬러 시스템(토큰) — Excel/웹 공통 -->
  <Section no="4" id="S4" title="컬러 시스템(토큰) — Excel/웹 공통">

    <SubSection no="4.1" id="S4-1" title="기본 팔레트(HEX / RGB)">
      <Note>엑셀 테마 색상(Accent)으로 등록해 재사용.</Note>
      <Palette>
        <Color token="Primary-600" hex="#2563EB" rgb="37,99,235">기본 강조/링크/프로젝트</Color>
        <Color token="Teal-600" hex="#0D9488" rgb="13,148,136">반복업무/지속성</Color>
        <Color token="Amber-500" hex="#F59E0B" rgb="245,158,11">주의/정체 경고</Color>
        <Color token="Red-500" hex="#EF4444" rgb="239,68,68">오류/위험</Color>
        <Color token="Violet-500" hex="#8B5CF6" rgb="139,92,246">학습/개선/실험(선택)</Color>
        <Color token="Slate-900" hex="#0F172A" rgb="15,23,42">본문 텍스트</Color>
        <Color token="Slate-600" hex="#475569" rgb="71,85,105">보조 텍스트</Color>
        <Color token="Slate-200" hex="#E2E8F0" rgb="226,232,240">보더/구분선</Color>
        <Color token="Slate-50" hex="#F8FAFC" rgb="248,250,252">배경</Color>
        <Color token="White" hex="#FFFFFF" rgb="255,255,255">카드 배경</Color>
      </Palette>
    </SubSection>

    <SubSection no="4.2" id="S4-2" title="의미(semantic) 규칙(고정)">
      <SemanticRules>
        <Rule meaning="프로젝트" token="Primary-600" />
        <Rule meaning="반복업무" token="Teal-600" />
        <Rule meaning="정체/주의" token="Amber-500" />
        <Rule meaning="오류/위험" token="Red-500" />
        <Rule meaning="중립(표/축/카드 보더)" token="Slate-200" />
        <Rule meaning="텍스트(본문/보조)" token="Slate-900 / Slate-600" />
      </SemanticRules>
    </SubSection>

    <SubSection no="4.3" id="S4-3" title="상태 표시(색 + 텍스트 동시)">
      <Rule>색만으로 의미를 전달하지 않음. 모든 상태는 뱃지 텍스트를 반드시 포함.</Rule>
      <StatusBadges>
        <Badge key="active" label="활동" colorToken="Primary-600" />
        <Badge key="stalled" label="정체" colorToken="Amber-500" />
        <Badge key="insufficient" label="데이터 부족" colorToken="Slate-200/Amber-500" />
        <Badge key="error" label="오류" colorToken="Red-500" />
      </StatusBadges>
    </SubSection>

    <SubSection no="4.4" id="S4-4" title="조건부서식(틴트) 규칙">
      <Rules>
        <Rule>의미색은 진한 원색을 직접 칠하지 않고 연한 틴트(10~20%)로 배경을 칠함.</Rule>
        <Rule>진한 색은 보더/아이콘/텍스트/막대(차트)에서만 사용.</Rule>
      </Rules>
    </SubSection>

  </Section>

  <!-- 5. 타이포그래피(Excel 구현 기준) -->
  <Section no="5" id="S5" title="타이포그래피(Excel 구현 기준)">

    <SubSection no="5.1" id="S5-1" title="폰트">
      <Fonts>
        <Font role="primary">맑은 고딕</Font>
        <Font role="fallback">Segoe UI</Font>
      </Fonts>
    </SubSection>

    <SubSection no="5.2" id="S5-2" title="텍스트 스타일(셀 스타일로 등록 권장)">
      <TextStyles>
        <Style name="H1" sizePt="18" weight="Bold" colorToken="Slate-900">시트 타이틀</Style>
        <Style name="H2" sizePt="13" weight="Bold" colorToken="Slate-900">섹션 타이틀</Style>
        <Style name="Label" sizePt="10" weight="Semibold" colorToken="Slate-600">필터 라벨/필드명</Style>
        <Style name="Body" sizePt="10.5" weight="Regular" colorToken="Slate-900">일반 텍스트</Style>
        <Style name="Metric" sizePt="20~28" weight="Bold" colorToken="Slate-900">KPI 숫자</Style>
        <Style name="Caption" sizePt="9" weight="Regular" colorToken="Slate-600">보조 설명/주석</Style>
      </TextStyles>
    </SubSection>

    <SubSection no="5.3" id="S5-3" title="숫자/시간 표기(일관 규칙)">
      <Rules>
        <Rule>시간 입력 단위: 분(min) (정수)</Rule>
        <Rule>
          <Text>대시보드 표기:</Text>
          <Bullets>
            <Bullet>합계/평균은 h:mm로 표기(예: 450분 → 7:30)</Bullet>
            <Bullet>필요 시 괄호로 분 병기(예: 1:15 (75m))</Bullet>
          </Bullets>
        </Rule>
        <Rule>소수점 금지. 평균 분은 5분 단위 반올림(권장).</Rule>
      </Rules>
    </SubSection>

  </Section>

  <!-- 6. 컴포넌트 스펙(규격/상태/사용 규칙) -->
  <Section no="6" id="S6" title="컴포넌트 스펙(규격/상태/사용 규칙)">
    <Principle>엑셀에서는 픽셀보다 셀 규격이 중요. 기본 규격은 셀 기반(표/카드)으로 정의. 도형은 버튼/탭 등 최소 범위로 사용.</Principle>

    <Component id="C-BUTTON" no="6.1" name="버튼" en="Button">
      <Usage>
        <Item>시트 이동</Item>
        <Item>필터 초기화</Item>
        <Item optional="true">오늘 기록 추가</Item>
      </Usage>
      <Spec>
        <Height unit="pt" range="20~24" />
        <Width description="3~6열 폭(버튼 텍스트가 한 줄로 유지)" />
      </Spec>
      <Variants>
        <Variant name="Primary" background="Primary-600" textColor="White" />
        <Variant name="Ghost" background="White" border="Slate-200" textColor="Slate-900" />
        <Variant name="Danger" background="Red-500" textColor="White" />
      </Variants>
      <States>
        <State name="Hover">Hover 없음(Excel)</State>
        <State name="Active">선택/활성은 보더 2pt 또는 음영 10% 진하게</State>
      </States>
    </Component>

    <Component id="C-INPUT" no="6.2" name="입력창" en="Input Field" scope="직원 입력용">
      <Composition>
        <Item>상단 “오늘 입력 폼”: 업무(텍스트) + 분(숫자) + 추가 버튼</Item>
        <Item>하단 “누적 로그 표”: 날짜/업무/분(직원 수정 가능/불가 선택)</Item>
      </Composition>
      <Guidance>규칙을 외우지 않게 오른쪽에 예시 2~3개를 항상 표시.</Guidance>
    </Component>

    <Component id="C-CARD" no="6.3" name="카드" en="Card">
      <BaseSpec>
        <Background token="White" />
        <Border token="Slate-200" width="1pt" />
        <Padding>상/하 1행, 좌/우 1열(패딩 열/행으로 확보)</Padding>
      </BaseSpec>
      <Sizes>
        <Size name="Card-S" widthCols="6~8" heightRows="4~5">소형 KPI</Size>
        <Size name="Card-M" widthCols="10~14" heightRows="6~8">기본 KPI/리스트</Size>
        <Size name="Card-L" widthCols="16~24" heightRows="10~16">차트 컨테이너</Size>
      </Sizes>
      <Types>
        <Type name="KPI Card">타이틀 + 큰 숫자(Metric) + 전주대비(▲▼) + 스파크라인(7~14일)</Type>
        <Type name="Status Card">상태 뱃지 + 근거 문장 1줄(예: 최근 7일 기록 없음)</Type>
        <Type name="List Card">Top5 항목(프로젝트/업무) + 합계 시간</Type>
      </Types>
    </Component>

    <Component id="C-BADGE" no="6.4" name="뱃지/칩" en="Badge/Chip">
      <Rules>
        <Rule>높이: 1행 안(14~18pt)</Rule>
        <Rule>배경: 의미색 10~15% 틴트, 텍스트: 의미색 진한 톤</Rule>
        <Rule>동일 의미는 항상 동일 색/단어 사용(예: 정체=Amber+“정체”)</Rule>
      </Rules>
    </Component>

    <Component id="C-TABLE" no="6.5" name="테이블" en="Table">
      <Rules>
        <Rule>Excel “표(Format as Table)” 사용(필터 포함)</Rule>
        <Rule>헤더: Slate-50 배경 + Bold + 하단 보더 Slate-200</Rule>
        <Rule>행 배경: 연한 지그재그(가독성)</Rule>
        <Rule>정렬: 숫자 오른쪽, 텍스트 왼쪽, 날짜 중앙</Rule>
        <Rule>긴 텍스트 컬럼은 줄바꿈 허용(업무/설명), KPI 표는 줄바꿈 금지</Rule>
      </Rules>
    </Component>

    <Component id="C-CHART" no="6.6" name="차트 컨테이너" en="Chart Container">
      <Rules>
        <Rule>차트는 반드시 카드(L) 안에 배치(화이트 배경 + 보더)</Rule>
        <Rule>축/그리드라인은 Slate-200로 얇게</Rule>
        <Rule>범례는 오른쪽 위 또는 아래(차트 영역을 침범하지 않게)</Rule>
      </Rules>
    </Component>

    <Component id="C-MODAL" no="6.7" name="모달/설정 UI" en="Modal/Settings">
      <Paragraph>엑셀 MVP에서 모달은 유지보수 부담이 있으므로 2단계 옵션 정의.</Paragraph>
      <Options>
        <Option id="SETTINGS-SHEET" recommended="true">
          <Title>권장(무매크로): 90_SETTINGS 시트를 “사이드패널”처럼 구성</Title>
          <Bullets>
            <Bullet>좌측: 목록/표</Bullet>
            <Bullet>우측: 선택 항목 상세/편집 폼</Bullet>
          </Bullets>
        </Option>
        <Option id="USERFORM" recommended="false">
          <Title>선택(VBA/Office Scripts): UserForm(모달) 제공</Title>
          <Bullets>
            <Bullet>폭 480~560px</Bullet>
            <Bullet>2열 폼(라벨/입력)</Bullet>
            <Bullet>하단 버튼(저장/취소)</Bullet>
          </Bullets>
        </Option>
      </Options>
    </Component>
  </Section>

  <!-- 7. 입력 UX(직원) — 최소 입력을 지키는 규칙 -->
  <Section no="7" id="S7" title="입력 UX(직원) — 최소 입력을 지키는 규칙">
    <Paragraph>직원이 2필드만 입력해도 분류/집계가 가능하도록, 업무 텍스트에 접두어 규칙을 적용한다.</Paragraph>

    <SubSection no="7.1" id="S7-1" title="업무 텍스트 최소 규격(자동 분류용)">
      <WorkTextRules>
        <Rule key="project" prefix="P:" pattern="P:프로젝트명 | 작업">
          <Example>P:쇼핑몰리뉴얼 | 결제 모듈 오류 재현</Example>
        </Rule>
        <Rule key="recurring" prefix="R:" pattern="R:업무명 | 작업">
          <Example>R:월간정산 | 1월 전표 검수</Example>
        </Rule>
        <Rule key="support" prefix="S:" optional="true" pattern="S:업무명 | 작업" />
        <Rule key="urgent" tag="#긴급" optional="true" position="suffix" />
      </WorkTextRules>
    </SubSection>

    <SubSection no="7.2" id="S7-2" title="유효성 검증(입력 오류 방지)">
      <Rules>
        <Rule>분은 정수(1~720 권장). 범위 밖은 Amber(확인) 또는 Red(오류).</Rule>
        <Rule>업무가 비어있으면 저장/추가 불가(스크립트 사용 시) 또는 행 경고 표시.</Rule>
      </Rules>
    </SubSection>
  </Section>

  <!-- 8. 시트별 UI/UX 상세 설계 -->
  <Section no="8" id="S8" title="시트별 UI/UX 상세 설계">

    <Screen id="SCR-HOME" no="8.1" sheet="00_HOME">
      <Purpose>처음 사용자(직원/리더)가 어디서 입력하고 무엇을 볼지 즉시 이해.</Purpose>
      <RecommendedComposition>
        <Item>상단: 시스템명(H1) + 목적 1문장(Caption)</Item>
        <Item>중앙: 큰 바로가기 카드 5개(입력/일간/주간/월간/프로젝트)</Item>
        <Item>하단: 입력 규칙 요약 + “데이터가 없을 때 화면 안내”</Item>
      </RecommendedComposition>
      <LayoutCoordinates approximate="true">
        <Area name="헤더" range="B1:AI6">타이틀/설명/내비게이션</Area>
        <Area name="바로가기 카드" range="B8:AI22">5개 카드</Area>
        <Area name="사용 가이드" range="B24:AI40">입력 규칙/빈 데이터 안내</Area>
      </LayoutCoordinates>
    </Screen>

    <Screen id="SCR-INPUT" no="8.2" sheet="10_INPUT">
      <Purpose>직원이 최소 입력으로 기록을 남기고, 기록이 데이터로 축적되게 함.</Purpose>
      <Structure>
        <Step index="1">오늘 입력 폼(상단 고정)</Step>
        <Step index="2" optional="true">오늘 요약(소형 KPI 3~4개)</Step>
        <Step index="3">누적 기록 테이블(로그)</Step>
      </Structure>
      <LogTableColumns>
        <Visible>
          <Column>일자</Column>
          <Column>업무</Column>
          <Column>분</Column>
        </Visible>
        <Hidden>
          <Column>구분(P/R/S)</Column>
          <Column>프로젝트명</Column>
          <Column>태그</Column>
          <Column>주차</Column>
          <Column>월</Column>
        </Hidden>
      </LogTableColumns>
      <LayoutCoordinates approximate="true">
        <Area name="타이틀/안내" range="B1:AI3">“입력만 하면 자동 요약” + 최소 규칙</Area>
        <Area name="오늘 입력 폼" range="B4:AI10">업무/분 + 예시 + (선택) 추가 버튼</Area>
        <Area name="오늘 요약(선택)" range="B11:AI15">소형 KPI 3~4개</Area>
        <Area name="누적 로그 표" range="B17:AI120">일자/업무/분(표 형식)</Area>
      </LayoutCoordinates>
    </Screen>

    <Screen id="SCR-DAILY" no="8.3" sheet="20_DAILY">
      <Purpose>선택한 날짜(기본: 오늘)의 “방향성”을 한 화면에 요약.</Purpose>
      <RecommendedComposition>
        <Item>KPI 카드 4개: 총 시간, 프로젝트 시간, 반복업무 시간, 기록 건수</Item>
        <Item>“오늘 한 일” 리스트(업무 Top N + 시간)</Item>
        <Item>시간 분포 차트(구분/프로젝트별)</Item>
        <Item>리스크 신호 카드(반복업무 누락/기록 공백/급격한 편차 등)</Item>
      </RecommendedComposition>
      <EmptyState>
        <Rule>해당 날짜 기록이 없으면 “기록 없음” 상태 카드(Amber) + 차트는 빈 상태 메시지로 대체</Rule>
      </EmptyState>
      <LayoutCoordinates approximate="true">
        <Area name="헤더" range="B1:AI6">타이틀 + 필터 바(날짜/팀원/프로젝트)</Area>
        <Area name="KPI(4개)" range="B8:AI13">총/프로젝트/반복/건수</Area>
        <Area name="오늘 한 일(리스트)" range="B15:Q40">업무 Top N + 시간</Area>
        <Area name="시간 분포(차트)" range="R15:AI40">구분/프로젝트별</Area>
        <Area name="리스크 신호" range="B42:AI55">누락/공백/편차</Area>
      </LayoutCoordinates>
    </Screen>

    <Screen id="SCR-WEEKLY" no="8.4" sheet="30_WEEKLY">
      <Purpose>이번주 vs 지난주(또는 4주 평균)로 “바쁘기만 한지/방향이 맞는지”를 비교.</Purpose>
      <RecommendedComposition>
        <Item>KPI 카드 6개: 이번주 총시간, 지난주 총시간, Δ, 프로젝트 비중, 반복 비중, 기록일수</Item>
        <Item>비교 차트: 일별 총시간 라인(2주 겹침), 구분별 누적 막대(이번주/지난주)</Item>
        <Item>Top 변화: 증가/감소 프로젝트 Top3</Item>
      </RecommendedComposition>
      <LayoutCoordinates approximate="true">
        <Area name="헤더" range="B1:AI6">타이틀 + 주/팀원 필터</Area>
        <Area name="KPI(6개)" range="B8:AI14">2행 배치 권장</Area>
        <Area name="비교 차트(2개)" range="B16:AI40">좌(라인) B:Q / 우(막대) R:AI</Area>
        <Area name="Top 변화" range="B42:AI60">증가/감소 Top3</Area>
      </LayoutCoordinates>
    </Screen>

    <Screen id="SCR-MONTHLY" no="8.5" sheet="40_MONTHLY">
      <Purpose>반복업무를 체크리스트가 아니라 기록 기반 자동 완료로 보이게 함.</Purpose>
      <RecommendedComposition>
        <Item>반복업무 이행률 KPI + 미기록 반복업무 리스트</Item>
        <Item>캘린더 히트맵(일자별 기록 유무/강도)</Item>
        <Item>월간 시간 분포(프로젝트/구분)</Item>
      </RecommendedComposition>
      <RecurringCompletionRules>
        <Rule key="done">완료: 해당 월에 해당 반복업무(R:) 기록이 1건 이상</Rule>
        <Rule key="not_done">미완료: 0건</Rule>
        <Rule key="warning">주의: 월의 70%가 지났는데 미완료(Amber)</Rule>
      </RecurringCompletionRules>
      <LayoutCoordinates approximate="true">
        <Area name="헤더" range="B1:AI6">타이틀 + 월 필터</Area>
        <Area name="반복 KPI/미기록" range="B8:Q26">이행률 + 미기록 리스트</Area>
        <Area name="캘린더 히트맵" range="R8:AI26">일자별 기록 강도</Area>
        <Area name="월간 분포" range="B28:AI55">프로젝트/구분 분포</Area>
      </LayoutCoordinates>
    </Screen>

    <Screen id="SCR-PROJECTS" no="8.6" sheet="50_PROJECTS">
      <Purpose>프로젝트를 보고서가 아니라 활동 흐름(진행/정체/재개)으로 보여줌.</Purpose>
      <RecommendedComposition>
        <Item>프로젝트 상태 카드 그리드(프로젝트명/최근 기록일/최근 N일 투입시간/상태 뱃지)</Item>
        <Item>활동 구간 간트(일 단위): 기록이 있는 날짜 셀을 파랑 틴트로 채움</Item>
        <Item>공백이 길면(예: 7일+) Amber 틴트로 정체 구간 배경 강조</Item>
      </RecommendedComposition>
      <LayoutCoordinates approximate="true">
        <Area name="헤더" range="B1:AI6">타이틀 + 월/프로젝트 필터</Area>
        <Area name="프로젝트 카드 보드" range="B8:AI26">프로젝트 상태 카드 그리드</Area>
        <Area name="활동 구간 간트" range="B28:AI60">일 단위 활동 표시</Area>
        <Area name="최근 기록 목록(선택)" range="B62:AI90" optional="true">선택 프로젝트 상세 로그</Area>
      </LayoutCoordinates>
    </Screen>

    <Screen id="SCR-SETTINGS" no="8.7" sheet="90_SETTINGS">
      <Purpose>자동판단 기준(태그 규칙, 반복업무 목록, 프로젝트 목록, 임계치)을 UI에서 관리.</Purpose>
      <RecommendedTables>
        <Table>프로젝트 목록(프로젝트명, 활성/비활성, 담당(선택))</Table>
        <Table>반복업무 목록(반복명, 주기, 적용월)</Table>
        <Table>태그 규칙(P/R/S 접두어, 긴급 태그 등)</Table>
        <Table>임계치(정체 기준 N일, 이상치 분 기준 등)</Table>
      </RecommendedTables>
      <LayoutCoordinates approximate="true">
        <Area name="헤더" range="B1:AI5">“설정(관리자)” + 주의 문구</Area>
        <Area name="좌측(목록/테이블)" range="B6:Q80">프로젝트/반복업무/태그 테이블</Area>
        <Area name="우측(상세/편집)" range="R6:AI80">선택 항목 편집 폼(사이드패널)</Area>
        <Area name="임계치/룰" range="B82:AI120">정체/이상치 기준, 분류 규칙</Area>
      </LayoutCoordinates>
    </Screen>

  </Section>

  <!-- 9. 상호작용 규칙(필터/드릴다운/리셋) -->
  <Section no="9" id="S9" title="상호작용 규칙(필터/드릴다운/리셋)">
    <SubSection no="9.1" id="S9-1" title="필터 바(공통)">
      <Rules>
        <Rule>위치: 모든 대시보드 상단 우측(4~5행)</Rule>
        <Rule>구성 순서: 기간(월/주/일) → 팀원 → 프로젝트 → 초기화</Rule>
        <Rule>
          <Text>구현 우선순위:</Text>
          <OrderedList>
            <Item index="1">피벗 + 슬라이서/타임라인(권장)</Item>
            <Item index="2">데이터 유효성 드롭다운 + 수식 기반 필터(대안)</Item>
          </OrderedList>
        </Rule>
      </Rules>
    </SubSection>

    <SubSection no="9.2" id="S9-2" title="초기화(Reset)">
      <Rules>
        <Rule>버튼 1개로 “전체 보기”로 복귀</Rule>
        <Rule>초기화 후 상단에 “전체(ALL)” 텍스트 표시(필터 상태 가시화)</Rule>
      </Rules>
    </SubSection>

    <SubSection no="9.3" id="S9-3" title="드릴다운(상세 보기)">
      <Rule>카드 클릭 대신, 카드 우측 상단에 “상세 보기” 텍스트 링크(하이퍼링크)로 통일</Rule>
    </SubSection>
  </Section>

  <!-- 10. 오류/빈 데이터/이상치 UI 처리 규칙 -->
  <Section no="10" id="S10" title="오류/빈 데이터/이상치 UI 처리 규칙">

    <SubSection no="10.1" id="S10-1" title="입력 오류(직원)">
      <Rules>
        <Rule>분이 숫자가 아니면: 셀 배경 Red 틴트 + “숫자(분)만 입력”</Rule>
        <Rule>분이 720 초과(권장 임계치): Amber 틴트 + “장시간(입력 확인)”</Rule>
        <Rule>업무가 비어있으면: 저장/추가 불가(스크립트 사용 시) 또는 경고 표시</Rule>
      </Rules>
    </SubSection>

    <SubSection no="10.2" id="S10-2" title="빈 데이터(대시보드)">
      <Rules>
        <Rule>기간 내 기록이 부족하면(예: 주간 기록일수 2일 이하):</Rule>
        <Bullets>
          <Bullet>KPI는 값 대신 “데이터 부족”</Bullet>
          <Bullet>차트는 빈 상태 메시지로 대체(축/범례만 남지 않게)</Bullet>
        </Bullets>
      </Rules>
    </SubSection>

    <SubSection no="10.3" id="S10-3" title="이상치(해석 왜곡 방지)">
      <Rules>
        <Rule>특정 하루 과도한 분 기록 시: 차트가 찌그러지지 않도록 표시용 상한을 두거나(클램프), 이상치 마커를 분리</Rule>
        <Rule>“이상치 포함” 배지로 투명하게 알림</Rule>
      </Rules>
    </SubSection>
  </Section>

  <!-- 11. 웹 전환을 위한 매핑 규칙(토큰 재사용) -->
  <Section no="11" id="S11" title="웹 전환을 위한 매핑 규칙(토큰 재사용)">
    <SubSection no="11.1" id="S11-1" title="토큰 → CSS 변수(예)">
      <Mappings>
        <Mapping from="Primary-600" to="--color-primary-600" />
        <Mapping from="Slate-50/200/600/900" to="배경/보더/텍스트" />
      </Mappings>
    </SubSection>
    <SubSection no="11.2" id="S11-2" title="반응형 레이아웃(웹 기준 초안)">
      <Breakpoints>
        <Breakpoint name="Desktop" condition="≥1200">3~4열 카드 그리드</Breakpoint>
        <Breakpoint name="Tablet" condition="≥768">2열 카드</Breakpoint>
        <Breakpoint name="Mobile" condition="&lt;768">1열 스택 + 상단 필터는 접기</Breakpoint>
      </Breakpoints>
    </SubSection>
  </Section>

  <!-- 12. 구현 완료 기준(체크리스트) -->
  <Section no="12" id="S12" title="구현 완료 기준(체크리스트)">
    <SubSection no="12.1" id="S12-1" title="일관성">
      <Checklist>
        <Check>모든 대시보드에 공통 내비게이션/필터 바가 존재한다.</Check>
        <Check>색 의미(프로젝트=파랑, 반복=청록, 경고=주황, 오류=빨강)가 전 시트에서 동일하다.</Check>
      </Checklist>
    </SubSection>
    <SubSection no="12.2" id="S12-2" title="입력 경험">
      <Checklist>
        <Check>직원은 10_INPUT에서 2필드(업무/분) 중심으로 기록을 남길 수 있다.</Check>
        <Check>입력 오류가 즉시 시각적으로 식별되고(색/문구), 수정 안내가 명확하다.</Check>
      </Checklist>
    </SubSection>
    <SubSection no="12.3" id="S12-3" title="요약/시각화">
      <Checklist>
        <Check>일간/주간/월간/프로젝트 화면이 데이터가 없을 때도 빈 상태 UI를 제공한다.</Check>
        <Check>프로젝트 화면에서 활동/정체 상태가 한눈에 구분된다.</Check>
      </Checklist>
    </SubSection>
    <SubSection no="12.4" id="S12-4" title="유지보수">
      <Checklist>
        <Check>색/폰트/카드/표 스타일이 셀 스타일/테마 중심으로 구성되어 수정이 쉽다.</Check>
        <Check>도형 사용은 버튼/탭 등 최소 범위로 제한되어 정렬 이슈가 과도하지 않다.</Check>
      </Checklist>
    </SubSection>
  </Section>

</UIUXSpec>
```
