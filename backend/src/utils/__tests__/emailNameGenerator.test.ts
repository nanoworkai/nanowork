/**
 * Test file for emailNameGenerator utility
 * Run with: npx tsx src/utils/__tests__/emailNameGenerator.test.ts
 */

import {
  generateUniqueAgentEmail,
  getRandomAgentName,
  getNamePool,
  getNamePoolStats,
} from '../emailNameGenerator';

async function testEmailGeneration() {
  console.log('\n🧪 Testing Email Name Generator\n');
  console.log('=' .repeat(60));

  // Test 1: Name pool statistics
  console.log('\n1️⃣  NAME POOL STATISTICS');
  console.log('-' .repeat(60));
  const stats = getNamePoolStats();
  console.log(`Total names: ${stats.total}`);
  console.log(`Average length: ${stats.avgLength.toFixed(1)} characters`);
  console.log(`Shortest: ${stats.shortest} characters`);
  console.log(`Longest: ${stats.longest} characters`);
  console.log(`All unique: ${stats.unique ? '✅ Yes' : '❌ No (duplicates found!)'}`);

  // Test 2: Sample random names
  console.log('\n2️⃣  SAMPLE RANDOM NAMES (10)');
  console.log('-' .repeat(60));
  const sampleNames = Array.from({ length: 10 }, () => getRandomAgentName());
  console.log(sampleNames.join(', '));

  // Test 3: Generate unique emails
  console.log('\n3️⃣  GENERATE UNIQUE EMAILS (5)');
  console.log('-' .repeat(60));
  for (let i = 0; i < 5; i++) {
    const result = await generateUniqueAgentEmail();
    console.log(`${i + 1}. ${result.email}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Had collision: ${result.hadCollision ? '⚠️  Yes' : '✅ No'}`);
  }

  // Test 4: Show name pool by category
  console.log('\n4️⃣  NAME POOL BY LENGTH');
  console.log('-' .repeat(60));
  const pool = getNamePool();
  const byLength: { [key: number]: string[] } = {};

  pool.forEach(name => {
    const len = name.length;
    if (!byLength[len]) byLength[len] = [];
    byLength[len].push(name);
  });

  Object.keys(byLength)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(len => {
      console.log(`${len} chars (${byLength[len].length} names): ${byLength[len].slice(0, 10).join(', ')}${byLength[len].length > 10 ? '...' : ''}`);
    });

  // Test 5: Sample emails with domain
  console.log('\n5️⃣  EXAMPLE GENERATED EMAILS');
  console.log('-' .repeat(60));
  const examples = [
    'aria@nanowork.ai',
    'nova@nanowork.ai',
    'sage42@nanowork.ai',
    'echo17@nanowork.ai',
    'finn@nanowork.ai',
    'luna23@nanowork.ai',
    'milo@nanowork.ai',
    'reef56@nanowork.ai',
    'skye@nanowork.ai',
    'vale89@nanowork.ai',
  ];
  examples.forEach((email, i) => console.log(`${i + 1}. ${email}`));

  console.log('\n' + '=' .repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests if executed directly
if (require.main === module) {
  testEmailGeneration().catch(console.error);
}

export { testEmailGeneration };
