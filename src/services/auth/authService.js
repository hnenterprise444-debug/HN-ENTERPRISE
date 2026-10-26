import { auth, fireDB } from '../../firebase/FirebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export const authService = {
  /**
   * Logs in a user with email and password
   */
  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  },

  /**
   * Sends password reset email to a user or admin using Firebase default technique
   */
  async sendPasswordResetEmail(email) {
    if (!email || !email.trim()) throw new Error("Email address is required");
    await sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Signs up a new user, saves details to Firestore, and logs them in
   */
  async signup(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const userProfile = {
      name: name,
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: "USER",
      time: Timestamp.now()
    };
    
    await setDoc(doc(fireDB, "users", userCredential.user.uid), userProfile, { merge: true });
    
    // Auto login
    const loginCredential = await signInWithEmailAndPassword(auth, email, password);
    return loginCredential;
  },

  /**
   * Initializes Firebase reCAPTCHA verifier for Phone Auth
   */
  setupRecaptcha(containerId = "recaptcha-container", size = "invisible") {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (err) {
        console.warn("Clearing previous recaptcha verifier:", err);
      }
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: size,
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn("reCAPTCHA expired. Please retry.");
      }
    });

    return window.recaptchaVerifier;
  },

  /**
   * Checks if an account with this phone number already exists in Firestore users
   */
  async checkPhoneExists(phoneNumber) {
    if (!phoneNumber) return false;
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${digitsOnly}`;
    const rawPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    try {
      // Check query against formatted phone
      const q1 = query(collection(fireDB, "users"), where("phone", "==", formattedPhone));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) return true;

      // Check query against raw digits
      const q2 = query(collection(fireDB, "users"), where("phone", "==", rawPhone));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) return true;

      // Check query with +91 prefix
      const q3 = query(collection(fireDB, "users"), where("phone", "==", `+91${rawPhone}`));
      const snap3 = await getDocs(q3);
      if (!snap3.empty) return true;
    } catch (err) {
      console.warn("Could not check phone existence:", err);
    }
    return false;
  },

  /**
   * Sends OTP to phone number using Firebase Auth
   */
  async sendOtp(phoneNumber, recaptchaVerifier) {
    if (!phoneNumber) throw new Error("Phone number is required");
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${digitsOnly}`;
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return confirmationResult;
  },

  /**
   * Verifies OTP code and signs in/registers user safely without overwriting existing profiles
   */
  async verifyOtp(confirmationResult, otpCode, customName = "") {
    if (!confirmationResult) throw new Error("No active OTP request found");
    if (!otpCode) throw new Error("OTP code is required");
    
    const userCredential = await confirmationResult.confirm(otpCode);
    const user = userCredential.user;

    // Check if user profile already exists in Firestore by document ID or query
    const userRef = doc(fireDB, "users", user.uid);
    const userDocSnap = await getDoc(userRef);

    let existingData = null;
    if (userDocSnap.exists()) {
      existingData = userDocSnap.data();
    } else {
      const q = query(collection(fireDB, "users"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        existingData = snap.docs[0].data();
      }
    }

    if (!existingData) {
      // New user registration: Create new user document with the provided name
      const displayName = customName.trim() || user.displayName || `User_${user.phoneNumber?.slice(-4)}` || "User";
      await setDoc(userRef, {
        uid: user.uid,
        name: displayName,
        phone: user.phoneNumber || "",
        phoneVerified: true,
        role: "USER",
        time: Timestamp.now(),
        createdAt: Timestamp.now()
      }, { merge: true });
    } else {
      // Existing user: NEVER overwrite their existing name or role!
      const updatePayload = {
        uid: user.uid,
        phone: user.phoneNumber || existingData.phone || "",
        phoneVerified: true,
        lastLogin: Timestamp.now()
      };

      // Only assign name if existing user record literally has an empty/missing name
      if (!existingData.name && customName.trim()) {
        updatePayload.name = customName.trim();
      }

      await setDoc(userRef, updatePayload, { merge: true });
    }

    return userCredential;
  },

  /**
   * Logs out the current user
   */
  async logout() {
    await signOut(auth);
  },

  /**
   * Listens to auth state changes
   */
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
};
