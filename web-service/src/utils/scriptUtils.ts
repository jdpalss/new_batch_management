import { TemplateField } from '../types/template';

export const generateScriptTemplate = (fields: TemplateField[]): string => {
  const fieldComments = fields
    .map(field => `  // ${field.name}: ${field.type}${field.required ? ' (required)' : ''}`)
    .join('\n');

  return `async function runScript(context) {
  const { page, data, log } = context;

  // Available dataset fields:
${fieldComments}

  try {
    // Log the start of execution
    log('Starting script execution');

    // Navigate to the target website
    await page.goto('https://example.com');

    // Wait for the page to be ready
    await page.waitForLoadState('networkidle');

    // Example: Fill a form using dataset values
    // await page.fill('#username', data.username);
    // await page.fill('#email', data.email);

    // Example: Click a button
    // await page.click('button[type="submit"]');

    // Example: Wait for navigation
    // await page.waitForNavigation();

    // Example: Take a screenshot
    // await page.screenshot({ path: \`screenshot-\${Date.now()}.png\` });

    log('Script execution completed successfully');
  } catch (error) {
    // Log error details
    context.error('Script execution failed', error);
    throw error;
  }
}`;
};

export const validatePlaywrightScript = (script: string): string[] => {
  const errors: string[] = [];

  try {
    // Basic syntax check
    new Function('context', script);

    // Check for required elements
    if (!script.includes('async function')) {
      errors.push('Script must be defined as an async function');
    }

    if (!script.includes('context.page') && !script.includes('const { page }')) {
      errors.push('Script must use the page object from context');
    }

    if (!script.includes('context.data') && !script.includes('const { data }')) {
      errors.push('Script must use the data object from context');
    }

    if (!script.includes('try') || !script.includes('catch')) {
      errors.push('Script should include error handling with try/catch');
    }

    // Check for common Playwright patterns
    if (!script.includes('await page.')) {
      errors.push('Script should contain Playwright page actions');
    }

    if (!script.includes('context.log') && !script.includes('log(')) {
      errors.push('Script should include logging');
    }

  } catch (error) {
    errors.push(`Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return errors;
};

export const generateSampleScript = (field: TemplateField): string => {
  switch (field.type) {
    case 'text':
    case 'email':
      return `await page.fill('input#${field.name}', data.${field.name});`;
      
    case 'number':
      return `await page.fill('input#${field.name}', data.${field.name}.toString());`;
      
    case 'checkbox':
      return `
if (data.${field.name}) {
  await page.check('input#${field.name}');
} else {
  await page.uncheck('input#${field.name}');
}`;
      
    case 'radio':
      return `await page.check('input[name="${field.name}"][value="' + data.${field.name} + '"]');`;
      
    case 'combo':
      return `await page.selectOption('select#${field.name}', data.${field.name});`;
      
    case 'file':
      return `
// Convert base64 to file and upload
const fileData = data.${field.name}.split(',')[1];
const buffer = Buffer.from(fileData, 'base64');
await page.setInputFiles('input#${field.name}', {
  name: '${field.name}-file',
  mimeType: 'application/octet-stream',
  buffer
});`;
      
    default:
      return `// Handle ${field.name} (${field.type})`;
  }
};