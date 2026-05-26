# ZEX LAUNCHER - OKU BENİ

Selam! Bu launcher, Minecraft sunucularına tek tıkla modlu ve vanilla giriş yapılabilmesi için Zexy tarafından özelleştirilmiştir.

Bu projeyi sıfırdan kurmak, çalıştırmak ve kendine göre düzenlemek istiyorsan aşağıdaki basit adımları takip etmen yeterli.

---

## 1. ÇALIŞTIRMAK İÇİN NE LAZIM?

Bilgisayarında şunların yüklü olması gerekiyor:
* Node.js (Sürüm 22 veya üzeri)
* Git (projeyi indirmek için)

---

## 2. PROJEYİ NASIL BAŞLATIRSIN?

1. Terminali/PowerShell'i aç ve projeyi indir:
   ```bash
   git clone https://github.com/zexyysh/ZexLauncher.git
   cd ZexLauncher
   ```
2. Gerekli kütüphaneleri yükle:
   ```bash
   npm install
   ```
3. Launcher'ı aç ve test et:
   ```bash
   npm start
   ```

---

## 3. KENDİNE GÖRE NASIL ÖZELLEŞTİRİRSİN?

### A) Sunucu Modlarını ve Güncellemeleri Bağlama
Launcher'ın modları ve sunucu dosyalarını indireceği linki değiştirmek için:
* `app/assets/js/distromanager.js` dosyasını aç.
* `exports.REMOTE_DISTRO_URL` kısmına kendi `distribution.json` linkini yaz.

### B) İsimler, Sosyal Medya ve Hoşgeldin Yazıları
Launcher'ın içindeki yazıları ve Discord vb. linklerini değiştirmek için:
* `app/assets/lang/_custom.toml` dosyasını aç ve oradaki ayarları kendine göre düzenle.

### C) Logolar ve Resimler
Kendi logolarını koymak istiyorsan:
* `app/assets/images` klasöründeki görselleri (özellikle `SealCircle.png` ve `LoadingSeal.png`) aynı isim ve boyutlarda kendi resimlerinle değiştir.

---

## 4. OYUNCULARA DAĞITMAK İÇİN EXE YAPMA (BUILD)

Her şeyi hazırladıktan sonra oyuncularına yollayacağın kurulum dosyasını (.exe) oluşturmak için terminale şu komutu yaz:
```bash
npm run dist:win
```
Bu işlem bittiğinde, proje klasörünün içinde `dist` adında yeni bir klasör açılacak. Kurulum dosyası (.exe) onun içine kaydolur.

---

## TEŞEKKÜRLER & LİSANS

* Bu proje MIT Lisansı altındadır.
* Geliştirici/Özelleştiren: Zexy (https://github.com/zexyysh)
* Orijinal Alt Yapı: Helios Launcher (Daniel Scalzi)


