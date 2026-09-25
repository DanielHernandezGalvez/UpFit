type AuthErrorLike = {
  code?: string
  message: string
}

export function mapAuthError(error: AuthErrorLike) {
  switch (error.code) {
    case "invalid_credentials":
      return "Correo o contraseña incorrectos."
    case "email_not_confirmed":
      return "Confirma tu correo antes de entrar. Revisa la bandeja de entrada."
    case "user_already_exists":
    case "email_exists":
      return "Ya existe una cuenta con ese correo."
    case "weak_password":
      return "La contraseña debe tener al menos 6 caracteres."
    case "over_request_rate_limit":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo."
    case "validation_failed":
      return "Revisa el correo y la contraseña."
    default:
      if (/invalid login credentials/i.test(error.message)) {
        return "Correo o contraseña incorrectos."
      }
      if (/email not confirmed/i.test(error.message)) {
        return "Confirma tu correo antes de entrar. Revisa la bandeja de entrada."
      }
      return "No se pudo completar la acción. Inténtalo de nuevo."
  }
}
