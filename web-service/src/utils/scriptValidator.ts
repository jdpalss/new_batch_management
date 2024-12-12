import { Template } from '@/types/template';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  unusedFields: string[];
  usedFields: string[];
}

export function validateScript(script: string, template: Template): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    unusedFields: [],
    usedFields: [],
  };

  try {
    // Basic syntax check
    new Function('context', script);

    // Extract field names from template
    const templateFields = new Set(template.fields.map(f => f.name));
    
    // Find field usage in script
    const fieldUsageRegex = /data\.(\w+)/g;
    const usedFields = new Set<string>();
    let match;

    while ((match = fieldUsageRegex.exec(script)) !== null) {
      const fieldName = match[1];
      usedFields.add(fieldName);

      // Check if field exists in template
      if (!templateFields.has(fieldName)) {
        result.errors.push(\`Field "\${fieldName}" is used in script but not defined in template\`);
      }
    }

    // Find unused fields
    templateFields.forEach(field => {
      if (!usedFields.has(field)) {
        result.warnings.push(\`Field "\${field}" is defined but not used in script\`);
        result.unusedFields.push(field);
      } else {
        result.usedFields.push(field);
      }
    });

    // Check for required context usage
    if (!script.includes('context.page')) {
      result.warnings.push('Script does not use context.page. Browser automation may not work.');
    }

    if (!script.includes('context.log')) {
      result.warnings.push('Script does not use logging. This may make debugging difficult.');
    }

    // Check common pitfalls
    if (!script.includes('try') || !script.includes('catch')) {
      result.warnings.push('Script lacks error handling. Consider adding try-catch blocks.');
    }

    if (!script.includes('waitFor')) {
      result.warnings.push('Script may have timing issues. Consider using waitFor methods.');
    }

    // Check script length
    if (script.length > 10000) {
      result.warnings.push('Script is very long. Consider breaking it into smaller functions.');
    }

    result.isValid = result.errors.length === 0;

  } catch (error: any) {
    result.isValid = false;
    result.errors.push(\`Syntax error: \${error.message}\`);
  }

  return result;
}

// 스크립트 포맷팅
export function formatScript(script: string): string {
  try {
    // 간단한 들여쓰기 처리
    const lines = script.split('\\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // 들여쓰기 레벨 조정
      if (trimmedLine.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const formattedLine = '  '.repeat(indentLevel) + trimmedLine;
      
      if (trimmedLine.includes('{')) {
        indentLevel++;
      }
      
      return formattedLine;
    });

    return formattedLines.join('\\n');
  } catch {
    return script;
  }
}

// 기본 스크립트 템플릿 생성
export function generateScriptTemplate(template: Template): string {
  const fieldAssignments = template.fields
    .map(field => \`const \${field.name} = data.\${field.name}; // \${field.type}\`)
    .join('\\n  ');

  return \`async function runScript(context) {
  const { page, data, log } = context;

  // Data fields
  \${fieldAssignments}

  try {
    log('Starting script execution...');
    await page.goto('https://example.com');
    
    // Your automation code here
    
    log('Script completed successfully');
  } catch (error) {
    log('ERROR: ' + error.message);
    throw error;
  }
}

await runScript(context);\`;
}