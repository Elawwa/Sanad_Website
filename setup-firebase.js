import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = '872612035774'; // User's project ID/number
const APP_NICKNAME = 'sanad-web-app';

console.log('🔥 Starting Firebase Setup Script...');

try {
  // 1. Check if logged in
  console.log('Checking Firebase login status...');
  try {
    execSync('npx -y firebase-tools@latest login:list', { stdio: 'ignore' });
    console.log('✅ Already authenticated with Firebase CLI.');
  } catch (e) {
    console.log('❌ Not authenticated. Please run "npx firebase login" in your terminal first, then run this script again.');
    process.exit(1);
  }

  // 2. Register Web App
  console.log(`Registering Web App "${APP_NICKNAME}" in project ${PROJECT_ID}...`);
  let appList = '';
  try {
    appList = execSync(`npx -y firebase-tools@latest apps:list --project ${PROJECT_ID}`, { encoding: 'utf8' });
  } catch (e) {
    console.log(`❌ Failed to list apps. Make sure project ${PROJECT_ID} exists and you have access.`);
    console.error(e.message);
    process.exit(1);
  }

  let appId = '';
  const appMatch = appList.match(new RegExp(`│\\s+${APP_NICKNAME}\\s+│\\s+([^\\s]+)\\s+│\\s+WEB\\s+│`));
  if (appMatch) {
    appId = appMatch[1];
    console.log(`✅ Web App already exists (App ID: ${appId}).`);
  } else {
    console.log('Creating new Web App...');
    try {
      const createOutput = execSync(`npx -y firebase-tools@latest apps:create web ${APP_NICKNAME} --project ${PROJECT_ID}`, { encoding: 'utf8' });
      const newAppMatch = createOutput.match(/App ID:\s+([^\s]+)/);
      if (newAppMatch) {
        appId = newAppMatch[1];
        console.log(`✅ Created Web App (App ID: ${appId}).`);
      } else {
        throw new Error('Could not parse App ID from creation output.');
      }
    } catch (e) {
      console.log('❌ Failed to create Web App.');
      console.error(e.message);
      process.exit(1);
    }
  }

  // 3. Get SDK Config
  console.log(`Fetching SDK config for Web App ${appId}...`);
  let sdkConfigStr = '';
  try {
    sdkConfigStr = execSync(`npx -y firebase-tools@latest apps:sdkconfig WEB ${appId} --project ${PROJECT_ID}`, { encoding: 'utf8' });
  } catch (e) {
    console.log('❌ Failed to fetch SDK config.');
    console.error(e.message);
    process.exit(1);
  }

  // Extract config object
  const configMatch = sdkConfigStr.match(/const firebaseConfig = ({[\s\S]*?});/);
  if (!configMatch) {
    console.log('❌ Could not parse Firebase config object from output.');
    console.log(sdkConfigStr);
    process.exit(1);
  }

  // Parse config JS object safely using evaluation or regex
  const configBody = configMatch[1];
  const config = {};
  const keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  keys.forEach(key => {
    const r = new RegExp(`${key}:\\s*"([^"]+)"`);
    const m = configBody.match(r);
    if (m) {
      config[key] = m[1];
    }
  });

  console.log('✅ Successfully retrieved Firebase Config:');
  console.log(config);

  // 4. Update .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const envVars = {
    VITE_FIREBASE_API_KEY: config.apiKey,
    VITE_FIREBASE_AUTH_DOMAIN: config.authDomain,
    VITE_FIREBASE_PROJECT_ID: config.projectId,
    VITE_FIREBASE_STORAGE_BUCKET: config.storageBucket,
    VITE_FIREBASE_MESSAGING_SENDER_ID: config.messagingSenderId,
    VITE_FIREBASE_APP_ID: config.appId
  };

  Object.entries(envVars).forEach(([key, val]) => {
    if (!val) return;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${val}`);
    } else {
      envContent += `\n${key}=${val}`;
    }
  });

  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  console.log('✅ Updated .env file with Firebase configuration.');

  // 5. Create .firebaserc
  const rcPath = path.join(process.cwd(), '.firebaserc');
  const rcContent = JSON.stringify({
    projects: {
      default: PROJECT_ID
    }
  }, null, 2);
  fs.writeFileSync(rcPath, rcContent, 'utf8');
  console.log('✅ Created .firebaserc file.');

  console.log('\n🎉 Firebase setup complete! You can now run "npm run dev:all" or refresh your browser.');
} catch (err) {
  console.error('❌ An unexpected error occurred during setup:', err);
}
