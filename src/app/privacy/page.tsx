import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi — Money Management",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl gradient-brand text-white shadow-soft">
            <Shield className="w-6 h-6" strokeWidth={2.5} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kebijakan Privasi</h1>
            <p className="text-xs text-muted-foreground">Terakhir diperbarui: 24 Juni 2026</p>
          </div>
        </div>

        <article className="space-y-5 text-sm leading-relaxed text-foreground/90">
          <section>
            <p>
              Money Management menghormati hak privasi lo sebagai pengguna dan tunduk pada
              Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).
              Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa, dan
              bagaimana lo bisa mengontrolnya.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">1. Data yang kami kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Akun</strong>: alamat email yang lo daftarkan untuk login.
              </li>
              <li>
                <strong>Data keuangan yang lo input sendiri</strong>: transaksi, kategori,
                rekening, saldo awal, budget, goals, hutang/piutang, aset, dan catatan
                terkait. Kami <em>tidak</em> terhubung ke bank atau e-wallet manapun;
                semua data masuk via input manual lo.
              </li>
              <li>
                <strong>Preferensi tampilan</strong>: tema gelap/terang, mode keluarga atau
                usaha kecil — disimpan sebagai cookie.
              </li>
              <li>
                <strong>Tidak ada</strong> data lokasi, kontak, kamera, mikrofon, atau
                aktivitas browsing di luar app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">2. Untuk apa data dipakai</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menyajikan dashboard, laporan, insight, dan proyeksi keuangan lo.</li>
              <li>Sinkronisasi antar device lewat akun yang sama.</li>
              <li>Auto-generate transaksi berulang dan deteksi pola langganan — semua
                dihitung di server kami, tidak dibagikan ke pihak ketiga.</li>
              <li>
                <strong>Tidak untuk iklan</strong>, tidak dijual, tidak dibagikan ke
                advertiser atau pihak ketiga manapun.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">3. Penyimpanan & keamanan</h2>
            <p>
              Data lo disimpan di database Supabase (PostgreSQL) di region Asia Tenggara.
              Setiap baris data dilindungi Row Level Security (RLS) yang memastikan
              hanya akun lo yang bisa membaca / menulisnya. Koneksi dienkripsi via HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">4. Hak-hak lo (sesuai UU PDP)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Akses & portabilitas</strong>: lo bisa export seluruh transaksi
                lo ke CSV kapan saja via menu Laporan.
              </li>
              <li>
                <strong>Koreksi</strong>: edit atau hapus transaksi/rekening/kategori
                kapan saja dari app.
              </li>
              <li>
                <strong>Penghapusan</strong>: lo bisa minta penghapusan total akun dan
                seluruh data via Pengaturan → Akun → Hapus Akun. Data dihapus permanen,
                tidak bisa dipulihkan.
              </li>
              <li>
                <strong>Penarikan persetujuan</strong>: lo bisa mencabut persetujuan
                penggunaan data dengan menghapus akun. Setelah dihapus, app tidak
                lagi memproses data lo.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">5. Perubahan kebijakan</h2>
            <p>
              Kalau ada perubahan signifikan, kami akan memberitahu lewat banner di
              aplikasi sebelum perubahan berlaku. Tanggal pembaruan terakhir selalu
              tertera di atas dokumen ini.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2">6. Kontak</h2>
            <p>
              Pertanyaan atau permintaan terkait data pribadi? Hubungi pengelola app
              langsung. Untuk laporan ke Otoritas: Kementerian Komunikasi dan
              Informatika (Komdigi) menerima keluhan terkait pelanggaran UU PDP.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
