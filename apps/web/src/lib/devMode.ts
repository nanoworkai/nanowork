/**
 * Development Mode Utilities
 *
 * Provides mock data and fallbacks when backend is unavailable,
 * allowing frontend developers to work on UI without a running backend.
 */

export const isDevelopment = import.meta.env.DEV;

export interface MockBuild {
  id: string;
  name: string;
  prompt: string;
  status: string;
  last_activity_at: string;
  created_at: string;
}

export interface MockBuildMeta {
  company_name: string;
  tagline: string;
}

export interface MockDeptStartEvent {
  dept: string;
  icon: string;
  task_count: number;
}

export interface MockTaskEvent {
  dept: string;
  task: string;
}

export interface MockDeptDoneEvent {
  dept: string;
  output: string;
}

// Mock data generators
export function generateMockBuild(prompt: string = ''): MockBuild {
  return {
    id: `mock-build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: prompt ? generateMockBuildName(prompt) : 'New Build',
    prompt,
    status: prompt ? 'generating' : 'draft',
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

export function generateMockBuildName(prompt: string): string {
  const words = prompt.split(' ').filter(w => w.length > 3);
  const keyWords = words.slice(0, 3);
  return keyWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'New Project';
}

export function generateMockBuildMeta(prompt: string): MockBuildMeta {
  // Extract key concepts from prompt
  const words = prompt.toLowerCase().split(' ');
  const buzzwords = ['ai', 'platform', 'marketplace', 'network', 'app', 'service', 'tool', 'system'];
  const industry = ['tech', 'social', 'finance', 'health', 'education', 'retail', 'enterprise'];

  const foundBuzzword = buzzwords.find(w => words.some(pw => pw.includes(w))) || 'Platform';
  const foundIndustry = industry.find(w => words.some(pw => pw.includes(w))) || 'Tech';

  const companyName = `${foundIndustry.charAt(0).toUpperCase() + foundIndustry.slice(1)} ${foundBuzzword.charAt(0).toUpperCase() + foundBuzzword.slice(1)}`;

  return {
    company_name: companyName,
    tagline: `Transforming ${foundIndustry} with innovative ${foundBuzzword} solutions`,
  };
}

// Department configuration
export const MOCK_DEPARTMENTS = [
  { name: 'Legal', icon: '⚖️', tasks: 5 },
  { name: 'Brand', icon: '🎨', tasks: 6 },
  { name: 'Web', icon: '🌐', tasks: 8 },
  { name: 'Marketing', icon: '📢', tasks: 7 },
  { name: 'Sales', icon: '💰', tasks: 6 },
  { name: 'Finance', icon: '📊', tasks: 5 },
  { name: 'Ops', icon: '⚙️', tasks: 6 },
];

// Generate mock streaming events
export function* generateMockStreamEvents(prompt: string): Generator<{
  type: string;
  data: unknown;
}> {
  // Meta event
  const meta = generateMockBuildMeta(prompt);
  yield { type: 'meta', data: meta };

  // Process each department
  for (const dept of MOCK_DEPARTMENTS) {
    // Department start
    yield {
      type: 'dept_start',
      data: {
        dept: dept.name,
        icon: dept.icon,
        task_count: dept.tasks,
      },
    };

    // Generate tasks
    const tasks = generateMockTasksForDept(dept.name, dept.tasks);
    for (const task of tasks) {
      yield {
        type: 'task',
        data: {
          dept: dept.name,
          task,
        },
      };
    }

    // Department done
    yield {
      type: 'dept_done',
      data: {
        dept: dept.name,
        output: generateMockOutputForDept(dept.name, meta.company_name),
      },
    };
  }

  // Build complete
  yield { type: 'done', data: {} };
}

function generateMockTasksForDept(dept: string, count: number): string[] {
  const taskTemplates: Record<string, string[]> = {
    Legal: [
      'Reviewing business structure requirements',
      'Drafting terms of service',
      'Creating privacy policy',
      'Analyzing compliance requirements',
      'Setting up legal entity framework',
    ],
    Brand: [
      'Developing brand identity',
      'Creating color palette',
      'Designing logo concepts',
      'Crafting brand voice guidelines',
      'Building visual style system',
      'Generating brand assets',
    ],
    Web: [
      'Architecting application structure',
      'Setting up development environment',
      'Building responsive layouts',
      'Implementing user authentication',
      'Creating database schema',
      'Optimizing performance',
      'Testing cross-browser compatibility',
      'Deploying to production',
    ],
    Marketing: [
      'Analyzing target market',
      'Developing marketing strategy',
      'Creating content calendar',
      'Setting up analytics tracking',
      'Building email campaigns',
      'Designing social media presence',
      'Planning launch strategy',
    ],
    Sales: [
      'Defining pricing strategy',
      'Creating sales funnel',
      'Building lead generation system',
      'Developing pitch materials',
      'Setting up CRM integration',
      'Training sales workflows',
    ],
    Finance: [
      'Setting up accounting systems',
      'Creating financial projections',
      'Establishing payment processing',
      'Building budget framework',
      'Implementing expense tracking',
    ],
    Ops: [
      'Designing operational workflows',
      'Setting up project management',
      'Creating documentation systems',
      'Building team collaboration tools',
      'Implementing monitoring systems',
      'Establishing support processes',
    ],
  };

  const templates = taskTemplates[dept] || [];
  return templates.slice(0, count);
}

function generateMockOutputForDept(dept: string, companyName: string): string {
  const outputs: Record<string, string> = {
    Legal: `Established legal framework for ${companyName} with comprehensive terms of service, privacy policy, and compliance documentation. Entity structure optimized for growth and investor readiness.`,
    Brand: `Created cohesive brand identity for ${companyName} including logo, color system, typography, and comprehensive brand guidelines. All assets ready for immediate deployment across digital and physical channels.`,
    Web: `Deployed production-ready web application for ${companyName} with responsive design, user authentication, secure backend API, and optimized performance. Available at live URL with SSL and CDN configured.`,
    Marketing: `Developed comprehensive go-to-market strategy for ${companyName} with content calendar, social media presence, email campaigns, and analytics tracking. Launch materials ready for immediate distribution.`,
    Sales: `Built complete sales infrastructure for ${companyName} including pricing strategy, lead generation funnels, CRM integration, and sales enablement materials. Ready to start converting prospects.`,
    Finance: `Configured financial systems for ${companyName} with payment processing, accounting integration, expense tracking, and 12-month projections. Revenue operations fully operational.`,
    Ops: `Established operational framework for ${companyName} with project management, documentation, team collaboration, monitoring, and support systems. Infrastructure ready to scale.`,
  };

  return outputs[dept] || `Completed all ${dept} tasks successfully for ${companyName}.`;
}

// Mock SSE stream simulator
export class MockEventSource {
  private events: Array<{ type: string; data: unknown }> = [];
  private currentIndex = 0;
  private intervalId: number | null = null;
  private listeners: Map<string, Array<(event: MessageEvent) => void>> = new Map();
  public readyState: number = 0; // CONNECTING
  public onerror: ((event: Event) => void) | null = null;
  public onopen: ((event: Event) => void) | null = null;

  constructor(private prompt: string) {
    this.events = Array.from(generateMockStreamEvents(prompt));

    // Simulate connection delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
      this.startStreaming();
    }, 500);
  }

  private startStreaming() {
    // Stream events with realistic delay
    this.intervalId = window.setInterval(() => {
      if (this.currentIndex >= this.events.length) {
        this.close();
        return;
      }

      const event = this.events[this.currentIndex];
      this.currentIndex++;

      const messageEvent = new MessageEvent(event.type, {
        data: JSON.stringify(event.data),
      });

      const listeners = this.listeners.get(event.type) || [];
      listeners.forEach(listener => listener(messageEvent));
    }, 300 + Math.random() * 400); // Random delay between 300-700ms
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.readyState = 2; // CLOSED
  }
}

// API wrapper with dev mode fallback
export async function fetchWithDevFallback<T>(
  url: string,
  options: RequestInit = {},
  mockData: T,
  operationName: string = 'API call'
): Promise<{ data: T | null; error: string | null; isMock: boolean }> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);

      // In development, return mock data instead of failing
      if (isDevelopment) {
        console.warn(
          `[DEV MODE] ${operationName} failed (${response.status}), using mock data:`,
          { url, error: errorText, mockData }
        );
        return { data: mockData, error: null, isMock: true };
      }

      return {
        data: null,
        error: `${operationName} failed: ${errorText}`,
        isMock: false,
      };
    }

    const data = await response.json();
    return { data, error: null, isMock: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // In development, return mock data on network error
    if (isDevelopment) {
      console.warn(
        `[DEV MODE] ${operationName} failed (network error), using mock data:`,
        { url, error: errorMsg, mockData }
      );
      return { data: mockData, error: null, isMock: true };
    }

    return {
      data: null,
      error: `${operationName} failed: ${errorMsg}`,
      isMock: false,
    };
  }
}

// Mock data for various API endpoints
export const MOCK_RESPONSES = {
  health: {
    status: 'ok',
    environment: 'development-mock',
    supabase_configured: true,
    anthropic_configured: true,
    stripe_configured: true,
  },
  createBuild: (prompt: string) => ({
    build: generateMockBuild(prompt),
  }),
  listBuilds: () => ({
    builds: [
      {
        id: 'mock-1',
        name: 'Sample Project',
        prompt: 'A platform for connecting creators',
        status: 'complete',
        last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ],
  }),
  generateName: (prompt: string) => ({
    name: generateMockBuildName(prompt),
  }),
};
