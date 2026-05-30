<?php

namespace Database\Seeders;

use App\Models\Sentence;
use Illuminate\Database\Seeder;

class SentenceSeeder extends Seeder
{
    public function run(): void
    {
        $sentences = [
            ['japanese'=>'わたしはごはんをたべます','romaji'=>'watashi wa gohan o tabemasu','meaning'=>'Saya makan nasi','words_json'=>['わたし','は','ごはん','を','たべます'],'difficulty'=>'N5'],
            ['japanese'=>'わたしはみずをのみます','romaji'=>'watashi wa mizu o nomimasu','meaning'=>'Saya minum air','words_json'=>['わたし','は','みず','を','のみます'],'difficulty'=>'N5'],
            ['japanese'=>'がっこうにいきます','romaji'=>'gakkou ni ikimasu','meaning'=>'Pergi ke sekolah','words_json'=>['がっこう','に','いきます'],'difficulty'=>'N5'],
            ['japanese'=>'ほんをよみます','romaji'=>'hon o yomimasu','meaning'=>'Membaca buku','words_json'=>['ほん','を','よみます'],'difficulty'=>'N5'],
            ['japanese'=>'ともだちとはなします','romaji'=>'tomodachi to hanashimasu','meaning'=>'Berbicara dengan teman','words_json'=>['ともだち','と','はなします'],'difficulty'=>'N5'],
            ['japanese'=>'テレビをみます','romaji'=>'terebi o mimasu','meaning'=>'Menonton televisi','words_json'=>['テレビ','を','みます'],'difficulty'=>'N5'],
            ['japanese'=>'でんしゃにのります','romaji'=>'densha ni norimasu','meaning'=>'Naik kereta','words_json'=>['でんしゃ','に','のります'],'difficulty'=>'N5'],
            ['japanese'=>'にほんごをべんきょうします','romaji'=>'nihongo o benkyou shimasu','meaning'=>'Belajar bahasa Jepang','words_json'=>['にほんご','を','べんきょう','します'],'difficulty'=>'N5'],
            ['japanese'=>'くるまでいきます','romaji'=>'kuruma de ikimasu','meaning'=>'Pergi naik mobil','words_json'=>['くるま','で','いきます'],'difficulty'=>'N5'],
            ['japanese'=>'おちゃをのみます','romaji'=>'ocha o nomimasu','meaning'=>'Minum teh','words_json'=>['おちゃ','を','のみます'],'difficulty'=>'N5'],
        ];

        foreach ($sentences as $s) {
            Sentence::create($s);
        }
    }
}
