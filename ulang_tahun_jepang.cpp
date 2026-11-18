// Ulang tahun bertema Jepang + gitar, di terminal (C++17)
// Kompilasi: g++ -std=c++17 ulang_tahun_jepang.cpp -o ulang_tahun_jepang
// Windows: jalankan "chcp 65001" dulu agar kanji tampil.

#include <iostream>
#include <string>
#include <thread>
#include <chrono>
#include <ctime>
#include <cstdlib>
#include <algorithm>
#include <vector>

using namespace std;

const string R = "\033[0m", RED = "\033[91m", PINK = "\033[95m",
             GOLD = "\033[93m", WHITE = "\033[97m";

void tunggu(int ms) { this_thread::sleep_for(chrono::milliseconds(ms)); }
void bersihkan() { cout << "\033[2J\033[H"; }

// Kue ulang tahun dengan n lilin (nyala = true -> api terlihat)
void lampion(int n, bool nyala = true) {
    string api, lilin;
    for (int i = 0; i < n; i++) { api += nyala ? " ) " : "   "; lilin += " | "; }
    int w = max(26, n * 3 + 6);
    string pad((w - n * 3) / 2, ' ');
    cout << GOLD << pad << api << R << "\n" << PINK << pad << lilin << R << "\n";
    cout << WHITE << string(w, '=') << R << "\n";
    cout << RED << "|" << string((w - 16) / 2, '~') << WHITE << " HAPPY BIRTHDAY " << RED
         << string(w - 2 - 16 - (w - 16) / 2, '~') << "|" << R << "\n";
    cout << GOLD << string(w, '#') << R << "\n";
}

// Gitar ASCII; 'senar' = indeks senar yang sedang bergetar (-1 = tidak ada)
void gitar(int senar) {
    const char* nota[6] = {"A2", "D3", "A3", "D4", "E4", "Bb4"};
    cout << GOLD << "                        o  o  o  o  o  o\n" << R;
    cout << "            ,--.  ___||__||__||__||__||__||___\n";
    for (int i = 0; i < 6; i++) {
        string tali = (i == senar) ? "~~~~~~~~~~~~~~~~~~~~~~~~" : "------------------------";
        cout << (i == senar ? PINK : WHITE) << "      <[=#=]|=" << tali << "  " << nota[i] << R << "\n";
    }
    cout << "      <[=====]\n";
}

void sakura(int baris) {
    const string bunga[] = {"*", "✿", "❀", "."};
    for (int b = 0; b < baris; b++) {
        string row(46, ' ');
        string out;
        for (int k = 0; k < 46; k++)
            out += (rand() % 7 == 0) ? PINK + bunga[rand() % 4] + R : " ";
        cout << out << "\n";
        tunggu(120);
    }
}

int main() {
    srand((unsigned)time(nullptr));
    string nama;
    int umur;

    cout << "Nama yang berulang tahun: ";
    getline(cin, nama);
    if (nama.empty()) nama = "Kamu";
    cout << "Umur: ";
    while (!(cin >> umur) || umur < 1 || umur > 120) {
        cin.clear(); cin.ignore(1000, '\n');
        cout << "Masukkan umur 1-120: ";
    }
    cin.ignore(1000, '\n');

    // Pembuka
    bersihkan();
    cout << "\n   " << RED << "●" << R << "  " << WHITE << "誕生日おめでとう" << R << "\n\n";
    cout << "   " << nama << "-san, selamat ulang tahun ke-" << umur << "!\n\n";
    lampion(min(umur, 10));
    tunggu(1500);

    // Permainan gitar: tiap ENTER memetik satu senar
    const int urut[] = {0, 2, 3, 4, 5, 4, 3, 2, 0, 1, 2, 3};
    cout << "\nTekan ENTER untuk memetik gitar (ketik q lalu ENTER untuk selesai).\n";
    int langkah = 0;
    string in;
    while (true) {
        int s = urut[langkah % 12];
        bersihkan();
        cout << "\n  " << GOLD << "誕生日" << R << "  Petik gitar listrik untuk " << nama << "\n\n";
        gitar(s);
        cout << "\n";
        lampion(min(umur, 10));
        cout << "\a";   // bunyi bip terminal
        tunggu(100);
        getline(cin, in);
        if (!in.empty() && (in[0] == 'q' || in[0] == 'Q')) break;
        langkah++;
    }

    // Penutup: hujan sakura
    bersihkan();
    cout << "\n  Fiuuuh! Lilin ditiup.\n\n";
    lampion(min(umur, 10), false);
    cout << "\n  " << PINK << "✿ Hujan sakura untuk " << nama << " ✿" << R << "\n\n";
    sakura(12);
    cout << "\n  " << GOLD << "お誕生日おめでとうございます！ Semoga sehat dan bahagia selalu." << R << "\n\n";
    return 0;
}
