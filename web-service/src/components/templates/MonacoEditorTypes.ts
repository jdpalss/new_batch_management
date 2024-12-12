export const PlaywrightTypes = `
interface Page {
  // Navigation
  goto(url: string, options?: { timeout?: number; waitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit' }): Promise<void>;
  reload(options?: { timeout?: number; waitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit' }): Promise<void>;
  goBack(options?: { timeout?: number; waitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit' }): Promise<void>;
  goForward(options?: { timeout?: number; waitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit' }): Promise<void>;

  // Actions
  click(selector: string, options?: { button?: 'left'|'right'|'middle'; clickCount?: number; delay?: number }): Promise<void>;
  dblclick(selector: string, options?: { button?: 'left'|'right'|'middle'; delay?: number }): Promise<void>;
  fill(selector: string, value: string, options?: { force?: boolean; noWaitAfter?: boolean }): Promise<void>;
  type(selector: string, text: string, options?: { delay?: number }): Promise<void>;
  press(selector: string, key: string, options?: { delay?: number }): Promise<void>;
  check(selector: string, options?: { force?: boolean }): Promise<void>;
  uncheck(selector: string, options?: { force?: boolean }): Promise<void>;
  selectOption(selector: string, values: string | string[]): Promise<string[]>;

  // Waiting
  waitForTimeout(timeout: number): Promise<void>;
  waitForSelector(selector: string, options?: { state?: 'attached'|'detached'|'visible'|'hidden'; timeout?: number }): Promise<void>;
  waitForLoadState(state?: 'load'|'domcontentloaded'|'networkidle', options?: { timeout?: number }): Promise<void>;
  waitForNavigation(options?: { timeout?: number; waitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit' }): Promise<void>;

  // State
  title(): Promise<string>;
  url(): Promise<string>;
  content(): Promise<string>;
  innerHTML(selector: string): Promise<string>;
  innerText(selector: string): Promise<string>;
  getAttribute(selector: string, name: string): Promise<string | null>;
  isChecked(selector: string): Promise<boolean>;
  isDisabled(selector: string): Promise<boolean>;
  isEditable(selector: string): Promise<boolean>;
  isEnabled(selector: string): Promise<boolean>;
  isHidden(selector: string): Promise<boolean>;
  isVisible(selector: string): Promise<boolean>;

  // Screenshots & Files
  screenshot(options?: { path?: string; fullPage?: boolean }): Promise<Buffer>;
  pdf(options?: { path?: string; format?: string }): Promise<Buffer>;
  setInputFiles(selector: string, files: string | string[]): Promise<void>;

  // Evaluation
  evaluate(pageFunction: Function | string, ...args: any[]): Promise<any>;
  evaluateHandle(pageFunction: Function | string, ...args: any[]): Promise<any>;
}

interface Context {
  page: Page;
  data: Record<string, any>;
  log: (message: string) => void;
}

declare const context: Context;
`;

export const PlaywrightSnippets = [
  {
    label: 'Basic Navigation',
    insertText:
`await page.goto('https://example.com');
await page.waitForLoadState('networkidle');`,
    documentation: 'Navigate to a URL and wait for network to be idle',
  },
  {
    label: 'Click Element',
    insertText:
`await page.click('button[type="submit"]');`,
    documentation: 'Click an element using a selector',
  },
  {
    label: 'Fill Form',
    insertText:
`await page.fill('input[name="username"]', data.username);
await page.fill('input[name="password"]', data.password);
await page.click('button[type="submit"]');`,
    documentation: 'Fill form fields and submit',
  },
  {
    label: 'Wait and Check',
    insertText:
`await page.waitForSelector('.success-message');
const message = await page.innerText('.success-message');
log('Success message: ' + message);`,
    documentation: 'Wait for element and get its text',
  },
  {
    label: 'Error Handling',
    insertText:
`try {
  await page.click('button');
  log('Button clicked successfully');
} catch (error) {
  log('Error: ' + error.message);
  throw error;
}`,
    documentation: 'Basic error handling template',
  },
  {
    label: 'Take Screenshot',
    insertText:
`await page.screenshot({ path: 'screenshot.png', fullPage: true });
log('Screenshot saved');`,
    documentation: 'Capture full page screenshot',
  },
];