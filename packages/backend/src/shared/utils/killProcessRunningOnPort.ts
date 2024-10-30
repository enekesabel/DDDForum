import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const killProcessRunningOnPort = async (port: number) => {
  try {
    const platform = process.platform;
    let command;

    if (platform === 'win32') {
      command = `netstat -ano | findstr :${port} | awk '{print $5}' | xargs taskkill /F /PID`;
    } else if (platform === 'darwin' || platform === 'linux') {
      command = `lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`;
    } else {
      throw new Error('Unsupported platform');
    }

    await execAsync(command);
    console.log(`Process running on port ${port} killed successfully.`);
  } catch (error) {
    console.error(`Error killing process on port ${port}:`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
