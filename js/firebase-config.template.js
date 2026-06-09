// PureScan Firebase Client Configuration & Helpers
// Exposes the global 'PureFirebase' object for the application

const firebaseConfig = {
  projectId: "[[FIREBASE_PROJECT_ID]]",
  appId: "[[FIREBASE_APP_ID]]",
  storageBucket: "[[FIREBASE_STORAGE_BUCKET]]",
  apiKey: "[[FIREBASE_API_KEY]]",
  authDomain: "[[FIREBASE_AUTH_DOMAIN]]",
  messagingSenderId: "[[FIREBASE_MESSAGING_SENDER_ID]]",
  projectNumber: "[[FIREBASE_PROJECT_NUMBER]]"
};

<<<<<<< HEAD
let PureFirebase;

try {
  if (typeof firebase !== 'undefined') {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Explicitly set persistence to LOCAL
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(err => console.warn("[PureScan] Auth persistence set error:", err.message));

    PureFirebase = {
      auth: firebase.auth(),
      db: firebase.firestore(),
      storage: firebase.storage(),
=======
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const PureFirebase = {
  auth: firebase.auth(),
  db: firebase.firestore(),
  storage: firebase.storage(),
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc

  // Current logged in user profile cache
  currentUserProfile: null,

  // ----------------------------------------------------
  // AUTH SYSTEM
  // ----------------------------------------------------
  
  // Register Email + Password & Create Profile
  async register(email, password, profileData) {
    const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    // Fallback logic for display name to prevent "Unknown" profiles
    const name = (profileData.name && profileData.name.trim()) ? profileData.name.trim() : (email.split('@')[0] || 'User');

    // Send profile display name to Auth
    await userCredential.user.updateProfile({
      displayName: name
    });

    const completeProfile = {
      uid: uid,
      email: email,
      displayName: name,
      name: name,
      photoURL: null,
      gender: profileData.gender || 'Male',
      age: profileData.age || 25,
      goal: profileData.goal || 'Maintain Health',
      activity: profileData.activity || 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      subscription: 'free',
      role: 'user',
      settings: {
        theme: 'dark',
        lang: 'en',
        uiTheme: 'default',
        seenUpdateV110: true,
        onboardingCompleted: true
      },
      scanCount: 0,
      analysisCount: 0
    };

    // Save profile to FireStore collections
    await this.db.collection('users').doc(uid).set(completeProfile);
    await this.db.collection('userProfiles').doc(uid).set(completeProfile);

    this.currentUserProfile = completeProfile;
    return userCredential.user;
  },

  // Login Email + Password
  async login(email, password) {
    const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    // Update lastLogin timestamp in Firestore
    await this.db.collection('users').doc(uid).update({
      lastLogin: new Date().toISOString()
    });
    await this.db.collection('userProfiles').doc(uid).update({
      lastLogin: new Date().toISOString()
    });

    // Load profile
    await this.loadUserProfile(uid);
    return userCredential.user;
  },

  // Logout
  async logout() {
    await this.auth.signOut();
    this.currentUserProfile = null;
  },

  // Reset Password (Forgot Password)
  async resetPassword(email) {
    await this.auth.sendPasswordResetEmail(email);
  },

  // Load user profile from Firestore
  async loadUserProfile(uid) {
    const doc = await this.db.collection('userProfiles').doc(uid).get();
    if (doc.exists) {
      this.currentUserProfile = doc.data();
      return this.currentUserProfile;
    }
    return null;
  },

  // Update user profile fields in Firestore
  async updateProfile(profileData) {
    if (!this.auth.currentUser) throw new Error("User not authenticated");
    const uid = this.auth.currentUser.uid;

    const updates = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    await this.db.collection('userProfiles').doc(uid).update(updates);
    
    // Also update users collection
    const userUpdates = {};
    if (profileData.name) userUpdates.displayName = profileData.name;
    if (profileData.photoURL) userUpdates.photoURL = profileData.photoURL;
    if (Object.keys(userUpdates).length > 0) {
      await this.db.collection('users').doc(uid).update(userUpdates);
    }

    // Update in-memory cache
    if (this.currentUserProfile) {
      this.currentUserProfile = { ...this.currentUserProfile, ...updates };
    }
  },

  // Upload Profile Avatar to Firebase Storage
  async uploadAvatar(file) {
    if (!this.auth.currentUser) throw new Error("User not authenticated");
    const uid = this.auth.currentUser.uid;

    const storageRef = this.storage.ref().child(`profile_photos/${uid}.jpg`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    // Update profile with photoURL
    await this.updateProfile({ photoURL: downloadURL });
    
    // Update Auth user profile
    await this.auth.currentUser.updateProfile({
      photoURL: downloadURL
    });

    return downloadURL;
  },

  // ----------------------------------------------------
  // PERSISTENCE & DATA STORAGE
  // ----------------------------------------------------

  // Save Scan history
  async saveScan(analysis) {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.uid;

    const item = {
      uid: uid,
      productName: analysis.productName || 'Unknown Product',
      healthScore: analysis.healthScore || 0,
      verdict: analysis.verdict || 'Moderate',
      verdictTranslated: analysis.verdictTranslated || '',
      shortSummary: analysis.shortSummary || '',
      timestamp: new Date().toISOString(),
      analysis: analysis
    };

    // Add to scanHistory
    const docRef = await this.db.collection('scanHistory').add(item);
    
    // Increment scanCount in profile
    if (this.currentUserProfile) {
      const newScanCount = (this.currentUserProfile.scanCount || 0) + 1;
      const newAnalysisCount = (this.currentUserProfile.analysisCount || 0) + 1;
      await this.updateProfile({ 
        scanCount: newScanCount,
        analysisCount: newAnalysisCount
      });
    }

    return docRef.id;
  },

  // Get Scan history
  async getHistory() {
    if (!this.auth.currentUser) return [];
    const uid = this.auth.currentUser.uid;

    const snapshot = await this.db.collection('scanHistory')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      history.push({
        id: doc.id,
        productName: data.productName,
        healthScore: data.healthScore,
        verdict: data.verdict,
        date: data.timestamp ? new Date(data.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
        data: data.analysis,
        analysis: data.analysis,
        timestamp: data.timestamp,
        uid: data.uid
      });
    });
    return history;
  },

  // Delete scan from history
  async deleteScan(scanId) {
    if (!this.auth.currentUser) return;
    await this.db.collection('scanHistory').doc(scanId).delete();
  },

  // Clear all scan history
  async clearHistory() {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.uid;
    const snapshot = await this.db.collection('scanHistory')
      .where('uid', '==', uid)
      .get();
    
    const batch = this.db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Reset scan counts
    await this.updateProfile({ scanCount: 0, analysisCount: 0 });
  },

  // Save Chat History
  async saveChatHistory(messages) {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.uid;

    await this.db.collection('chatHistory').doc(uid).set({
      uid: uid,
      messages: messages,
      updatedAt: new Date().toISOString()
    });
  },

  // Get Chat History
  async getChatHistory() {
    if (!this.auth.currentUser) return [];
    const uid = this.auth.currentUser.uid;

    const doc = await this.db.collection('chatHistory').doc(uid).get();
    if (doc.exists) {
      return doc.data().messages || [];
    }
    return [];
  },

  // Save specific setting/preference
  async saveSetting(key, value) {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.uid;

    const updateObj = {};
    updateObj[`settings.${key}`] = value;

    await this.db.collection('userProfiles').doc(uid).update(updateObj);
    if (this.currentUserProfile) {
      if (!this.currentUserProfile.settings) this.currentUserProfile.settings = {};
      this.currentUserProfile.settings[key] = value;
    }
  },

  // Save daily tip index & date
  async saveDailyTip(index) {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.uid;

    await this.db.collection('userProfiles').doc(uid).update({
      dailyTipIndex: index,
      dailyTipDate: new Date().toDateString()
    });

    if (this.currentUserProfile) {
      this.currentUserProfile.dailyTipIndex = index;
      this.currentUserProfile.dailyTipDate = new Date().toDateString();
    }
  },

  // Save BMI data
  async saveBmiData(weight, height) {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.uid;

    await this.db.collection('userProfiles').doc(uid).update({
      bmiWeight: weight,
      bmiHeight: height
    });

    if (this.currentUserProfile) {
      this.currentUserProfile.bmiWeight = weight;
      this.currentUserProfile.bmiHeight = height;
    }
  },

  // Save custom UI setting
  async saveCustomUi(uiVal) {
    await this.saveSetting('uiTheme', uiVal);
  },

  // Save feedback
  async submitFeedback(text) {
    if (!this.auth.currentUser) return;
    const uid = this.auth.currentUser.uid;

    await this.db.collection('feedback').add({
      uid: uid,
      email: this.auth.currentUser.email,
      feedback: text,
      timestamp: new Date().toISOString()
    });
  }
};
<<<<<<< HEAD
  } else {
    throw new Error("Firebase SDK was not loaded");
  }
} catch (e) {
  console.error("[PureScan] Firebase initialization failed. Defining fallback object.", e);
  PureFirebase = {
    auth: {
      currentUser: null,
      onAuthStateChanged(callback) {
        setTimeout(() => callback(null), 50);
        return () => {};
      }
    },
    db: null,
    storage: null,
    currentUserProfile: null,
    isFallback: true,
    async register() { throw new Error("Firebase is not available. Please check your internet connection."); },
    async login() { throw new Error("Firebase is not available. Please check your internet connection."); },
    async logout() {},
    async resetPassword() { throw new Error("Firebase is not available. Please check your internet connection."); },
    async loadUserProfile() { return null; },
    async updateProfile() { throw new Error("Firebase is not available."); },
    async uploadAvatar() { throw new Error("Firebase is not available."); },
    async saveScan() {},
    async getHistory() { return []; },
    async deleteScan() {},
    async clearHistory() {},
    async saveChatHistory() {},
    async getChatHistory() { return []; },
    async saveSetting() {},
    async saveDailyTip() {},
    async saveBmiData() {},
    async saveCustomUi() {},
    async submitFeedback() { throw new Error("Firebase is not available."); }
  };
}
=======
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
