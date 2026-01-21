import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  User,
  EmailAuthProvider,
  linkWithCredential,
  AuthError,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { supabase } from "./supabase";
import { getUserProfile, saveUserProfile, updateLastLogin } from "@/utils/userProfile";

/**
 * SIMPLIFIED: Direct Google sign-in with Supabase integration
 * Returns isNewUser flag to show profile setup
 */
export const signInWithGoogleSimple = async () => {
  try {
    console.log("🔵 Starting Google sign-in...");
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log("✅ Google popup completed!");
    console.log("   User UID:", user.uid);
    console.log("   User Email:", user.email);
    console.log("   Display Name:", user.displayName);
    console.log("   Photo URL:", user.photoURL);
    
    // Check if user exists in Supabase
    console.log("📂 Checking Supabase for user profile:", user.uid);
    
    try {
      const userProfile = await getUserProfile(user.uid);
      
      console.log("📊 Supabase check result:");
      console.log("   Profile exists?", !!userProfile);
      
      if (!userProfile) {
        // First time user - need profile setup
        console.log("🆕 NEW USER DETECTED!");
        console.log("   Will return isNewUser: true");
        console.log("   User should see profile setup page");
        
        return {
          success: true,
          user,
          isNewUser: true,
          userData: null,
        };
      } else {
        // Existing user - update last login and proceed
        console.log("👤 EXISTING USER FOUND!");
        console.log("   Will return isNewUser: false");
        console.log("   User should go directly to app");
        
        await updateLastLogin(user.uid);
        
        // Update Firebase user profile with photoURL from Supabase if needed
        if (userProfile.google_photo_url && user.photoURL !== userProfile.google_photo_url) {
          console.log("📸 Syncing photoURL from Supabase to Firebase...");
          try {
            await updateProfile(user, {
              photoURL: userProfile.google_photo_url
            });
            console.log("✅ Firebase photoURL updated from Supabase");
          } catch (error) {
            console.warn("⚠️ Could not update Firebase photoURL:", error);
          }
        }
        
        return {
          success: true,
          user,
          isNewUser: false,
          userData: userProfile,
        };
      }
    } catch (supabaseError) {
      // Supabase error - treat as new user to show profile setup
      console.warn("⚠️ Supabase error:", supabaseError);
      console.warn("   FALLBACK: Treating as NEW USER to show profile setup");
      
      return {
        success: true,
        user,
        isNewUser: true,
        userData: null,
        offline: true,
      };
    }
  } catch (error) {
    const authError = error as AuthError;
    console.error("❌ Google sign-in error:", authError);
    console.error("❌ Error code:", authError.code);
    console.error("❌ Error message:", authError.message);
    
    let errorMessage = 'Failed to sign in with Google.';
    
    switch (authError.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed. Please try again.';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in was cancelled. Please try again.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
        break;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Complete profile setup for new Google users
 * Saves to Supabase instead of Firestore
 */
export const completeProfileSetup = async (
  userId: string,
  username: string,
  email: string,
  password: string,
  displayName: string,
  photoURL: string
) => {
  try {
    // Trim email to avoid spacing issues
    const trimmedEmail = email.trim();
    
    console.log("🔧 Starting profile setup for:", trimmedEmail);
    console.log("👤 Username:", username);
    
    // Get the current authenticated user (from Google sign-in)
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error("❌ No authenticated user found!");
      return {
        success: false,
        error: "Authentication session expired. Please try again.",
      };
    }
    
    console.log("✅ Current user:", currentUser.email);
    
    // Link email/password credential to Google account
    // This allows user to login with either Google OR email/password
    console.log("🔗 Linking email/password credential to account...");
    try {
      const credential = EmailAuthProvider.credential(trimmedEmail, password);
      await linkWithCredential(currentUser, credential);
      console.log("✅ Email/password credential linked successfully!");
    } catch (linkError) {
      // If already linked or error, log but continue (not critical)
      const authLinkError = linkError as AuthError;
      if (authLinkError.code === 'auth/provider-already-linked') {
        console.log("ℹ️ Email/password already linked to this account");
      } else if (authLinkError.code === 'auth/email-already-in-use') {
        console.log("ℹ️ Email already in use, skipping credential link");
      } else {
        console.warn("⚠️ Could not link email/password:", authLinkError.message);
      }
    }
    
    console.log("💾 Saving user profile to Supabase...");
    
    // Save to Supabase (replaces Firestore)
    const result = await saveUserProfile(
      userId,
      trimmedEmail,
      username,
      displayName,
      photoURL,
      trimmedEmail // googleEmail
    );
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to save profile",
      };
    }
    
    // Update Firebase user profile with photoURL and displayName
    console.log("📸 Updating Firebase user profile with photoURL...");
    try {
      await updateProfile(currentUser, {
        displayName: username,
        photoURL: photoURL || null
      });
      console.log("✅ Firebase profile updated successfully!");
    } catch (updateError) {
      console.warn("⚠️ Could not update Firebase profile:", updateError);
      // Not critical, continue
    }
    
    console.log("✅ Profile setup complete!");

    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error("❌ Profile setup error:", authError);
    console.error("❌ Error code:", authError.code);
    console.error("❌ Error message:", authError.message);
    
    return {
      success: false,
      error: authError.message || "Failed to set up profile",
    };
  }
};

/**
 * Sign in with email/username and password
 */
export const signInWithPassword = async (emailOrUsername: string, password: string) => {
  try {
    let email = emailOrUsername.trim();
    
    // If username, look up email from Supabase
    if (!email.includes('@')) {
      console.log("🔍 Looking up username in Supabase:", email);
      
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('username', email)
        .single();
      
      if (error || !data) {
        return {
          success: false,
          error: "Username not found",
        };
      }
      
      email = data.email;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login in Supabase
    await updateLastLogin(user.uid);

    // Get user profile from Supabase
    const userProfile = await getUserProfile(user.uid);

    // Update Firebase user profile with photoURL from Supabase
    if (userProfile?.google_photo_url && user.photoURL !== userProfile.google_photo_url) {
      console.log("📸 Syncing photoURL from Supabase to Firebase...");
      try {
        await updateProfile(user, {
          photoURL: userProfile.google_photo_url
        });
        console.log("✅ Firebase photoURL updated from Supabase");
      } catch (error) {
        console.warn("⚠️ Could not update Firebase photoURL:", error);
      }
    }

    return {
      success: true,
      user,
      userData: userProfile,
    };
  } catch (error) {
    const authError = error as AuthError;
    console.error("❌ Password sign-in error:", authError);
    
    // Handle incorrect password (both old and new Firebase error codes)
    if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
      return { success: false, error: "Entered incorrect password!" };
    }
    if (authError.code === 'auth/user-not-found') {
      return { success: false, error: "Account not found" };
    }
    if (authError.code === 'auth/invalid-email') {
      return { success: false, error: "Invalid email address" };
    }
    if (authError.code === 'auth/too-many-requests') {
      return { success: false, error: "Too many failed attempts. Please try again later." };
    }
    
    return {
      success: false,
      error: authError.message || "Failed to sign in",
    };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error("Sign out error:", authError);
    return {
      success: false,
      error: authError.message || "Failed to sign out",
    };
  }
};

