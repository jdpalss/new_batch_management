import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Card, CardBody, CardHeader } from 'reactstrap';

interface BatchScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const BatchScriptEditor: React.FC<BatchScriptEditorProps> = ({
  value,
  onChange,
  readOnly = false
}) => {
  const defaultValue = `async function runScript(context) {
  const { page, data } = context;
  
  // Your Playwright script here
  await page.goto('https://example.com');
  
  // Access dataset values
  const username = data.username;
  
  // Log important information
  context.log('Starting script execution');
  
  try {
    // Add your automation steps here
    
  } catch (error) {
    context.error('Script execution failed', error);
    throw error;
  }
}`;

  return (
    <Card>
      <CardHeader>Playwright Script</CardHeader>
      <CardBody>
        <MonacoEditor
          height="400px"
          defaultValue={defaultValue}
          value={value}
          onChange={value => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            readOnly,
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            language: 'typescript'
          }}
        />
      </CardBody>
    </Card>
  );
};