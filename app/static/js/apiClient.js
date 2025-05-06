export const api = {
    get : p      => fetch(`/api${p}`).then(r => r.json()),
    post: (p,d)  => fetch(`/api${p}`, {
                    method:"POST",
                    headers:{ "Content-Type":"application/json" },
                    body: JSON.stringify(d)
                  }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
  };
  