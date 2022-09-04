import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  writeBatch, //一批寫入操作，用於作為單個原子單元執行多次寫入。
  query, // 查詢
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUpm_jtPH95dryVXp0_lvUBgCHeTYb7WM",
  authDomain: "crwn-project-db-a8d7e.firebaseapp.com",
  projectId: "crwn-project-db-a8d7e",
  storageBucket: "crwn-project-db-a8d7e.appspot.com",
  messagingSenderId: "1001240242470",
  appId: "1:1001240242470:web:baa529a673df24797ff9e7",
};

initializeApp(firebaseConfig);

// 用 Google 登入的方法
const googleProvider = new GoogleAuthProvider();

// Google provider 設定的參數
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const auth = getAuth();
export const signInWithGooglePopup = () =>
  signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () =>
  signInWithRedirect(auth, googleProvider);

export const db = getFirestore();

// 上傳資料到 firebase上所需要的方法
export const addCollectionAndDocuments = async (
  collectionKey,
  objectsToAdd
) => {
  // 跟下面的創建 user 一樣, 呼叫 db 中的哪一個 collection
  const collectionRef = collection(db, collectionKey);
  // 如何將這些對象作為新的資料檔並儲存在 ref 集合中
  const batch = writeBatch(db);

  // 要增加的對象
  objectsToAdd.forEach((object) => {
    const docRef = doc(collectionRef, object.title.toLowerCase()); // 給定要上傳至哪一個 "collection"
    batch.set(docRef, object);
  });

  await batch.commit(); // 提交任務
  console.log("done");
};

// 從 firebase 的 firestore 取得資料的方法
export const getCategoriesAndDocuments = async () => {
  const collectionRef = collection(db, "categories");
  const q = query(collectionRef);

  const querySnapshot = await getDocs(q);
  const categoryMap = querySnapshot.docs.reduce((acc, docSnapshot) => {
    const { title, items } = docSnapshot.data();
    acc[title.toLowerCase()] = items;
    return acc;
  }, {});

  return categoryMap;
};

// 創建使用者 Auth 的方法
export const createUserDocumentFromAuth = async (
  userAuth,
  additionalInformation = {}
) => {
  if (!userAuth) return;
  const userDocRef = doc(db, "users", userAuth.uid);

  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        createdAt,
        ...additionalInformation,
      });
    } catch (error) {
      console.log("Error creating the user", error.message);
    }
  }

  return userDocRef;
};

export const createAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;

  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;

  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListener = (callback) =>
  onAuthStateChanged(auth, callback);
