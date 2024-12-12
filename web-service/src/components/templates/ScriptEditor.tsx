import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Card, CardBody, CardHeader, Button, ButtonGroup } from 'reactstrap';
import { useToasts } from '../../hooks/useToasts';

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
}

const scriptTemplates = {
  basic: `async function runScript(context) {
  const { page, data, log } = context;
  
  try {
    // Log start of execution
    log('Starting script execution');

    // Navigate to target website
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');

    // Example: Working with dynamic data
    const username = data.username;
    log('Using username:', username);

    await page.fill('#username', username);
    await page.click('button[type="submit"]');

    log('Script execution completed');
  } catch (error) {
    context.error('Script execution failed', error);
    throw error;
  }
}`,

  form: `async function runScript(context) {
  const { page, data, log } = context;
  
  try {
    log('Starting form automation');

    await page.goto('https://example.com/form');
    await page.waitForLoadState('networkidle');

    // Fill form using dataset values
    for (const [key, value] of Object.entries(data)) {
      const field = await page.$(\`[name="\${key}"]\`);
      if (field) {
        await field.fill(String(value));
        log(\`Filled \${key} with \${value}\`);
      }
    }

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    log('Form submitted successfully');
  } catch (error) {
    context.error('Form automation failed', error);
    throw error;
  }
}`,

  login: `async function runScript(context) {
  const { page, data, log } = context;
  
  try {
    log('Starting login automation');

    await page.goto('https://example.com/login');
    await page.waitForLoadState('networkidle');

    // Enter credentials from dataset
    await page.fill('input[name="username"]', data.username);
    await page.fill('input[name="password"]', data.password);
    log('Filled login credentials');
    
    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // Verify login
    const logoutButton = await page.$('button:has-text("Logout")');
    if (!logoutButton) {
      throw new Error('Login verification failed');
    }

    log('Login successful');
  } catch (error) {
    context.error('Login failed', error);
    throw error;
  }
}`
};

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  height = '400px'
}) => {
  const { error } = useToasts();
  const [selectedTemplate, setSelectedTemplate] = React.useState<keyof typeof scriptTemplates>('basic');

  useEffect(() => {
    if (!value) {
      onChange(scriptTemplates.basic);
    }
  }, [value, onChange]);

  const handleTemplateChange = (template: keyof typeof scriptTemplates) => {
    try {
      onChange(scriptTemplates[template]);
      setSelectedTemplate(template);
    } catch (err) {
      error('Failed to load template');
    }
  };

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <span>Playwright Script</span>
        {!readOnly && (
          <ButtonGroup size="sm">
            {Object.entries(scriptTemplates).map(([key, _]) => (
              <Button
                key={key}
                color={selectedTemplate === key ? 'primary' : 'secondary'}
                outline
                onClick={() => handleTemplateChange(key as keyof typeof scriptTemplates)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </ButtonGroup>
        )}
      </CardHeader>
      <CardBody>
        <MonacoEditor
          height={height}
          value={value}
          onChange={(value) => onChange(value || '')}
          language="typescript"
          options={{
            minimap: { enabled: false },
            readOnly,
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            tabSize: 2,
            rulers: [80, 120],
            renderWhitespace: 'boundary'
          }}
        />
      </CardBody>
    </Card>
  );
};