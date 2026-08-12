const {execFileSync} = require('node:child_process');

function git(...args) {
  return execFileSync('git', args, {encoding: 'utf8'}).trim();
}

try {
  if (git('rev-parse', '--is-shallow-repository') !== 'false') {
    throw new Error(
      'The Learn build requires complete Git history to produce reliable sitemap last-modified dates.',
    );
  }

  const commitCount = Number(git('rev-list', '--count', 'HEAD'));
  if (!Number.isInteger(commitCount) || commitCount < 2) {
    throw new Error('The Learn build requires more than one Git commit.');
  }

  console.log(`Verified complete Git history (${commitCount} commits).`);
} catch (error) {
  console.error(`Git history verification failed: ${error.message}`);
  process.exitCode = 1;
}
