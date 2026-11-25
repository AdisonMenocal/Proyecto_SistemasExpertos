import { loginUser } from "../../services/auth-service.js";
import { saveToken } from "../../session/session.js";
import { validateEmail } from "../../utils/validators.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailFeedback = document.getElementById("emailFeedback");
const passwordFeedback = document.getElementById("passwordFeedback");
const submitButton = document.getElementById("submitButton");
const messageBox = document.getElementById("formMessage");
let submitting = false;

function setError(input, feedback, message) {
  input.classList.toggle("is-invalid", Boolean(message));
  input.classList.toggle("is-valid", !message && input.value.trim().length > 0);
  feedback.textContent = message || "";
}
function validateForm() {
  let valid = true;
  const emailValid = validateEmail(emailInput.value);
  setError(emailInput, emailFeedback, emailValid ? "" : "Ingresa un correo válido.");
  valid = emailValid && valid;

  const passwordValid = passwordInput.value.length > 0;
  setError(passwordInput, passwordFeedback, passwordValid ? "" : "Ingresa tu contraseña.");
  valid = passwordValid && valid;
  return valid;
}
function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "form-message";
}
function showMessage(message) {
  messageBox.textContent = message;
  messageBox.className = "form-message show error";
}
function setProcessing(processing) {
  submitButton.disabled = processing;
  submitButton.textContent = processing ? "Ingresando..." : "Ingresar";
  submitButton.setAttribute("aria-busy", String(processing));
}

[emailInput, passwordInput].forEach(input => input.addEventListener("input", () => {
  clearMessage();
  validateForm();
}));

document.querySelectorAll("[data-toggle-password]").forEach(button => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.togglePassword);
    const showing = target.type === "password";
    target.type = showing ? "text" : "password";
    button.textContent = showing ? "Ocultar" : "Mostrar";
    button.setAttribute("aria-label", showing ? "Ocultar contraseña" : "Mostrar contraseña");
  });
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (submitting) return;
  clearMessage();
  if (!validateForm()) {
    form.querySelector(".is-invalid")?.focus();
    return;
  }
  submitting = true;
  setProcessing(true);
  try {
    const responseData = await loginUser({
      email: emailInput.value.trim().toLowerCase(),
      password: passwordInput.value
    });
    const token = responseData.token ?? responseData.data?.token;
    saveToken(token);
    // Ajustar si el dashboard tiene otra ruta.
    window.location.href = "./author/dashboard.html";
  } catch (error) {
    showMessage(error.message || "No se pudo iniciar sesión.");
    submitting = false;
    setProcessing(false);
  }
});
