async function fetchStock() {
  const list = document.getElementById("stock-table-body");

  // Check of de tabel er wel is (veiligheidje)
  if (!list) return;

  // 1. Data ophalen uit Supabase
  const { data: products, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  // 2. Fouten afhandelen
  if (error) {
    console.error("Fout bij ophalen stock:", error);
    list.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: red;">Kon producten niet laden.</td></tr>`;
    return;
  }

  // 3. Lijst leegmaken (loading wegpoetsen)
  list.innerHTML = "";

  // 4. Tabel vullen
  if (products.length === 0) {
    list.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center;">Nog geen producten gevonden.</td></tr>`;
    return;
  }

  products.forEach((product) => {
    // Status bepalen (bv. rood als voorraad laag is)
    // We gebruiken 'min_stock_level' uit je database
    const isLowStock = product.stock_quantity <= (product.min_stock_level || 5);

    const statusBadge = isLowStock
      ? `<span style="background: #f8d7da; color: #721c24; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">Laag</span>`
      : `<span style="background: #d4edda; color: #155724; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">OK</span>`;

    const row = `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 1rem;"><strong>${product.name}</strong></td>
                <td style="padding: 1rem;">€ ${product.price}</td>
                <td style="padding: 1rem;">${product.stock_quantity} stuks</td>
                <td style="padding: 1rem;">${statusBadge}</td>
            </tr>
        `;
    list.innerHTML += row;
  });
}
