/* Chaesa AI Tools — Pre-built Construction AI Apps (No Prompting Needed)
   Inspired by GipsyAI's approach: structured forms → instant professional output
   30+ tools across 8 construction disciplines */

export interface ToolField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
  rows?: number;
}

export interface AiTool {
  id: string;
  name: string;
  description: string;
  longDesc?: string;
  category: string;
  categoryIcon: string;
  icon: string;
  tier: "free" | "pro";
  isNew?: boolean;
  isPopular?: boolean;
  fields: ToolField[];
  buildPrompt: (data: Record<string, string>) => string;
  outputLabel: string;
  outputHint?: string;
  agentId: string;
  estimatedTime?: string;
}

/* ── Categories ─────────────────────────────────────── */
export const TOOL_CATEGORIES = [
  { id: "all",       label: "Semua Tools",      icon: "⚡", count: 0 },
  { id: "pm",        label: "Manajemen Proyek",  icon: "📊", count: 0 },
  { id: "k3",        label: "K3 & Keselamatan",  icon: "⛑️", count: 0 },
  { id: "dokumen",   label: "Dokumen & Surat",   icon: "📄", count: 0 },
  { id: "estimasi",  label: "Estimasi & RAB",    icon: "💰", count: 0 },
  { id: "teknis",    label: "Teknis & Sipil",    icon: "🏛️", count: 0 },
  { id: "kontrak",   label: "Kontrak & Legal",   icon: "⚖️", count: 0 },
  { id: "mep",       label: "MEP",               icon: "⚡", count: 0 },
  { id: "bim",       label: "BIM & Digital",     icon: "🖥️", count: 0 },
] as const;

/* ── Tool definitions ───────────────────────────────── */
export const AI_TOOLS: AiTool[] = [

  /* ══ MANAJEMEN PROYEK ══════════════════════════════ */
  {
    id: "wbs-generator",
    name: "Generator WBS Otomatis",
    description: "Buat Work Breakdown Structure lengkap dan terstruktur hanya dari input dasar proyek.",
    longDesc: "Hasilkan WBS dengan Level 1-4 yang komprehensif, mencakup semua lingkup pekerjaan konstruksi sesuai jenis bangunan.",
    category: "pm", categoryIcon: "📊", icon: "🗂️",
    tier: "free", isPopular: true,
    estimatedTime: "~15 detik",
    agentId: "pm", outputLabel: "Work Breakdown Structure",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Gedung Kantor PT Maju Bersama", required: true },
      { id: "jenisProyek", label: "Jenis Bangunan", type: "select", required: true, options: ["Gedung Perkantoran","Apartemen/Hunian","Ruko/Komersial","Fasilitas Industri","Infrastruktur Jalan","Jembatan","Rumah Sakit","Sekolah/Kampus","Hotel","Mixed-Use"] },
      { id: "jumlahLantai", label: "Jumlah Lantai", type: "number", placeholder: "5", required: true },
      { id: "nilaiKontrak", label: "Estimasi Nilai Proyek", type: "text", placeholder: "Rp 25 miliar" },
      { id: "durasi", label: "Target Durasi (bulan)", type: "number", placeholder: "18" },
    ],
    buildPrompt: (d) => `Kamu adalah Manajer Proyek konstruksi senior berpengalaman. Buat Work Breakdown Structure (WBS) lengkap untuk proyek berikut:

Nama: ${d.namaProyek}
Jenis: ${d.jenisProyek}
Lantai: ${d.jumlahLantai} lantai
Nilai: ${d.nilaiKontrak || "tidak disebutkan"}
Durasi: ${d.durasi || "belum ditentukan"} bulan

Format WBS dengan Level 0 (Proyek), Level 1 (Fase Besar), Level 2 (Paket Pekerjaan), Level 3 (Sub-pekerjaan). Gunakan kode numerik (1.0, 1.1, 1.1.1, dst). Wajib mencakup: Pekerjaan Persiapan, Sipil/Struktur, Arsitektur, MEP, Finishing, dan Commissioning. Bahasa Indonesia profesional.`,
    outputHint: "WBS dapat langsung digunakan di MS Project, Primavera, atau Excel",
  },

  {
    id: "agenda-rapat",
    name: "Template Agenda Rapat Proyek",
    description: "Buat agenda rapat site/koordinasi yang profesional dan terstruktur dalam hitungan detik.",
    category: "pm", categoryIcon: "📊", icon: "📋",
    tier: "free", isNew: true,
    estimatedTime: "~10 detik",
    agentId: "pm", outputLabel: "Agenda Rapat",
    fields: [
      { id: "jenis", label: "Jenis Rapat", type: "select", required: true, options: ["Rapat Koordinasi Mingguan","Rapat Progress Bulanan","Rapat Site (kick-off)","Rapat Teknis","Rapat Klaim/Dispute","Rapat PCM (Pre Construction Meeting)","Rapat PHO/FHO"] },
      { id: "tanggal", label: "Tanggal & Waktu", type: "text", placeholder: "Senin, 15 April 2025 — 09:00 WIB", required: true },
      { id: "lokasi", label: "Lokasi Rapat", type: "text", placeholder: "Direksi Keet Proyek / Zoom" },
      { id: "peserta", label: "Peserta Rapat", type: "textarea", placeholder: "PM, Site Manager, Konsultan MK, Subkontraktor Sipil...", rows: 3, required: true },
      { id: "topikUtama", label: "Topik/Isu Utama", type: "textarea", placeholder: "Review progress pekerjaan bekisting, kendala pengiriman material, dsb.", rows: 3, required: true },
    ],
    buildPrompt: (d) => `Kamu adalah Manajer Proyek konstruksi senior. Buat agenda rapat formal untuk:

Jenis: ${d.jenis}
Tanggal: ${d.tanggal}
Lokasi: ${d.lokasi || "Direksi Keet"}
Peserta: ${d.peserta}
Topik Utama: ${d.topikUtama}

Sertakan: Pembukaan, Review notulen sebelumnya, Agenda per topik dengan estimasi waktu, Penutup/action item. Format profesional dengan kop surat konstruksi. Bahasa Indonesia formal.`,
    outputHint: "Siap dikirim via email atau WhatsApp ke peserta rapat",
  },

  {
    id: "laporan-progress",
    name: "Generator Laporan Progress",
    description: "Susun laporan progress mingguan/bulanan yang formal dari data lapangan sederhana.",
    category: "pm", categoryIcon: "📊", icon: "📈",
    tier: "free", isPopular: true,
    estimatedTime: "~20 detik",
    agentId: "pm", outputLabel: "Laporan Progress",
    fields: [
      { id: "periode", label: "Periode Laporan", type: "text", placeholder: "Minggu ke-12, 7–13 April 2025", required: true },
      { id: "proyek", label: "Nama Proyek", type: "text", placeholder: "Pembangunan Gedung Kantor 8 Lantai", required: true },
      { id: "progressRencana", label: "Progress Rencana (%)", type: "number", placeholder: "65", required: true },
      { id: "progressAktual", label: "Progress Aktual (%)", type: "number", placeholder: "62", required: true },
      { id: "kegiatanSelesai", label: "Kegiatan yang Diselesaikan", type: "textarea", placeholder: "Pengecoran kolom lantai 4, pasang bekisting balok lt 5...", rows: 3, required: true },
      { id: "kendala", label: "Kendala / Masalah", type: "textarea", placeholder: "Keterlambatan ready mix, hujan 3 hari, dsb.", rows: 3 },
      { id: "rencanaMingguDepan", label: "Rencana Kegiatan Berikutnya", type: "textarea", placeholder: "Pengecoran balok lt 5, pemasangan rebar kolom lt 5...", rows: 3 },
    ],
    buildPrompt: (d) => `Kamu adalah Manajer Proyek konstruksi senior. Buat laporan progress formal dengan data berikut:

Periode: ${d.periode}
Proyek: ${d.proyek}
Progress Rencana: ${d.progressRencana}%
Progress Aktual: ${d.progressAktual}%
Deviasi: ${(Number(d.progressAktual) - Number(d.progressRencana)).toFixed(1)}% (${Number(d.progressAktual) >= Number(d.progressRencana) ? "on track / ahead" : "behind schedule"})

Kegiatan Selesai:
${d.kegiatanSelesai}

Kendala:
${d.kendala || "Tidak ada kendala berarti"}

Rencana Berikutnya:
${d.rencanaMingguDepan || "Akan ditentukan"}

Format laporan resmi: ringkasan eksekutif, tabel progress per WBS, analisa keterlambatan (jika ada) dan recovery plan, rencana kegiatan, tindak lanjut. Bahasa Indonesia formal dan ringkas.`,
    outputHint: "Format siap dilaporkan ke Owner/MK",
  },

  {
    id: "checklist-pho",
    name: "Checklist PHO/FHO",
    description: "Generate checklist serah terima pekerjaan (PHO/FHO) yang komprehensif sesuai kontrak.",
    category: "pm", categoryIcon: "📊", icon: "✅",
    tier: "free", isNew: true,
    estimatedTime: "~15 detik",
    agentId: "pm", outputLabel: "Checklist Serah Terima",
    fields: [
      { id: "jenis", label: "Jenis Serah Terima", type: "select", required: true, options: ["PHO (Provisional Hand Over)","FHO (Final Hand Over)","Serah Terima Parsial","Serah Terima Pekerjaan per Zona"] },
      { id: "jenisProyek", label: "Jenis Proyek", type: "select", required: true, options: ["Gedung","Infrastruktur Jalan","Jembatan","Instalasi MEP","Renovasi"] },
      { id: "nilaiKontrak", label: "Nilai Kontrak", type: "text", placeholder: "Rp 15 miliar" },
      { id: "kondisiKhusus", label: "Kondisi / Catatan Khusus", type: "textarea", placeholder: "Ada pekerjaan minor yang belum selesai, dsb.", rows: 3 },
    ],
    buildPrompt: (d) => `Kamu adalah Manajer Proyek dan konsultan MK berpengalaman. Buat checklist ${d.jenis} yang komprehensif untuk:

Jenis Proyek: ${d.jenisProyek}
Nilai Kontrak: ${d.nilaiKontrak || "tidak disebutkan"}
Kondisi Khusus: ${d.kondisiKhusus || "standar"}

Checklist harus mencakup: dokumen teknis, dokumen administrasi, kondisi fisik bangunan/infrastruktur, uji fungsi sistem, as-built drawing, manual operasi, garansi peralatan, dan jaminan pemeliharaan. Format tabel dengan kolom: No, Item, Keterangan, Status (OK/Belum/N/A), Catatan. Bahasa Indonesia profesional.`,
  },

  /* ══ K3 & KESELAMATAN ══════════════════════════════ */
  {
    id: "jsa-generator",
    name: "Generator JSA (Job Safety Analysis)",
    description: "Buat Job Safety Analysis lengkap dengan identifikasi bahaya, penilaian risiko, dan pengendalian.",
    longDesc: "Hasilkan JSA sesuai standar PP 50/2012 dan ISO 45001 dengan hierarki pengendalian risiko yang tepat.",
    category: "k3", categoryIcon: "⛑️", icon: "⛑️",
    tier: "free", isPopular: true,
    estimatedTime: "~20 detik",
    agentId: "k3", outputLabel: "Job Safety Analysis (JSA)",
    fields: [
      { id: "namaPekerjaan", label: "Nama Pekerjaan", type: "text", placeholder: "Pemasangan Bekisting Kolom Lantai 5", required: true },
      { id: "lokasiKerja", label: "Lokasi Kerja", type: "text", placeholder: "Area Grid A1-B3, Lantai 5", required: true },
      { id: "jumlahPekerja", label: "Jumlah Pekerja", type: "number", placeholder: "8" },
      { id: "peralatan", label: "Peralatan & Material", type: "textarea", placeholder: "Tower crane, scaffolding, bekisting baja, palu, dsb.", rows: 3, required: true },
      { id: "bahayaUtama", label: "Potensi Bahaya Utama (opsional)", type: "textarea", placeholder: "Jatuh dari ketinggian, terbentur material, dsb.", rows: 3 },
    ],
    buildPrompt: (d) => `Kamu adalah HSE Manager konstruksi senior, berpengalaman dalam K3 konstruksi Indonesia. Buat JSA (Job Safety Analysis) lengkap sesuai standar PP 50/2012 dan ISO 45001:2018 untuk:

Pekerjaan: ${d.namaPekerjaan}
Lokasi: ${d.lokasiKerja}
Jumlah Pekerja: ${d.jumlahPekerja || "tidak disebutkan"}
Peralatan: ${d.peralatan}
Bahaya Utama: ${d.bahayaUtama || "identifikasi secara komprehensif"}

JSA harus mencakup:
1. Tabel langkah-langkah pekerjaan (minimal 6 langkah)
2. Per langkah: bahaya (fisik, kimia, ergonomi, psikososial), risiko (L×S = Risk Rating), pengendalian (eliminasi→substitusi→rekayasa→administratif→APD)
3. APD wajib lengkap
4. Persyaratan ijin kerja (work permit) jika diperlukan
5. Tanda tangan: Pekerja, Supervisor, HSE Officer

Format tabel profesional. Bahasa Indonesia formal.`,
    outputHint: "Cetak dan tanda tangani sebelum pekerjaan dimulai",
  },

  {
    id: "hirarc-generator",
    name: "Generator Tabel HIRARC",
    description: "Buat Hazard Identification, Risk Assessment & Risk Control (HIRARC) untuk aktivitas konstruksi.",
    category: "k3", categoryIcon: "⛑️", icon: "🔴",
    tier: "free",
    estimatedTime: "~20 detik",
    agentId: "k3", outputLabel: "Tabel HIRARC",
    fields: [
      { id: "aktivitas", label: "Aktivitas/Pekerjaan", type: "text", placeholder: "Pekerjaan Galian Tanah Dalam (>3m)", required: true },
      { id: "lingkupKerja", label: "Lingkup Kerja", type: "textarea", placeholder: "Galian pile cap, dewatering, shoring...", rows: 3, required: true },
      { id: "lokasiKondisi", label: "Kondisi Lingkungan", type: "textarea", placeholder: "Dekat bangunan eksisting, muka air tanah tinggi, dsb.", rows: 2 },
    ],
    buildPrompt: (d) => `Kamu adalah HSE Manager konstruksi. Buat tabel HIRARC (Hazard Identification, Risk Assessment & Risk Control) sesuai ISO 45001:2018 dan PP 50/2012 untuk:

Aktivitas: ${d.aktivitas}
Lingkup: ${d.lingkupKerja}
Kondisi: ${d.lokasiKondisi || "standar"}

Format tabel kolom: No | Aktivitas | Bahaya | Risiko | Likelihood (1-5) | Severity (1-5) | Risk Rating | Level Risiko | Tindakan Pengendalian | PIC | Target Tanggal.

Sertakan risk matrix 5×5 dan klasifikasi level (Low/Medium/High/Extreme). Minimal 8 bahaya berbeda. Bahasa Indonesia.`,
    outputHint: "Sesuai format audit SMK3 PP 50/2012",
  },

  {
    id: "apd-list",
    name: "Daftar APD Wajib per Pekerjaan",
    description: "Dapatkan daftar Alat Pelindung Diri yang wajib, disarankan, dan standar kualitasnya.",
    category: "k3", categoryIcon: "⛑️", icon: "🦺",
    tier: "free",
    estimatedTime: "~10 detik",
    agentId: "k3", outputLabel: "Daftar APD",
    fields: [
      { id: "jenisPekerjaan", label: "Jenis Pekerjaan", type: "select", required: true, options: ["Pekerjaan di Ketinggian (>2m)","Pekerjaan Pengelasan","Pekerjaan Elektrikal","Pekerjaan di Ruang Terbatas (Confined Space)","Pekerjaan Galian/Excavation","Pekerjaan Pengecoran Beton","Pekerjaan Blasting/Spraying","Pekerjaan Rigging & Lifting","Pekerjaan Bongkar Pasang Perancah","Demolisi/Pembongkaran"] },
      { id: "kondisiKhusus", label: "Kondisi Khusus", type: "textarea", placeholder: "Bekerja di malam hari, cuaca ekstrem, dsb.", rows: 2 },
    ],
    buildPrompt: (d) => `Kamu adalah HSE Manager berpengalaman. Buat daftar APD wajib sesuai Permenaker 08/2010 dan ISO 45001:2018 untuk:

Pekerjaan: ${d.jenisPekerjaan}
Kondisi Khusus: ${d.kondisiKhusus || "standar"}

Format tabel: APD | Standar/Sertifikasi | Spesifikasi Minimum | Wajib/Disarankan | Frekuensi Inspeksi. Kelompokkan: Pelindung Kepala, Mata/Wajah, Pernapasan, Tangan, Kaki, Tubuh, Jatuh. Sertakan catatan tentang pemeriksaan kondisi APD sebelum digunakan.`,
  },

  {
    id: "prosedur-darurat",
    name: "Prosedur Tanggap Darurat",
    description: "Buat prosedur tanggap darurat (emergency response) untuk skenario kecelakaan konstruksi.",
    category: "k3", categoryIcon: "⛑️", icon: "🚨",
    tier: "free", isNew: true,
    estimatedTime: "~20 detik",
    agentId: "k3", outputLabel: "Prosedur Tanggap Darurat",
    fields: [
      { id: "jenisInsiden", label: "Jenis Insiden", type: "select", required: true, options: ["Kebakaran di Lokasi Proyek","Pekerja Jatuh dari Ketinggian","Kecelakaan Alat Berat","Ledakan/Explosion","Tumpahan Bahan Kimia/B3","Orang Tenggelam/Jatuh ke Lubang","Gempa Bumi saat Konstruksi","Runtuhnya Struktur Sementara","Pekerja Tersengat Listrik","Kecelakaan Maut (Fatal Accident)"] },
      { id: "lokasiProyek", label: "Lokasi Proyek", type: "text", placeholder: "Jakarta Selatan — dekat RSUD Pasar Minggu", required: true },
      { id: "jumlahPekerja", label: "Total Pekerja di Lokasi", type: "number", placeholder: "150" },
    ],
    buildPrompt: (d) => `Kamu adalah HSE Manager dan Emergency Response Coordinator berpengalaman. Buat prosedur tanggap darurat resmi untuk:

Skenario: ${d.jenisInsiden}
Lokasi: ${d.lokasiProyek}
Total Pekerja: ${d.jumlahPekerja || "tidak disebutkan"}

Prosedur harus mencakup: (1) Deteksi & Pelaporan Awal, (2) Aktivasi Tim Tanggap Darurat, (3) Langkah Penanganan Immediate, (4) Evakuasi (jika diperlukan), (5) Koordinasi dengan Pihak Eksternal (pemadam, ambulans, polisi), (6) Penyelidikan Insiden, (7) Pelaporan ke Disnaker. Sertakan nomor darurat template dan diagram alur (dalam teks). Referensi: UU 1/1970 dan PP 50/2012.`,
  },

  /* ══ DOKUMEN & SURAT ══════════════════════════════ */
  {
    id: "surat-teguran",
    name: "Generator Surat Teguran",
    description: "Buat surat teguran formal kepada subkontraktor, pemasok, atau pihak lain yang tidak memenuhi kewajiban.",
    category: "dokumen", categoryIcon: "📄", icon: "✉️",
    tier: "free", isPopular: true,
    estimatedTime: "~15 detik",
    agentId: "kontrak", outputLabel: "Surat Teguran",
    fields: [
      { id: "jenisPlanggar", label: "Pihak yang Ditegur", type: "select", required: true, options: ["Subkontraktor","Pemasok/Supplier","Konsultan Perencana","Konsultan MK","Mandor/Kepala Tukang","Penyewa (Tenant)"] },
      { id: "namaPenerima", label: "Nama Perusahaan/Pihak", type: "text", placeholder: "PT Jaya Mandiri Konstruksi", required: true },
      { id: "pelanggaran", label: "Jenis Pelanggaran", type: "select", required: true, options: ["Keterlambatan Pekerjaan","Kualitas Pekerjaan di Bawah Standar","Pelanggaran K3","Tidak Menyelesaikan Perbaikan (Defect)","Pengiriman Material Terlambat","Tidak Hadir Rapat Koordinasi","Pelanggaran Kontrak Lainnya"] },
      { id: "detailPelanggaran", label: "Detail Pelanggaran", type: "textarea", placeholder: "Pekerjaan pasangan dinding lantai 3 terlambat 15 hari dari jadwal, target selesai 1 April namun baru 60% per tanggal ini...", rows: 4, required: true },
      { id: "teguranKe", label: "Surat Teguran ke-", type: "select", options: ["1 (Pertama)","2 (Kedua)","3 (Terakhir/Final)"] },
      { id: "deadlineRespons", label: "Batas Waktu Respons", type: "text", placeholder: "7 hari kerja sejak surat ini diterima" },
    ],
    buildPrompt: (d) => `Kamu adalah konsultan hukum konstruksi senior. Buat surat teguran formal dengan ketentuan:

Penerima: ${d.namaPenerima} (${d.jenisPlanggar})
Teguran ke: ${d.teguranKe || "Pertama"}
Jenis Pelanggaran: ${d.pelanggaran}
Detail: ${d.detailPelanggaran}
Batas Respons: ${d.deadlineRespons || "7 hari kerja"}

Format surat resmi lengkap: kop surat, nomor surat, perihal, salam, isi (kronologi, dasar kontrak, tuntutan), konsekuensi jika tidak ditindaklanjuti, tanda tangan. Merujuk klausul kontrak umum FIDIC/SPK terkait default notice. Bahasa Indonesia formal dan tegas.`,
    outputHint: "Simpan salinan untuk dokumentasi klaim di kemudian hari",
  },

  {
    id: "surat-perpanjangan",
    name: "Permohonan Perpanjangan Waktu",
    description: "Susun surat permohonan perpanjangan waktu (time extension claim) yang kuat dan terdokumentasi.",
    category: "dokumen", categoryIcon: "📄", icon: "📅",
    tier: "free",
    estimatedTime: "~20 detik",
    agentId: "kontrak", outputLabel: "Surat Permohonan Perpanjangan Waktu",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Pembangunan Gedung Kantor Bank XYZ", required: true },
      { id: "pihakPemilik", label: "Nama Owner/Pemberi Kerja", type: "text", placeholder: "PT Bank XYZ Tbk", required: true },
      { id: "durasiPerpanjangan", label: "Durasi Perpanjangan (hari kalender)", type: "number", placeholder: "45", required: true },
      { id: "alasanUtama", label: "Alasan Perpanjangan", type: "select", required: true, options: ["Force Majeure (Bencana Alam/Pandemi)","Cuaca Ekstrem di Luar Normal","Perubahan Desain (Change Order)","Keterlambatan Ijin dari Owner","Kelangkaan Material","Pekerjaan Tambah (Variation Order)","Keterlambatan Pembayaran Termin","Kondisi Lapangan Berbeda dari Kontrak"] },
      { id: "kronologi", label: "Kronologi & Bukti Pendukung", type: "textarea", placeholder: "Pada tanggal 10 Maret 2025 terjadi banjir yang menghentikan seluruh pekerjaan selama 12 hari...", rows: 4, required: true },
    ],
    buildPrompt: (d) => `Kamu adalah konsultan kontrak konstruksi berpengalaman. Buat surat permohonan perpanjangan waktu yang kuat dan mengacu FIDIC/Perpres 16/2018:

Proyek: ${d.namaProyek}
Owner: ${d.pihakPemilik}
Durasi Perpanjangan: ${d.durasiPerpanjangan} hari kalender
Alasan: ${d.alasanUtama}
Kronologi: ${d.kronologi}

Surat harus mencakup: dasar hukum klaim (pasal kontrak), kronologi kejadian, analisa dampak pada jadwal (jalur kritis), perhitungan durasi perpanjangan, dokumen pendukung yang dilampirkan, dan permintaan persetujuan. Bahasa Indonesia formal dan meyakinkan.`,
  },

  {
    id: "notulen-rapat",
    name: "Generator Notulen Rapat",
    description: "Ubah poin-poin rapat menjadi notulen resmi yang terstruktur dan siap distribusi.",
    category: "dokumen", categoryIcon: "📄", icon: "📝",
    tier: "free",
    estimatedTime: "~15 detik",
    agentId: "pm", outputLabel: "Notulen Rapat",
    fields: [
      { id: "jenisRapat", label: "Jenis Rapat", type: "text", placeholder: "Rapat Koordinasi Mingguan #14", required: true },
      { id: "tanggalWaktu", label: "Tanggal & Waktu", type: "text", placeholder: "Senin, 14 April 2025, 09.00–11.30 WIB", required: true },
      { id: "peserta", label: "Daftar Peserta", type: "textarea", placeholder: "PM (Ir. Hendra), Site Manager (Budi), MK (Pak Andi), Subkon Sipil (PT Jaya)...", rows: 3, required: true },
      { id: "poinPembahasaan", label: "Poin-poin yang Dibahas", type: "textarea", placeholder: "1. Review progress minggu lalu: 62% aktual vs 65% rencana\n2. Kendala material besi: pengiriman terlambat 3 hari\n3. Rencana pengecoran balok lt.5 hari Rabu...", rows: 6, required: true },
      { id: "actionItems", label: "Action Items / Tindak Lanjut", type: "textarea", placeholder: "PM akan koordinasi dengan supplier, MK cek gambar revisi...", rows: 3 },
    ],
    buildPrompt: (d) => `Kamu adalah administrator proyek konstruksi profesional. Buat notulen rapat resmi dari poin-poin berikut:

Rapat: ${d.jenisRapat}
Tanggal: ${d.tanggalWaktu}
Peserta: ${d.peserta}

Pembahasan:
${d.poinPembahasaan}

Action Items:
${d.actionItems || "sesuaikan dari poin pembahasan"}

Format notulen resmi: header (nama proyek, nomor notulen, tanggal, peserta), isi pembahasan per agenda dengan keputusan yang dicapai, tabel action items (aktivitas, PIC, deadline, status), dan kolom tanda tangan. Bahasa Indonesia formal.`,
  },

  {
    id: "rks-generator",
    name: "Generator RKS Teknis",
    description: "Buat Rencana Kerja dan Syarat (RKS/Spesifikasi Teknis) untuk item pekerjaan tertentu.",
    category: "dokumen", categoryIcon: "📄", icon: "📗",
    tier: "pro", isNew: true,
    estimatedTime: "~25 detik",
    agentId: "struktur", outputLabel: "RKS / Spesifikasi Teknis",
    fields: [
      { id: "itemPekerjaan", label: "Item Pekerjaan", type: "select", required: true, options: ["Pekerjaan Beton Bertulang","Pekerjaan Beton Pracetak","Pekerjaan Pasangan Bata","Pekerjaan Plesteran & Acian","Pekerjaan Waterproofing","Pekerjaan Cat Gedung","Pekerjaan Keramik/Granit","Pekerjaan Rangka Atap Baja","Pekerjaan Tiang Pancang","Pekerjaan Fondasi Strauss Pile"] },
      { id: "mutualBeton", label: "Mutu Material Utama", type: "text", placeholder: "fc'=25 MPa, fy=400 MPa, semen PCC" },
      { id: "standar", label: "Standar Acuan", type: "text", placeholder: "SNI 2847:2019, SNI 03-2834" },
    ],
    buildPrompt: (d) => `Kamu adalah engineer konstruksi senior. Buat Spesifikasi Teknis (RKS) untuk:

Item Pekerjaan: ${d.itemPekerjaan}
Mutu Material: ${d.mutualBeton || "standar Indonesia"}
Standar Acuan: ${d.standar || "SNI terkait"}

RKS harus mencakup: (1) Lingkup Pekerjaan, (2) Standar dan Referensi, (3) Persyaratan Material (dengan merk yang diperbolehkan), (4) Persyaratan Pelaksanaan (metode, urutan, toleransi), (5) Quality Control & Testing, (6) Pengukuran & Pembayaran. Format SNI dan bahasa Indonesia formal.`,
  },

  /* ══ ESTIMASI & RAB ════════════════════════════════ */
  {
    id: "rab-kasar",
    name: "Estimasi RAB Kasar (OE)",
    description: "Dapatkan perkiraan biaya konstruksi (Order of Magnitude / OE) dari data minimal proyek.",
    category: "estimasi", categoryIcon: "💰", icon: "💰",
    tier: "free", isPopular: true,
    estimatedTime: "~20 detik",
    agentId: "rab", outputLabel: "Estimasi RAB Kasar",
    fields: [
      { id: "jenisProyek", label: "Jenis Bangunan", type: "select", required: true, options: ["Gedung Perkantoran","Rumah Tinggal Mewah","Rumah Tinggal Tipe Sedang","Ruko Komersial","Gudang/Warehouse","Apartemen","Rumah Sakit","Sekolah/Kampus","Hotel Bintang 3","Hotel Bintang 4-5","Fasilitas Industri"] },
      { id: "lokasiProyek", label: "Lokasi Proyek", type: "select", required: true, options: ["DKI Jakarta","Surabaya","Bandung","Semarang","Medan","Bali/Denpasar","Kota Besar Lainnya","Kota Sedang (Jawa)","Luar Jawa"] },
      { id: "luasTotal", label: "Luas Total Bangunan (m²)", type: "number", placeholder: "2500", required: true },
      { id: "jumlahLantai", label: "Jumlah Lantai", type: "number", placeholder: "5", required: true },
      { id: "spesifikasi", label: "Spesifikasi/Kualitas", type: "select", options: ["Ekonomis","Standar","Menengah","Mewah","Premium"], required: true },
      { id: "tahunAnggaran", label: "Tahun Anggaran", type: "text", placeholder: "2025" },
    ],
    buildPrompt: (d) => `Kamu adalah Quantity Surveyor senior. Buat estimasi biaya konstruksi Order of Magnitude (OE) untuk:

Jenis: ${d.jenisProyek}
Lokasi: ${d.lokasiProyek}
Luas Total: ${d.luasTotal} m²
Lantai: ${d.jumlahLantai} lantai
Kualitas: ${d.spesifikasi}
Tahun: ${d.tahunAnggaran || "2025"}

Sajikan: (1) Harga satuan per m² (range min-max berdasarkan HSPK ${d.lokasiProyek} ${d.tahunAnggaran || "2025"}), (2) Estimasi total per komponen utama (Sipil/Struktur, Arsitektur, MEP, Finishing, Pekerjaan Luar), (3) Total biaya konstruksi (belum termasuk tanah dan desain), (4) Biaya soft cost (desain, perijinan, konsultan) ±15%, (5) Contingency ±10%. Sertakan asumsi dan batasan estimasi. Harga realistis berdasarkan market Indonesia.`,
    outputHint: "Estimasi ini bersifat indikatif; RAB detail perlu survey dan gambar teknis",
  },

  {
    id: "ahs-generator",
    name: "Analisa Harga Satuan Pekerjaan",
    description: "Buat AHS (Analisa Harga Satuan) berdasarkan SNI Analisa / AHSP 2022.",
    category: "estimasi", categoryIcon: "💰", icon: "📊",
    tier: "free",
    estimatedTime: "~15 detik",
    agentId: "rab", outputLabel: "Analisa Harga Satuan",
    fields: [
      { id: "itemPekerjaan", label: "Item Pekerjaan", type: "select", required: true, options: ["Pekerjaan Beton fc'=25 MPa per m³","Pekerjaan Pasangan Bata Merah per m²","Pekerjaan Plesteran 1:5 per m²","Pekerjaan Keramik 60x60 per m²","Pekerjaan Cat Tembok per m²","Pekerjaan Bekisting Balok per m²","Pekerjaan Pembesian D16 per kg","Pekerjaan Waterproofing per m²","Pekerjaan Tiang Pancang D40 per m'","Pekerjaan Galian Tanah Manual per m³"] },
      { id: "lokasiProyek", label: "Lokasi Proyek", type: "text", placeholder: "Jakarta Selatan", required: true },
      { id: "tahunAnggaran", label: "Tahun Anggaran", type: "text", placeholder: "2025" },
    ],
    buildPrompt: (d) => `Kamu adalah Quantity Surveyor berpengalaman. Buat Analisa Harga Satuan (AHS) sesuai AHSP 2022 / SNI Analisa Harga Satuan untuk:

Item: ${d.itemPekerjaan}
Lokasi: ${d.lokasiProyek}
Tahun: ${d.tahunAnggaran || "2025"}

Format tabel AHS: Kode | Uraian | Satuan | Koefisien | Harga Satuan (Rp) | Jumlah Harga (Rp).
Kelompokkan: Tenaga Kerja, Bahan/Material, Peralatan. Sertakan overhead 10-15% dan profit 10%. Referensikan AHSP 2022 dan HSPK ${d.lokasiProyek}. Harga material dan upah harus realistis tahun ${d.tahunAnggaran || "2025"}.`,
  },

  {
    id: "cashflow-proyek",
    name: "Template Cash Flow Proyek",
    description: "Proyeksikan cash flow proyek konstruksi berdasarkan S-Curve dan jadwal pembayaran termin.",
    category: "estimasi", categoryIcon: "💰", icon: "📉",
    tier: "pro",
    estimatedTime: "~20 detik",
    agentId: "pm", outputLabel: "Proyeksi Cash Flow",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Pembangunan Gedung A", required: true },
      { id: "nilaiKontrak", label: "Nilai Kontrak (Rp)", type: "text", placeholder: "Rp 25.000.000.000", required: true },
      { id: "durasi", label: "Durasi Kontrak (bulan)", type: "number", placeholder: "18", required: true },
      { id: "jadwalTermin", label: "Jadwal Termin Pembayaran", type: "textarea", placeholder: "Uang Muka 20% di awal, Termin per 25% progress, Retensi 5%...", rows: 3, required: true },
      { id: "distribusiPekerjaan", label: "Distribusi Pekerjaan", type: "select", options: ["S-Curve Normal (lambat-cepat-lambat)","Front Loaded (berat di awal)","Back Loaded (berat di akhir)","Linear (merata)"] },
    ],
    buildPrompt: (d) => `Kamu adalah Quantity Surveyor dan PM senior. Buat proyeksi cash flow untuk:

Proyek: ${d.namaProyek}
Nilai: ${d.nilaiKontrak}
Durasi: ${d.durasi} bulan
Termin: ${d.jadwalTermin}
Distribusi: ${d.distribusiPekerjaan || "S-Curve Normal"}

Sajikan: (1) Tabel cash flow per bulan: planned value (PV), pembayaran masuk, cash out (biaya proyek ~75-80% nilai kontrak), net cash flow, dan cumulative. (2) Identifikasi bulan dengan cash flow negatif (kebutuhan modal kerja). (3) Rekomendasi manajemen cash flow. Format tabel lengkap dan analisa ringkas.`,
  },

  {
    id: "volume-beton",
    name: "Kalkulator Volume & Material Beton",
    description: "Hitung volume beton, kebutuhan semen, pasir, kerikil, dan air untuk berbagai elemen struktur.",
    category: "estimasi", categoryIcon: "💰", icon: "🧱",
    tier: "free", isNew: true,
    estimatedTime: "~10 detik",
    agentId: "rab", outputLabel: "Perhitungan Volume & Material",
    fields: [
      { id: "elemenStruktur", label: "Elemen Struktur", type: "select", required: true, options: ["Kolom Beton","Balok Beton","Pelat Lantai","Dinding Beton","Tangga Beton","Fondasi Footplate","Fondasi Cakar Ayam","Pile Cap"] },
      { id: "dimensi", label: "Dimensi Elemen", type: "textarea", placeholder: "Contoh Kolom: 50×50 cm, tinggi 4m, jumlah 24 buah\nContoh Balok: 30×60 cm, panjang total 180m", rows: 3, required: true },
      { id: "mutuBeton", label: "Mutu Beton", type: "select", required: true, options: ["fc'=17 MPa (K-200)","fc'=21 MPa (K-250)","fc'=25 MPa (K-300)","fc'=28 MPa (K-350)","fc'=35 MPa (K-400)"] },
    ],
    buildPrompt: (d) => `Kamu adalah Quantity Surveyor. Hitung volume dan kebutuhan material beton untuk:

Elemen: ${d.elemenStruktur}
Dimensi: ${d.dimensi}
Mutu: ${d.mutuBeton}

Hitung: (1) Volume beton total (m³), (2) Kebutuhan material per m³ sesuai SNI Analisa: semen (zak 50kg), pasir (m³), kerikil (m³), air (liter), (3) Total kebutuhan material, (4) Kebutuhan ready mix (jika dipesan jadi), (5) Estimasi harga material (harga Jakarta 2025). Sertakan waste factor 5% untuk beton. Tabel lengkap dan ringkas.`,
  },

  /* ══ TEKNIS & SIPIL ══════════════════════════════ */
  {
    id: "qc-beton",
    name: "Checklist QC Pekerjaan Beton",
    description: "Dapatkan checklist quality control beton bertulang yang komprehensif sesuai standar SNI.",
    category: "teknis", categoryIcon: "🏛️", icon: "🔍",
    tier: "free",
    estimatedTime: "~15 detik",
    agentId: "struktur", outputLabel: "Checklist QC Beton",
    fields: [
      { id: "tahapan", label: "Tahapan Pekerjaan", type: "select", required: true, options: ["Pra-Pengecoran (sebelum cor)","Saat Pengecoran","Pasca-Pengecoran & Curing","Pembesian/Tulangan","Bekisting & Perancah","Penerimaan Ready Mix"] },
      { id: "elemenStruktur", label: "Elemen Struktur", type: "select", required: true, options: ["Kolom","Balok","Pelat Lantai","Dinding Geser (Shear Wall)","Fondasi","Tangga","Semua Elemen"] },
      { id: "mutuBeton", label: "Mutu Beton", type: "text", placeholder: "fc'=25 MPa" },
    ],
    buildPrompt: (d) => `Kamu adalah Quality Engineer konstruksi berpengalaman. Buat checklist QC pekerjaan beton bertulang sesuai SNI 2847:2019 untuk:

Tahapan: ${d.tahapan}
Elemen: ${d.elemenStruktur}
Mutu Beton: ${d.mutuBeton || "fc'=25 MPa"}

Checklist harus mencakup semua item kritikal dengan: No | Item Pemeriksaan | Metode Verifikasi | Toleransi (sesuai SNI) | PIC | Status (OK/NG/N/A) | Catatan. Sertakan referensi SNI 2847:2019 pada item relevan. Minimum 20 item pemeriksaan. Format siap cetak.`,
    outputHint: "Sesuai standar SNI 2847:2019 dan audit MK",
  },

  {
    id: "metode-konstruksi",
    name: "Metode Pelaksanaan Pekerjaan",
    description: "Susun metode pelaksanaan (method statement) teknis untuk pekerjaan konstruksi tertentu.",
    category: "teknis", categoryIcon: "🏛️", icon: "📐",
    tier: "pro", isNew: true,
    estimatedTime: "~25 detik",
    agentId: "struktur", outputLabel: "Metode Pelaksanaan",
    fields: [
      { id: "jenisPekerjaan", label: "Jenis Pekerjaan", type: "select", required: true, options: ["Pemancangan Tiang (Hydraulic Jack-In)","Pengecoran Beton Masif (Mass Concrete)","Erection Baja Struktural","Pemasangan Precast Girder","Pekerjaan Galian Dalam (Deep Excavation)","Grouting & Micropile","Instalasi Curtain Wall","Pekerjaan Waterproofing Basement"] },
      { id: "kondisiLapangan", label: "Kondisi Lapangan", type: "textarea", placeholder: "Lahan sempit, dekat bangunan eksisting, muka air tanah tinggi...", rows: 3 },
      { id: "peralatan", label: "Peralatan yang Tersedia", type: "textarea", placeholder: "2 unit hydraulic hammer, 1 crawler crane 50 ton...", rows: 2 },
    ],
    buildPrompt: (d) => `Kamu adalah Site Manager dan Engineer konstruksi senior. Buat Method Statement (Metode Pelaksanaan) untuk:

Pekerjaan: ${d.jenisPekerjaan}
Kondisi: ${d.kondisiLapangan || "standar"}
Peralatan: ${d.peralatan || "sesuai kebutuhan"}

Metode harus mencakup: (1) Ruang Lingkup, (2) Referensi Standar (SNI terkait), (3) Personil & Peralatan, (4) Urutan Pekerjaan Step-by-Step, (5) Quality Control & Testing, (6) Aspek K3 & Mitigasi Risiko, (7) Gambar Skema/Diagram Alur (dalam teks), (8) Dokumentasi yang Diperlukan. Bahasa Indonesia teknis dan komprehensif.`,
  },

  {
    id: "interpretasi-spt",
    name: "Interpretasi Data SPT",
    description: "Analisa data SPT (Standard Penetration Test) dan dapatkan rekomendasi fondasi yang tepat.",
    category: "teknis", categoryIcon: "🏛️", icon: "⛏️",
    tier: "free", isPopular: true,
    estimatedTime: "~20 detik",
    agentId: "geoteknik", outputLabel: "Interpretasi SPT & Rekomendasi Fondasi",
    fields: [
      { id: "dataSPT", label: "Data SPT (N-value per kedalaman)", type: "textarea", placeholder: "1m: N=4\n3m: N=6\n5m: N=8\n7m: N=12\n9m: N=18\n11m: N=28\n13m: N=45\n15m: N=50(refusal)", rows: 6, required: true, hint: "Masukkan data borehole: kedalaman (m): N-value" },
      { id: "jenisProyek", label: "Beban Bangunan", type: "select", required: true, options: ["Rumah Tinggal 1-2 Lantai","Ruko 3-4 Lantai","Gedung 5-8 Lantai","Gedung >8 Lantai","Infrastruktur Jalan/Jembatan","Gudang/Warehouse Besar"] },
      { id: "mukaAirTanah", label: "Kedalaman Muka Air Tanah (m)", type: "number", placeholder: "2.5" },
      { id: "kondisiTanah", label: "Deskripsi Visual Tanah (opsional)", type: "textarea", placeholder: "0-3m lempung lunak abu-abu, 3-10m lanau berpasir, >10m pasir kerikil...", rows: 3 },
    ],
    buildPrompt: (d) => `Kamu adalah Dr. Rini Wulandari, konsultan geoteknik berpengalaman. Analisis data berikut sesuai SNI 8460:2017 dan ASTM D1586:

Data SPT:
${d.dataSPT}

Beban: ${d.jenisProyek}
Muka Air Tanah: ${d.mukaAirTanah ? d.mukaAirTanah + " m" : "tidak diketahui"}
Deskripsi Tanah: ${d.kondisiTanah || "berdasarkan N-value"}

Analisa: (1) Klasifikasi profil tanah per layer berdasarkan N-value (USCS), (2) Identifikasi lapisan pendukung (bearing layer), (3) Perkiraan daya dukung tanah (qa dan qult), (4) Rekomendasi jenis fondasi (dengan justifikasi), (5) Estimasi kedalaman fondasi yang disarankan, (6) Potensi penurunan (settlement) dan rekomendasi mitigasi, (7) Catatan risiko (liquefaction, stability, dll). Bahasa teknis formal.`,
    outputHint: "Untuk desain final, diperlukan analisa geoteknik lengkap oleh insinyur berlisensi",
  },

  /* ══ KONTRAK & LEGAL ══════════════════════════════ */
  {
    id: "klaim-keterlambatan",
    name: "Draft Klaim Keterlambatan",
    description: "Susun klaim keterlambatan (delay claim) yang terstruktur dan mengacu FIDIC / kontrak SPK.",
    category: "kontrak", categoryIcon: "⚖️", icon: "⚖️",
    tier: "free",
    estimatedTime: "~25 detik",
    agentId: "kontrak", outputLabel: "Draft Klaim Keterlambatan",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Pembangunan Gedung Kantor 8 Lantai", required: true },
      { id: "jenisKontrak", label: "Jenis Kontrak", type: "select", required: true, options: ["FIDIC Red Book 1999","FIDIC Silver Book 1999","SPK Pemerintah (Perpres 16/2018)","Kontrak Swasta / Lump Sum","JCT Contract"] },
      { id: "durasiTerlambat", label: "Durasi Keterlambatan (hari)", type: "number", placeholder: "45", required: true },
      { id: "penyebab", label: "Penyebab Keterlambatan", type: "select", required: true, options: ["Force Majeure","Change Order/Variation","Employer Delay (keterlambatan pembayaran)","Late Instruction from Engineer","Site Conditions Differ from Contract","Concurrent Delay","Weather (di luar normal)"] },
      { id: "kronologi", label: "Kronologi & Fakta Pendukung", type: "textarea", placeholder: "15 Jan 2025: Surat pengajuan VO dikirim. 30 Jan: Belum ada respons. 15 Feb: Pekerjaan VO dimulai tanpa persetujuan untuk mencegah proyek berhenti total...", rows: 5, required: true },
      { id: "dokumenPendukung", label: "Dokumen Pendukung yang Ada", type: "textarea", placeholder: "Site diary, daily report, foto lapangan, surat korespondensi...", rows: 2 },
    ],
    buildPrompt: (d) => `Kamu adalah konsultan klaim konstruksi senior. Buat draft klaim keterlambatan berdasarkan:

Proyek: ${d.namaProyek}
Kontrak: ${d.jenisKontrak}
Durasi Terlambat: ${d.durasiTerlambat} hari
Penyebab: ${d.penyebab}
Kronologi: ${d.kronologi}
Dokumen: ${d.dokumenPendukung || "sesuai standar"}

Draft mencakup: (1) Executive Summary klaim, (2) Dasar Kontrak (pasal yang relevan dari ${d.jenisKontrak}), (3) Kronologi Lengkap (timeline events), (4) Analisa Kausalitas (penyebab vs dampak pada jadwal), (5) Perhitungan Extension of Time (EOT) yang diklaim, (6) Daftar Dokumen Pendukung, (7) Permintaan Relief (EOT + potential costs), (8) Tanggal batas notifikasi sesuai kontrak. Bahasa formal dan persuasif.`,
    outputHint: "Konsultasikan dengan pengacara untuk klaim senilai besar",
  },

  {
    id: "checklist-kontrak",
    name: "Review Checklist Kontrak",
    description: "Checklist komprehensif untuk review kontrak konstruksi sebelum ditandatangani.",
    category: "kontrak", categoryIcon: "⚖️", icon: "📋",
    tier: "free",
    estimatedTime: "~15 detik",
    agentId: "kontrak", outputLabel: "Checklist Review Kontrak",
    fields: [
      { id: "jenisKontrak", label: "Jenis Kontrak", type: "select", required: true, options: ["Kontrak Lump Sum","Kontrak Unit Price","Kontrak Gabungan","Kontrak Terima Jadi (EPC/Turnkey)","Kontrak Jasa Konsultan","Kontrak Subkontraktor"] },
      { id: "posisi", label: "Posisi Anda dalam Kontrak", type: "select", required: true, options: ["Kontraktor (menerima pekerjaan)","Owner/Employer (memberi pekerjaan)","Subkontraktor","Konsultan"] },
      { id: "nilaiKontrak", label: "Nilai Kontrak", type: "text", placeholder: "Rp 15 miliar" },
    ],
    buildPrompt: (d) => `Kamu adalah konsultan hukum konstruksi. Buat checklist review kontrak komprehensif untuk:

Jenis: ${d.jenisKontrak}
Posisi: ${d.posisi}
Nilai: ${d.nilaiKontrak || "tidak disebutkan"}

Checklist harus mencakup: Identifikasi para pihak, Lingkup pekerjaan (kejelasan scope), Harga dan pembayaran (termin, retensi, eskalasi), Jadwal dan milestone, Klaim dan variation order, Force majeure, Pengakhiran kontrak, Penyelesaian sengketa, Jaminan (performance bond, uang muka), Asuransi, Garansi pemeliharaan, Intellectual property, Pajak. Setiap item: Poin yang Diperiksa | Risiko Jika Tidak Ada | Rekomendasi. Perspektif dari posisi ${d.posisi}.`,
  },

  /* ══ MEP ══════════════════════════════════════════ */
  {
    id: "estimasi-daya-listrik",
    name: "Estimasi Kebutuhan Daya Listrik",
    description: "Hitung estimasi kebutuhan daya listrik gedung berdasarkan luas dan fungsi ruang.",
    category: "mep", categoryIcon: "⚡", icon: "⚡",
    tier: "free", isPopular: true,
    estimatedTime: "~15 detik",
    agentId: "mep", outputLabel: "Estimasi Kebutuhan Daya",
    fields: [
      { id: "jenisGedung", label: "Fungsi Gedung", type: "select", required: true, options: ["Perkantoran","Pusat Perbelanjaan/Mall","Hotel","Rumah Sakit","Sekolah/Universitas","Apartemen Hunian","Gudang/Industri Ringan","Fasilitas Olahraga","Data Center","Restoran/F&B"] },
      { id: "luasTotal", label: "Luas Total Bangunan (m²)", type: "number", placeholder: "5000", required: true },
      { id: "jumlahLantai", label: "Jumlah Lantai", type: "number", placeholder: "8", required: true },
      { id: "fasilitasKhusus", label: "Fasilitas Khusus", type: "textarea", placeholder: "Lift 3 unit, chillers, genset backup, UPS, CCTV 64 kamera...", rows: 3 },
    ],
    buildPrompt: (d) => `Kamu adalah MEP Engineer senior. Hitung estimasi kebutuhan daya listrik sesuai PUIL 2011 untuk:

Fungsi: ${d.jenisGedung}
Luas: ${d.luasTotal} m²
Lantai: ${d.jumlahLantai} lantai
Fasilitas Khusus: ${d.fasilitasKhusus || "standar"}

Hitung: (1) Beban instalasi penerangan (watt/m² sesuai SNI), (2) Beban stop kontak dan peralatan, (3) Beban sistem AC/HVAC, (4) Beban lift dan eskalator (jika ada), (5) Beban fasilitas khusus, (6) Total beban terpasang, (7) Demand factor dan kebutuhan daya aktual, (8) Rekomendasi daya PLN yang diminta (kVA) dan ukuran trafo, (9) Kebutuhan genset backup (%). Format tabel per kategori. Referensi PUIL 2011.`,
    outputHint: "Konsultasikan dengan PLN setempat untuk layanan daya",
  },

  {
    id: "spesifikasi-ac",
    name: "Spesifikasi Sistem AC/HVAC",
    description: "Tentukan kapasitas dan spesifikasi sistem pendingin udara berdasarkan parameter ruang.",
    category: "mep", categoryIcon: "⚡", icon: "❄️",
    tier: "free",
    estimatedTime: "~15 detik",
    agentId: "mep", outputLabel: "Spesifikasi AC/HVAC",
    fields: [
      { id: "fungsiRuang", label: "Fungsi Ruang", type: "select", required: true, options: ["Kantor Open Plan","Ruang Meeting","Server Room/Data Center","Showroom","Restoran","Kamar Hotel","Ruang Kelas","Lobby/Atrium","Rumah Sakit (ICU/OR)"] },
      { id: "luasRuang", label: "Luas Ruang (m²)", type: "number", placeholder: "200", required: true },
      { id: "tinggiRuang", label: "Tinggi Plafon (m)", type: "number", placeholder: "3.2" },
      { id: "jumlahOrang", label: "Jumlah Orang dalam Ruang", type: "number", placeholder: "40" },
      { id: "peralatanPanas", label: "Peralatan yang Mengeluarkan Panas", type: "textarea", placeholder: "20 komputer, 5 server, 2 mesin fotokopi, proyektor...", rows: 2 },
      { id: "orientasi", label: "Orientasi Gedung", type: "select", options: ["Utara-Selatan (sedikit paparan matahari)","Timur-Barat (banyak paparan matahari)","Tidak Diketahui"] },
    ],
    buildPrompt: (d) => `Kamu adalah MEP Engineer HVAC specialist. Hitung cooling load dan tentukan spesifikasi AC sesuai SNI 6572:2001 dan ASHRAE 62.1 untuk:

Fungsi: ${d.fungsiRuang}
Luas: ${d.luasRuang} m²
Tinggi Plafon: ${d.tinggiRuang || "3"} m
Jumlah Orang: ${d.jumlahOrang || "estimasi"}
Peralatan: ${d.peralatanPanas || "standar kantor"}
Orientasi: ${d.orientasi || "tidak diketahui"}

Hitung: (1) Cooling load dari masing-masing sumber (manusia, peralatan, infiltrasi, transmisi atap/dinding, radiasi matahari), (2) Total cooling load (watt dan BTU/h dan TR), (3) Rekomendasi kapasitas AC (dengan safety factor 10%), (4) Jenis sistem AC yang sesuai (split, cassette, AHU, VRV/VRF), (5) Spesifikasi teknis minimum, (6) Jumlah unit yang disarankan, (7) Fresh air requirement (ASHRAE 62.1). Tabel lengkap.`,
  },

  {
    id: "checklist-commissioning",
    name: "Checklist Commissioning MEP",
    description: "Generate checklist testing & commissioning sistem MEP sebelum serah terima ke owner.",
    category: "mep", categoryIcon: "⚡", icon: "🔧",
    tier: "pro", isNew: true,
    estimatedTime: "~20 detik",
    agentId: "mep", outputLabel: "Checklist Commissioning",
    fields: [
      { id: "sistemMEP", label: "Sistem MEP", type: "select", required: true, options: ["Sistem Listrik (MV/LV)","Sistem HVAC/AC Sentral","Sistem Plumbing & Sanitary","Sistem Fire Fighting (Sprinkler & Hidran)","Sistem Fire Alarm","Sistem Lift & Escalator","Sistem CCTV & BMS","Semua Sistem MEP"] },
      { id: "jenisGedung", label: "Jenis & Skala Gedung", type: "text", placeholder: "Gedung perkantoran 12 lantai, 15.000 m²", required: true },
    ],
    buildPrompt: (d) => `Kamu adalah MEP Commissioning Engineer. Buat checklist commissioning ${d.sistemMEP} untuk:

Gedung: ${d.jenisGedung}

Checklist mencakup: Pre-commissioning (visual check, continuity test), Functional test per alat, System integration test, Performance test (capacity, pressure, temperature), Safety test, dan dokumentasi hasil. Format tabel: No | Item Test | Parameter | Standar/Toleransi | Hasil Test | Status | Catatan | Tanggal | Insinyur. Referensikan standar PUIL 2011, SNI, dan NFPA untuk sistem terkait. Minimum 25 item.`,
  },

  /* ══ BIM & DIGITAL ════════════════════════════════ */
  {
    id: "bep-generator",
    name: "Generator BEP (BIM Execution Plan)",
    description: "Buat BIM Execution Plan ringkas dan profesional sesuai standar ISO 19650.",
    category: "bim", categoryIcon: "🖥️", icon: "🖥️",
    tier: "pro", isPopular: true,
    estimatedTime: "~25 detik",
    agentId: "bim", outputLabel: "BIM Execution Plan (BEP)",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Gedung Kantor PT Maju Tbk", required: true },
      { id: "nilaiProyek", label: "Nilai Proyek", type: "text", placeholder: "Rp 80 miliar" },
      { id: "tahapan", label: "Tahap Proyek", type: "select", required: true, options: ["SD/DD (Skematik/Pengembangan Desain)","CD (Construction Document)","Konstruksi (Construction Phase)","O&M (Operasi & Pemeliharaan)","Full BIM (SD hingga O&M)"] },
      { id: "software", label: "Software BIM yang Digunakan", type: "textarea", placeholder: "Revit Architecture, Revit Structure, Revit MEP, Navisworks Manage...", rows: 2, required: true },
      { id: "tim", label: "Tim Proyek", type: "textarea", placeholder: "Arsitek: PT Design X, Struktur: PT Sipil Y, MEP: PT MEP Z, Kontraktor: PT Bangun A...", rows: 2 },
    ],
    buildPrompt: (d) => `Kamu adalah BIM Manager berpengalaman. Buat BIM Execution Plan (BEP) sesuai ISO 19650 untuk:

Proyek: ${d.namaProyek}
Nilai: ${d.nilaiProyek || "tidak disebutkan"}
Tahap: ${d.tahapan}
Software: ${d.software}
Tim: ${d.tim || "multidisiplin"}

BEP mencakup: (1) Project Information, (2) BIM Goals & Uses, (3) Roles & Responsibilities (RACI matrix), (4) LOD Matrix per tahap & disiplin, (5) File Naming Convention, (6) CDE (Common Data Environment) yang digunakan, (7) Model Coordination Process (clash detection schedule), (8) Deliverables & Milestones, (9) Quality Control, (10) IFC & Data Exchange Protocol. Format profesional siap submit ke owner. Bahasa Indonesia formal.`,
    outputHint: "Sesuai Permen PUPR 22/2018 dan ISO 19650",
  },

  {
    id: "lod-matrix",
    name: "LOD Matrix per Disiplin",
    description: "Generate Level of Development (LOD) matrix untuk semua disiplin BIM per tahap desain.",
    category: "bim", categoryIcon: "🖥️", icon: "📊",
    tier: "free",
    estimatedTime: "~15 detik",
    agentId: "bim", outputLabel: "LOD Matrix",
    fields: [
      { id: "jenisProyek", label: "Jenis Proyek", type: "select", required: true, options: ["Gedung Bertingkat","Infrastruktur (Jalan/Jembatan)","Fasilitas Industri","Mixed-Use Development"] },
      { id: "disiplin", label: "Disiplin BIM", type: "select", required: true, options: ["Arsitektur saja","Struktur saja","MEP saja","Arsitektur + Struktur + MEP (Lengkap)"] },
      { id: "tahapAkhir", label: "Tahap BIM Tertinggi", type: "select", required: true, options: ["SD (Schematic Design)","DD (Design Development)","CD (Construction Documents)","Konstruksi (As-Built)","O&M (Operasi & Pemeliharaan)"] },
    ],
    buildPrompt: (d) => `Kamu adalah BIM Manager. Buat LOD Matrix untuk:

Proyek: ${d.jenisProyek}
Disiplin: ${d.disiplin}
Tahap Akhir: ${d.tahapAkhir}

Buat tabel matrix: Elemen Bangunan | LOD per Tahap (SD/DD/CD/Konstruksi/O&M). Untuk setiap sel LOD sebutkan angka (100/200/300/350/400/500) dan deskripsi singkat isi model. Kelompokkan elemen per sistem (Arsitektur: lantai, dinding, atap, pintu, jendela; Struktur: kolom, balok, pelat, fondasi; MEP: ducting, kabel, pipa, fixture). Referensikan BIMForum LOD Spec 2021 dan ISO 19650.`,
  },

  {
    id: "clash-checklist",
    name: "Checklist Clash Detection",
    description: "Template checklist koordinasi clash detection multi-disiplin BIM yang komprehensif.",
    category: "bim", categoryIcon: "🖥️", icon: "🔧",
    tier: "free",
    estimatedTime: "~15 detik",
    agentId: "bim", outputLabel: "Checklist Clash Detection",
    fields: [
      { id: "disiplinTerlibat", label: "Disiplin yang Terlibat", type: "select", required: true, options: ["Struktur vs MEP","Arsitektur vs Struktur","Arsitektur vs MEP","Semua Disiplin (ARK + STR + MEP)"] },
      { id: "software", label: "Software Clash Detection", type: "select", required: true, options: ["Autodesk Navisworks Manage","BIM 360 / ACC","Solibri Model Checker","Revit Interference Check","Lainnya"] },
      { id: "jenisGedung", label: "Jenis Gedung", type: "text", placeholder: "Gedung perkantoran 10 lantai" },
    ],
    buildPrompt: (d) => `Kamu adalah BIM Coordinator. Buat checklist clash detection komprehensif untuk:

Disiplin: ${d.disiplinTerlibat}
Software: ${d.software}
Gedung: ${d.jenisGedung || "gedung bertingkat"}

Checklist mencakup: (1) Pre-Clash Setup (toleransi jarak, rule set), (2) Tabel prioritas clash per tipe (Hard Clash, Soft Clash, Duplicate Clash), (3) Daftar clash yang paling umum ditemukan per pasangan disiplin, (4) Workflow penyelesaian clash (clash owner, deadline, verifikasi), (5) Format laporan clash report, (6) BCF workflow (jika digunakan). Format tabel siap digunakan di koordinasi BIM meeting. Referensi ISO 19650.`,
  },
  /* ══ NOTIS-INSPIRED: CATATAN → DOKUMEN ══════════════════════════════ */
  {
    id: "notulen-dari-teks",
    name: "Notulen Rapat dari Teks Mentah",
    description: "Paste teks catatan rapat yang tidak terstruktur — AI langsung ekstrak keputusan, action items, PIC, dan deadline.",
    longDesc: "Terinspirasi dari notis.ai: ubah catatan rapat yang berantakan menjadi notulen profesional siap distribusi dalam hitungan detik.",
    category: "dokumen", categoryIcon: "📄", icon: "🎙️",
    tier: "free", isNew: true, isPopular: true,
    estimatedTime: "~15 detik",
    agentId: "pm", outputLabel: "Notulen Rapat Terstruktur",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Proyek Gedung Kantor PT Maju", required: true },
      { id: "tanggalRapat", label: "Tanggal & Waktu Rapat", type: "text", placeholder: "Senin, 7 April 2025 — 10:00 WIB" },
      { id: "teksRapat", label: "Tempel Catatan Rapat (teks bebas / voice-to-text)", type: "textarea", rows: 10, required: true,
        placeholder: `Contoh (paste teks bebas dari rekaman/catatan):
"jadi progress minggu ini kita udah 62 persen, harusnya 65, ada delay 3 hari di pekerjaan bekisting lt4 karena material kayu telat dateng. pak budi bilang supplier perlu dikonfirmasi ulang. rencananya rabu mau cor balok lt5. terus ada masalah di gambar, arsitek belum kirim revisi shop drawing. hendra minta deadline gambar paling lambat jumat. soal K3 pak slamet lapor ada 2 worker yang gak pake harness kemarin, perlu tindak lanjut..."`,
        hint: "Bisa langsung dari voice-to-text, WhatsApp, atau catatan coret-coretan — AI akan merapikannya" },
      { id: "peserta", label: "Peserta Rapat (opsional)", type: "text", placeholder: "PM, Site Manager, MK, Subkon Sipil" },
      { id: "jenisRapat", label: "Jenis Rapat", type: "select", options: ["Rapat Koordinasi Mingguan","Rapat Progress","Rapat Teknis","Rapat K3","Rapat Keuangan","Rapat Lainnya"] },
    ],
    buildPrompt: (d) => `Kamu adalah sekretaris proyek konstruksi yang ahli. Ubah catatan rapat berantakan berikut menjadi notulen rapat profesional.

Proyek: ${d.namaProyek}
Tanggal: ${d.tanggalRapat || "tidak disebutkan"}
Jenis: ${d.jenisRapat || "Rapat Proyek"}
Peserta: ${d.peserta || "tidak disebutkan"}

CATATAN MENTAH:
${d.teksRapat}

Hasilkan notulen dalam format berikut:

## NOTULEN RAPAT — ${d.namaProyek}
**Tanggal:** [tanggal]  **Jenis:** [jenis]  **Peserta:** [peserta]

### Ringkasan Eksekutif
(2-3 kalimat inti rapat)

### Poin-Poin Pembahasan
(buat daftar terstruktur per topik)

### Keputusan yang Diambil
(bullet list keputusan yang jelas dan konkret)

### Action Items
| No | Aktivitas | PIC | Deadline | Prioritas |
|-----|-----------|-----|----------|-----------|
(ekstrak semua tindak lanjut dengan PIC dan deadline — jika tidak disebutkan beri estimasi wajar)

### Isu & Risiko yang Perlu Diperhatikan
(hal-hal yang perlu dipantau lanjut)

Bahasa Indonesia formal dan ringkas.`,
    outputHint: "Siap dibagikan via email/WhatsApp — pastikan verifikasi nama PIC dan deadline",
  },

  {
    id: "site-diary",
    name: "Site Diary Harian Otomatis",
    description: "Input catatan lapangan cepat — AI format menjadi site diary proyek yang profesional dan terdokumentasi.",
    longDesc: "Catat kondisi lapangan dalam bahasa bebas, AI mengubahnya menjadi site diary resmi lengkap dengan cuaca, pekerjaan, tenaga kerja, dan catatan insiden.",
    category: "dokumen", categoryIcon: "📄", icon: "📔",
    tier: "free", isNew: true,
    estimatedTime: "~12 detik",
    agentId: "pm", outputLabel: "Site Diary Harian",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Gedung Kantor 8 Lantai", required: true },
      { id: "tanggal", label: "Tanggal", type: "text", placeholder: "7 April 2025", required: true },
      { id: "cuaca", label: "Kondisi Cuaca", type: "select", required: true, options: ["Cerah sepanjang hari","Cerah pagi, hujan sore","Hujan sepanjang hari","Mendung (tidak hujan)","Panas terik"] },
      { id: "catatanLapangan", label: "Catatan Lapangan Hari Ini (teks bebas)", type: "textarea", rows: 8, required: true,
        placeholder: `Contoh catatan bebas:
"cor balok lt5 grid A-C selesai jam 2 siang, 48m3 readymix. tenaga kerja tukang bata 24 orang, tukang besi 16, helper 30. ada 1 pekerja kena luka ringan di tangan kena besi, sudah P3K. pengiriman kayu bekisting dari PT Kayu Jaya 15m3 diterima jam 10. mandor slamet bilang besok rencana pasang tulangan kolom lt5 grid D-F. ada tamu dari owner jam 3 sore inspeksi, hasilnya ok.",
`,
        hint: "Tulis bebas seperti WhatsApp — AI akan merapikan menjadi site diary resmi" },
      { id: "jumlahPekerja", label: "Total Pekerja Hari Ini", type: "number", placeholder: "75" },
      { id: "alat", label: "Alat Berat Beroperasi", type: "text", placeholder: "Tower crane 1 unit, concrete pump 1 unit, vibrator 3 unit" },
    ],
    buildPrompt: (d) => `Kamu adalah Site Manager proyek konstruksi. Ubah catatan lapangan berikut menjadi Site Diary resmi.

Proyek: ${d.namaProyek}
Tanggal: ${d.tanggal}
Cuaca: ${d.cuaca}
Total Pekerja: ${d.jumlahPekerja || "lihat dari catatan"} orang
Alat Berat: ${d.alat || "lihat dari catatan"}

CATATAN LAPANGAN:
${d.catatanLapangan}

Format Site Diary resmi:

## SITE DIARY — ${d.namaProyek}
**Tanggal:** ${d.tanggal} | **Cuaca:** ${d.cuaca} | **Halaman:** ___

### Kondisi Umum Lapangan
(ringkasan situasi hari ini)

### Pekerjaan yang Dilaksanakan
| No | Uraian Pekerjaan | Lokasi/Zona | Volume | Satuan | Keterangan |
|----|------------------|-------------|--------|--------|------------|

### Sumber Daya
**Tenaga Kerja:**
| Jabatan | Jumlah |
|---------|--------|

**Peralatan:**
| Alat | Jumlah | Kondisi |
|------|--------|---------|

**Material Diterima:**
| Material | Volume | Supplier |
|----------|--------|---------|

### Insiden & K3
(catat setiap insiden keselamatan, meski minor)

### Kunjungan Tamu / Inspeksi
(catat siapa yang datang dan hasilnya)

### Kendala & Catatan Penting
(masalah yang perlu tindak lanjut)

### Rencana Kegiatan Esok Hari
(berdasarkan catatan)

**Dibuat oleh:** Site Manager | **Tanggal:** ${d.tanggal}

Bahasa Indonesia formal dan presisi. Jika ada informasi tidak disebutkan, beri nilai "-".`,
    outputHint: "Simpan site diary setiap hari — dokumen krusial untuk klaim dan audit",
  },

  {
    id: "daily-report-generator",
    name: "Daily Report Proyek (AI Digest)",
    description: "Masukkan poin-poin progres harian, AI langsung susun daily report eksekutif yang siap kirim ke owner.",
    longDesc: "Seperti daily digest notis.ai — ringkas semua aktivitas, masalah, dan rencana hari ini menjadi laporan eksekutif 1 halaman yang profesional.",
    category: "pm", categoryIcon: "📊", icon: "📨",
    tier: "free", isNew: true,
    estimatedTime: "~15 detik",
    agentId: "pm", outputLabel: "Daily Report Eksekutif",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Pembangunan Gedung Kantor PT XYZ", required: true },
      { id: "tanggal", label: "Tanggal Laporan", type: "text", placeholder: "Senin, 7 April 2025", required: true },
      { id: "progressKumulatif", label: "Progress Kumulatif s.d. Hari Ini (%)", type: "number", placeholder: "63" },
      { id: "progressRencana", label: "Progress Rencana s.d. Hari Ini (%)", type: "number", placeholder: "65" },
      { id: "kegiatanHariIni", label: "Kegiatan yang Dikerjakan Hari Ini", type: "textarea", rows: 4, required: true,
        placeholder: "Cor balok lt5 48m3, pasang bekisting kolom lt5 grid A-C, pengiriman besi D19..." },
      { id: "kendalaHariIni", label: "Kendala / Masalah", type: "textarea", rows: 3,
        placeholder: "Ready mix terlambat 2 jam, 1 pekerja sakit, cuaca hujan jam 15.00..." },
      { id: "rencanaBesok", label: "Rencana Kegiatan Besok", type: "textarea", rows: 3,
        placeholder: "Pasang tulangan kolom lt5, lanjut bekisting balok lt5, pengecatan lt2..." },
      { id: "catatanPenting", label: "Catatan Penting / Isu Mendesak", type: "textarea", rows: 2,
        placeholder: "Owner akan inspeksi Rabu, perlu koordinasi clean-up area lt3..." },
    ],
    buildPrompt: (d) => {
      const deviasi = d.progressKumulatif && d.progressRencana
        ? `${(Number(d.progressKumulatif) - Number(d.progressRencana)).toFixed(1)}%`
        : "N/A";
      const status = d.progressKumulatif && d.progressRencana
        ? Number(d.progressKumulatif) >= Number(d.progressRencana) ? "ON TRACK ✅" : "BEHIND SCHEDULE ⚠️"
        : "";
      return `Kamu adalah Manajer Proyek konstruksi senior. Susun Daily Report eksekutif ringkas (1 halaman) untuk dikirim ke owner/direksi.

Proyek: ${d.namaProyek}
Tanggal: ${d.tanggal}
Progress Aktual: ${d.progressKumulatif || "N/A"}% | Rencana: ${d.progressRencana || "N/A"}% | Deviasi: ${deviasi} | Status: ${status}

Kegiatan Hari Ini:
${d.kegiatanHariIni}

Kendala:
${d.kendalaHariIni || "Tidak ada kendala berarti"}

Rencana Besok:
${d.rencanaBesok || "Akan ditentukan"}

Catatan Penting:
${d.catatanPenting || "-"}

Format Daily Report yang ringkas dan profesional:

## DAILY REPORT — ${d.namaProyek}
**Tanggal:** ${d.tanggal}

### Status Progress
(tabel mini: rencana vs aktual vs deviasi, status keseluruhan)

### Kegiatan Hari Ini
(bullet list ringkas per pekerjaan utama)

### Kendala & Tindak Lanjut
(issue + siapa yang bertanggung jawab menyelesaikan + kapan)

### Rencana Besok
(bullet list singkat)

### Isu Penting untuk Perhatian Manajemen
(highlight jika ada hal mendesak yang perlu keputusan owner/direksi)

---
*Laporan disiapkan oleh: Tim Proyek | ${d.tanggal}*

Bahasa Indonesia profesional, ringkas, langsung ke poin. Maksimal 1 halaman A4.`;
    },
    outputHint: "Kirim daily report ke WhatsApp group owner/direksi setiap sore hari",
  },

  {
    id: "voice-to-instruksi",
    name: "Catatan Suara → Instruksi Lapangan",
    description: "Paste voice-to-text atau catatan bebas dari lapangan — AI ubah jadi instruksi kerja tertulis yang jelas.",
    longDesc: "Supervisor lapangan bicara, AI merapikan jadi instruksi kerja tertulis yang tidak ambigu untuk subkontraktor dan mandor.",
    category: "dokumen", categoryIcon: "📄", icon: "🗣️",
    tier: "free", isNew: true,
    estimatedTime: "~10 detik",
    agentId: "pm", outputLabel: "Instruksi Kerja Tertulis",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Proyek Gedung Office Park", required: true },
      { id: "ditujukanKe", label: "Ditujukan Kepada", type: "text", placeholder: "Mandor/Subkontraktor Sipil/Kepala Tukang Besi", required: true },
      { id: "catatanSuara", label: "Paste Teks Catatan / Voice-to-Text", type: "textarea", rows: 8, required: true,
        placeholder: `Paste langsung dari voice-to-text atau WhatsApp, contoh:
"pak tolong besok pagi sebelum jam 7 tim besi nya udah standby di lt6 ya buat pasang tulangan kolom yang kemarin belum selesai. yang grid D sama E dulu karena jumat mau dicor. jangan lupa bawa las dan kawat ikat yang cukup. kalau ada yang butuh material tambahan langsung lapor ke pak hendra jangan nunggu sampai kehabisan. terus perhatiin juga jarak sengkang nya sesuai gambar, kemarin masih ada yang 25cm harusnya 15cm..."`,
        hint: "Langsung paste dari voice-to-text HP, rekaman WhatsApp, atau catatan coret-coretan" },
      { id: "prioritas", label: "Tingkat Prioritas", type: "select", options: ["Segera (hari ini)","Normal (besok)","Perencanaan (minggu ini)"] },
    ],
    buildPrompt: (d) => `Kamu adalah Site Manager konstruksi yang berpengalaman. Ubah catatan suara/teks bebas berikut menjadi instruksi kerja tertulis yang jelas, tidak ambigu, dan langsung bisa dilaksanakan di lapangan.

Proyek: ${d.namaProyek}
Kepada: ${d.ditujukanKe}
Prioritas: ${d.prioritas || "Normal"}

CATATAN ASLI:
${d.catatanSuara}

Format instruksi kerja:

## INSTRUKSI KERJA
**Proyek:** ${d.namaProyek}  
**Kepada:** ${d.ditujukanKe}  
**Prioritas:** ${d.prioritas || "Normal"}  
**Tanggal:** [tanggal hari ini]  

### Instruksi Pekerjaan:
(ubah menjadi poin-poin instruksi yang jelas, terurut, dan spesifik — tanpa ambigu)
1. ...
2. ...

### Spesifikasi & Standar yang Harus Dipatuhi:
(ekstrak standar teknis atau mutu yang disebutkan)

### Batas Waktu:
(ekstrak deadline yang disebutkan, atau beri estimasi wajar)

### Koordinasi & Pelaporan:
(kepada siapa harus melapor dan kapan)

### Catatan Keselamatan:
(K3 yang relevan dengan pekerjaan ini)

---
Bahasa Indonesia formal dan tegas. Gunakan kalimat perintah aktif yang jelas.`,
    outputHint: "Simpan instruksi ini sebagai bukti tertulis — lebih kuat dari instruksi lisan",
  },

  /* ══ QUEENSCORE-INSPIRED: AI SERBA GUNA KONSTRUKSI ══════════════════ */

  /* ── Teknis & Sipil Tambahan ── */
  {
    id: "desain-campuran-beton",
    name: "Mix Design Beton (SNI)",
    description: "Hitung proporsi campuran beton (mix design) sesuai SNI 03-2834 dari mutu yang diinginkan.",
    category: "teknis", categoryIcon: "🏛️", icon: "🧪",
    tier: "free", isNew: true, isPopular: true,
    estimatedTime: "~15 detik",
    agentId: "struktur", outputLabel: "Mix Design Beton",
    fields: [
      { id: "mutuBeton", label: "Mutu Beton Target", type: "select", required: true, options: ["fc'=17 MPa (K-200)","fc'=20 MPa (K-225)","fc'=21 MPa (K-250)","fc'=25 MPa (K-300)","fc'=28 MPa (K-350)","fc'=30 MPa (K-350+)","fc'=35 MPa (K-400)"] },
      { id: "tipeSemen", label: "Tipe Semen", type: "select", required: true, options: ["Semen Portland Tipe I (OPC)","Semen Portland Composite (PCC)","Semen Portland Pozzolan (PPC)","Semen Portland Tipe II","Semen Portland Tipe V (SR)"] },
      { id: "ukuranKerikil", label: "Ukuran Agregat Kasar Maks.", type: "select", required: true, options: ["10 mm","20 mm","25 mm","40 mm"] },
      { id: "slump", label: "Nilai Slump yang Diinginkan (mm)", type: "select", required: true, options: ["25–50 mm (kaku, pondasi masif)","75–100 mm (normal, kolom/balok)","100–150 mm (mudah, plat tipis)","150–200 mm (sangat mudah, pumping)"] },
      { id: "kondisiLingkungan", label: "Kondisi Lingkungan", type: "select", options: ["Normal (interior)","Moderate (terkena hujan)","Severe (tepi laut)","Very Severe (daerah agresif)"] },
    ],
    buildPrompt: (d) => `Kamu adalah ahli material beton dan quality control konstruksi. Hitung mix design beton sesuai metode SNI 03-2834:2000 untuk:

Mutu Target: ${d.mutuBeton}
Tipe Semen: ${d.tipeSemen}
Agregat Kasar Maks: ${d.ukuranKerikil}
Slump: ${d.slump}
Kondisi Lingkungan: ${d.kondisiLingkungan || "Normal"}

Hitung:
1. **Kuat tekan rata-rata perlu (f'cr)** dengan standar deviasi sesuai SNI
2. **Water-Cement Ratio (W/C)** berdasarkan mutu dan kondisi lingkungan
3. **Kebutuhan air (liter/m³)** berdasarkan slump dan ukuran agregat
4. **Kebutuhan semen (kg/m³)**
5. **Kebutuhan agregat kasar dan halus (kg/m³)**
6. **Koreksi kadar air agregat (asumsi kondisi SSD)**
7. **Tabel proporsi campuran per m³ dan per adukan (0.5 m³, 1 zak semen)**
8. **Estimasi biaya material per m³ (harga Jakarta 2025)**
9. **Quality control: syarat pengujian (slump test, cube test umur 7 dan 28 hari)**

Referensi: SNI 03-2834:2000, SNI 2847:2019. Format tabel lengkap dan profesional.`,
    outputHint: "Lakukan trial mix di lapangan sebelum produksi massal",
  },

  {
    id: "kalkulator-tulangan",
    name: "Kalkulator Kebutuhan Tulangan",
    description: "Hitung kebutuhan besi tulangan (berat dan panjang) untuk elemen struktur berdasarkan gambar.",
    category: "teknis", categoryIcon: "🏛️", icon: "🔩",
    tier: "free", isNew: true,
    estimatedTime: "~12 detik",
    agentId: "struktur", outputLabel: "Kebutuhan Tulangan",
    fields: [
      { id: "elemen", label: "Elemen Struktur", type: "select", required: true, options: ["Kolom Persegi","Kolom Bulat","Balok Beton","Pelat Lantai Dua Arah","Pelat Lantai Satu Arah","Dinding Beton","Tangga Beton","Fondasi Footplate"] },
      { id: "dimensi", label: "Dimensi Elemen", type: "textarea", rows: 3, required: true, placeholder: "Contoh Kolom 50x50: utama 8D19, sengkang D10-150, tinggi 4m, jumlah 20 kolom\nContoh Balok 30x60: utama 4D19 bawah + 2D19 atas, sengkang D10-150, panjang total 120m" },
      { id: "mutubesi", label: "Mutu Besi", type: "select", required: true, options: ["BJTP 24 (fy=240 MPa, polos)","BJTD 32 (fy=320 MPa, ulir)","BJTD 40 (fy=400 MPa, ulir)","BJTD 48 (fy=480 MPa, ulir)"] },
    ],
    buildPrompt: (d) => `Kamu adalah Quantity Surveyor struktur berpengalaman. Hitung kebutuhan tulangan berdasarkan data berikut:

Elemen: ${d.elemen}
Data Tulangan: ${d.dimensi}
Mutu Besi: ${d.mutubesi}

Hitung per ukuran diameter:
1. **Tabel berat jenis besi per meter** (D10=0.617 kg/m, D13=1.04, D16=1.58, D19=2.23, D22=3.00, D25=3.85 kg/m)
2. **Total panjang per diameter (m)** termasuk overlap 40d
3. **Total berat per diameter (kg)**
4. **Total berat semua tulangan (kg dan ton)**
5. **Kebutuhan per satuan volume beton (kg/m³)**
6. **Estimasi harga material** (besi ulir D19 ≈ Rp 13.500/kg, D16 ≈ Rp 13.800/kg, sesuaikan 2025)
7. **Waste factor 3%**

Format tabel lengkap: Diameter | Panjang (m) | Berat/m (kg) | Total Berat (kg) | Harga Satuan | Jumlah Harga.`,
    outputHint: "Tambahkan waste 3-5% untuk pemesanan aktual ke supplier",
  },

  /* ── K3 Tambahan ── */
  {
    id: "toolbox-meeting",
    name: "Materi Toolbox Meeting (TBM)",
    description: "Generate materi Toolbox Meeting K3 harian yang relevan, singkat, dan langsung bisa dipresentasikan.",
    category: "k3", categoryIcon: "⛑️", icon: "🛠️",
    tier: "free", isNew: true, isPopular: true,
    estimatedTime: "~12 detik",
    agentId: "k3", outputLabel: "Materi Toolbox Meeting",
    fields: [
      { id: "topikK3", label: "Topik K3 Hari Ini", type: "select", required: true, options: ["Pencegahan Jatuh dari Ketinggian","Keselamatan Penggunaan Scaffolding","APD Wajib dan Cara Memakainya","Prosedur Ijin Kerja (Work Permit)","Keselamatan Pengoperasian Alat Berat","K3 Pekerjaan Pengelasan","K3 Pekerjaan Elektrikal","Tata Cara Pelaporan Kecelakaan Kerja","Bahaya Cuaca Ekstrem di Lokasi Proyek","Kebersihan dan Kerapian Lokasi Kerja (5R)","First Aid / P3K Dasar","Keselamatan Material Handling & Rigging"] },
      { id: "pekerjaan", label: "Pekerjaan Utama Hari Ini", type: "text", placeholder: "Pengecoran balok lantai 5, pemasangan scaffolding area B" },
      { id: "jumlahPekerja", label: "Jumlah Pekerja", type: "number", placeholder: "45" },
      { id: "durasi", label: "Durasi TBM", type: "select", options: ["5 menit (sangat singkat)","10 menit (singkat)","15 menit (standar)"] },
    ],
    buildPrompt: (d) => `Kamu adalah HSE Officer konstruksi berpengalaman. Buat materi Toolbox Meeting (TBM) K3 yang menarik, mudah dipahami pekerja lapangan, dan bisa dipresentasikan langsung oleh supervisor.

Topik: ${d.topikK3}
Pekerjaan Hari Ini: ${d.pekerjaan || "pekerjaan konstruksi umum"}
Jumlah Pekerja: ${d.jumlahPekerja || "tidak disebutkan"} orang
Durasi: ${d.durasi || "10 menit"}

Format Materi TBM:

## 🛠️ TOOLBOX MEETING — ${d.topikK3}
**Tanggal:** ___ | **Lokasi:** ___ | **Presenter:** ___

### 📌 Mengapa Ini Penting? (1-2 menit)
(fakta atau insiden nyata yang relevan — buat dampak emosional)

### ⚠️ Bahaya & Risiko yang Sering Terjadi (2-3 menit)
(list singkat dengan ilustrasi verbal yang mudah dimengerti pekerja lapangan)

### ✅ Yang HARUS Dilakukan (cara aman) (3-4 menit)
(instruksi spesifik yang bisa langsung dilakukan — bahasa sederhana)

### ❌ Yang DILARANG (larangan keras)
(apa yang tidak boleh dilakukan)

### 🎯 Pesan Utama Hari Ini (1 kalimat kuat)

### ❓ Pertanyaan untuk Pekerja (2 pertanyaan diskusi)

---
*Referensi: PP 50/2012, ISO 45001:2018*  
*Tanda tangan peserta: _______________*

Bahasa Indonesia sederhana, mudah dipahami, tidak terlalu teknis. Gunakan analogi praktis.`,
    outputHint: "Cetak dan minta tanda tangan peserta untuk dokumentasi K3",
  },

  {
    id: "investigasi-insiden",
    name: "Laporan Investigasi Insiden K3",
    description: "Susun laporan investigasi kecelakaan/insiden K3 yang sistematis dengan analisa akar masalah (RCA).",
    category: "k3", categoryIcon: "⛑️", icon: "🔍",
    tier: "free",
    estimatedTime: "~20 detik",
    agentId: "k3", outputLabel: "Laporan Investigasi Insiden",
    fields: [
      { id: "tanggalInsiden", label: "Tanggal & Waktu Insiden", type: "text", placeholder: "Senin, 7 April 2025 — 14:30 WIB", required: true },
      { id: "jenisInsiden", label: "Jenis Insiden", type: "select", required: true, options: ["Near Miss (hampir kecelakaan)","First Aid Case (P3K)","Medical Treatment Case","Lost Time Injury (LTI)","Fatality","Property Damage","Environmental Incident"] },
      { id: "kronologi", label: "Kronologi Kejadian", type: "textarea", rows: 5, required: true, placeholder: "Pekerja A sedang memasang bekisting di lantai 5, tiba-tiba scaffolding bergeser dan pekerja kehilangan keseimbangan, jatuh sejauh 1.5m dan mendarat di platform bawah..." },
      { id: "korban", label: "Data Korban / Kerusakan", type: "textarea", rows: 2, placeholder: "Ahmad Sulaiman (32th), tukang kayu, luka di tangan kiri, dibawa ke klinik proyek..." },
      { id: "apd", label: "APD yang Digunakan Saat Insiden", type: "text", placeholder: "Helm, sepatu safety, tidak menggunakan harness" },
    ],
    buildPrompt: (d) => `Kamu adalah HSE Investigator berpengalaman. Susun laporan investigasi insiden K3 yang sistematis menggunakan metode 5-Why dan Fishbone Analysis sesuai PP 50/2012.

Tanggal: ${d.tanggalInsiden}
Jenis: ${d.jenisInsiden}
Kronologi: ${d.kronologi}
Korban/Kerusakan: ${d.korban || "tidak ada korban"}
APD: ${d.apd || "tidak disebutkan"}

Laporan mencakup:

## LAPORAN INVESTIGASI INSIDEN K3
**Nomor Laporan:** ___ | **Tanggal:** ${d.tanggalInsiden} | **Klasifikasi:** ${d.jenisInsiden}

### 1. Data Insiden
(waktu, lokasi spesifik, aktivitas saat kejadian, saksi)

### 2. Kronologi Lengkap
(timeline step-by-step sebelum, saat, dan sesudah insiden)

### 3. Analisa Akar Masalah — 5 Why
(5 pertanyaan "Mengapa" hingga akar masalah sebenarnya)

### 4. Fishbone Analysis
(4 kategori: Manusia, Metode, Material, Lingkungan)

### 5. Faktor Penyebab
(Penyebab Langsung | Penyebab Tidak Langsung | Akar Masalah)

### 6. Tindakan Perbaikan (Corrective Action)
| No | Tindakan | PIC | Deadline | Status |
|----|----------|-----|----------|--------|

### 7. Tindakan Pencegahan (Preventive Action)
(untuk mencegah kejadian serupa di masa depan)

### 8. Rekomendasi kepada Manajemen

Referensi: PP 50/2012, ISO 45001:2018, Permenaker 03/1998.`,
  },

  /* ── Estimasi & RAB Tambahan ── */
  {
    id: "value-engineering",
    name: "Analisa Value Engineering",
    description: "Identifikasi peluang penghematan biaya tanpa mengurangi fungsi dan kualitas pekerjaan.",
    category: "estimasi", categoryIcon: "💰", icon: "💡",
    tier: "free", isNew: true,
    estimatedTime: "~20 detik",
    agentId: "rab", outputLabel: "Analisa Value Engineering",
    fields: [
      { id: "itemPekerjaan", label: "Item Pekerjaan yang Dievaluasi", type: "text", placeholder: "Pekerjaan Struktur Beton Bertulang Gedung 8 Lantai", required: true },
      { id: "spesifikasiAwal", label: "Spesifikasi / Desain Awal", type: "textarea", rows: 4, required: true, placeholder: "Kolom 60x60 fc'=35MPa, Balok 35x70 fc'=35MPa, Pelat 15cm fc'=25MPa, tulangan BJTD40..." },
      { id: "estimasiAwal", label: "Estimasi Biaya Awal", type: "text", placeholder: "Rp 8.500.000.000" },
      { id: "targetPenghematan", label: "Target Penghematan (%)", type: "number", placeholder: "15" },
    ],
    buildPrompt: (d) => `Kamu adalah Quantity Surveyor dan Value Engineer berpengalaman. Lakukan analisa Value Engineering (VE) untuk:

Item: ${d.itemPekerjaan}
Spesifikasi Awal: ${d.spesifikasiAwal}
Estimasi Biaya: ${d.estimasiAwal || "tidak disebutkan"}
Target Penghematan: ${d.targetPenghematan || "10-20"}%

Analisa VE mencakup:
1. **Identifikasi Fungsi Utama** (apa fungsi kritis yang harus dipertahankan)
2. **Tabel Alternatif Penghematan** per komponen:
   | Komponen | Spesifikasi Awal | Alternatif VE | Estimasi Penghematan | Risiko/Catatan |
3. **Alternatif Material** yang setara atau lebih ekonomis
4. **Alternatif Metode Konstruksi** yang lebih efisien
5. **Optimasi Desain** (reduksi dimensi yang masih aman secara struktur)
6. **Prioritas Implementasi** (quick win vs medium term)
7. **Potensi Penghematan Total** (Rp dan %)
8. **Hal yang TIDAK boleh dikompromikan** (aspek keselamatan dan fungsi kritis)

Catatan: semua alternatif harus tetap memenuhi SNI yang berlaku.`,
    outputHint: "Presentasikan ke owner dan konsultan sebelum diputuskan",
  },

  {
    id: "perbandingan-penawaran",
    name: "Analisa Perbandingan Penawaran",
    description: "Bandingkan beberapa penawaran subkontraktor/supplier secara objektif dengan scoring matrix.",
    category: "estimasi", categoryIcon: "💰", icon: "📋",
    tier: "free", isNew: true,
    estimatedTime: "~15 detik",
    agentId: "rab", outputLabel: "Analisa Perbandingan Penawaran",
    fields: [
      { id: "itemPengadaan", label: "Item Pengadaan", type: "text", placeholder: "Subkontraktor Pekerjaan Mekanikal Gedung", required: true },
      { id: "penawar1", label: "Penawar 1 (nama & harga)", type: "text", placeholder: "PT Alpha Mekanikal — Rp 3.250.000.000", required: true },
      { id: "penawar2", label: "Penawar 2 (nama & harga)", type: "text", placeholder: "PT Beta Teknik — Rp 2.980.000.000" },
      { id: "penawar3", label: "Penawar 3 (nama & harga)", type: "text", placeholder: "PT Gamma Jaya — Rp 3.100.000.000" },
      { id: "hpsOwner", label: "HPS / Budget Owner", type: "text", placeholder: "Rp 3.000.000.000" },
      { id: "kualifikasi", label: "Kualifikasi & Catatan Tambahan", type: "textarea", rows: 3, placeholder: "PT Alpha: pengalaman 10 tahun, sudah kerja sama sebelumnya, BUJK grade M\nPT Beta: harga paling murah tapi baru, belum ada track record di gedung\nPT Gamma: sedang mengerjakan proyek lain, kapasitas perlu dicek..." },
    ],
    buildPrompt: (d) => `Kamu adalah Procurement Manager konstruksi berpengalaman. Buat analisa perbandingan penawaran (bid comparison) yang objektif menggunakan scoring matrix untuk:

Item: ${d.itemPengadaan}
HPS/Budget: ${d.hpsOwner || "tidak disebutkan"}

Penawar:
1. ${d.penawar1}
2. ${d.penawar2 || "tidak ada penawar 2"}
3. ${d.penawar3 || "tidak ada penawar 3"}

Kualifikasi: ${d.kualifikasi || "standar"}

Analisa mencakup:
1. **Tabel Perbandingan Harga** (vs HPS, selisih Rp dan %)
2. **Bid Leveling** (pastikan lingkup apples-to-apples)
3. **Scoring Matrix** dengan kriteria:
   | Kriteria | Bobot | Penawar 1 | Penawar 2 | Penawar 3 |
   (Harga 40%, Track Record 25%, Kemampuan Teknis 20%, Waktu Pelaksanaan 15%)
4. **Total Score** dan **Ranking Rekomendasi**
5. **Red Flags** yang perlu diwaspadai per penawar
6. **Rekomendasi Final** dengan justifikasi
7. **Negosiasi Points** untuk penawar terpilih

Bahasa Indonesia formal. Format laporan siap presentasi ke direksi.`,
    outputHint: "Dokumentasikan proses evaluasi ini untuk audit dan compliance",
  },

  /* ── Kontrak & Legal Tambahan ── */
  {
    id: "addendum-kontrak",
    name: "Draft Addendum Kontrak",
    description: "Susun addendum/amandemen kontrak untuk perubahan lingkup, waktu, atau harga pekerjaan.",
    category: "kontrak", categoryIcon: "⚖️", icon: "📜",
    tier: "free", isNew: true,
    estimatedTime: "~20 detik",
    agentId: "kontrak", outputLabel: "Draft Addendum Kontrak",
    fields: [
      { id: "namaProyek", label: "Nama Proyek & Nomor Kontrak", type: "text", placeholder: "Gedung Kantor PT XYZ — Kontrak No. 001/SPK/2024", required: true },
      { id: "jenisPerubahan", label: "Jenis Perubahan", type: "select", required: true, options: ["Perubahan Lingkup Pekerjaan (Variation Order)","Perpanjangan Waktu Pelaksanaan","Penyesuaian Harga (Eskalasi/De-eskalasi)","Perubahan Spesifikasi Teknis","Perubahan Jadwal Pembayaran","Kombinasi (beberapa perubahan)"] },
      { id: "detailPerubahan", label: "Detail Perubahan", type: "textarea", rows: 4, required: true, placeholder: "Penambahan pekerjaan MEP lantai atap yang tidak ada di kontrak awal: instalasi genset 500kVA dan panel LVMDB, estimasi nilai tambah Rp 850.000.000..." },
      { id: "nilaiPerubahan", label: "Nilai Perubahan", type: "text", placeholder: "+Rp 850.000.000 (penambahan)" },
      { id: "dasarPerubahan", label: "Dasar / Justifikasi Perubahan", type: "textarea", rows: 2, placeholder: "Instruksi owner melalui surat No. 045/DIR/2025, persetujuan konsultan MK..." },
    ],
    buildPrompt: (d) => `Kamu adalah konsultan hukum konstruksi senior. Buat draft Addendum/Amandemen Kontrak yang sah secara hukum untuk:

Proyek/Kontrak: ${d.namaProyek}
Jenis Perubahan: ${d.jenisPerubahan}
Detail: ${d.detailPerubahan}
Nilai Perubahan: ${d.nilaiPerubahan || "akan ditentukan"}
Dasar: ${d.dasarPerubahan || "kesepakatan para pihak"}

Format Addendum resmi:

## ADDENDUM KONTRAK NOMOR ___ / ___
**Mengacu kepada:** ${d.namaProyek}

### Pasal 1 — Dasar Pembuatan Addendum
(latar belakang dan justifikasi perubahan)

### Pasal 2 — Perubahan yang Disepakati
(bunyi pasal kontrak asal → perubahan menjadi → bunyi baru)

### Pasal 3 — Dampak terhadap Nilai Kontrak
(rincian perubahan nilai: asal + perubahan = baru)

### Pasal 4 — Dampak terhadap Waktu Pelaksanaan
(perubahan jadwal jika ada)

### Pasal 5 — Ketentuan Lain
(klausul yang tidak berubah tetap berlaku)

### Pasal 6 — Berlakunya Addendum
(tanggal efektif)

**Kolom tanda tangan:** Pihak Pertama | Pihak Kedua | Konsultan MK | Saksi

Bahasa Indonesia hukum yang formal dan presisi. Referensi Perpres 16/2018 untuk kontrak pemerintah.`,
    outputHint: "Addendum harus ditandatangani kedua pihak sebelum perubahan dilaksanakan",
  },

  /* ── PM Tambahan ── */
  {
    id: "recovery-plan",
    name: "Recovery Plan (Rencana Pemulihan Jadwal)",
    description: "Susun rencana pemulihan jadwal (recovery plan) yang realistis saat proyek terlambat dari baseline.",
    category: "pm", categoryIcon: "📊", icon: "🔄",
    tier: "free", isNew: true,
    estimatedTime: "~20 detik",
    agentId: "pm", outputLabel: "Recovery Plan",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Gedung Kantor 10 Lantai", required: true },
      { id: "deviasi", label: "Deviasi Jadwal Saat Ini", type: "text", placeholder: "-8% (aktual 57%, rencana 65%)", required: true },
      { id: "sisaDurasi", label: "Sisa Durasi Kontrak (bulan)", type: "number", placeholder: "6", required: true },
      { id: "pekerjaan", label: "Pekerjaan yang Sedang Berjalan", type: "textarea", rows: 3, required: true, placeholder: "Finishing arsitektur lt3-5, MEP lt1-3, struktur lt6 dalam proses..." },
      { id: "penyebab", label: "Penyebab Keterlambatan", type: "textarea", rows: 3, required: true, placeholder: "Keterlambatan material besi 3 minggu, cuaca buruk 2 minggu, revisi desain lt4..." },
      { id: "sumberDaya", label: "Sumber Daya yang Bisa Ditambah", type: "textarea", rows: 2, placeholder: "Bisa tambah 2 shift kerja, tambah 30 pekerja, sewa concrete pump tambahan..." },
    ],
    buildPrompt: (d) => `Kamu adalah Manajer Proyek konstruksi senior berpengalaman. Susun Recovery Plan yang realistis dan terstruktur untuk:

Proyek: ${d.namaProyek}
Deviasi Saat Ini: ${d.deviasi}
Sisa Durasi: ${d.sisaDurasi} bulan
Pekerjaan Berjalan: ${d.pekerjaan}
Penyebab: ${d.penyebab}
Sumber Daya Tambahan: ${d.sumberDaya || "terbatas"}

Recovery Plan mencakup:

## RECOVERY PLAN — ${d.namaProyek}

### 1. Diagnosa Situasi
(ringkasan kondisi terkini, dampak terhadap milestone, risiko denda keterlambatan)

### 2. Strategi Pemulihan (pilih yang paling relevan)
- Fast-tracking (paralel pekerjaan)
- Crashing (tambah sumber daya)
- Re-sequencing (ubah urutan pekerjaan)
- Scope reduction (jika ada persetujuan owner)

### 3. Rencana Aksi Pemulihan
| Minggu | Pekerjaan Prioritas | Target Progress | Sumber Daya Tambahan | PIC |
|--------|--------------------|-----------------|--------------------|-----|
(isi untuk 4 minggu ke depan minimum)

### 4. Milestone Kritis yang Tidak Boleh Terlewat
(3-5 milestone utama dengan tanggal target)

### 5. Kebutuhan Sumber Daya Tambahan
(personil, alat, material — dengan estimasi biaya)

### 6. Risiko Recovery Plan
(apa yang bisa menghambat recovery dan mitigasinya)

### 7. Proyeksi Penyelesaian
(dengan dan tanpa recovery plan)

Bahasa Indonesia profesional. Realistis dan bisa langsung diimplementasikan.`,
    outputHint: "Presentasikan ke owner dan minta persetujuan sebelum implementasi",
  },

  {
    id: "procurement-plan",
    name: "Rencana Pengadaan Material & Subkon",
    description: "Susun procurement plan terstruktur untuk material dan subkontraktor sepanjang durasi proyek.",
    category: "pm", categoryIcon: "📊", icon: "🛒",
    tier: "free",
    estimatedTime: "~20 detik",
    agentId: "pm", outputLabel: "Procurement Plan",
    fields: [
      { id: "namaProyek", label: "Nama Proyek", type: "text", placeholder: "Gedung Apartemen 20 Lantai", required: true },
      { id: "jenisProyek", label: "Jenis Proyek", type: "select", required: true, options: ["Gedung Bertingkat","Infrastruktur Jalan","Jembatan","Fasilitas Industri","Renovasi Besar"] },
      { id: "nilaiKontrak", label: "Nilai Kontrak", type: "text", placeholder: "Rp 120 miliar" },
      { id: "durasi", label: "Durasi Proyek (bulan)", type: "number", placeholder: "24", required: true },
      { id: "pekerjaan", label: "Pekerjaan Utama yang Disubkonkan", type: "textarea", rows: 3, placeholder: "Struktur baja, MEP, curtain wall, lift, landscaping..." },
    ],
    buildPrompt: (d) => `Kamu adalah Procurement Manager konstruksi senior. Susun Procurement Plan terstruktur untuk:

Proyek: ${d.namaProyek} (${d.jenisProyek})
Nilai: ${d.nilaiKontrak || "tidak disebutkan"}
Durasi: ${d.durasi} bulan
Subkon Utama: ${d.pekerjaan || "sesuai jenis proyek"}

Procurement Plan mencakup:

## PROCUREMENT PLAN — ${d.namaProyek}

### 1. Strategi Pengadaan
(make or buy, direct procurement vs tender)

### 2. Tabel Paket Pengadaan Utama
| No | Item | Jenis | Estimasi Nilai | Metode | Jadwal Tender | Jadwal Kontrak | Lead Time |
|----|------|-------|----------------|--------|---------------|----------------|-----------|
(list semua material utama dan subkon, urutan prioritas)

### 3. Vendor List Awal
(per paket: maks 3-4 vendor yang direkomendasikan dikualifikasi)

### 4. Jadwal Pengadaan (S-Curve)
(deskripsi timeline per kuartal)

### 5. Critical Procurement Items
(item dengan lead time panjang yang perlu dipesan awal)

### 6. Dokumen Pengadaan yang Diperlukan
(checklist: RFQ, dokumen tender, SPK, dll)

Bahasa Indonesia profesional. Referensi Perpres 16/2018 untuk proyek pemerintah.`,
  },

  /* ── BIM Tambahan ── */
  {
    id: "as-built-checklist",
    name: "Checklist As-Built Drawing",
    description: "Checklist kelengkapan dan keakuratan as-built drawing sebelum serah terima ke owner.",
    category: "bim", categoryIcon: "🖥️", icon: "📐",
    tier: "free", isNew: true,
    estimatedTime: "~12 detik",
    agentId: "bim", outputLabel: "Checklist As-Built Drawing",
    fields: [
      { id: "disiplin", label: "Disiplin Gambar", type: "select", required: true, options: ["Arsitektur","Struktur","MEP (Mekanikal, Elektrikal, Plumbing)","Semua Disiplin (Lengkap)"] },
      { id: "jenisProyek", label: "Jenis & Skala Proyek", type: "text", placeholder: "Gedung perkantoran 8 lantai, luas 12.000 m²", required: true },
      { id: "formatGambar", label: "Format As-Built", type: "select", options: ["CAD (.dwg)","PDF","BIM Model (Revit)","CAD + PDF + BIM (lengkap)"] },
    ],
    buildPrompt: (d) => `Kamu adalah BIM Manager dan Document Controller konstruksi. Buat checklist as-built drawing yang komprehensif untuk:

Disiplin: ${d.disiplin}
Proyek: ${d.jenisProyek}
Format: ${d.formatGambar || "CAD + PDF"}

Checklist mencakup:

## CHECKLIST AS-BUILT DRAWING — ${d.disiplin}

**Format tabel:** No | Item Pemeriksaan | Standar/Referensi | Status (✓/✗/N/A) | Catatan

### A. Kelengkapan Dokumen
(semua lembar gambar yang wajib ada)

### B. Keakuratan Konten
(kesesuaian gambar dengan kondisi as-built aktual di lapangan)

### C. Standar Penggambaran
(title block, skala, layer, simbol, notasi)

### D. Koordinasi Antar Disiplin
(kesesuaian antara ARK, STR, dan MEP)

### E. Revisi dan Markup
(semua perubahan selama konstruksi sudah di-update)

### F. Deliverable Final
(format file, jumlah set, media penyimpanan)

Minimum 30 item pemeriksaan. Referensi: ISO 19650, Permen PUPR 22/2018.`,
    outputHint: "As-built drawing adalah dokumen aset yang sangat penting untuk O&M",
  },
];

/* Compute category counts */
const countMap: Record<string, number> = {};
for (const t of AI_TOOLS) {
  countMap[t.category] = (countMap[t.category] || 0) + 1;
}
for (const cat of TOOL_CATEGORIES) {
  if (cat.id === "all") (cat as any).count = AI_TOOLS.length;
  else (cat as any).count = countMap[cat.id] || 0;
}
