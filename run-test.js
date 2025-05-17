const { execSync } = require('child_process');

try {
  // 特定のテストファイルのみを実行
  const testFile = 'src/__tests__/lib/jobQueue.test.ts';
  console.log(`Running test: ${testFile}`);
  
  execSync(`npx jest ${testFile} --no-cache`, { stdio: 'inherit' });
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}
