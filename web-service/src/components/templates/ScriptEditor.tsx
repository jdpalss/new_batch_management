import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Card, CardBody, CardHeader, Button, ButtonGroup } from 'reactstrap';
import { useToasts } from '../../hooks/useToasts';

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
}

const defaultScript = `async function runScript(context) {
  const { page, data, log } = context;
  
  try {
    log('Starting script execution');

    // Navigate to target website
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');

    // Fill form using dataset values
    // await page.fill('#username', data.username);
    // await page.click('button[type="submit"]');

    log('Script execution completed successfully');
  } catch (error) {
    context.error('Script execution failed', error);
    throw error;
  }
}`;

const scriptTemplates = {
  basic: defaultScript,
  form: `async function runScript(context) {
  const { page, data, log } = context;
  
  try {
    log('Starting form automation');

    await page.goto('https://example.com/form');
    await page.waitForLoadState('networkidle');

    // Fill form fields
    for (const [key, value] of Object.entries(data)) {
      const field = await page.\$(\`[name="\${key}"]\`);
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

    // Enter credentials
    await page.fill('input[name="username"]', data.username);
    await page.fill('input[name="password"]', data.password);
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await page.waitForNavigation();
    
    // Verify login
    const logoutButton = await page.$('button:has-text("Logout")');
    if (!logoutButton) {
      throw new Error('Login failed - Logout button not found');
    }

    log('Login successful');
  } catch (error) {
    context.error('Login automation failed', error);
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
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof scriptTemplates>('basic');

  useEffect(() => {
    if (!value) {
      onChange(defaultScript);
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
            {Object.keys(scriptTemplates).map((template) => (
              <Button
                key={template}
                color={selectedTemplate === template ? 'primary' : 'secondary'}
                outline
                onClick={() => handleTemplateChange(template as keyof typeof scriptTemplates)}
              >
                {template.charAt(0).toUpperCase() + template.slice(1)}
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