import "./services/authService.js";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

const togglePassword =
    document.getElementById("togglePassword");

const passwordInput =
    document.getElementById("password");

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add("fa-eye-slash");

        } else {

            passwordInput.type = "password";

            togglePassword.classList.remove("fa-eye-slash");
            togglePassword.classList.add("fa-eye");

        }

    });

}


// ==========================================
// EMAIL + PASSWORD LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email")
                    .value
                    .trim();

            const password =
                document.getElementById("password")
                    .value;


            // Disable button
            loginBtn.disabled = true;

            loginBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';


            try {

                // Firebase email/password login
                const user =
                    await window.ExamPro.AuthService.login(
                        email,
                        password
                    );


                console.log(
                    "Login successful:",
                    user
                );


                window.ExamPro.Utils.showToast(
                    "Login successful!",
                    "success"
                );


                redirectUser(user);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                let message =
                    "Login failed. Please try again.";


                switch (error.code) {

                    case "auth/invalid-credential":

                        message =
                            "Incorrect email or password.";

                        break;


                    case "auth/user-not-found":

                        message =
                            "No account found with this email.";

                        break;


                    case "auth/wrong-password":

                        message =
                            "Incorrect password.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    case "auth/too-many-requests":

                        message =
                            "Too many login attempts. Please try again later.";

                        break;


                    case "permission-denied":

                        message =
                            "Unable to access your user profile.";

                        break;


                    default:

                        if (error.message) {
                            message = error.message;
                        }

                }


                window.ExamPro.Utils.showToast(
                    message,
                    "error"
                );


            } finally {

                loginBtn.disabled = false;

                loginBtn.innerHTML =
                    '<i class="fa-solid fa-right-to-bracket"></i> Login';

            }

        }
    );

}


// ==========================================
// GOOGLE LOGIN
// ==========================================

if (googleLoginBtn) {

    googleLoginBtn.addEventListener(
        "click",
        async function () {

            googleLoginBtn.disabled = true;

            googleLoginBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';


            try {

                // Firebase Google login
                const user =
                    await window.ExamPro.AuthService.googleLogin();


                console.log(
                    "Google login successful:",
                    user
                );


                window.ExamPro.Utils.showToast(
                    "Google login successful!",
                    "success"
                );


                redirectUser(user);


            } catch (error) {

                console.error(
                    "Google login error:",
                    error
                );


                let message =
                    "Google login failed.";


                switch (error.code) {

                    case "auth/popup-closed-by-user":

                        message =
                            "Google sign-in was cancelled.";

                        break;


                    case "auth/popup-blocked":

                        message =
                            "Your browser blocked the Google sign-in popup.";

                        break;


                    case "auth/account-exists-with-different-credential":

                        message =
                            "An account already exists with this email using another sign-in method.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Network error. Check your internet connection.";

                        break;


                    case "auth/unauthorized-domain":

                        message =
                            "This website domain is not authorized in Firebase.";

                        break;


                    case "permission-denied":

                        message =
                            "Unable to create or access your user profile.";

                        break;


                    default:

                        if (error.message) {
                            message = error.message;
                        }

                }


                window.ExamPro.Utils.showToast(
                    message,
                    "error"
                );


            } finally {

                googleLoginBtn.disabled = false;

                googleLoginBtn.innerHTML =
                    '<svg class="google-icon" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">' +
                    '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
                    '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
                    '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
                    '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
                    '</svg> Sign in with Google';

            }

        }
    );

}


// ==========================================
// REDIRECT USER
// ==========================================

function redirectUser(user) {

    setTimeout(() => {

        if (user.role === "admin") {

            window.location.href =
                "admin/dashboard.html";

        } else {

            window.location.href =
                "student/dashboard.html";

        }

    }, 800);

}