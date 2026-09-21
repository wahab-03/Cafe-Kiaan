const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api";

async function request(path, options={}) {
  let res;
  const isBrowser = typeof window !== "undefined";
  const requestUrl = isBrowser ? path : `${API_URL}${path}`;
  const headers = {"Accept":"application/json", ...(options.headers||{})};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  try {
    res = await fetch(requestUrl, {
      ...options,
      headers,
      cache:"no-store",
      ...(isBrowser ? {} : { mode:"cors" })
    });
  } catch (error) {
    throw new Error(`Unable to reach the Café Kiaan backend at ${API_URL}. Make sure Odoo is running on port 8070.`);
  }
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.detail || `Backend request failed (HTTP ${res.status})`);
  return data;
}

export const api = {
  menu:()=>request(`${API_PREFIX}/menu`),
  categories:()=>request(`${API_PREFIX}/menu/categories`),
  category:(c)=>request(`${API_PREFIX}/menu/category/${encodeURIComponent(c)}`),
  createOrder:(payload)=>request(`${API_PREFIX}/orders`,{method:"POST",body:JSON.stringify(payload)}),
  quoteOrder:(payload)=>request(`${API_PREFIX}/orders/quote`,{method:"POST",body:JSON.stringify(payload)}),
  order:(id,token)=>request(`${API_PREFIX}/orders/${encodeURIComponent(id)}?token=${encodeURIComponent(token||"")}`),
  customerOrders:(token)=>request(`${API_PREFIX}/customer/orders?token=${encodeURIComponent(token)}`),
  accountRegister:(payload)=>request(`${API_PREFIX}/account/register`,{method:"POST",body:JSON.stringify(payload)}),
  accountLogin:(payload)=>request(`${API_PREFIX}/account/login`,{method:"POST",body:JSON.stringify(payload)}),
  accountMe:(token)=>request(`${API_PREFIX}/account/me?token=${encodeURIComponent(token||"")}`),
  accountLogout:(token)=>request(`${API_PREFIX}/account/logout`,{method:"POST",body:JSON.stringify({token})})
};
