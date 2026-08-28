import { auth, db } from "../firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


window.ExamPro = window.ExamPro || {};


window.ExamPro.AuthService = {

    // ==========================================
    // REGISTER WITH EMAIL + PASSWORD
    // ==========================================

    register: async function(userData) {

        const {
            fullName,
            email,
            password,
            studentId,
            department,
            semester
        } = userData;

        try {

            // Create Firebase Authentication account
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            // Store name in Firebase Auth profile
            await updateProfile(user, {
                displayName: fullName
            });


            // Create student profile in Firestore
            const profileData = {

                uid: user.uid,

                name: fullName,

                email: email,

                studentId: studentId,

                department: department,

                semester: semester,

                role: "student",

                createdAt: serverTimestamp()

            };


            await setDoc(
                doc(db, "users", user.uid),
                profileData
            );


            // Store basic profile locally
            localStorage.setItem(
                "exampro_user",
                JSON.stringify({
                    uid: user.uid,
                    name: fullName,
                    email: email,
                    studentId: studentId,
                    department: department,
                    semester: semester,
                    role: "student"
                })
            );


            console.log(
                "Registration successful!"
            );


            return {
                uid: user.uid,
                name: fullName,
                email: email,
                studentId: studentId,
                department: department,
                semester: semester,
                role: "student"
            };


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            throw error;
        }
    },


    // ==========================================
    // LOGIN WITH EMAIL + PASSWORD
    // ==========================================

    login: async function(email, password) {

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            // Get profile from Firestore
            const userDoc =
                await getDoc(
                    doc(db, "users", user.uid)
                );


            if (!userDoc.exists()) {

                throw new Error(
                    "User profile not found."
                );
            }


            const userData =
                userDoc.data();


            // Store profile locally
            localStorage.setItem(
                "exampro_user",
                JSON.stringify(userData)
            );


            console.log(
                "Login successful!"
            );


            return userData;


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            throw error;
        }
    },


    // ==========================================
    // GOOGLE LOGIN
    // ==========================================

    googleLogin: async function() {

        try {

            const provider =
                new GoogleAuthProvider();


            // Open Google login popup
            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            const user =
                result.user;


            // Reference to user's Firestore profile
            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            // Check whether profile already exists
            const userDoc =
                await getDoc(userRef);


            // ======================================
            // NEW GOOGLE USER
            // ======================================

            if (!userDoc.exists()) {

                const newUser = {

                    uid: user.uid,

                    name:
                        user.displayName || "",

                    email:
                        user.email || "",

                    studentId: "",

                    department: "",

                    semester: "",

                    role: "student",

                    createdAt:
                        serverTimestamp()

                };


                // Create Firestore profile
                await setDoc(
                    userRef,
                    newUser
                );


                // Store locally
                localStorage.setItem(
                    "exampro_user",
                    JSON.stringify({
                        uid: user.uid,
                        name:
                            user.displayName || "",
                        email:
                            user.email || "",
                        studentId: "",
                        department: "",
                        semester: "",
                        role: "student"
                    })
                );


                console.log(
                    "New Google user created!"
                );


                return {
                    uid: user.uid,
                    name:
                        user.displayName || "",
                    email:
                        user.email || "",
                    studentId: "",
                    department: "",
                    semester: "",
                    role: "student"
                };
            }


            // ======================================
            // EXISTING GOOGLE USER
            // ======================================

            const userData =
                userDoc.data();


            localStorage.setItem(
                "exampro_user",
                JSON.stringify(userData)
            );


            console.log(
                "Google login successful!"
            );


            return userData;


        } catch (error) {

            console.error(
                "Google login error:",
                error
            );

            throw error;
        }
    },


    // ==========================================
    // LOGOUT
    // ==========================================

    logout: async function() {

        try {

            await signOut(auth);

            localStorage.removeItem(
                "exampro_user"
            );


            window.location.href =
                "../login.html";


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );
        }
    },


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    getCurrentUser: function() {

        const userStr =
            localStorage.getItem(
                "exampro_user"
            );


        if (!userStr) {

            return null;
        }


        return JSON.parse(userStr);
    },


    // ==========================================
    // GET USER ROLE FROM FIRESTORE (SECURE)
    // ==========================================
    // Reads the role directly from Firestore so
    // authorization is enforced server-side,
    // not just from localStorage (which can be
    // tampered with in the browser).

    getUserRole: async function(uid) {

        try {

            const userDoc =
                await getDoc(
                    doc(db, "users", uid)
                );


            if (!userDoc.exists()) {

                return null;
            }


            const data =
                userDoc.data();


            return data.role || "student";


        } catch (error) {

            console.error(
                "Error fetching user role:",
                error
            );

            return null;
        }
    },


    // ==========================================
    // REQUIRE AUTHENTICATION
    // ==========================================
    // Verifies the user's role from Firestore
    // (server-side data), not just localStorage.
    // This prevents users from tampering with
    // their role in the browser to gain admin
    // access.

    requireAuth: async function(
        requiredRole = null
    ) {

        const user =
            this.getCurrentUser();


        if (!user) {

            window.location.href =
                "../login.html";

            return null;
        }


        // Fetch the authoritative role from Firestore
        const firestoreRole =
            await this.getUserRole(user.uid);


        // If Firestore role is unavailable, fall back
        // to the locally stored role for UX only.
        // Real security is enforced by Firestore rules.
        const effectiveRole =
            firestoreRole || user.role || "student";


        // Update local storage with the authoritative role
        if (
            firestoreRole &&
            firestoreRole !== user.role
        ) {

            user.role = firestoreRole;

            localStorage.setItem(
                "exampro_user",
                JSON.stringify(user)
            );
        }


        // Check required role
        if (
            requiredRole &&
            effectiveRole !== requiredRole
        ) {

            if (
                effectiveRole === "admin"
            ) {

                window.location.href =
                    "../admin/dashboard.html";

            } else {

                window.location.href =
                    "../student/dashboard.html";
            }


            return null;
        }


        return {
            ...user,
            role: effectiveRole
        };
    }

};
