// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-analytics.js";
import { 
  getFirestore,
  serverTimestamp,
  collection, addDoc,
  query, where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc
 } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-firestore.js";
import { getAuth ,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider, 
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBfEXBOFr09QbCxOAR5mVOgb1bt-tRIEMg",
    authDomain: "todo-e04e7.firebaseapp.com",
    projectId: "todo-e04e7",
    storageBucket: "todo-e04e7.appspot.com",
    messagingSenderId: "485204955907",
    appId: "1:485204955907:web:1e2b4c885e8b6637c84f36",
    measurementId: "G-339RS63K3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app)
const analytics = getAnalytics(app);


const signInGoogleBtn = document.getElementById("signInWithGoogleBtn")
const signInFacebookBtn = document.getElementById("signInWithFacebookBtn")
const signOutBtn = document.getElementById("signOutBtn")

const newTaskInput = document.getElementById("newTask")
const addBtn = document.getElementById("addBtn")

let deleteTaskBtns;

const tasksList = document.getElementById("tasksList")
const whenSignIn = document.getElementById("whenSignIn")
const whenSignOut = document.getElementById("whenSignOut")
const whenSignInTopbar = document.getElementById("whenSignInTopbar")

/* TESTED & WORKING */
// let email = "savina@me.lk"
// let password="veryStrongPassword"
// createUserWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     // Signed in 
//     const user = userCredential.user;
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // ..
// });

signInGoogleBtn.onclick = ()=>{
  signInWithPopup(auth, new GoogleAuthProvider())
  .then((user)=>{
    console.log(`User logged ${user.user.displayName}`);
  })
  .catch((err)=>{console.log(err)})
}

onAuthStateChanged(auth, (user)=>{
  if (user){
    signOutBtn.hidden = false;
    whenSignIn.hidden = false;
    whenSignInTopbar.hidden = false;
    whenSignOut.hidden = true;
    document.getElementById("loggedInAs").innerHTML = `You're signed in as ${user.displayName}`
  }
  else{
    signOutBtn.hidden = true;
    whenSignIn.hidden = true;
    whenSignInTopbar.hidden = true;
    whenSignOut.hidden = false;
    document.getElementById("loggedInAs").innerHTML = ''
  }
})

signOutBtn.onclick = () => {
  signOut(auth);
}

let tasksRef;
let unsubscribe;

//Show, Add, Delete Tasks
onAuthStateChanged(auth, (user)=>{
  if (user){
    tasksRef = collection(db, 'tasks')
    addBtn.onclick = ()=>{
      const taskName = newTaskInput.value
      addDoc(tasksRef, {
        uid: user.uid,
        name: `${taskName}`,
        createdAt: serverTimestamp()
      }).then(
          console.log("successfully added!!")
      ).then(
        newTaskInput.value = ''
      )
      .catch((e)=>{
          console.error("Error adding document: ", e);
      });
    }

    const q = query(tasksRef, orderBy('createdAt'), where("uid", "==", user.uid));
    unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => {
            return `
            <li> ${doc.data().name} 
            <button id="deleteTask" data-taskid="${doc.id}" class="btn btn-warning">Delete</button>
            </li>`
        });

        tasksList.innerHTML = items.join('');

        deleteTaskBtns = document.querySelectorAll("#deleteTask")
        for (let i = 0; i < deleteTaskBtns.length; i++) {
          deleteTaskBtns[i].addEventListener('click', async function(){
            const docId = this.dataset.taskid
            await deleteDoc(doc(db, 'tasks', docId))
          });
        }
    });


  }
  else{
    unsubscribe && unsubscribe();
  }

})


