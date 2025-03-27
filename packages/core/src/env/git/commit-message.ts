import childProcess from 'child_process';

export function getGitCommitMessage(): string {
  let message = '';

  try {
    message = childProcess.execSync('git log -1 --pretty=%B').toString().trim();
  } catch (error) {
    console.error('Error reading commit message from git', error);
  }

  return message;
}
