import firebase from 'firebase'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAuHJhJUpFjDEh340oOILZpF51Jm-dFLnY",
    authDomain: "whatsapp-2-4a39c.firebaseapp.com",
    projectId: "whatsapp-2-4a39c",
    storageBucket: "whatsapp-2-4a39c.appspot.com",
    messagingSenderId: "261591540675",
    appId: "1:261591540675:web:941a272d6e5b569df55376",
    measurementId: "G-PGQ3RVS1LM"
}

const app = !firebase.apps.length
    ? firebase.initializeApp(firebaseConfig)
    : firebase.app()

const db = app.firestore()
const auth = app.auth()

const provider = new firebase.auth.GoogleAuthProvider()

export { db, auth, provider }
