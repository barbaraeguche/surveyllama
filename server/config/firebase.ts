import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
// const firebaseConfig = {
//   apiKey: "AIzaSyBqlOXMAD9tmYtslhDx8Rn3edd-Aj_PWNg",
//   authDomain: "soen487-surveyllama.firebaseapp.com",
//   projectId: "soen487-surveyllama",
//   storageBucket: "soen487-surveyllama.firebasestorage.app",
//   messagingSenderId: "841996488037",
//   appId: "1:841996488037:web:344be122eeb9de96c3e58c",
//   measurementId: "G-D2W27RBP72",
//   clientEmail: "firebase-adminsdk-fbsvc@soen487-surveyllama.iam.gserviceaccount.com",
//   privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFLwJvz4m7q6da\nRaY0gt1ouDtvFUhbVZJ1BpNZpS/3PeQJ2QCUEwWd6guW9n2ueZY5izdfX+D16HiK\n5bdxhAGbtDBmqzRRp8iWxzY/WHhFS1wPdRpEdOelD4QWCQhMDmkhQy+g7IfkC6K/\nOvwN/KO89sI6ZfUg2myPlKfEQZdp/mZwtH+4vTRDXAofXNaMdtqCYlFJ8IEEFvib\nizqbft0f4BBMpe8Df56fYLyu2fAN4UXxi5HW6Uz8n82wmrTThrbHjS/zXfv3t3v3\nx75bTJPDrJce+HMQmRpOBqIM5gdF10cQy+39HDqCm/p1KQ2XJSUmEVyB/wGH4gyu\nmppmnAMrAgMBAAECggEAFZycaMLXdsFOm19M4y6As+yVXwx3HMOZRMhOuCGZy0B2\nUPn+zTv0fqVbVdV4Wvoqk+4FSKfKkUlEhPy+iWuNfZJXR7l2B4kbPCNjd7frnrSu\nx2bvVRd3GClGMeAVj7h4n1Os0bd7AWyhDtKZM7NAAwMMsLfiERK/mVESvjjuLoip\nO23a8BLfVcE8IbdZ+Y68NQiBEmUm9JQDTCT4RDNkMK8A17h97R7KW1REY7DLvn0V\nXLQM4IA3aKKkuWvgjuueM2Oo8zEQiNgpKGSt3CASJNxTyAwTWQ7KF37cPAc1oMbH\ncrpnoGQzbeybbNqd5nK3QdTQnacLUEhmmsSLvVfmoQKBgQDvABPVTGHEVM6Cm0Bc\nCwO9zSM7syxXj/GkraW7gyZiWUQiYT6A8mNLV30NzOim8KpnRIQkBitcOFlDbPGF\ns/hgXBlFYWJI13jLlx59lGspAzU4royEesWBUcDy58u0xMpZk56zqU5jwUKuGml0\nb95JG8XPPYK8q5m3FJYNwL0XWwKBgQDTNX+LGTdtM2yREbno/fMRK0KAgvptv70f\nLUo8OpuKIkR8hhqjk2tkj9LfCIihxotyuxeNlhx+8FMJbKkmL1aOn5Ahfw7ZFeJ0\nDjJZls4XNvy1tRq7C6WCl/K5fAMiEfuQKoiPTLfIx7D+wBszeJWrX11R8kbYpYzW\ngSLKGEBccQKBgQDpSDkTrK+NNH4yC5oBfZrUS4RFhHkWquDhrcEkSzpPKvSPXj3l\nHTKAWtAshULdl/GsRLt6ci8mn7W5U4BX0jfwzlS4XPrTQMaeak4Po6wJZyEux2lO\n8osP1B2yu0AhnSgp0SZKFUr3oa8VQ6CFT6A32gz1YQPYZuLuSgDBQc0QGwKBgDYH\ngHoX2EryFbrCmxlUJWLl+xwe5Ws/2mRoVI41u+ZJP9XPBG+F3boa5KmzaChiPvf5\njlvk46NBXSyTBG5FO9I+VUOMWkMESyq/Gvg6ELx1j434Jz9kClHvBuOWKsMDcKP/\njXGDAZy2ILv6brrrBPaS7a9x19fB+dZBsKGcNJKxAoGAJpB1AqOPLKVPT90tdtJi\nTjlR5lzLenbgNpZ8KeKDyVqjaYKN+e3KiW4mQ042OyspkNiCVnOjTLENfx2LUtA9\nqekARQCbULJjhik9Nfse7ePWj1yq19Tt1+sLIFsglIX41fUWJxl90yqksZHkJKRz\niUwSWssnC0tnRvaFq//GjFQ=\n-----END PRIVATE KEY-----\n",
// };

// Initialize Firebase
// const analytics = getAnalytics(app);

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase environment variables. Database features will not work.');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional