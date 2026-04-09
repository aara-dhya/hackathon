-- materials (inventory)
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    quantity INTEGER NOT NULL,
    cost_per_unit NUMERIC NOT NULL
);

-- usage logs (material consumption)
CREATE TABLE usages (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id),
    quantity INTEGER NOT NULL,
    phase TEXT NOT NULL,
    cost NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);