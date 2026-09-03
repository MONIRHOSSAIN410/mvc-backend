import axios from "axios";
import { CATEGORIES, filterProducts, findProduct } from "../data/catalog.js";

/**
 * Where the API lives.
 *
 * - In development Vite proxies /api to the local server (vite.config.js).
 * - On a deployed site the default is the CookMe API on Vercel.
 * - VITE_API_URL overrides both, so a preview or a second backend needs no
 *   code change — set it in Vercel → Settings → Environment Variables and
 *   redeploy (Vite bakes the value in at build time).
 */
const DEPLOYED_API = "https://mvc-backend-b5wn.vercel.app/api";

const baseURL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEPLOYED_API : "/api");

const api = axios.create({
  baseURL,
  // A serverless function that cannot reach its database will otherwise keep
  // the page waiting; this hands control to the offline catalogue instead.
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cookme-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------------------------------------------------------------ *
 * Offline catalogue
 *
 * If the API is unreachable, or MongoDB has not been seeded yet, the shop
 * would render empty pages with no pictures. These interceptors quietly fall
 * back to the bundled catalogue for the read-only product endpoints, so the
 * storefront always works. Orders and auth still need the real backend.
 * ------------------------------------------------------------------ */

const path = (c) => c?.url || "";
const isList = (c) => /^\/products\/?$/.test(path(c));
const isDetail = (c) => /^\/products\/[^/]+$/.test(path(c));
const isCategories = (c) => /^\/categories\/?$/.test(path(c));

const offline = (config, data) => ({
  data: { ...data, offline: true },
  status: 200,
  statusText: "OK (offline catalogue)",
  headers: {},
  config,
});

const listData = (config) => {
  const products = filterProducts(config.params || {});
  return { success: true, count: products.length, products };
};

const categoriesData = () => ({
  success: true,
  categories: CATEGORIES.map((c) => ({
    ...c,
    productCount: filterProducts({ category: c.slug }).length,
  })),
});

api.interceptors.response.use(
  (response) => {
    const config = response.config;
    if (isList(config) && !response.data?.products?.length) {
      return offline(config, listData(config));
    }
    if (isCategories(config) && !response.data?.categories?.length) {
      return offline(config, categoriesData());
    }
    return response;
  },
  (error) => {
    const config = error.config || {};
    if (isList(config)) return Promise.resolve(offline(config, listData(config)));
    if (isCategories(config)) return Promise.resolve(offline(config, categoriesData()));
    if (isDetail(config)) {
      const found = findProduct(path(config).split("/").pop());
      if (found) return Promise.resolve(offline(config, { success: true, ...found }));
    }
    return Promise.reject(error);
  }
);

export default api;
