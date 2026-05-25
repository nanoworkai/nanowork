/**
 * Test file for Slash Command SDK
 * Run with: npx tsx src/services/__tests__/slashCommandSDK.test.ts
 */

import { SlashCommandSDK } from '../slashCommandSDK';
import fs from 'fs';
import path from 'path';

async function testSlashCommandSDK() {
  console.log('\n🧪 Testing Slash Command SDK\n');
  console.log('='.repeat(60));

  const sdk = new SlashCommandSDK();

  // Test 1: Initialize and discover commands
  console.log('\n1️⃣  INITIALIZING SDK');
  console.log('-'.repeat(60));
  await sdk.initialize();
  const commands = sdk.getAvailableCommands();
  console.log(`✅ Discovered ${commands.length} commands`);
  commands.forEach(cmd => {
    const namespacePart = cmd.namespace ? `${cmd.namespace}:` : '';
    console.log(`   - /${namespacePart}${cmd.name} ${cmd.metadata.description ? `- ${cmd.metadata.description}` : ''}`);
  });

  // Test 2: Get init message
  console.log('\n2️⃣  GET INIT MESSAGE');
  console.log('-'.repeat(60));
  const initMessage = sdk.getInitMessage();
  console.log(`Type: ${initMessage.type}`);
  console.log(`Subtype: ${initMessage.subtype}`);
  console.log(`Available commands: ${initMessage.slash_commands.join(', ')}`);

  // Test 3: Parse slash commands
  console.log('\n3️⃣  PARSE SLASH COMMANDS');
  console.log('-'.repeat(60));
  const testInputs = [
    '/refactor src/app.ts',
    '/test unit backend',
    'regular text not a command',
    '/compact',
  ];

  testInputs.forEach(input => {
    const parsed = sdk.parseSlashCommand(input);
    if (parsed) {
      console.log(`✅ "${input}"`);
      console.log(`   Command: ${parsed.command}`);
      console.log(`   Args: [${parsed.args.join(', ')}]`);
    } else {
      console.log(`❌ "${input}" - Not a slash command`);
    }
  });

  // Test 4: Execute built-in commands
  console.log('\n4️⃣  EXECUTE BUILT-IN COMMANDS');
  console.log('-'.repeat(60));
  const builtinCommands = ['clear', 'compact', 'context'];

  for (const cmd of builtinCommands) {
    const result = await sdk.executeBuiltinCommand(cmd);
    console.log(`/${cmd}:`);
    console.log(`   Status: ${result.subtype}`);
    if (result.result) {
      console.log(`   Result: ${JSON.stringify(result.result)}`);
    }
  }

  // Test 5: Execute custom command with argument replacement
  console.log('\n5️⃣  EXECUTE CUSTOM COMMAND');
  console.log('-'.repeat(60));

  const refactorCmd = sdk.getCommand('refactor');
  if (refactorCmd) {
    const result = await sdk.executeCommand('refactor', ['src/app.ts', 'improve readability']);
    console.log(`Command: /refactor`);
    console.log(`Status: ${result.subtype}`);
    if (result.result) {
      console.log(`Content preview: ${result.result.content.substring(0, 100)}...`);
      console.log(`Args used: [${result.result.args.join(', ')}]`);
    }
  } else {
    console.log('⚠️  /refactor command not found');
  }

  // Test 6: Test command with placeholders
  console.log('\n6️⃣  TEST PLACEHOLDER REPLACEMENT');
  console.log('-'.repeat(60));

  // Create a temporary test command
  const testDir = path.join(process.cwd(), '.claude', 'commands', '__test__');
  const testFile = path.join(testDir, 'placeholder-test.md');

  try {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    fs.writeFileSync(testFile, `---
description: Test placeholder replacement
---
First arg: $1
Second arg: $2
All args: $ARGUMENTS
`);

    // Reinitialize to pick up new command
    await sdk.initialize();

    const result = await sdk.executeCommand('placeholder-test', ['alpha', 'beta', 'gamma']);
    console.log('Placeholder test result:');
    console.log(result.result?.content);

    // Cleanup
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);
  } catch (error) {
    console.error('⚠️  Placeholder test failed:', error);
  }

  // Test 7: Command metadata
  console.log('\n7️⃣  COMMAND METADATA');
  console.log('-'.repeat(60));
  commands.slice(0, 3).forEach(cmd => {
    console.log(`/${cmd.name}:`);
    console.log(`   Description: ${cmd.metadata.description || 'N/A'}`);
    console.log(`   Allowed Tools: ${cmd.metadata.allowedTools?.join(', ') || 'N/A'}`);
    console.log(`   Model: ${cmd.metadata.model || 'default'}`);
    console.log(`   Argument Hint: ${cmd.metadata.argumentHint || 'N/A'}`);
  });

  // Test 8: Error handling
  console.log('\n8️⃣  ERROR HANDLING');
  console.log('-'.repeat(60));

  const nonExistentResult = await sdk.executeCommand('does-not-exist', []);
  console.log(`Non-existent command:`);
  console.log(`   Status: ${nonExistentResult.subtype}`);
  console.log(`   Error: ${nonExistentResult.error}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests if executed directly
if (require.main === module) {
  testSlashCommandSDK().catch(console.error);
}

export { testSlashCommandSDK };
