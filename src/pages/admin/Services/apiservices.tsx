const BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "192.168.0.100:10000/";

/* ========================
   COMMON HELPERS
   ======================== */

const getHeaders = (includeToken = false) => {
  const headers = { "Content-Type": "application/json" };

  if (includeToken) {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      console.warn("Unauthorized - signing out");
      localStorage.removeItem("access_token");
      window.location.href = "/";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    console.error("fetchWithAuth error:", err);
    throw err;
  }
};

/* ========================
   AUTH & MFA APIs
   ======================== */

/**
 *  ADMIN LOGIN (CHANGED FROM STUDENT LOGIN)
 * Endpoint: POST /admin/login
 */
export async function login(userData) {
  try {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(userData),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: await res.text() };
    }

    return { success: res.ok, ...data };
  } catch (err) {
    return { success: false, message: "Network error" };
  }
}

export async function verifyLoginMfa(payload) {
  try {
    const res = await fetch(`${BASE_URL}/mfa/verify-login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: await res.text() };
    }

    return { success: res.ok, ...data };
  } catch (err) {
    return { success: false, message: "Network error" };
  }
}

export async function enrollStart(payload = {}) {
  try {
    const res = await fetch(`${BASE_URL}/mfa/enroll/start`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: await res.text() };
    }

    return { success: res.ok, ...data };
  } catch (err) {
    return { success: false, message: "Failed to start enrollment" };
  }
}

export async function enrollQr(tempToken) {
  try {
    const url = `${BASE_URL}/mfa/enroll/qr?token=${encodeURIComponent(
      tempToken
    )}`;
    const res = await fetch(url, { headers: { Accept: "image/png" } });

    if (!res.ok) throw new Error("QR load failed");

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);

    return { success: true, qr_image: imageUrl };
  } catch (err) {
    return { success: false, message: "Failed to load QR code" };
  }
}

/* ========================
   RE-ENROLL MFA
   ======================== */

export async function reenrollStart(token, current_code) {
  try {
    const res = await fetch(`${BASE_URL}/mfa/re-enroll/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, current_code }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.detail || "Invalid backup code" };
    }

    return { success: true, ...(await res.json()) };
  } catch (err) {
    return { success: false, error: "Network error" };
  }
}

export async function reenrollQr(token) {
  try {
    const res = await fetch(`${BASE_URL}/mfa/re-enroll/qr?token=${token}`);
    if (!res.ok) throw new Error("Failed");

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function verifyMfaCode(token, code, isReenroll = false) {
  const endpoint = isReenroll
    ? "/mfa/re-enroll/verify"
    : "/mfa/enroll/verify";

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, data: { code } }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.detail || "Invalid code" };
    }

    return { success: true, ...(await res.json()) };
  } catch (err) {
    return { success: false, error: "Network error" };
  }
}

/* ========================
   OTHER APIs (UNCHANGED)
   ======================== */

export async function registerGuest(userData) {
  return fetchWithAuth(`${BASE_URL}/guest/register`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(userData),
  });
}

export async function ContactUs(userData) {
  return fetchWithAuth(`${BASE_URL}/enrollments/submit`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(userData),
  });
}

export async function Getquizes(quizTitle) {
  return fetchWithAuth(
    `${BASE_URL}/guest/quiz/${encodeURIComponent(quizTitle)}`,
    {
      method: "GET",
      headers: getHeaders(true),
    }
  );
}

export async function PunchIn(data = {}) {
  return fetchWithAuth(`${BASE_URL}/guest/attendance/check-in`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function PunchOut(data = {}) {
  return fetchWithAuth(`${BASE_URL}/guest/attendance/check-out`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function Getattendance() {
  return fetchWithAuth(`${BASE_URL}/guest/attendance/my-attendance`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function GetQuizResult() {
  return fetchWithAuth(`${BASE_URL}/guest/results`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function getjobs() {
  return fetchWithAuth(`${BASE_URL}/company`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function getProfile() {
  return fetchWithAuth(`${BASE_URL}/guest/my-profile`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function submitQuiz(payload) {
  return fetchWithAuth(`${BASE_URL}/guest/submit`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
}

export async function getquizes() {
  return fetchWithAuth(`${BASE_URL}/admin/guest-quiz/guest/`, {
    method: "GET",
    headers: getHeaders(true),
  });
}
}

export async function PunchIn(data = {}) {
  return fetchWithAuth(`${BASE_URL}/guest/attendance/check-in`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function PunchOut(data = {}) {
  return fetchWithAuth(`${BASE_URL}/guest/attendance/check-out`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
}

export async function Getattendance() {
  return fetchWithAuth(`${BASE_URL}/guest/attendance/my-attendance`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function GetQuizResult() {
  return fetchWithAuth(`${BASE_URL}/guest/results`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function getjobs() {
  return fetchWithAuth(`${BASE_URL}/company`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function getProfile() {
  return fetchWithAuth(`${BASE_URL}/guest/my-profile`, {
    method: "GET",
    headers: getHeaders(true),
  });
}

export async function submitQuiz(payload) {
  return fetchWithAuth(`${BASE_URL}/guest/submit`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
}

export async function getquizes() {
  return fetchWithAuth(`${BASE_URL}/admin/guest-quiz/guest/`, {
    method: "GET",
    headers: getHeaders(true),
  });
}
