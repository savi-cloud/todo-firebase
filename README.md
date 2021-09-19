# Introduction

<b>IMPORTANT : </b> Since, API key is shown in frontend, you must add firestore rules to prevent unauthorized access.

## Setup

+ Create firebase project
+ Add api key to firebaseConfig constant (app.js)
+ Set up firebase project using firebase cli(<a href="https://firebase.google.com/docs/cli">See here</a>)
+ SETUP FIRESTORE RULES

## Firestore rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  
    match /{document=**} {
      allow read, write: if false;
    }
    
    match /tasks/{docId} {
     allow write: if request.auth != null && request.auth.uid == request.resource.data.uid;
     allow delete: if request.auth != null && request.auth.uid == resource.data.uid;
     allow read: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    
  }
}
```