import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4eGP44p51biVDqW3eMxyINeEHr8DndXo",
  authDomain: "dashboard-varpas.firebaseapp.com",
  projectId: "dashboard-varpas",
  storageBucket: "dashboard-varpas.firebasestorage.app",
  messagingSenderId: "687937734919",
  appId: "1:687937734919:web:837e2bf934c369d6f81da2",
  measurementId: "G-7P11JR0XR8",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
