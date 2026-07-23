// One-time migration: uploads the cars from data/cars.ts into Firestore.
// Usage: node scripts/seed-firestore.mjs
import {readFileSync} from "node:fs";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {initializeApp} from "firebase/app";
import {getFirestore, doc, setDoc} from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const line of readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n")) {
  const match = line.match(/^([\w.-]+)=(.*)$/);
  if (match) process.env[match[1]] ??= match[2];
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const {cars} = await import("../data/cars.ts");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

for (const car of cars) {
  await setDoc(doc(db, "cars", car.id), car);
  console.log(`Seeded ${car.id}`);
}

console.log(`Done. Seeded ${cars.length} cars into Firestore.`);
process.exit(0);
