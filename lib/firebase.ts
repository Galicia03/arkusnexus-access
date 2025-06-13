// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDcOM9j0YByn0TvivRqrr3morck0U8ChcQ",
  authDomain: "arkusnexus-access.firebaseapp.com",
  projectId: "arkusnexus-access",
  storageBucket: "arkusnexus-access.appspot.com",
  messagingSenderId: "1060632803623",
  appId: "1:1060632803623:web:10812bd48fb28a5bc1d102",
  measurementId: "G-7XRBDZS71C"
};

// Inicializar la app de Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios que vas a usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
