import "./firebase-config.js";
import "./services/authService.js";


const registerForm =
    document.getElementById("registerForm");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirm =
    document.getElementById("toggleConfirm");

const registerButton =
    document.getElementById("regBtn");

const googleRegisterButton =
    document.getElementById("googleRegisterBtn");


// ==========================================
// PASSWORD VISIBILITY
// ==========================================

function toggleVisibility(input, icon) {

    const isPassword =
        input.type === "password";

    input.type =
        isPassword ? "text" : "password";

    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
}


togglePassword.addEventListener("click", () => {

    toggleVisibility(
        passwordInput,
        togglePassword
    );

});


toggleConfirm.addEventListener("click", () => {

    toggleVisibility(
        confirmPasswordInput,
        toggleConfirm
    );

});


// ==========================================
// PASSWORD STRENGTH
// ==========================================

const strengthBars = [

    document.getElementById("str1"),
    document.getElementById("str2"),
    document.getElementById("str3"),
    document.getElementById("str4")

];

const strengthText =
    document.getElementById("strText");


passwordInput.addEventListener(
    "input",
    function () {

        const password =
            this.value;

        let strength = 0;


        if (password.length >= 6) {
            strength++;
        }

        if (
            password.match(/[A-Z]/) &&
            password.match(/[a-z]/)
        ) {
            strength++;
        }

        if (password.match(/[0-9]/)) {
            strength++;
        }

        if (
            password.match(/[^A-Za-z0-9]/)
        ) {
            strength++;
        }


        // Reset bars
        strengthBars.forEach(
            bar => {
                bar.style.backgroundColor =
                    "var(--border-color)";
            }
        );


        if (password.length === 0) {

            strengthText.innerText =
                "Password Strength";

            return;
        }


        // Color bars
        for (
            let i = 0;
            i < strength;
            i++
        ) {

            if (strength === 1) {

                strengthBars[i].style.backgroundColor =
                    "var(--error-color)";

            }
            else if (strength === 2) {

                strengthBars[i].style.backgroundColor =
                    "var(--warning-color)";

            }
            else {

                strengthBars[i].style.backgroundColor =
                    "var(--success-color)";

            }

        }


        // Text
        if (strength <= 1) {

            strengthText.innerText =
                "Weak";

            strengthText.style.color =
                "var(--error-color)";

        }
        else if (strength === 2) {

            strengthText.innerText =
                "Fair";

            strengthText.style.color =
                "var(--warning-color)";

        }
        else {

            strengthText.innerText =
                "Strong";

            strengthText.style.color =
                "var(--success-color)";

        }

    }
);


// ==========================================
// GOOGLE REGISTRATION
// ==========================================

if (googleRegisterButton) {

    googleRegisterButton.addEventListener(
        "click",
        async function () {

            googleRegisterButton.disabled = true;

            googleRegisterButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

            try {

                // Reuse the existing Google sign-in service —
                // creates a profile if new, or signs in if existing.
                const user =
                    await window.ExamPro.AuthService.googleLogin();

                console.log(
                    "Google registration successful:",
                    user
                );

                window.ExamPro.Utils.showToast(
                    "Welcome to Exam Pro!",
                    "success"
                );

                setTimeout(() => {
                    window.location.href =
                        "student/dashboard.html";
                }, 1000);

            } catch (error) {

                console.error(
                    "Google registration error:",
                    error
                );

                let message =
                    "Google sign-in failed.";

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

                googleRegisterButton.disabled = false;

                googleRegisterButton.innerHTML =
                    '<svg class="google-icon" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">' +
                    '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
                    '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
                    '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
                    '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
                    '</svg> Continue with Google';

            }

        }
    );

}


// ==========================================
// REGISTER
// ==========================================

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const fullName =
            document.getElementById(
                "fullName"
            ).value.trim();


        const studentId =
            document.getElementById(
                "studentId"
            ).value.trim();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const department =
            document.getElementById(
                "department"
            ).value;


        const semester =
            document.getElementById(
                "semester"
            ).value;


        const password =
            passwordInput.value;


        const confirmPassword =
            confirmPasswordInput.value;


        // ==================================
        // VALIDATION
        // ==================================

        if (password !== confirmPassword) {

            window.ExamPro.Utils.showToast(
                "Passwords do not match!",
                "error"
            );

            return;
        }


        if (password.length < 6) {

            window.ExamPro.Utils.showToast(
                "Password must be at least 6 characters.",
                "error"
            );

            return;
        }


        // ==================================
        // DISABLE BUTTON
        // ==================================

        registerButton.disabled = true;

        registerButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';


        try {

            // ==================================
            // USER DATA
            // ==================================

            const userData = {

                fullName: fullName,

                studentId: studentId,

                email: email,

                department: department,

                semester: semester,

                password: password

            };


            // ==================================
            // FIREBASE REGISTRATION
            // ==================================

            const user =
                await window.ExamPro.AuthService.register(
                    userData
                );


            console.log(
                "Firebase registration successful:",
                user
            );


            // ==================================
            // SUCCESS
            // ==================================

            window.ExamPro.Utils.showToast(
                "Account created successfully!",
                "success"
            );


            // Redirect
            setTimeout(() => {

                window.location.href =
                    "student/dashboard.html";

            }, 1000);


        }
        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            let message =
                "Registration failed. Please try again.";


            // Firebase errors
            switch (error.code) {

                case "auth/email-already-in-use":

                    message =
                        "This email is already registered.";

                    break;


                case "auth/invalid-email":

                    message =
                        "Please enter a valid email address.";

                    break;


                case "auth/weak-password":

                    message =
                        "Password is too weak.";

                    break;


                case "auth/network-request-failed":

                    message =
                        "Network error. Check your internet connection.";

                    break;


                case "permission-denied":

                    message =
                        "Permission denied by Firestore.";

                    break;

            }


            window.ExamPro.Utils.showToast(
                message,
                "error"
            );


        }
        finally {

            registerButton.disabled = false;

            registerButton.innerHTML =
                "Create Account";

        }

    }
);