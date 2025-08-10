// authMonitor.js
export function setupAuthMonitor() {
  let currentToken = localStorage.getItem("token");

  const checkAuth = () => {
    const newToken = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If token changed to null/undefined or role changed
    if (newToken !== currentToken && !newToken) {
      window.location.href = "/login";
    }
    currentToken = newToken;
  };

  // Listen for storage events (changes from other tabs)
  window.addEventListener("storage", (e) => {
    if (e.key === "token") {
      checkAuth();
    }
  });

  // Also check periodically in case of direct localStorage manipulation
  const intervalId = setInterval(checkAuth, 5000);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
