const Database = require('better-sqlite3');
const db = new Database('../restaurants/REST-WWQ2RC/db.sqlite');

async function testAdminPutTableWithActiveOrder() {
  const tableId = 1;

  // 1. Insert an active order on table 1
  db.prepare("DELETE FROM orders WHERE table_id = ?").run(tableId);
  db.prepare("INSERT INTO orders (table_id, table_number, status, total) VALUES (?, 'T1', 'pending', 100)").run(tableId);

  async function test(label, role, pin, username, body) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (role) headers['x-role'] = role;
      if (pin) headers['x-pin'] = pin;
      if (username) headers['x-username'] = username;

      const res = await fetch(`http://localhost:4000/r/REST-WWQ2RC/tables/${tableId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      const status = res.status;
      const data = await res.json();
      console.log(`${label} -> STATUS:`, status, 'DATA:', data);
    } catch (err) {
      console.log(`${label} -> FAILED:`, err.message);
    }
  }

  // Test A: Admin sends exact table number T1
  await test('Admin with T1 (same case)', 'admin', '1111', null, {
    id: tableId,
    number: 'T1',
    capacity: 4,
    section: 'Indoor',
    status: 'occupied'
  });

  // Test B: Admin sends table number t1 (different case)
  await test('Admin with t1 (different case)', 'admin', '1111', null, {
    id: tableId,
    number: 't1',
    capacity: 4,
    section: 'Indoor',
    status: 'occupied'
  });

  // Test C: Waiter with T1 and active order
  await test('Waiter with T1 and active order', 'waiter', '1234', 'aman', {
    id: tableId,
    number: 'T1',
    capacity: 4,
    section: 'Indoor',
    status: 'occupied'
  });

  // Clean up
  db.prepare("DELETE FROM orders WHERE table_id = ?").run(tableId);
}

testAdminPutTableWithActiveOrder();
