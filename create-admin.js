import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const adminEmail = process.env.ADMIN_EMAIL || 'admin@sanad.com';
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  console.error('❌ Error: ADMIN_PASSWORD environment variable is not set. Please add it to your .env file.');
  process.exit(1);
}

console.log('🚀 Creating Admin User in Firebase Auth...');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    // 1. Create user in Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log(`✅ User created in Firebase Authentication: ${userCredential.user.email}`);

    // 2. Add admin record in Firestore 'users' collection
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: adminEmail,
      uid: userCredential.user.uid,
      role: 'admin',
      dateCreated: new Date().toLocaleDateString()
    });
    console.log('✅ Admin record saved to Firestore.');

    console.log('\n🎉 SUCCESS! You can now log in to the Admin Portal with:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`ℹ️ The email ${adminEmail} is already registered. Attempting to sign in to update admin role...`);
      try {
        const loginCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        await setDoc(doc(db, 'users', loginCredential.user.uid), {
          email: adminEmail,
          uid: loginCredential.user.uid,
          role: 'admin',
          dateCreated: new Date().toISOString().split('T')[0]
        });
        console.log('✅ Existing user signed in and Admin record saved to Firestore.');
        console.log('\n🎉 SUCCESS! You can now log in to the Admin Portal.');
      } catch (loginError) {
        console.error('❌ Failed to sign in existing user to update role. Please ensure ADMIN_PASSWORD is correct in .env:', loginError.message);
      }
    } else {
      console.error('❌ Error creating admin user:', error.message);
      console.log('Ensure "Email/Password" sign-in is enabled in Firebase Console -> Authentication -> Sign-in method.');
    }
  }
  process.exit(0);
}

run();
