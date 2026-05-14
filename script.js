let dataSiswa = [];

fetch('data.csv')
  .then(response => response.text())
  .then(text => {
    const rows = text.trim().split(/\r?\n/);
    const headers = rows[0].split(',');
    dataSiswa = rows.slice(1).map(row => {
      const values = row.split(',');
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i] || '');
      return obj;
    });
  });

function formatRupiah(angka) {
  const num = Number(String(angka).replace(/[^0-9]/g, '')) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

function cariData() {
  const nis = document.getElementById('nisInput').value.trim();
  const result = document.getElementById('result');

  const siswa = dataSiswa.find(item => item['NIS'] === nis);

  if (!siswa) {
    result.innerHTML = '<div class="error">Data tidak ditemukan. Pastikan NIS benar.</div>';
    return;
  }

  const fields = [
    'UANG PANGKAL','SPP (Total)','OSIS','PRAKTIK',
    'SERAGAM','BUKU','KEGIATAN','MPLS'
  ];

  let rows = '';
  fields.forEach(field => {
    rows += `<tr><td>${field}</td><td>${formatRupiah(siswa[field])}</td></tr>`;
  });

  result.innerHTML = `
    <div class="card">
      <h2>${siswa['NAMA']}</h2>
      <p><strong>Kelas:</strong> ${siswa['KELAS']}</p>
      <table>${rows}</table>
      <p class="total">Total Tagihan: ${formatRupiah(siswa['JUMLAH'])}</p>
    </div>
  `;
}

document.getElementById('nisInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') cariData();
});
