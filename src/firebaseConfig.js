import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCSNMrSvWPsZEzAYZwMt7wgwM1nw4rljgM",
  authDomain: "mappymap-cc92b.firebaseapp.com",
  databaseURL: "https://mappymap-cc92b-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "mappymap-cc92b",
  storageBucket: "mappymap-cc92b.appspot.com",
  messagingSenderId: "706072624912",
  appId: "1:706072624912:web:71d5d93ada8a3509246f95",
  measurementId: "G-3SHR599JJT"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);

export { app, auth, database };
