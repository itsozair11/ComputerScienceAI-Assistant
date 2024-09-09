import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBDkxouSzQ6ukeTMAtHUoI0aKFT3Wpc-BU",
    authDomain: "ai-customer-support-c0e70.firebaseapp.com",
    databaseURL: "https://ai-customer-support-c0e70-default-rtdb.firebaseio.com",
    projectId: "ai-customer-support-c0e70",
    storageBucket: "ai-customer-support-c0e70.appspot.com",
    messagingSenderId: "703417285851",
    appId: "1:703417285851:web:10e41921cf512be919e0fe",
    measurementId: "G-YR97KFBM36"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
