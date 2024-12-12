export interface ScriptContext {
  page: any; // Playwright Page
  data: Record<string, any>;
  log: (message: string) => void;
}

export interface ScriptVariable {
  name: string;
  type: string;
  value: any;
  description?: string;
}

export interface ScriptValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  unusedVariables: string[];
}

export interface ScriptTestResult {
  success: boolean;
  error?: string;
  logs: string[];
  duration: number;
  screenshot?: string;
}

export type ScriptSnippet = {
  name: string;
  description: string;
  code: string;
  variables?: ScriptVariable[];
};

// 자주 사용되는 스크립트 스니펫
export const commonScriptSnippets: ScriptSnippet[] = [
  {
    name: 'Page Navigation',
    description: 'Navigate to a URL',
    code: `await page.goto('https://example.com');`,
  },
  {
    name: 'Click Element',
    description: 'Click an element by selector',
    code: `await page.click('button.submit');`,
  },
  {
    name: 'Fill Form',
    description: 'Fill a form field',
    code: `await page.fill('input[name="username"]', username);`,
  },
  {
    name: 'Wait For Element',
    description: 'Wait for an element to be visible',
    code: `await page.waitForSelector('.loading', { state: 'hidden' });`,
  },
  {
    name: 'Take Screenshot',
    description: 'Capture page screenshot',
    code: `await page.screenshot({ path: 'screenshot.png' });`,
  },
  {
    name: 'Error Handling',
    description: 'Basic error handling template',
    code: \`try {
  // Your code here
  context.log('Operation completed');
} catch (error) {
  context.log('ERROR: ' + error.message);
  throw error;
}\`,
  },
];