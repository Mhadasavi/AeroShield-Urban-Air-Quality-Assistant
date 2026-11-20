import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.cwd(), 'tests', 'aeroshield.test.ts');
const [major, minor] = process.versions.node.split('.').map(Number);

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  return result.status ?? 1;
}

if (major > 22 || (major === 22 && minor >= 18)) {
  process.exit(run(process.execPath, ['--test', target]));
}

if (major === 22 && minor >= 6) {
  process.exit(run(process.execPath, ['--experimental-strip-types', '--test', target]));
}

const tsxBin = path.resolve(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsx.cmd' : 'tsx'
);

if (fs.existsSync(tsxBin)) {
  process.exit(run(tsxBin, ['--test', target]));
}

process.exit(run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsx', '--test', target]));
