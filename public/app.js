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
    signInWithPopup,
    GoogleAuthProvider, 
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-auth.js";

  
const firebaseConfig = {
  // TODO: Add your API Key
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


