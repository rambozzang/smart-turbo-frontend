export default {
  nav: {
    // Sections
    overview: '개요',
    testing: '테스팅',
    reportsMonitoring: '보고서 & 모니터링',
    configuration: '설정',

    // Menu items
    dashboard: '대시보드',
    analytics: '분석',
    allTests: '전체 테스트',
    tests: '테스트',
    createTest: '테스트 생성',
    scenarioBuilder: '시나리오 빌더',
    dataParameterization: '데이터 파라미터화',
    templates: '템플릿',
    schedules: '스케줄',
    testReports: '테스트 보고서',
    liveMonitoring: '실시간 모니터링',
    performanceTrends: '성능 트렌드',
    integrations: '통합',
    apiKeys: 'API 키',
    settings: '설정',
    documentation: '문서',
    testComparison: '테스트 비교',
    logout: '로그아웃',
    status: {
      online: '온라인',
      offline: '오프라인'
    },
    footer: {
      poweredBy: '제공',
      loadTesting: '부하 테스트'
    }
  },
  dashboard: {
    title: '성능 테스트 대시보드',
    subtitle: '실시간 성능 메트릭 및 시스템 상태',
    totalTests: '전체 테스트',
    completedTests: '완료됨',
    testsThisWeek: '이번 주 테스트',
    successRate: '성공률',
    avgResponseTime: '평균 응답시간',
    threshold: '임계값',
    systemStatus: '시스템 상태',
    online: '온라인',
    uptime: '가동시간',
    recentTests: '최근 테스트',
    viewAll: '전체 테스트 보기',
    noTests: '테스트가 없습니다',
    createFirst: '첫 번째 부하 테스트를 생성하여 시작하세요'
  },
  testList: {
    title: '부하 테스트',
    subtitle: '부하 테스트 구성 관리 및 모니터링',
    createNew: '새 테스트 생성',
    search: '테스트 검색...',
    filters: {
      all: '전체'
    },
    table: {
      name: '이름',
      type: '유형',
      config: '설정',
      status: '상태',
      created: '생성일',
      actions: '작업'
    },
    noTests: '테스트가 없습니다',
    viewResult: '결과 보기',
    runTest: '실행',
    analyze: '분석',
    delete: '삭제'
  },
  testCreate: {
    title: '부하 테스트 생성',
    headerTitle: 'smart-turbo-cli',
    testConfig: 'test-config',
    escape: 'ESC',
    metadata: 'TEST_CONFIG.metadata',
    required: '[필수]',
    testName: 'test_name',
    testNamePlaceholder: 'production-api-loadtest-2024',
    targetEndpoint: 'target_endpoint',
    targetUrlPlaceholder: 'https://api.production.example.com/v2/health',
    methodology: 'TEST_CONFIG.methodology',
    loadTest: '부하 테스트',
    stressTest: '스트레스 테스트',
    spikeTest: '스파이크 테스트',
    soakTest: '지구력 테스트',
    loadTestDesc: '일정한 지속 부하',
    stressTestDesc: '점진적 부하 증가',
    spikeTestDesc: '급격한 트래픽 급증',
    soakTestDesc: '장기간 지속 스트레스',
    loadTestMetrics: 'RPS 기준선 | P95 지연시간 | 처리량',
    stressTestMetrics: '한계점 | 최대 RPS | 시스템 한계',
    spikeTestMetrics: '최대 부하 | 복구 시간 | 오류율',
    soakTestMetrics: '메모리 누수 | 리소스 변동 | 안정성',
    loadTestUseCase: '예상 트래픽 하에서 시스템 성능 검증',
    stressTestUseCase: '최대 용량 및 장애 임계값 찾기',
    spikeTestUseCase: '자동 스케일링 및 버스트 용량 처리 테스트',
    soakTestUseCase: '장기적인 성능 저하 및 메모리 문제 탐지',
    loadProfile: 'TEST_CONFIG.load_profile',
    virtualUsers: 'virtual_users',
    concurrentConnections: '동시 접속',
    testDuration: 'test_duration',
    executionTime: '실행 시간',
    customDuration: '사용자 정의: 15m',
    estimatedMetrics: 'ESTIMATED_METRICS',
    rps: 'RPS',
    reqPerSec: 'req/sec',
    totalReq: '전체 요청',
    requests: '요청',
    data: '데이터',
    mb: 'MB',
    estP95: '예상 P95',
    ms: 'ms',
    testType: '테스트 유형',
    vus: 'VUs',
    duration: '지속시간',
    target: '대상',
    systemStatus: 'SYSTEM_STATUS',
    k6Engine: 'k6 엔진',
    ready: '준비완료',
    aiGenerator: 'AI 생성기',
    online: '온라인',
    backendApi: '백엔드 API',
    connected: '연결됨',
    error: '오류',
    executing: '실행 중...',
    executeTest: '테스트 실행',
    cancel: '취소',
    executionPipeline: 'EXECUTION_PIPELINE',
    step1: 'Claude AI를 통한 스크립트 생성',
    step2: 'k6 엔진 초기화',
    step3: '부하 테스트 실행',
    step4: '메트릭 수집 및 분석',
    step5: 'AI 기반 보고서 생성',
    presets: {
      dev: 'DEV',
      stage: 'STAGE',
      prodS: 'PROD-S',
      prodM: 'PROD-M',
      prodL: 'PROD-L',
      prodXL: 'PROD-XL',
      smokeTest: '스모크 테스트',
      quickCheck: '빠른 확인',
      standard: '표준',
      extended: '확장',
      stability: '안정성',
      soakTest: '지구력 테스트'
    },
    types: {
      LOAD: '부하 테스트',
      STRESS: '스트레스 테스트',
      SPIKE: '스파이크 테스트',
      SOAK: '지구력 테스트'
    },
    typeDescriptions: {
      LOAD: '일반적인 시스템 동작 테스트',
      STRESS: '시스템 한계 테스트',
      SPIKE: '급격한 트래픽 증가 테스트',
      SOAK: '장기간 안정성 테스트'
    },
    advancedConfig: '고급 설정',
    optional: '선택사항',
    preview: {
      generating: '생성 중...',
      button: 'k6 스크립트 미리보기',
      title: 'k6 스크립트 미리보기',
      description: '설정을 기반으로 생성된 테스트 스크립트',
      tip: '실행하기 전에 스크립트를 검토하여 예상과 일치하는지 확인하세요',
      close: '닫기'
    },
    buttons: {
      addHeader: '헤더 추가',
      addThreshold: '임계값 추가',
      addCheck: '체크 추가',
      addVariable: '변수 추가',
      addTag: '태그 추가'
    }
  },
  testResults: {
    title: '테스트 결과',
    subtitle: '종합적인 테스트 성능 분석',
    loading: '테스트 결과 로딩 중...',
    completed: '완료됨',
    executedAt: '실행 시각',
    duration: '지속시간',
    backToTests: '테스트로 돌아가기',
    tabs: {
      metrics: '메트릭',
      report: '상세 보고서'
    },
    grade: {
      excellent: '우수',
      good: '양호',
      fair: '보통',
      poor: '미흡',
      failed: '실패',
      notAnalyzed: '분석 안 됨'
    },
    totalRequests: '전체 요청',
    avgResponseTime: '평균 응답시간',
    errorRate: '오류율',
    maxVirtualUsers: '최대 가상 사용자',
    responseTimeDistribution: '응답 시간 분포',
    performanceGrade: '성능 등급',
    requestDistribution: '요청 분포',
    statusCodeDistribution: '상태 코드 분포',
    dataTransfer: '데이터 전송',
    statusCodes: 'HTTP 상태 코드',
    aiAnalysis: 'AI 성능 분석',
    recommendations: '권장사항',
    success: '성공',
    failed: '실패',
    reportLoading: '보고서 생성 중...',
    metrics: {
      requests: '요청',
      totalRequests: '전체 요청',
      avg: '평균',
      avgPerformance: '성능',
      errors: '오류',
      failureRate: '실패율',
      users: '사용자',
      peakConcurrent: '최대 동시접속'
    },
    performance: {
      excellent: '우수',
      good: '양호',
      fair: '보통',
      poor: '미흡'
    },
    responseTime: {
      title: '응답 시간 분포',
      average: '평균',
      p95: '95번째 백분위',
      p99: '99번째 백분위'
    },
    analysis: {
      title: 'AI 성능 분석',
      poweredBy: 'Powered by Anthropic',
      summary: '요약',
      recommendations: '성능 개선 권장사항'
    },
    actions: {
      downloadReport: '보고서 다운로드',
      rerunTest: '테스트 재실행'
    },
    reportDownload: {
      markdown: '마크다운',
      generateMd: 'MD 생성',
      htmlReport: 'HTML 보고서'
    },
    advancedDashboard: {
      tabs: {
        overview: '개요',
        http: 'HTTP',
        errors: '에러',
        performance: '성능'
      },
      headers: {
        overallGrade: '종합 등급',
        totalRequests: '총 요청 수',
        avgResponse: '평균 응답',
        errorRate: '에러율',
        maxVUs: '최대 VU',
        successRate: '성공률',
        responseTimeDistribution: '응답 시간 분포',
        statusCodeDistribution: '상태 코드 분포',
        aiAnalysis: 'AI 성능 분석',
        recommendations: '권장사항',
        httpTimingBreakdown: 'HTTP 요청 타이밍 분석',
        detailedHttpMetrics: '상세 HTTP 메트릭',
        dataTransfer: '데이터 전송',
        requestRate: '요청 속도',
        totalErrors: '총 에러',
        clientErrors: '클라이언트 에러 (4xx)',
        serverErrors: '서버 에러 (5xx)',
        errorTypeDistribution: '에러 타입 분포',
        topErrors: '주요 에러',
        errorStatusCodes: '에러 상태 코드'
      },
      metrics: {
        received: '수신',
        sent: '송신',
        avg: '평균',
        p95: 'P95',
        blocked: '차단됨',
        connecting: '연결 중',
        waiting: '대기 중',
        sending: '전송 중',
        receiving: '수신 중',
        metric: '메트릭',
        statusCode: '상태 코드',
        count: '횟수',
        percentage: '백분율',
        description: '설명',
        ofTotalRequests: '전체 요청 중',
        ofErrors: '에러 중'
      },
      messages: {
        noStatusData: '상태 코드 데이터가 없습니다',
        noErrors: '에러가 감지되지 않았습니다!',
        noErrorData: '에러 데이터가 없습니다'
      },
      statusCodes: {
        '400': '잘못된 요청',
        '401': '인증 필요',
        '403': '접근 금지',
        '404': '찾을 수 없음',
        '405': '허용되지 않는 메서드',
        '408': '요청 시간 초과',
        '429': '너무 많은 요청',
        '500': '내부 서버 오류',
        '502': '불량 게이트웨이',
        '503': '서비스 이용 불가',
        '504': '게이트웨이 시간 초과',
        'unknown': '알 수 없는 오류'
      },
      errorLabels: {
        clientErrors: '클라이언트 에러 (4xx)',
        serverErrors: '서버 에러 (5xx)',
        otherErrors: '기타 에러'
      }
    }
  },
  common: {
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '수정',
    view: '보기',
    close: '닫기',
    search: '검색',
    filter: '필터',
    sort: '정렬',
    noData: '데이터가 없습니다',
    ms: 'ms',
    seconds: '초',
    minutes: '분',
    hours: '시간',
    back: '뒤로',
    page: '페이지',
    of: '/',
    previous: '이전',
    next: '다음',
    create: '생성'
  },
  status: {
    PENDING: '대기 중',
    RUNNING: '실행 중',
    COMPLETED: '완료',
    FAILED: '실패'
  },
  analytics: {
    title: '분석 대시보드',
    subtitle: '종합적인 테스트 성능 인사이트',
    proFeature: 'PRO 기능',
    totalTests: '전체 테스트',
    successRate: '성공률',
    avgResponse: '평균 응답',
    thisWeek: '이번 주',
    testTypeDistribution: '테스트 유형 분포',
    testStatus: '테스트 상태',
    weeklyActivity: '주간 활동',
    performanceInsights: '성능 인사이트',
    improvements: {
      responseTime: '응답 시간 개선됨',
      responseTimeDesc: '이번 주 평균 응답 시간이 5ms 감소했습니다',
      highFrequency: '높은 테스트 빈도 감지',
      highFrequencyDesc: '자동화된 테스트 스케줄링을 고려하여 사용을 최적화하세요',
      attention: '일부 테스트에 주의 필요',
      attentionDesc: '3개의 테스트가 5% 임계값을 초과하는 오류율을 보이고 있습니다'
    }
  },
  templates: {
    title: '테스트 템플릿',
    subtitle: '일반적인 사용 사례를 위한 사전 구성된 테스트 시나리오',
    createTemplate: '템플릿 생성',
    useTemplate: '템플릿 사용',
    items: {
      apiEndpoint: {
        name: 'API 엔드포인트 테스트',
        description: '인증이 포함된 표준 REST API 엔드포인트 테스트'
      },
      ecommerce: {
        name: '이커머스 결제',
        description: '여러 단계로 구성된 사용자 결제 흐름 시뮬레이션'
      },
      database: {
        name: '데이터베이스 쿼리 부하',
        description: '대량의 데이터베이스 읽기/쓰기 작업 테스트'
      },
      microservice: {
        name: '마이크로서비스 헬스 체크',
        description: '마이크로서비스 가용성 및 응답 시간 모니터링'
      }
    }
  },
  schedules: {
    title: '예약된 테스트',
    subtitle: '반복되는 성능 테스트 자동화',
    proFeature: 'PRO',
    createSchedule: '스케줄 생성',
    activeSchedules: '활성 스케줄',
    cron: 'Cron',
    nextRun: '다음 실행',
    active: '활성',
    paused: '일시정지'
  },
  reports: {
    title: '테스트 보고서',
    subtitle: '테스트 보고서 탐색 및 내보내기',
    exportAll: '전체 내보내기',
    availableReports: '사용 가능한 보고서',
    noReports: '아직 완료된 테스트가 없습니다'
  },
  monitoring: {
    title: '실시간 모니터링',
    subtitle: '실시간 테스트 실행 모니터링',
    live: '실시간',
    activeTests: '활성 테스트',
    totalRequests: '전체 요청',
    avgLatency: '평균 지연시간',
    errorRate: '오류율',
    eventStream: '이벤트 스트림'
  },
  trends: {
    title: '성능 트렌드',
    subtitle: '장기적인 성능 분석 및 인사이트',
    improvement30d: '30일 개선도',
    responseTimeDecreased: '응답 시간 감소',
    successRate: '성공률',
    fromLastMonth: '지난 달 대비',
    testVolume: '테스트 볼륨',
    testsThisMonth: '이번 달 테스트',
    weekTrend: '6주 응답 시간 트렌드',
    avgResponseTime: '평균 응답 시간'
  },
  integrations: {
    title: '통합',
    subtitle: 'Smart-Turbo를 즐겨 사용하는 도구와 연결하세요',
    comingSoon: '출시 예정',
    connected: '연결됨',
    connect: '연결',
    configure: '설정',
    items: {
      slack: {
        name: 'Slack',
        description: 'Slack 워크스페이스에서 실시간 테스트 알림 받기'
      },
      github: {
        name: 'GitHub',
        description: 'CI/CD 워크플로우를 위한 GitHub Actions 통합'
      },
      datadog: {
        name: 'Datadog',
        description: '중앙 집중식 모니터링을 위해 Datadog으로 테스트 메트릭 내보내기'
      },
      pagerduty: {
        name: 'PagerDuty',
        description: '테스트 실패 시 자동으로 인시던트 생성'
      },
      jira: {
        name: 'Jira',
        description: '테스트 실패에서 자동으로 이슈 생성'
      },
      grafana: {
        name: 'Grafana',
        description: 'Grafana 대시보드에서 테스트 메트릭 시각화'
      }
    }
  },
  apiKeys: {
    title: 'API 키',
    subtitle: '프로그래매틱 액세스를 위한 API 키 관리',
    generateNewKey: '새 키 생성',
    yourApiKeys: '내 API 키',
    created: '생성됨',
    lastUsed: '마지막 사용',
    active: '활성',
    inactive: '비활성',
    apiDocs: {
      title: 'API 문서',
      description: 'Smart-Turbo API를 사용하여 CI/CD 파이프라인에 부하 테스트를 통합하는 방법을 알아보세요.',
      viewDocs: 'API 문서 보기'
    }
  },
  settings: {
    title: '설정',
    subtitle: 'Smart-Turbo 환경설정',
    appearance: '외관',
    notifications: '알림',
    testDefaults: '테스트 기본값',
    darkMode: '다크 모드',
    darkModeDesc: '어두운 환경에서 더 나은 가시성을 위해 다크 테마 사용',
    language: '언어',
    languageDesc: '선호하는 언어 선택',
    emailNotifications: '이메일 알림',
    emailNotificationsDesc: '이메일로 테스트 업데이트 받기',
    testCompletion: '테스트 완료',
    testCompletionDesc: '테스트가 성공적으로 완료되면 알림',
    testFailures: '테스트 실패',
    testFailuresDesc: '테스트 실패 시 즉시 알림',
    defaultTestType: '기본 테스트 유형',
    defaultVUs: '기본 VUs',
    defaultDuration: '기본 지속시간',
    timeout: '타임아웃 (초)',
    resetDefaults: '기본값으로 재설정',
    saveSettings: '설정 저장'
  },
  login: {
    branding: {
      title: '스마트 터보',
      tagline: '엔터프라이즈 부하 테스트 플랫폼',
      description: 'Grafana k6 기반 실시간 분석 및 분산 실행 성능 테스트'
    },
    features: {
      distributed: '분산 부하 테스트',
      realtime: '실시간 모니터링',
      analytics: '고급 분석',
      cicd: 'CI/CD 통합'
    },
    form: {
      welcome: '환영합니다',
      subtitle: '계속하려면 계정에 로그인하세요',
      username: '사용자명',
      usernamePlaceholder: '사용자명을 입력하세요',
      password: '비밀번호',
      passwordPlaceholder: '비밀번호를 입력하세요',
      showPassword: '비밀번호 표시',
      hidePassword: '비밀번호 숨기기',
      rememberMe: '로그인 상태 유지',
      signIn: '로그인'
    },
    demo: {
      hint: '데모 계정'
    },
    error: {
      invalidCredentials: '사용자명 또는 비밀번호가 올바르지 않습니다'
    },
    footer: {
      rights: '모든 권리 보유.',
      privacy: '개인정보처리방침',
      terms: '이용약관',
      support: '고객지원'
    }
  },
  privacy: {
    title: '개인정보처리방침',
    lastUpdated: '최종 수정일',
    introduction: {
      title: '소개',
      content: '스마트 터보("당사", "저희")는 귀하의 개인정보 보호를 위해 최선을 다하고 있습니다. 본 개인정보처리방침은 귀하가 당사의 부하 테스트 플랫폼을 사용할 때 정보를 수집, 사용, 공개 및 보호하는 방법을 설명합니다.'
    },
    dataCollection: {
      title: '수집하는 정보',
      item1: '계정 정보 (사용자명, 이메일, 비밀번호)',
      item2: '테스트 설정 및 결과',
      item3: '사용 데이터 및 분석 정보',
      item4: '기술 정보 (IP 주소, 브라우저 유형, 기기 정보)'
    },
    dataUsage: {
      title: '정보 사용 방법',
      content: '수집된 정보는 다음 목적으로 사용됩니다:',
      item1: '서비스 제공 및 유지',
      item2: '플랫폼 성능 개선 및 최적화',
      item3: '서비스 관련 알림 발송',
      item4: '사용 패턴 및 트렌드 분석'
    },
    dataSecurity: {
      title: '데이터 보안',
      content: '당사는 암호화, 보안 연결 및 정기적인 보안 감사를 포함한 업계 표준 보안 조치를 구현하여 귀하의 데이터를 보호합니다. 그러나 인터넷을 통한 전송 방법은 100% 안전하지 않습니다.'
    },
    userRights: {
      title: '귀하의 권리',
      item1: '개인정보 열람',
      item2: '부정확한 데이터 수정 요청',
      item3: '데이터 삭제 요청',
      item4: '데이터 처리 거부'
    },
    contact: {
      title: '문의하기',
      content: '본 개인정보처리방침에 대한 문의사항이 있으시면 다음으로 연락해 주세요'
    }
  },
  terms: {
    title: '이용약관',
    lastUpdated: '최종 수정일',
    acceptance: {
      title: '약관 동의',
      content: '스마트 터보에 접속하고 사용함으로써 귀하는 본 약관의 조건에 동의하게 됩니다. 위의 내용에 동의하지 않으시면 본 서비스를 사용하지 마십시오.'
    },
    serviceDescription: {
      title: '서비스 설명',
      content: '스마트 터보는 다음 기능을 제공하는 부하 테스트 플랫폼입니다:',
      item1: 'Grafana k6 기반 분산 부하 테스트',
      item2: '실시간 성능 모니터링 및 분석',
      item3: '테스트 결과 시각화 및 보고',
      item4: 'API 통합 및 CI/CD 지원'
    },
    userResponsibilities: {
      title: '사용자 책임',
      item1: '계정 자격 증명의 기밀 유지',
      item2: '합법적인 목적으로만 서비스 사용',
      item3: '적절한 권한 없이 시스템에 대한 테스트를 수행하지 않음',
      item4: '모든 관련 법률 및 규정 준수'
    },
    limitations: {
      title: '책임의 제한',
      content: '스마트 터보는 어떠한 종류의 보증도 없이 "있는 그대로" 제공됩니다. 당사는 귀하의 서비스 사용 또는 사용 불능으로 인한 간접적, 우발적, 특별, 결과적 또는 징벌적 손해에 대해 책임을 지지 않습니다.'
    },
    termination: {
      title: '해지',
      content: '당사는 본 이용약관을 위반하거나 다른 사용자, 당사 또는 제3자에게 해를 끼친다고 판단되는 행위에 대해 사전 통지 없이 귀하의 계정과 서비스 접근을 종료하거나 일시 중단할 권리를 보유합니다.'
    },
    changes: {
      title: '약관 변경',
      content: '당사는 언제든지 본 약관을 수정할 권리를 보유합니다. 중요한 변경 사항은 이메일 또는 서비스를 통해 사용자에게 알려드립니다. 수정 후 서비스를 계속 사용하면 업데이트된 약관에 동의한 것으로 간주됩니다.'
    },
    contact: {
      title: '연락처 정보',
      content: '본 이용약관에 대한 문의사항은 다음으로 연락해 주세요'
    }
  },
  support: {
    title: '고객지원 센터',
    contactInfo: {
      title: '연락처 정보',
      email: '이메일',
      hours: '운영 시간',
      hoursValue: '월요일 - 금요일, 오전 9시 - 오후 6시 (한국 시간)',
      location: '위치',
      locationValue: '대한민국 서울'
    },
    faq: {
      title: '빠른 링크',
      item1: '부하 테스트를 시작하는 방법은?',
      item2: '시스템 요구 사항은 무엇인가요?',
      item3: '테스트 결과를 해석하는 방법은?',
      item4: '일반적인 문제 해결'
    },
    form: {
      title: '문의 메시지 보내기',
      name: '이름',
      email: '이메일',
      subject: '제목',
      message: '메시지',
      submit: '메시지 보내기',
      success: '감사합니다! 곧 답변드리겠습니다.'
    }
  },
  scenarioBuilder: {
    title: '시나리오 빌더',
    subtitle: '다단계 사용자 여정 시나리오 생성',
    buttons: {
      loadExample: '예제 불러오기',
      validate: '검증',
      previewScript: '스크립트 미리보기',
      createTest: '테스트 생성',
      loading: '로딩 중...',
      creating: '생성 중...'
    },
    mode: {
      gui: 'GUI 모드',
      code: '코드 모드'
    },
    scenarioInfo: {
      title: '시나리오 정보',
      name: '시나리오 이름',
      namePlaceholder: '예: 사용자 로그인 흐름',
      description: '설명',
      descriptionPlaceholder: '시나리오에 대한 선택적 설명',
      baseUrl: '기본 URL',
      baseUrlPlaceholder: 'https://api.example.com',
      globalHeaders: '전역 헤더',
      addHeader: '헤더 추가',
      headerName: '헤더 이름',
      headerValue: '헤더 값'
    },
    steps: {
      title: '단계',
      count: '단계',
      addStep: '단계 추가',
      stepNumber: '단계',
      edit: '수정',
      remove: '제거'
    },
    stepEditor: {
      title: '단계 추가',
      name: '단계 이름',
      namePlaceholder: '예: 로그인',
      method: 'HTTP 메서드',
      url: 'URL',
      urlHint: '기본 URL에는 ${baseUrl}, 추출된 변수에는 ${변수명} 사용',
      urlPlaceholder: '${baseUrl}/endpoint',
      headers: '헤더 (선택사항)',
      addButton: '헤더 추가',
      body: '요청 본문 (JSON)',
      bodyPlaceholder: '{"key": "value"}',
      thinkTime: '대기 시간',
      thinkTimePlaceholder: '1s',
      thinkTimeHint: '예: 1s, 500ms',
      extractVariables: '변수 추출 (선택사항)',
      variableName: '변수 이름 (예: token)',
      variablePath: 'JSON 경로 (예: json.token)',
      checks: '응답 검사 (선택사항)',
      checkName: '검사 이름 (예: status is 200)',
      checkCondition: '조건 (예: r.status === 200)',
      addStepButton: '단계 추가'
    },
    codeMode: {
      title: '시나리오 JSON'
    },
    preview: {
      title: '생성된 k6 스크립트',
      close: '닫기'
    },
    testCreation: {
      title: '시나리오에서 테스트 생성',
      testName: '테스트 이름',
      testNamePlaceholder: '예: 시나리오 테스트 - 사용자 여정',
      testType: '테스트 타입',
      vus: '가상 사용자',
      duration: '지속 시간',
      durationHint: '예: 30s, 5m, 1h',
      durationPlaceholder: '5m',
      cancel: '취소',
      create: '테스트 생성'
    },
    messages: {
      stepAdded: '단계가 성공적으로 추가되었습니다',
      exampleLoaded: '예제가 성공적으로 로드되었습니다',
      scenarioValid: '시나리오가 유효합니다!',
      scenarioValidWithWarnings: '시나리오가 유효하지만 {count}개의 경고가 있습니다',
      testCreated: '테스트가 성공적으로 생성되었습니다!',
      stepNameRequired: '단계 이름과 URL이 필요합니다',
      testNameRequired: '테스트 이름이 필요합니다',
      previewFailed: '시나리오 미리보기 실패',
      validateFailed: '시나리오 검증 실패',
      createFailed: '테스트 생성 실패'
    },
    help: {
      title: '시나리오 빌더 사용 가이드',
      intro: '시나리오 빌더를 사용하면 여러 API 호출로 구성된 복잡한 사용자 여정을 생성할 수 있습니다.',
      modes: {
        title: '모드 선택',
        gui: 'GUI 모드: 시각적 인터페이스로 단계별 시나리오 구성',
        code: '코드 모드: JSON 형식으로 직접 시나리오 작성'
      },
      steps: {
        title: '시나리오 생성 단계',
        step1: '1. 시나리오 이름과 기본 URL 입력',
        step2: '2. 필요한 경우 전역 헤더 추가',
        step3: '3. 각 API 호출에 대한 단계 추가',
        step4: '4. 변수 추출 및 후속 단계에서 사용',
        step5: '5. 응답 검증을 위한 검사 추가',
        step6: '6. 시나리오 검증 및 미리보기',
        step7: '7. 부하 테스트 생성 및 실행'
      },
      features: {
        title: '주요 기능',
        variables: '변수 추출: 이전 응답에서 값을 추출하여 다음 요청에서 사용',
        thinkTime: '대기 시간: 실제 사용자 행동을 시뮬레이션하기 위한 단계 간 지연',
        checks: '검사: 응답 유효성 검사 및 성공 기준 정의',
        headers: '헤더: 인증 및 요청 구성을 위한 전역 또는 단계별 헤더'
      },
      examples: {
        title: '예제',
        description: '시작하려면 "예제 불러오기" 버튼을 클릭하여 전자상거래 구매 흐름 예제를 확인하세요.'
      }
    }
  },
  users: {
    title: '사용자 관리',
    subtitle: '시스템 사용자 및 권한 관리',
    empty: '사용자가 없습니다',
    stats: {
      totalUsers: '전체 사용자',
      activeUsers: '활성 사용자',
      admins: '관리자',
      managers: '매니저'
    },
    table: {
      username: '사용자명',
      email: '이메일',
      fullName: '이름',
      role: '역할',
      status: '상태',
      lastLogin: '마지막 로그인',
      actions: '작업'
    },
    roles: {
      admin: '관리자',
      manager: '매니저',
      tester: '테스터',
      viewer: '뷰어'
    },
    status: {
      active: '활성',
      inactive: '비활성',
      locked: '잠김'
    },
    actions: {
      createUser: '사용자 생성',
      edit: '수정',
      delete: '삭제'
    },
    modal: {
      createTitle: '새 사용자 생성',
      editTitle: '사용자 수정'
    },
    form: {
      username: '사용자명',
      email: '이메일',
      password: '비밀번호',
      fullName: '이름',
      role: '역할',
      status: '상태',
      errors: {
        usernameRequired: '사용자명은 필수입니다',
        emailRequired: '이메일은 필수입니다',
        passwordRequired: '비밀번호는 필수입니다',
        passwordTooShort: '비밀번호는 최소 8자 이상이어야 합니다'
      }
    },
    delete: {
      title: '사용자 삭제',
      confirm: '{username} 사용자를 정말 삭제하시겠습니까?'
    }
  }
}
