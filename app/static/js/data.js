// ---------- tiny helper ----------

const api = {
    get:  (p) => fetch("/api" + p, { credentials: "include" }).then(r => r.json()),
    post: (p, d) => fetch("/api" + p, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    }).then(async r => {
      if (!r.ok) throw new Error((await r.json()).message || "API error");
      return r.json();
    })
  };
  
  // populate dropdowns on page load
  const teamSelects = [document.getElementById("team1"), document.getElementById("team2")];
  
  api.get("/teams").then(teams => {
    const opts = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    teamSelects.forEach(sel => sel.innerHTML = `<option value="" disabled selected>Select team</option>` + opts);
  }).catch(err => {
    console.error(err);
    alert("Could not load team list.");
  });
  
  // form submit -> POST /api/matches
  document.getElementById("matchForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        team1_id:    Number(team1.value),
        team2_id:    Number(team2.value),
        team1_score: Number(score1.value),
        team2_score: Number(score2.value),
        played_on:   played_on.value               // YYYY‑MM‑DD
      };
      await api.post("/matches", payload);
      alert("Match saved!");
      score1.value = score2.value = "";
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
  