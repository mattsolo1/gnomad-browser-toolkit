const { spawnSync } = require('child_process')

process.on('unhandledRejection', err => {
  throw err
})

// Build CJS
console.log('Building CJS...')
const cjsResult = spawnSync(
  'babel',
  [
    '--root-mode=upward',
    'src',
    '--out-dir=lib/cjs',
    '--delete-dir-on-start',
    '--ignore=src/**/*.spec.js,src/**/*.test.js',
  ],
  {
    stdio: 'inherit',
  }
)

if (cjsResult.signal || cjsResult.status !== 0) {
  console.error('CJS build failed')
  process.exit(1)
}

// Build ESM
console.log('Building ESM...')
const esmResult = spawnSync(
  'babel',
  [
    '--root-mode=upward',
    'src',
    '--out-dir=lib/esm',
    '--ignore=src/**/*.spec.js,src/**/*.test.js',
    '--env-name=esm',
  ],
  {
    stdio: 'inherit',
  }
)

if (esmResult.signal || esmResult.status !== 0) {
  console.error('ESM build failed')
  process.exit(1)
}

console.log('Build complete!')
process.exit(0)