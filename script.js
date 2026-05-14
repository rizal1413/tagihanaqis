let dataSiswa = [];

fetch('data.csv')
  .then(response => {
    if (!response.ok) throw new Error('Gagal membaca data.csv');
    return response.text();
  })
  .then(text => {
    const rows = text.trim().split(/\r?\n/);
    if (rows.length < 2) throw new Error('File CSV kosong');

    const delimiter = rows[0].includes(';') ? ';' : ',';

    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(rows[0].replace(/^\uFEFF/, ''));

    dataSiswa = rows.slice(1).map(row => {
      const values = parseCSVLine(row);
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    console.log('Data berhasil dimuat:', dataSiswa.length, 'baris');
  })
  .catch(error => {
    console.error(error);
    const result = document.getElementById('result');
    result.innerHTML = `
      <div class="error">
        <button class="close-btn" onclick="tutupHasil()">×</button>
        Gagal memuat data. Pastikan file data.csv tersedia dan formatnya benar.
      </div>
    `;
  });

function formatRupiah(angka) {
  const cleaned = String(angka || '').replace(/[^0-9]/g, '');
  const num = Number(cleaned) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cariData() {
  const nis = document.getElementById('nisInput').value.trim();
  const result = document.getElementById('result');

  if (!nis) {
    result.innerHTML = `
      <div class="error">
        <button class="close-btn" onclick="tutupHasil()">×</button>
        Silakan masukkan NIS terlebih dahulu.
      </div>
    `;
    return;
  }

  if (dataSiswa.length === 0) {
    result.innerHTML = `
      <div class="error">
        <button class="close-btn" onclick="tutupHasil()">×</button>
        Data belum selesai dimuat. Silakan coba lagi beberapa detik.
      </div>
    `;
    return;
  }

  const siswa = dataSiswa.find(item =>
    String(item['NIS'] || '').trim() === nis
  );

  if (!siswa) {
    result.innerHTML = `
      <div class="error">
        <button class="close-btn" onclick="tutupHasil()">×</button>
        Data tidak ditemukan. Pastikan NIS yang dimasukkan benar.
      </div>
    `;
    return;
  }

  const fields = [
    'UANG PANGKAL',
    'SPP (Total)',
    'OSIS',
    'PRAKTIK',
    'SERAGAM',
    'BUKU',
    'KEGIATAN',
    'MPLS'
  ];

  let tableRows = '';
  fields.forEach(field => {
    if (field in siswa) {
      tableRows += `
        <tr>
          <td>${escapeHtml(field)}</td>
          <td>${formatRupiah(siswa[field])}</td>
        </tr>
      `;
    }
  });

  result.innerHTML = `
    <div class="card">
      <button class="close-btn" onclick="tutupHasil()">×</button>
      <h2>${escapeHtml(siswa['NAMA'])}</h2>
      <p><strong>Kelas:</strong> ${escapeHtml(siswa['KELAS'])}</p>

      <table>
        ${tableRows}
      </table>

      <p class="total">
        Total Tagihan: ${formatRupiah(siswa['JUMLAH'])}
      </p>
    </div>
  `;
}

function tutupHasil() {
  const result = document.getElementById('result');
  result.innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>Terima kasih.</h3>
      <p>Silakan masukkan NIS lain untuk melihat tagihan siswa berikutnya.</p>
    </div>
  `;
  document.getElementById('nisInput').focus();
}

document.getElementById('nisInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    cariData();
  }
});
