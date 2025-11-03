export const armazenamento = localStorage;

function getBaseUrl(url) {
  return "http://localhost:8000/api/" + url;
}

export function getUsuarioLogado() {
  const value = armazenamento.getItem("nexus-usuario");
  if (!value) window.location.href = "login.html";
  return JSON.parse(value);
}

export function getEmpresaLogada() {
  return getUsuarioLogado().empresa;
}

function getHeaders(isFormData = false) {
  const token = armazenamento.getItem("nexus-token");
  const headers = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function applyCallbacks(response, listener) {
  const { status, data } = response;
  listener.onResponse?.(data, status);
  listener[`_${status}`]?.(data);
  if (status >= 200 && status < 300) {
    listener.onSuccess?.(data);
  } else {
    listener.onError?.(data);
  }
  listener.onResponse?.(data, status);
}

function handleError(error, listener) {
  const response = error.response;
  const status = response?.status;
  const data = response?.data ?? error;
  listener.onResponse?.(data, status);
  listener[`_${status}`]?.(data);
  listener.onError?.(data);
}

async function request(method, url, payload = {}, listener = {}) {
  listener.onInit?.();
  const isFormData = payload instanceof FormData;
  const config = { headers: getHeaders(isFormData) };

  try {
    let response;
    if (method === "GET") {
      config.params = payload;
      response = await axios.get(getBaseUrl(url), config);
    } else if (method === "POST") {
      response = await axios.post(getBaseUrl(url), payload, config);
    } else if (method === "PUT") {
      response = await axios.put(getBaseUrl(url), payload, config);
    } else if (method === "DELETE") {
      config.data = payload;
      response = await axios.delete(getBaseUrl(url), config);
    }

    applyCallbacks(response, listener);
    return response.data;
  } catch (error) {
    handleError(error, listener);
  } finally {
    listener.onFinally?.();
  }
}

export const AppService = {
  getData: async (url, params = {}, listener = {}) =>
    await request("GET", url, params, listener),
  postData: async (url, data = {}, listener = {}) =>
    await request("POST", url, data, listener),
  putData: async (url, data = {}, listener = {}) =>
    await request("PUT", url, data, listener),
  deleteData: async (url, data = {}, listener = {}) =>
    await request("DELETE", url, data, listener),
};
