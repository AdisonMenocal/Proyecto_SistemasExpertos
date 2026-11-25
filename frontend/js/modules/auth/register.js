import { registerUser } from "../../services/auth-service.js";
import { saveToken } from "../../session/session.js";

import {
    validateFullName,
    validateUsername,
    validateEmail,
    validatePassword,
    passwordsMatch
} from "../../utils/validators.js";

const form = document.getElementById("registerForm");

const nameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

const submitButton = document.getElementById("submitButton");
const messageBox = document.getElementById("formMessage");

let submitting = false;


// Validación individual de campos
function setFieldError(input, feedback, message) {
    input.classList.toggle("is-invalid", Boolean(message));

    input.classList.toggle(
        "is-valid",
        !message && input.value.trim().length > 0
    );

    feedback.textContent = message || "";
}


// Validación completa del formulario
function validateForm() {
    let valid = true;

    const nameValid = validateFullName(nameInput.value);

    setFieldError(
        nameInput,
        document.getElementById("nameFeedback"),
        nameValid ? "" : "Ingresa tu nombre completo."
    );

    valid = nameValid && valid;


    const usernameValid = validateUsername(usernameInput.value);

    setFieldError(
        usernameInput,
        document.getElementById("usernameFeedback"),
        usernameValid
            ? ""
            : "El username debe tener entre 3 y 20 caracteres y no contener espacios."
    );

    valid = usernameValid && valid;


    const emailValid = validateEmail(emailInput.value);

    setFieldError(
        emailInput,
        document.getElementById("emailFeedback"),
        emailValid ? "" : "Ingresa un correo electrónico válido."
    );

    valid = emailValid && valid;


    const passwordValid = validatePassword(passwordInput.value);

    setFieldError(
        passwordInput,
        document.getElementById("passwordFeedback"),
        passwordValid
            ? ""
            : "La contraseña debe tener al menos 8 caracteres."
    );

    valid = passwordValid && valid;


    const confirmationValid = passwordsMatch(
        passwordInput.value,
        confirmInput.value
    );

    setFieldError(
        confirmInput,
        document.getElementById("confirmFeedback"),
        confirmationValid
            ? ""
            : "Las contraseñas no coinciden."
    );

    valid = confirmationValid && valid;

    return valid;
}


// Mostrar mensajes generales
function showMessage(message, type = "error") {
    messageBox.textContent = message;
    messageBox.className = `form-message show ${type}`;
}


// Limpiar mensaje general
function clearMessage() {
    messageBox.textContent = "";
    messageBox.className = "form-message";
}


// Estado de procesamiento
function setProcessing(processing) {
    submitButton.disabled = processing;

    submitButton.textContent = processing
        ? "Creando cuenta..."
        : "Crear cuenta";

    submitButton.setAttribute(
        "aria-busy",
        String(processing)
    );
}


// Validación en tiempo real
[
    nameInput,
    usernameInput,
    emailInput,
    passwordInput,
    confirmInput
].forEach(input => {

    input.addEventListener("input", () => {
        clearMessage();
        validateForm();
    });

});


// Mostrar u ocultar contraseñas
document.querySelectorAll("[data-toggle-password]").forEach(button => {

    button.addEventListener("click", () => {

        const target = document.getElementById(
            button.dataset.togglePassword
        );

        const showing = target.type === "password";

        target.type = showing ? "text" : "password";

        button.textContent = showing
            ? "Ocultar"
            : "Mostrar";

        button.setAttribute(
            "aria-label",
            showing
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
        );

    });

});


// Envío del formulario
form.addEventListener("submit", async event => {

    event.preventDefault();

    // Evita dobles envíos
    if (submitting) return;

    clearMessage();

    // Validar antes de llamar al backend
    if (!validateForm()) {

        form.querySelector(".is-invalid")?.focus();

        return;
    }

    submitting = true;

    setProcessing(true);


    // Datos que se enviarán al backend
    const userData = {

        name: nameInput.value.trim(),

        username: usernameInput.value.trim(),

        email: emailInput.value.trim().toLowerCase(),

        password: passwordInput.value

    };


    try {

        // Registrar usuario
        const responseData = await registerUser(userData);


        // Obtener token de la respuesta
        const token = responseData.token
            ?? responseData.data?.token;


        // Guardar sesión
        saveToken(token);


        // Redirigir a configuración del blog
        window.location.href = "./author/settings.html";


    } catch (error) {

        // Mostrar error del servidor
        showMessage(
            error.message || "Ocurrió un error al registrar la cuenta."
        );


        // Rehabilitar botón
        submitting = false;

        setProcessing(false);

    }

});