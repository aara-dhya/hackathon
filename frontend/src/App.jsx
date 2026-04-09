import { useEffect, useState } from "react";
import { getDashboard, addMaterial, useMaterial } from "./api/client";

function App() {
  const [data, setData] = useState(null);
  const [phaseQuery, setPhaseQuery] = useState("");
  const [invoice, setInvoice] = useState(null);

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

  const loadDashboard = () => {
    getDashboard().then(setData);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAddMaterial = async () => {
    await addMaterial({
      name: material.name,
      quantity: Number(material.quantity),
      cost_per_unit: Number(material.cost_per_unit),
    });

    setMaterial({ name: "", quantity: "", cost_per_unit: "" });
    loadDashboard();
  };

  const handleUseMaterial = async () => {
    await useMaterial({
      material_name: usage.material_name,
      quantity: Number(usage.quantity),
      phase: usage.phase,
    });

    setUsage({ material_name: "", quantity: "", phase: "" });
    loadDashboard();
  };

  const fetchInvoice = async () => {
    const res = await fetch(`http://localhost:8080/invoice/${phaseQuery}`);
    const data = await res.json();
    setInvoice(data);
  };

  if (!data) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        <h1 style={titleStyle}>Construction Management Dashboard</h1>
        <p>Total Spent: <strong>₹{data.total_spent}</strong></p>

        <div style={layoutStyle}>

          {/* LEFT */}
          <div style={leftPanelStyle}>

            <div style={cardStyle}>
              <h3>Add Material</h3>
              <input style={inputStyle} value={material.name}
                placeholder="Name"
                onChange={(e) => setMaterial({ ...material, name: e.target.value })} />
              <input style={inputStyle} value={material.quantity}
                placeholder="Quantity"
                onChange={(e) => setMaterial({ ...material, quantity: e.target.value })} />
              <input style={inputStyle} value={material.cost_per_unit}
                placeholder="Cost per unit"
                onChange={(e) => setMaterial({ ...material, cost_per_unit: e.target.value })} />
              <button style={buttonStyle} onClick={handleAddMaterial}>Add</button>
            </div>

            <div style={cardStyle}>
              <h3>Use Material</h3>
              <input style={inputStyle} value={usage.material_name}
                placeholder="Material"
                onChange={(e) => setUsage({ ...usage, material_name: e.target.value })} />
              <input style={inputStyle} value={usage.quantity}
                placeholder="Quantity"
                onChange={(e) => setUsage({ ...usage, quantity: e.target.value })} />
              <input style={inputStyle} value={usage.phase}
                placeholder="Phase"
                onChange={(e) => setUsage({ ...usage, phase: e.target.value })} />
              <button style={buttonStyle} onClick={handleUseMaterial}>Use</button>
            </div>

          </div>

          {/* RIGHT */}
          <div style={rightPanelStyle}>

            <div style={cardStyle}>
              <h3>Inventory</h3>
              <p style={{ color: "#dc2626", fontSize: "12px" }}>
                ⚠️ Low stock (&lt;50)
              </p>

              {data.inventory.length === 0 ? (
                <p>No materials</p>
              ) : (
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Material</th>
                      <th style={thStyle}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inventory.map((item, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{item.material}</td>
                        <td style={{
                          ...tdStyle,
                          color: item.quantity < 50 ? "#dc2626" : "#111"
                        }}>
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={cardStyle}>
              <h3>Phase Cost</h3>
              {Object.entries(data.phase_cost).map(([phase, cost]) => (
                <p key={phase}>{phase}: <strong>₹{cost}</strong></p>
              ))}
            </div>

            <div style={cardStyle}>
              <h3>Generate Invoice</h3>
              <input style={inputStyle}
                placeholder="Phase"
                value={phaseQuery}
                onChange={(e) => setPhaseQuery(e.target.value)} />
              <button style={buttonStyle} onClick={fetchInvoice}>Generate</button>

              {invoice && Array.isArray(invoice.items) && (
                <div style={{ marginTop: "10px" }}>
                  <h4>{invoice.phase}</h4>

                  {invoice.items.length === 0 ? (
                    <p>No data found</p>
                  ) : (
                    <ul>
                      {invoice.items.map((item, i) => (
                        <li key={i}>
                          {item.material} - ₹{item.cost}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p><strong>Total: ₹{invoice.total}</strong></p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const pageStyle = {
  background: "#f5f7fb",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  padding: "40px 20px",
  fontFamily: "'Inter', sans-serif",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1000px",
};

const layoutStyle = {
  display: "flex",
  gap: "30px",
  marginTop: "20px",
};

const leftPanelStyle = {
  width: "280px",
};

const rightPanelStyle = {
  flex: 1,
};

const titleStyle = {
  fontWeight: "600",
};

const cardStyle = {
  background: "#fff",
  padding: "16px",
  borderRadius: "10px",
  marginBottom: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const thStyle = {
  textAlign: "left",
  padding: "8px",
};

const tdStyle = {
  padding: "8px",
};

export default App;