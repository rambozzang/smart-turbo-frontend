export default {
  nav: {
    // Sections
    overview: 'Overview',
    testing: 'Testing',
    reportsMonitoring: 'Reports & Monitoring',
    configuration: 'Configuration',

    // Menu items
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    allTests: 'All Tests',
    tests: 'Tests',
    createTest: 'Create Test',
    scenarioBuilder: 'Scenario Builder',
    dataParameterization: 'Data Parameterization',
    templates: 'Templates',
    schedules: 'Schedules',
    testReports: 'Test Reports',
    liveMonitoring: 'Live Monitoring',
    performanceTrends: 'Performance Trends',
    integrations: 'Integrations',
    apiKeys: 'API Keys',
    settings: 'Settings',
    documentation: 'Documentation',
    testComparison: 'Test Comparison',
    logout: 'Logout',
    status: {
      online: 'ONLINE',
      offline: 'OFFLINE'
    },
    footer: {
      poweredBy: 'Powered by',
      loadTesting: 'Load Testing'
    }
  },
  dashboard: {
    title: 'Performance Testing Dashboard',
    subtitle: 'Real-time performance metrics and system status',
    totalTests: 'Total Tests',
    completedTests: 'Completed',
    testsThisWeek: 'Tests this week',
    successRate: 'Success Rate',
    avgResponseTime: 'Avg Response Time',
    threshold: 'Threshold',
    systemStatus: 'System Status',
    online: 'Online',
    uptime: 'Uptime',
    recentTests: 'Recent Tests',
    viewAll: 'View All Tests',
    noTests: 'No tests found',
    createFirst: 'Create your first load test to get started'
  },
  testList: {
    title: 'Load Tests',
    subtitle: 'Manage and monitor load test configurations',
    createNew: 'Create New Test',
    search: 'Search tests...',
    filters: {
      all: 'ALL'
    },
    table: {
      name: 'Name',
      type: 'Type',
      config: 'Configuration',
      status: 'Status',
      created: 'Created',
      actions: 'Actions'
    },
    noTests: 'No tests found',
    viewResult: 'View Result',
    runTest: 'Run Test',
    analyze: 'Analyze',
    delete: 'Delete'
  },
  testCreate: {
    title: 'Create Load Test',
    headerTitle: 'smart-turbo-cli',
    testConfig: 'test-config',
    escape: 'ESC',
    metadata: 'TEST_CONFIG.metadata',
    required: '[required]',
    testName: 'test_name',
    testNamePlaceholder: 'production-api-loadtest-2024',
    targetEndpoint: 'target_endpoint',
    targetUrlPlaceholder: 'https://api.production.example.com/v2/health',
    methodology: 'TEST_CONFIG.methodology',
    loadTest: 'LOAD TEST',
    stressTest: 'STRESS TEST',
    spikeTest: 'SPIKE TEST',
    soakTest: 'SOAK TEST',
    loadTestDesc: 'Constant sustained load',
    stressTestDesc: 'Progressive load increase',
    spikeTestDesc: 'Sudden traffic surge',
    soakTestDesc: 'Extended duration stress',
    loadTestMetrics: 'RPS Baseline | P95 Latency | Throughput',
    stressTestMetrics: 'Breaking Point | Max RPS | System Limits',
    spikeTestMetrics: 'Peak Load | Recovery Time | Error Rate',
    soakTestMetrics: 'Memory Leaks | Resource Drift | Stability',
    loadTestUseCase: 'Verify system performance under expected traffic',
    stressTestUseCase: 'Find maximum capacity and failure thresholds',
    spikeTestUseCase: 'Test auto-scaling and burst capacity handling',
    soakTestUseCase: 'Detect long-term degradation and memory issues',
    loadProfile: 'TEST_CONFIG.load_profile',
    virtualUsers: 'virtual_users',
    concurrentConnections: 'concurrent connections',
    testDuration: 'test_duration',
    executionTime: 'execution time',
    customDuration: 'Custom: 15m',
    estimatedMetrics: 'ESTIMATED_METRICS',
    rps: 'RPS',
    reqPerSec: 'req/sec',
    totalReq: 'Total Req',
    requests: 'requests',
    data: 'Data',
    mb: 'MB',
    estP95: 'Est. P95',
    ms: 'ms',
    testType: 'Test Type',
    vus: 'VUs',
    duration: 'Duration',
    target: 'Target',
    systemStatus: 'SYSTEM_STATUS',
    k6Engine: 'k6 Engine',
    ready: 'READY',
    aiGenerator: 'AI Generator',
    online: 'ONLINE',
    backendApi: 'Backend API',
    connected: 'CONNECTED',
    error: 'ERROR',
    executing: 'EXECUTING...',
    executeTest: 'EXECUTE TEST',
    cancel: 'CANCEL',
    executionPipeline: 'EXECUTION_PIPELINE',
    step1: 'Script generation via Claude AI',
    step2: 'k6 engine initialization',
    step3: 'Load test execution',
    step4: 'Metrics collection & analysis',
    step5: 'AI-powered report generation',
    presets: {
      dev: 'DEV',
      stage: 'STAGE',
      prodS: 'PROD-S',
      prodM: 'PROD-M',
      prodL: 'PROD-L',
      prodXL: 'PROD-XL',
      smokeTest: 'Smoke Test',
      quickCheck: 'Quick Check',
      standard: 'Standard',
      extended: 'Extended',
      stability: 'Stability',
      soakTest: 'Soak Test'
    },
    types: {
      LOAD: 'Load Test',
      STRESS: 'Stress Test',
      SPIKE: 'Spike Test',
      SOAK: 'Soak Test'
    },
    typeDescriptions: {
      LOAD: 'Test normal system behavior',
      STRESS: 'Test system limits',
      SPIKE: 'Test sudden traffic increases',
      SOAK: 'Test long-term stability'
    },
    advancedConfig: 'ADVANCED_CONFIG',
    optional: 'optional',
    preview: {
      generating: 'Generating...',
      button: 'Preview k6 Script',
      title: 'k6 Script Preview',
      description: 'Generated test script based on your configuration',
      tip: 'Review the script before executing to ensure it matches your expectations',
      close: 'Close'
    },
    buttons: {
      addHeader: 'Add Header',
      addThreshold: 'Add Threshold',
      addCheck: 'Add Check',
      addVariable: 'Add Variable',
      addTag: 'Add Tag'
    }
  },
  testResults: {
    title: 'Test Results',
    subtitle: 'Comprehensive test performance analysis',
    loading: 'Loading test results...',
    completed: 'Completed',
    executedAt: 'Executed at',
    duration: 'Duration',
    backToTests: 'Back to Tests',
    tabs: {
      metrics: 'Metrics',
      report: 'Detailed Report'
    },
    grade: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      failed: 'Failed',
      notAnalyzed: 'Not Analyzed'
    },
    totalRequests: 'Total Requests',
    avgResponseTime: 'Avg Response Time',
    errorRate: 'Error Rate',
    maxVirtualUsers: 'Max Virtual Users',
    responseTimeDistribution: 'Response Time Distribution',
    performanceGrade: 'Performance Grade',
    requestDistribution: 'Request Distribution',
    statusCodeDistribution: 'Status Code Distribution',
    dataTransfer: 'Data Transfer',
    statusCodes: 'HTTP Status Codes',
    aiAnalysis: 'AI Performance Analysis',
    recommendations: 'Recommendations',
    success: 'Success',
    failed: 'Failed',
    reportLoading: 'Generating report...',
    metrics: {
      requests: 'REQUESTS',
      totalRequests: 'Total Requests',
      avg: 'AVG',
      avgPerformance: 'Performance',
      errors: 'ERRORS',
      failureRate: 'Failure Rate',
      users: 'USERS',
      peakConcurrent: 'Peak Concurrent'
    },
    performance: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    responseTime: {
      title: 'Response Time Distribution',
      average: 'Average',
      p95: '95th Percentile',
      p99: '99th Percentile'
    },
    analysis: {
      title: 'AI Performance Analysis',
      poweredBy: 'Powered by Anthropic',
      summary: 'Executive Summary',
      recommendations: 'Performance Recommendations'
    },
    actions: {
      downloadReport: 'Download Report',
      rerunTest: 'Re-run Test'
    },
    reportDownload: {
      markdown: 'Markdown',
      generateMd: 'Generate MD',
      htmlReport: 'HTML Report'
    },
    advancedDashboard: {
      tabs: {
        overview: 'Overview',
        http: 'HTTP',
        errors: 'Errors',
        performance: 'Performance'
      },
      headers: {
        overallGrade: 'Overall Grade',
        totalRequests: 'Total Requests',
        avgResponse: 'Avg Response',
        errorRate: 'Error Rate',
        maxVUs: 'Max VUs',
        successRate: 'success rate',
        responseTimeDistribution: 'Response Time Distribution',
        statusCodeDistribution: 'Status Code Distribution',
        aiAnalysis: 'AI Performance Analysis',
        recommendations: 'Recommendations',
        httpTimingBreakdown: 'HTTP Request Timing Breakdown',
        detailedHttpMetrics: 'Detailed HTTP Metrics',
        dataTransfer: 'Data Transfer',
        requestRate: 'Request Rate',
        totalErrors: 'Total Errors',
        clientErrors: 'Client Errors (4xx)',
        serverErrors: 'Server Errors (5xx)',
        errorTypeDistribution: 'Error Type Distribution',
        topErrors: 'Top Errors',
        errorStatusCodes: 'Error Status Codes'
      },
      metrics: {
        received: 'Received',
        sent: 'Sent',
        avg: 'Avg',
        p95: 'P95',
        blocked: 'Blocked',
        connecting: 'Connecting',
        waiting: 'Waiting',
        sending: 'Sending',
        receiving: 'Receiving',
        metric: 'Metric',
        statusCode: 'Status Code',
        count: 'Count',
        percentage: 'Percentage',
        description: 'Description',
        ofTotalRequests: 'of total requests',
        ofErrors: 'of errors'
      },
      messages: {
        noStatusData: 'No status code data available',
        noErrors: 'No errors detected!',
        noErrorData: 'No error data available'
      },
      statusCodes: {
        '400': 'Bad Request',
        '401': 'Unauthorized',
        '403': 'Forbidden',
        '404': 'Not Found',
        '405': 'Method Not Allowed',
        '408': 'Request Timeout',
        '429': 'Too Many Requests',
        '500': 'Internal Server Error',
        '502': 'Bad Gateway',
        '503': 'Service Unavailable',
        '504': 'Gateway Timeout',
        'unknown': 'Unknown Error'
      },
      errorLabels: {
        clientErrors: 'Client Errors (4xx)',
        serverErrors: 'Server Errors (5xx)',
        otherErrors: 'Other Errors'
      }
    }
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    noData: 'No data available',
    ms: 'ms',
    seconds: 's',
    minutes: 'm',
    hours: 'h',
    back: 'Back',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    create: 'Create'
  },
  status: {
    PENDING: 'Pending',
    RUNNING: 'Running',
    COMPLETED: 'Completed',
    FAILED: 'Failed'
  },
  analytics: {
    title: 'Analytics Dashboard',
    subtitle: 'Comprehensive test performance insights',
    proFeature: 'PRO Feature',
    totalTests: 'Total Tests',
    successRate: 'Success Rate',
    avgResponse: 'Avg Response',
    thisWeek: 'This Week',
    testTypeDistribution: 'Test Type Distribution',
    testStatus: 'Test Status',
    weeklyActivity: 'Weekly Activity',
    performanceInsights: 'Performance Insights',
    improvements: {
      responseTime: 'Response time improved',
      responseTimeDesc: 'Your average response time decreased by 5ms this week',
      highFrequency: 'High test frequency detected',
      highFrequencyDesc: 'Consider scheduling automated tests to optimize usage',
      attention: 'Some tests need attention',
      attentionDesc: '3 tests have error rates above 5% threshold'
    }
  },
  templates: {
    title: 'Test Templates',
    subtitle: 'Pre-configured test scenarios for common use cases',
    createTemplate: 'Create Template',
    useTemplate: 'Use Template',
    items: {
      apiEndpoint: {
        name: 'API Endpoint Test',
        description: 'Standard REST API endpoint testing with authentication'
      },
      ecommerce: {
        name: 'E-commerce Checkout',
        description: 'Simulate user checkout flow with multiple steps'
      },
      database: {
        name: 'Database Query Load',
        description: 'Heavy database read/write operations testing'
      },
      microservice: {
        name: 'Microservice Health Check',
        description: 'Monitor microservice availability and response times'
      }
    }
  },
  schedules: {
    title: 'Scheduled Tests',
    subtitle: 'Automate recurring performance tests',
    proFeature: 'PRO',
    createSchedule: 'Create Schedule',
    activeSchedules: 'Active Schedules',
    cron: 'Cron',
    nextRun: 'Next',
    active: 'Active',
    paused: 'Paused'
  },
  reports: {
    title: 'Test Reports',
    subtitle: 'Browse and export test reports',
    exportAll: 'Export All',
    availableReports: 'Available Reports',
    noReports: 'No completed tests yet'
  },
  monitoring: {
    title: 'Live Monitoring',
    subtitle: 'Real-time test execution monitoring',
    live: 'Live',
    activeTests: 'Active Tests',
    totalRequests: 'Total Requests',
    avgLatency: 'Avg Latency',
    errorRate: 'Error Rate',
    eventStream: 'Event Stream'
  },
  trends: {
    title: 'Performance Trends',
    subtitle: 'Long-term performance analysis and insights',
    improvement30d: '30-Day Improvement',
    responseTimeDecreased: 'Response time decreased',
    successRate: 'Success Rate',
    fromLastMonth: 'from last month',
    testVolume: 'Test Volume',
    testsThisMonth: 'Tests this month',
    weekTrend: '6-Week Response Time Trend',
    avgResponseTime: 'Avg Response Time'
  },
  integrations: {
    title: 'Integrations',
    subtitle: 'Connect Smart-Turbo with your favorite tools',
    comingSoon: 'Coming Soon',
    connected: 'Connected',
    connect: 'Connect',
    configure: 'Configure',
    items: {
      slack: {
        name: 'Slack',
        description: 'Get real-time test notifications in your Slack workspace'
      },
      github: {
        name: 'GitHub',
        description: 'Integrate with GitHub Actions for CI/CD workflows'
      },
      datadog: {
        name: 'Datadog',
        description: 'Export test metrics to Datadog for centralized monitoring'
      },
      pagerduty: {
        name: 'PagerDuty',
        description: 'Create incidents automatically when tests fail'
      },
      jira: {
        name: 'Jira',
        description: 'Create issues from test failures automatically'
      },
      grafana: {
        name: 'Grafana',
        description: 'Visualize test metrics in Grafana dashboards'
      }
    }
  },
  apiKeys: {
    title: 'API Keys',
    subtitle: 'Manage API keys for programmatic access',
    generateNewKey: 'Generate New Key',
    yourApiKeys: 'Your API Keys',
    created: 'Created',
    lastUsed: 'Last used',
    active: 'Active',
    inactive: 'Inactive',
    apiDocs: {
      title: 'API Documentation',
      description: 'Learn how to use the Smart-Turbo API to integrate load testing into your CI/CD pipeline.',
      viewDocs: 'View API Docs'
    }
  },
  settings: {
    title: 'Settings',
    subtitle: 'Configure your Smart-Turbo preferences',
    appearance: 'Appearance',
    notifications: 'Notifications',
    testDefaults: 'Test Defaults',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark theme for better visibility in low-light environments',
    language: 'Language',
    languageDesc: 'Choose your preferred language',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive test updates via email',
    testCompletion: 'Test Completion',
    testCompletionDesc: 'Notify when tests complete successfully',
    testFailures: 'Test Failures',
    testFailuresDesc: 'Notify immediately when tests fail',
    defaultTestType: 'Default Test Type',
    defaultVUs: 'Default VUs',
    defaultDuration: 'Default Duration',
    timeout: 'Timeout (seconds)',
    resetDefaults: 'Reset to Defaults',
    saveSettings: 'Save Settings'
  },
  login: {
    branding: {
      title: 'Smart Turbo',
      tagline: 'Enterprise Load Testing Platform',
      description: 'Grafana k6 powered performance testing with real-time analytics and distributed execution'
    },
    features: {
      distributed: 'Distributed Load Testing',
      realtime: 'Real-time Monitoring',
      analytics: 'Advanced Analytics',
      cicd: 'CI/CD Integration'
    },
    form: {
      welcome: 'Welcome back',
      subtitle: 'Sign in to your account to continue',
      username: 'Username',
      usernamePlaceholder: 'Enter your username',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      rememberMe: 'Remember me',
      signIn: 'Sign In'
    },
    demo: {
      hint: 'Demo credentials'
    },
    error: {
      invalidCredentials: 'Invalid username or password'
    },
    footer: {
      rights: 'All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
      support: 'Support'
    }
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated',
    introduction: {
      title: 'Introduction',
      content: 'Smart Turbo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our load testing platform.'
    },
    dataCollection: {
      title: 'Information We Collect',
      item1: 'Account information (username, email, password)',
      item2: 'Test configurations and results',
      item3: 'Usage data and analytics',
      item4: 'Technical information (IP address, browser type, device information)'
    },
    dataUsage: {
      title: 'How We Use Your Information',
      content: 'We use the collected information for the following purposes:',
      item1: 'Provide and maintain our service',
      item2: 'Improve and optimize platform performance',
      item3: 'Send service-related notifications',
      item4: 'Analyze usage patterns and trends'
    },
    dataSecurity: {
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your data, including encryption, secure connections, and regular security audits. However, no method of transmission over the Internet is 100% secure.'
    },
    userRights: {
      title: 'Your Rights',
      item1: 'Access your personal data',
      item2: 'Request correction of inaccurate data',
      item3: 'Request deletion of your data',
      item4: 'Object to data processing'
    },
    contact: {
      title: 'Contact Us',
      content: 'If you have questions about this Privacy Policy, please contact us at'
    }
  },
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated',
    acceptance: {
      title: 'Acceptance of Terms',
      content: 'By accessing and using Smart Turbo, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    serviceDescription: {
      title: 'Service Description',
      content: 'Smart Turbo provides a load testing platform with the following features:',
      item1: 'Distributed load testing powered by Grafana k6',
      item2: 'Real-time performance monitoring and analytics',
      item3: 'Test result visualization and reporting',
      item4: 'API integration and CI/CD support'
    },
    userResponsibilities: {
      title: 'User Responsibilities',
      item1: 'Maintain the confidentiality of your account credentials',
      item2: 'Use the service only for lawful purposes',
      item3: 'Not conduct tests against systems without proper authorization',
      item4: 'Comply with all applicable laws and regulations'
    },
    limitations: {
      title: 'Limitations of Liability',
      content: 'Smart Turbo is provided "as is" without warranty of any kind. We shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use or inability to use the service.'
    },
    termination: {
      title: 'Termination',
      content: 'We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.'
    },
    changes: {
      title: 'Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Continued use of the service after such modifications constitutes acceptance of the updated terms.'
    },
    contact: {
      title: 'Contact Information',
      content: 'For questions about these Terms of Service, please contact us at'
    }
  },
  support: {
    title: 'Support Center',
    contactInfo: {
      title: 'Contact Information',
      email: 'Email',
      hours: 'Business Hours',
      hoursValue: 'Monday - Friday, 9:00 AM - 6:00 PM (KST)',
      location: 'Location',
      locationValue: 'Seoul, South Korea'
    },
    faq: {
      title: 'Quick Links',
      item1: 'How do I get started with load testing?',
      item2: 'What are the system requirements?',
      item3: 'How do I interpret test results?',
      item4: 'Troubleshooting common issues'
    },
    form: {
      title: 'Send us a message',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      submit: 'Send Message',
      success: 'Thank you! We will get back to you soon.'
    }
  },
  scenarioBuilder: {
    title: 'Scenario Builder',
    subtitle: 'Create multi-step user journey scenarios',
    buttons: {
      loadExample: 'Load Example',
      validate: 'Validate',
      previewScript: 'Preview Script',
      createTest: 'Create Test',
      loading: 'Loading...',
      creating: 'Creating...'
    },
    mode: {
      gui: 'GUI Mode',
      code: 'Code Mode'
    },
    scenarioInfo: {
      title: 'Scenario Information',
      name: 'Scenario Name',
      namePlaceholder: 'E.g., User Login Flow',
      description: 'Description',
      descriptionPlaceholder: 'Optional description of the scenario',
      baseUrl: 'Base URL',
      baseUrlPlaceholder: 'https://api.example.com',
      globalHeaders: 'Global Headers',
      addHeader: 'Add Header',
      headerName: 'Header name',
      headerValue: 'Header value'
    },
    steps: {
      title: 'Steps',
      count: 'Steps',
      addStep: 'Add Step',
      stepNumber: 'Step',
      edit: 'Edit',
      remove: 'Remove'
    },
    stepEditor: {
      title: 'Add Step',
      name: 'Step Name',
      namePlaceholder: 'E.g., Login',
      method: 'HTTP Method',
      url: 'URL',
      urlHint: 'use ${baseUrl} for base URL, ${variableName} for extracted variables',
      urlPlaceholder: '${baseUrl}/endpoint',
      headers: 'Headers (optional)',
      addButton: 'Add',
      body: 'Request Body (JSON)',
      bodyPlaceholder: '{"key": "value"}',
      thinkTime: 'Think Time',
      thinkTimePlaceholder: '1s',
      thinkTimeHint: 'e.g., 1s, 500ms',
      extractVariables: 'Extract Variables (optional)',
      variableName: 'Variable name (e.g., token)',
      variablePath: 'JSON path (e.g., json.token)',
      checks: 'Response Checks (optional)',
      checkName: 'Check name (e.g., status is 200)',
      checkCondition: 'Condition (e.g., r.status === 200)',
      addStepButton: 'Add Step'
    },
    codeMode: {
      title: 'Scenario JSON'
    },
    preview: {
      title: 'Generated k6 Script',
      close: 'Close'
    },
    testCreation: {
      title: 'Create Test from Scenario',
      testName: 'Test Name',
      testNamePlaceholder: 'E.g., Scenario Test - User Journey',
      testType: 'Test Type',
      vus: 'Virtual Users',
      duration: 'Duration',
      durationHint: 'e.g., 30s, 5m, 1h',
      durationPlaceholder: '5m',
      cancel: 'Cancel',
      create: 'Create Test'
    },
    messages: {
      stepAdded: 'Step added successfully',
      exampleLoaded: 'Example loaded successfully',
      scenarioValid: 'Scenario is valid!',
      scenarioValidWithWarnings: 'Scenario is valid with {count} warning(s)',
      testCreated: 'Test created successfully!',
      stepNameRequired: 'Step name and URL are required',
      testNameRequired: 'Test name is required',
      previewFailed: 'Failed to preview scenario',
      validateFailed: 'Failed to validate scenario',
      createFailed: 'Failed to create test'
    },
    help: {
      title: 'Scenario Builder Usage Guide',
      intro: 'The Scenario Builder allows you to create complex user journeys with multiple API calls.',
      modes: {
        title: 'Mode Selection',
        gui: 'GUI Mode: Build scenarios step-by-step with a visual interface',
        code: 'Code Mode: Write scenarios directly in JSON format'
      },
      steps: {
        title: 'Scenario Creation Steps',
        step1: '1. Enter scenario name and base URL',
        step2: '2. Add global headers if needed',
        step3: '3. Add steps for each API call',
        step4: '4. Extract variables and use them in subsequent steps',
        step5: '5. Add checks to validate responses',
        step6: '6. Validate and preview your scenario',
        step7: '7. Create and run load tests'
      },
      features: {
        title: 'Key Features',
        variables: 'Variable Extraction: Extract values from previous responses to use in next requests',
        thinkTime: 'Think Time: Add delays between steps to simulate real user behavior',
        checks: 'Checks: Validate responses and define success criteria',
        headers: 'Headers: Global or per-step headers for authentication and request configuration'
      },
      examples: {
        title: 'Examples',
        description: 'Click "Load Example" button to see an example e-commerce purchase flow to get started.'
      }
    }
  },
  users: {
    title: 'User Management',
    subtitle: 'Manage system users and permissions',
    empty: 'No users found',
    stats: {
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      admins: 'Administrators',
      managers: 'Managers'
    },
    table: {
      username: 'Username',
      email: 'Email',
      fullName: 'Full Name',
      role: 'Role',
      status: 'Status',
      lastLogin: 'Last Login',
      actions: 'Actions'
    },
    roles: {
      admin: 'Administrator',
      manager: 'Manager',
      tester: 'Tester',
      viewer: 'Viewer'
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
      locked: 'Locked'
    },
    actions: {
      createUser: 'Create User',
      edit: 'Edit',
      delete: 'Delete'
    },
    modal: {
      createTitle: 'Create New User',
      editTitle: 'Edit User'
    },
    form: {
      username: 'Username',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      role: 'Role',
      status: 'Status',
      errors: {
        usernameRequired: 'Username is required',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        passwordTooShort: 'Password must be at least 8 characters'
      }
    },
    delete: {
      title: 'Delete User',
      confirm: 'Are you sure you want to delete user {username}?'
    }
  }
}
