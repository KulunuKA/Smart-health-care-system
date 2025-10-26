#!/usr/bin/env node

/**
 * Test Runner Script for Payment Controller Tests
 * 
 * This script provides an easy way to run the comprehensive test suite
 * with proper configuration and coverage reporting.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Payment Controller Unit Tests...\n');

try {
  // Change to backend directory
  process.chdir(path.join(__dirname, '..'));

  // Run tests with coverage
  const testCommand = 'npm run test:ci';
  console.log(`Executing: ${testCommand}\n`);
  
  execSync(testCommand, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ All tests completed successfully!');
  console.log('📊 Coverage report generated in coverage/ directory');
  
} catch (error) {
  console.error('\n❌ Tests failed!');
  console.error('Error:', error.message);
  process.exit(1);
}
