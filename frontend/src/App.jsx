import { useEffect, useState } from "react";
import { getDashboard, addMaterial, useMaterial, getInvoice } from "./api/client";

function App() {
  const [data, setData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [phaseQuery, setPhaseQuery] = useState("");

  const [material, setMaterial] = useState({
    name: "",
    quantity: "",
    cost_per_unit: "",
  });

  const [usage, setUsage] = useState({
    material_name: "",
    quantity: "",
    phase: "",
  });

  const loadDashboard = async () => {
    const res = await getDashboard();
    setData(res);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ✅ Add Material
  const handleAddMaterial = async () => {
    if (
      !material.name.trim() ||
      !material.quantity ||
      !material.cost_per_unit
    ) {
      alert("Fill all fields");
      return;
    }

    await addMaterial({
      name: material.name,
      quantity: Number(material.quantity),
      cost_per_unit: Number(material.cost_per_unit),
    });

    setMaterial({ name: "", quantity: "", cost_per_unit: "" });
    loadDashboard();
  };

  // ✅ Use Material
  const handleUseMaterial = async () => {
    if (
      !usage.material_name.trim() ||
      !usage.quantity ||
      !usage.phase.trim()
    ) {
      alert("Fill all fields");
      return;
    }

    await useMaterial({
      material_name: usage.material_name,
      quantity: Number(usage.quantity),
      phase: usage.phase,
    });

    setUsage({ material_name: "", quantity: "", phase: "" });
    loadDashboard();
  };

  // ✅ Fetch Invoice
  const fetchInvoice = async () => {
    if (!phaseQuery.trim()) {
      alert("Enter phase");
      return;
    }

    const res = await getInvoice(phaseQuery);
    setInvoice(res);
  };

  // ✅ Loading state ONLY here
  if (!data) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", background: "#f5f7fb", minHeight: "100vh" }}>
      
      <h1>Construction Dashboard</h1>
      <p>Total Spent: <strong>{data.total_spent}</strong></p>

      <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>

        {/* LEFT PANEL */}
        <div style={{ width: "300px" }}>

          <div style={card}>
            <h3>Add Material</h3>

            <select
              style={input}
              value={material.name}
              onChange={(e) => setMaterial({ ...material, name: e.target.value })}
            >
              <option value="">Select Material</option>
              <option value="cement">Cement</option>
              <option value="steel">Steel</option>
              <option value="sand">Sand</option>
              <option value="bricks">Bricks</option>
            </select>

            <input
              style={input}
              placeholder="Quantity"
              value={material.quantity}
              onChange={(e) => setMaterial({ ...material, quantity: e.target.value })}
            />

            <input
              style={input}
              placeholder="Cost per unit"
              value={material.cost_per_unit}
              onChange={(e) => setMaterial({ ...material, cost_per_unit: e.target.value })}
            />

            <button style={button} onClick={handleAddMaterial}>Add</button>
          </div>

          <div style={card}>
            <h3>Use Material</h3>

            <input
              style={input}
              placeholder="Material name"
              value={usage.material_name}
              onChange={(e) => setUsage({ ...usage, material_name: e.target.value })}
            />

            <input
              style={input}
              placeholder="Quantity"
              value={usage.quantity}
              onChange={(e) => setUsage({ ...usage, quantity: e.target.value })}
            />

            <input
              style={input}
              placeholder="Phase"
              value={usage.phase}
              onChange={(e) => setUsage({ ...usage, phase: e.target.value })}
            />

            <button style={button} onClick={handleUseMaterial}>Use</button>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1 }}>

          <div style={card}>
            <h3>Inventory</h3>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Material</th>
                  <th style={th}>Quantity</th>
                </tr>
              </thead>

              <tbody>
                {data.inventory.length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center", padding: "10px" }}>
                      No materials yet
                    </td>
                  </tr>
                ) : (
                  data.inventory.map((item, i) => (
                    <tr key={i}>
                      <td style={td}>{item.material}</td>
                      <td style={td}>{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={card}>
            <h3>Phase Cost</h3>

            {Object.keys(data.phase_cost).length === 0 ? (
              <p>No usage yet</p>
            ) : (
              <ul>
                {Object.entries(data.phase_cost).map(([phase, cost]) => (
                  <li key={phase}>
                    {phase}: ₹{cost}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={card}>
            <h3>Generate Invoice</h3>

            <input
              style={input}
              placeholder="Enter phase"
              value={phaseQuery}
              onChange={(e) => setPhaseQuery(e.target.value)}
            />

            <button style={button} onClick={fetchInvoice}>Generate</button>

            {invoice && (
              <div style={{ marginTop: "15px" }}>
                <h4>Invoice: {invoice.phase}</h4>

                {invoice.items.length === 0 ? (
                  <p>No data</p>
                ) : (
                  <ul>
                    {invoice.items.map((item, i) => (
                      <li key={i}>
                        {item.material} - {item.quantity} units - ₹{item.cost}
                      </li>
                    ))}
                  </ul>
                )}

                <strong>Total: ₹{invoice.total}</strong>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

/* styles */

const card = {
  background: "white",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "20px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const button = {
  width: "100%",
  padding: "10px",
  background: "#333",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const th = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "1px solid #ccc",
};

const td = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};

export default App;