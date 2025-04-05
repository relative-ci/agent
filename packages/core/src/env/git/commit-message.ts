import childProcess from 'child_process';

export function getGitCommitMessage(commit: string = ''): string {
  let message = '';

  try {
    message = childProcess.execSync(`git show -s --format=%B ${commit}`).toString().trim();
  } catch (error) {
    console.error('Error reading commit message from git', error);
  }

  return message;
}
