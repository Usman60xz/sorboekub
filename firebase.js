import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHJeTl2Sa4rzPr1O_EIV-TEH9y4nOKRHo",
  authDomain: "digital-equb-a3132.firebaseapp.com",
  projectId: "digital-equb-a3132",
  storageBucket: "digital-equb-a3132.firebasestorage.app",
  messagingSenderId: "266692867979",
  appId: "1:266692867979:web:7110896a5d31e0a26ee18e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;

export { db };