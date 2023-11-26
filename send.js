const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

const buildDir = 'build';
const remotePath = 'root@kuremendocino.com:/var/www/pwa.kuremendocino.com/';
const concurrency = 5;  // Number of concurrent scp processes

async function listFiles(directory) {
  console.log(`Listing files in directory: ${directory}`);
  const entries = await fs.readdir(directory, { withFileTypes: true });

  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  console.log(`Found ${files.length} files in directory: ${directory}`);
  return files;
}

function scpFile(filePath) {
  return new Promise((resolve, reject) => {
    const remoteFilePath = path.join(remotePath, path.relative(buildDir, filePath));
    const remoteDir = path.dirname(remoteFilePath);

    // Create the directory on the remote server first
    const mkdirCommand = `ssh ${remotePath.split(':')[0]} "mkdir -p ${remoteDir}"`;
    exec(mkdirCommand, (error) => {
      if (error) {
        console.error(`Error creating directory ${remoteDir} on remote server:`, error.message);
        reject(error);
        return;
      }

      // Then transfer the file
      console.log(`Transferring file: ${filePath} to ${remoteFilePath}`);
      const scpCommand = `scp ${filePath} ${remoteFilePath}`;
      exec(scpCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error transferring ${filePath}:`, error.message);
          reject(error);
        } else {
          console.log(`Successfully transferred: ${filePath}`);
          resolve(filePath);
        }
      });
    });
  });
}

async function main() {
  const files = await listFiles(buildDir);
  console.log(`Total files to transfer: ${files.length}`);

  const promises = [];
  for (let i = 0; i < concurrency && i < files.length; i++) {
    promises.push(scpFile(files[i]));
  }

  let index = concurrency;
  while (index < files.length) {
    await Promise.race(promises);
    promises.push(scpFile(files[index]));
    index++;
  }

  await Promise.all(promises);
  console.log('All files transferred.');
}

main().catch(error => {
  console.error('Error in main function:', error);
});
