const app = document.getElementById("app");
let state = {
  parties: [],
  selectedParty: null,
};
// === Render  layout === //
function renderLayout() {
  app.innerHTML = `
      <h1>Party Planner (Admin)</h1>
      <form id="party-form">
        <h3>Add New Party</h3>
        <input name="name" placeholder="Party Name" required />
        <input name="description" placeholder="Description" required />
        <input name="location" placeholder="Location" required />
        <input name="date" type="datetime-local" required />
        <button type="submit">Add Party</button>
      </form>
      <div id="container" style="display: flex; gap: 2rem;">
        <div id="party-list" style="flex: 1;">
          <h2>Upcoming Parties</h2>
          <ul id="party-buttons" style="list-style: none; padding: 0;"></ul>
        </div>
        <div id="party-details" style="flex: 2;">
          <h2>Party Details</h2>
          <div id="details-content">Select a party to view details.</div>
        </div>
      </div>
    `;
  document
    .getElementById("party-form")
    .addEventListener("submit", handleFormSubmit);
}
// === Fetch all parties === //
async function fetchParties() {
  try {
    const res = await fetch(
      "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2503-David/events"
    );
    const { data } = await res.json();
    state.parties = data;
    renderParties();
  } catch (err) {
    console.error("Error fetching parties:", err);
    document.getElementById("party-buttons").innerHTML =
      "<li>Error loading parties.</li>";
  }
}
// === Render list of party names === //
function renderParties() {
  const list = document.getElementById("party-buttons");
  list.innerHTML = "";
  state.parties.forEach((party) => {
    const li = document.createElement("li");
    li.textContent = party.name;
    li.style.cursor = "pointer";
    li.style.padding = "0.5rem";
    li.style.border = "1px solid #ccc";
    li.style.marginBottom = "0.5rem";
    li.addEventListener("click", () => fetchPartyDetails(party.id));
    list.appendChild(li);
  });
}
// === Fetch and show single party details === //
async function fetchPartyDetails(id) {
  try {
    const res = await fetch(
      `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2503-David/events/${id}`
    );
    const { data } = await res.json();
    state.selectedParty = data;
    renderPartyDetails();
  } catch (err) {
    console.error("Error fetching party details:", err);
    document.getElementById("details-content").textContent =
      "Error loading party details.";
  }
}
// === Render selected party's full details === //
function renderPartyDetails() {
  const container = document.getElementById("details-content");
  const p = state.selectedParty;

  container.innerHTML = `
    <h3>${p.name} #${p.id}</h3>
    <p><strong>${new Date(p.date).toLocaleString()}</strong><br>${
    p.location
  }</p>
    <p>${p.description}</p>
    <ul>
      ${
        p.attendees?.map((person) => `<li>${person}</li>`).join("") ||
        "<li>No attendees listed</li>"
      }
    </ul>
    <button id="delete-btn">Delete Party</button>
  `;

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => deleteParty(p.id));
  } else {
    console.error("Delete button not found in DOM after rendering.");
  }
}
// === Form Submit === //
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;

  const newParty = {
    name: form.name.value,
    description: form.description.value,
    location: form.location.value,
    date: new Date(form.date.value).toISOString(),
  };
  try {
    const res = await fetch(
      "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2503-David/events",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty),
      }
    );
    if (!res.ok) throw new Error("Failed to create party");
    form.reset();
    await fetchParties();
  } catch (err) {
    console.error("Error adding party", err);
  }
}
// === Delte Party === //
async function deleteParty(id) {
  try {
    const res = await fetch(
      `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2503-David/events/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!res.ok) throw new Error(" Failed to delete party");
    state.selectedParty = null;
    await fetchParties();
    document.getElementById("details-content").textContent =
      "Select a party to view details.";
  } catch (err) {
    console.error("Error deleting party:", err);
  }
}
// === Initialize app === //
renderLayout();
fetchParties();
