<?php

namespace Database\Seeders;

use App\Models\Kanji;
use Illuminate\Database\Seeder;

class KanjiSeeder extends Seeder
{
    public function run(): void
    {
        $kanjis = [
            ['character'=>'日','onyomi'=>'ニチ、ジツ','kunyomi'=>'ひ、か','meaning'=>'Hari/Matahari','stroke_count'=>4,'difficulty'=>'N5'],
            ['character'=>'月','onyomi'=>'ゲツ、ガツ','kunyomi'=>'つき','meaning'=>'Bulan','stroke_count'=>4,'difficulty'=>'N5'],
            ['character'=>'火','onyomi'=>'カ','kunyomi'=>'ひ','meaning'=>'Api','stroke_count'=>4,'difficulty'=>'N5'],
            ['character'=>'水','onyomi'=>'スイ','kunyomi'=>'みず','meaning'=>'Air','stroke_count'=>4,'difficulty'=>'N5'],
            ['character'=>'木','onyomi'=>'モク、ボク','kunyomi'=>'き','meaning'=>'Pohon/Kayu','stroke_count'=>4,'difficulty'=>'N5'],
            ['character'=>'金','onyomi'=>'キン、コン','kunyomi'=>'かね','meaning'=>'Emas/Uang','stroke_count'=>8,'difficulty'=>'N5'],
            ['character'=>'土','onyomi'=>'ド、ト','kunyomi'=>'つち','meaning'=>'Tanah','stroke_count'=>3,'difficulty'=>'N5'],
            ['character'=>'人','onyomi'=>'ジン、ニン','kunyomi'=>'ひと','meaning'=>'Orang','stroke_count'=>2,'difficulty'=>'N5'],
            ['character'=>'大','onyomi'=>'ダイ、タイ','kunyomi'=>'おお(きい)','meaning'=>'Besar','stroke_count'=>3,'difficulty'=>'N5'],
            ['character'=>'小','onyomi'=>'ショウ','kunyomi'=>'ちい(さい)、こ','meaning'=>'Kecil','stroke_count'=>3,'difficulty'=>'N5'],
            ['character'=>'山','onyomi'=>'サン','kunyomi'=>'やま','meaning'=>'Gunung','stroke_count'=>3,'difficulty'=>'N5'],
            ['character'=>'川','onyomi'=>'セン','kunyomi'=>'かわ','meaning'=>'Sungai','stroke_count'=>3,'difficulty'=>'N5'],
            ['character'=>'上','onyomi'=>'ジョウ','kunyomi'=>'うえ、あ(がる)','meaning'=>'Atas','stroke_count'=>3,'difficulty'=>'N5'],
            ['character'=>'下','onyomi'=>'カ、ゲ','kunyomi'=>'した、さ(がる)','meaning'=>'Bawah','stroke_count'=>3,'difficulty'=>'N5'],
            ['character'=>'中','onyomi'=>'チュウ','kunyomi'=>'なか','meaning'=>'Tengah/Dalam','stroke_count'=>4,'difficulty'=>'N5'],
            ['character'=>'右','onyomi'=>'ウ、ユウ','kunyomi'=>'みぎ','meaning'=>'Kanan','stroke_count'=>5,'difficulty'=>'N5'],
            ['character'=>'左','onyomi'=>'サ','kunyomi'=>'ひだり','meaning'=>'Kiri','stroke_count'=>5,'difficulty'=>'N5'],
            ['character'=>'本','onyomi'=>'ホン','kunyomi'=>'もと','meaning'=>'Buku/Asal','stroke_count'=>5,'difficulty'=>'N5'],
            ['character'=>'学','onyomi'=>'ガク','kunyomi'=>'まな(ぶ)','meaning'=>'Belajar','stroke_count'=>8,'difficulty'=>'N5'],
            ['character'=>'生','onyomi'=>'セイ、ショウ','kunyomi'=>'い(きる)、う(まれる)','meaning'=>'Hidup/Lahir','stroke_count'=>5,'difficulty'=>'N5'],
            ['character'=>'先','onyomi'=>'セン','kunyomi'=>'さき','meaning'=>'Sebelum/Duluan','stroke_count'=>6,'difficulty'=>'N5'],
            ['character'=>'食','onyomi'=>'ショク','kunyomi'=>'た(べる)','meaning'=>'Makan','stroke_count'=>9,'difficulty'=>'N5'],
            ['character'=>'飲','onyomi'=>'イン','kunyomi'=>'の(む)','meaning'=>'Minum','stroke_count'=>12,'difficulty'=>'N5'],
            ['character'=>'見','onyomi'=>'ケン','kunyomi'=>'み(る)','meaning'=>'Melihat','stroke_count'=>7,'difficulty'=>'N5'],
            ['character'=>'聞','onyomi'=>'ブン、モン','kunyomi'=>'き(く)','meaning'=>'Mendengar','stroke_count'=>14,'difficulty'=>'N5'],
            ['character'=>'読','onyomi'=>'ドク、トク','kunyomi'=>'よ(む)','meaning'=>'Membaca','stroke_count'=>14,'difficulty'=>'N5'],
            ['character'=>'書','onyomi'=>'ショ','kunyomi'=>'か(く)','meaning'=>'Menulis','stroke_count'=>10,'difficulty'=>'N5'],
            ['character'=>'話','onyomi'=>'ワ','kunyomi'=>'はな(す)、はなし','meaning'=>'Berbicara/Cerita','stroke_count'=>13,'difficulty'=>'N5'],
            ['character'=>'車','onyomi'=>'シャ','kunyomi'=>'くるま','meaning'=>'Mobil/Kendaraan','stroke_count'=>7,'difficulty'=>'N5'],
            ['character'=>'花','onyomi'=>'カ','kunyomi'=>'はな','meaning'=>'Bunga','stroke_count'=>7,'difficulty'=>'N5'],
        ];

        foreach ($kanjis as $k) {
            Kanji::create($k);
        }
    }
}
