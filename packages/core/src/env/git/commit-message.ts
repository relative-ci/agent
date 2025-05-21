import childProcess from 'child_process';

export function getGitCommitMessage(commit: string = ''): string {
  let message = '';

  try {
    message = childProcess.execSync(`git show -s --format=%B ${commit}`).toString().trim();
  } catch (error) {
    console.warn(`Faild to read the commit message from git: ${error.message}`);
  }

  return message;
}
