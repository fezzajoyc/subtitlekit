#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Patch the 15 SubtitleKit dictionaries: brand-bound keys per locale (site-engineering skill §0.6)."""
import re, sys

def q(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

COPY = {
  "en": {
    "tagline": "Every subtitle fix runs in your browser.",
    "metaDesc": "Free subtitle tools: SRT ↔ VTT conversion, timeline shifting and rescaling, bilingual merging, timing repair and text cleanup. Everything runs in your browser — your subtitle files never leave your device.",
    "heroTitle": "Subtitle files, fixed in seconds — no upload, no account",
    "heroSub": "SubtitleKit is a set of subtitle tools for video creators: convert between SRT and WebVTT, shift or rescale timelines, merge bilingual tracks, repair broken timing and batch-clean text. All in your browser — fast, free, nothing sent anywhere.",
    "rotating": [
      "Convert SRT to VTT and back — tags, settings and timing preserved",
      "Desynced subtitles? Shift every cue by seconds or milliseconds",
      "25 fps PAL print or 23.976 master — rescale the timeline in one click",
      "Stack two tracks into one bilingual subtitle file, aligned by time",
    ],
    "categoriesSub": "Five subtitle tools, all running on your device.",
    "endSub": "Fifteen languages, zero uploads, nothing to install.",
    "privacyTitle": "Your subtitles never leave your device.",
    "utilityName": "Subtitles",
    "utilityDesc": "Convert, shift, merge, fix and clean subtitle files — SRT and WebVTT, without uploading them anywhere.",
    "footerLine": "Free subtitle tools. Nothing you do here leaves your device.",
    "mcpDesc1": "SubtitleKit ships an MCP (Model Context Protocol) server: AI assistants like Claude or Cursor can convert, shift, merge, fix and clean the same subtitle files you see on this site — same tested logic, no reimplementation.",
    "mcpDesc2": "The tools run the site's own pure functions for SRT/VTT parsing, timeline math and text cleanup. Subtitles go in as file text and come back as file text; execution happens on the AI client's machine via npx — nothing is sent to our servers.",
    "badgeTitle": "SubtitleKit badges",
    "badgeDesc": "Put a SubtitleKit badge on your site, README or docs. It links back here and tells people the subtitle tools behind it run entirely in the browser.",
  },
  "zh": {
    "tagline": "每一次字幕修复都在浏览器里完成。",
    "metaDesc": "免费字幕工具箱:SRT 与 VTT 互转、时间轴平移缩放、双语合并、时间轴修复、文本批量清理。全部在浏览器里运行——字幕文件从不离开你的设备。",
    "heroTitle": "字幕文件,几秒修好——不上传、不用注册",
    "heroSub": "SubtitleKit 是为视频创作者准备的字幕工具集:SRT 与 WebVTT 互转、时间轴平移与缩放、双语轨合并、时间轴修复、文本批量清理。全程在浏览器里完成——快、免费、不发送任何数据。",
    "rotating": [
      "SRT 与 VTT 双向互转——标签、设置、时间全部保留",
      "字幕不同步?按秒或毫秒整体平移每一条",
      "25 帧的 PAL 版还是 23.976 的母版?一键缩放时间轴",
      "两条字幕轨按时间对齐,叠成一个双语文件",
    ],
    "categoriesSub": "五个字幕工具,全部在你设备上运行。",
    "endSub": "十五种语言,零上传,无需安装。",
    "privacyTitle": "你的字幕从不离开你的设备。",
    "utilityName": "字幕",
    "utilityDesc": "转换、平移、合并、修复、清理字幕文件——SRT 与 VTT,全程不上传。",
    "footerLine": "免费字幕工具。你在这里做的一切都不会离开你的设备。",
    "mcpDesc1": "SubtitleKit 提供 MCP(Model Context Protocol)服务器:Claude、Cursor 等 AI 助手可以直接转换、平移、合并、修复、清理本站的字幕文件——同一套经过测试的逻辑,不是重新实现。",
    "mcpDesc2": "这些工具运行本站自己的纯函数:SRT/VTT 解析、时间轴运算、文本清理。字幕以文本进出,执行发生在 AI 客户端所在的机器上(经 npx)——不会发送到我们的服务器。",
    "badgeTitle": "SubtitleKit 徽章",
    "badgeDesc": "把 SubtitleKit 徽章放到你的网站、README 或文档里。它会链接回本站,并告诉访问者:这些字幕工具完全在浏览器里运行。",
  },
  "ja": {
    "tagline": "すべての字幕修復はブラウザの中で完結。",
    "metaDesc": "無料の字幕ツール:SRT と WebVTT の相互変換、タイムラインのズラし・スケール、バイリンガル統合、タイミング修復、テキスト一括クリーニング。すべてブラウザ内で動き、字幕ファイルは端末の外に出ません。",
    "heroTitle": "字幕ファイルは数秒で修復——アップロードも登録もなし",
    "heroSub": "SubtitleKit は動画制作者のための字幕ツール集です。SRT と WebVTT の変換、タイムラインのズラしとスケール、2 トラックの統合、タイミング修復、テキストの一括クリーニング。すべてブラウザ内で——速く、無料で、どこにも送信しません。",
    "rotating": [
      "SRT と WebVTT を往復変換——タグも設定もタイミングもそのまま",
      "字幕がズレている?全キューを秒・ミリ秒単位でまとめてズラす",
      "25fps の PAL 版か 23.976 のマスターか——タイムラインをワンクリックでスケール",
      "2 つのトラックを時間で整列して 1 枚のバイリンガル字幕に",
    ],
    "categoriesSub": "5 つの字幕ツール、すべてあなたのデバイスで動きます。",
    "endSub": "15 言語、アップロード ゼロ、インストール不要。",
    "privacyTitle": "あなたの字幕は端末の外に出ません。",
    "utilityName": "字幕",
    "utilityDesc": "字幕ファイルの変換・ズラし・統合・修復・クリーニング。SRT と VTT をどこにもアップロードせずに。",
    "footerLine": "無料の字幕ツール。ここで行うことは何も端末の外に出ません。",
    "mcpDesc1": "SubtitleKit は MCP(Model Context Protocol)サーバーを同梱しています。Claude や Cursor などの AI アシスタントが、このサイトの字幕ファイルをそのまま変換・ズラし・統合・修復・クリーニングできます——同じテスト済みロジック、再実装は不要です。",
    "mcpDesc2": "ツールはサイト独自の純関数(SRT/VTT 解析、タイムライン演算、テキスト クリーニング)を実行します。字幕はテキストとして受け渡しされ、実行は npx 経由で AI クライアント側のマシン上で行われます——当社サーバーには何も送られません。",
    "badgeTitle": "SubtitleKit バッジ",
    "badgeDesc": "あなたのサイトや README、ドキュメントに SubtitleKit バッジを置いてみてください。このサイトへリンクし、背後の字幕ツールが完全にブラウザ内で動くことを伝えます。",
  },
  "es": {
    "tagline": "Cada arreglo de subtítulos ocurre en tu navegador.",
    "metaDesc": "Herramientas de subtítulos gratuitas: conversión SRT ↔ VTT, desplazamiento y escalado de líneas de tiempo, fusión bilingüe, reparación de tiempos y limpieza de texto. Todo en tu navegador — tus archivos nunca salen de tu dispositivo.",
    "heroTitle": "Archivos de subtítulos, arreglados en segundos — sin subidas ni cuentas",
    "heroSub": "SubtitleKit es un conjunto de herramientas de subtítulos para creadores de vídeo: convierte entre SRT y WebVTT, desplaza o reescala líneas de tiempo, fusiona pistas bilingües, repara tiempos rotos y limpia texto por lotes. Todo en tu navegador — rápido, gratis y sin enviar nada a ningún sitio.",
    "rotating": [
      "Convierte SRT a VTT y viceversa — etiquetas, ajustes y tiempos intactos",
      "¿Subtítulos desincronizados? Desplaza todos los cues por segundos o milisegundos",
      "¿Copia PAL de 25 fps o máster de 23.976? Reescala la línea de tiempo a un clic",
      "Apila dos pistas en un archivo bilingüe, alineadas por tiempo",
    ],
    "categoriesSub": "Cinco herramientas de subtítulos, todas en tu dispositivo.",
    "endSub": "Quince idiomas, cero subidas, nada que instalar.",
    "privacyTitle": "Tus subtítulos nunca salen de tu dispositivo.",
    "utilityName": "Subtítulos",
    "utilityDesc": "Convierte, desplaza, fusiona, repara y limpia archivos de subtítulos — SRT y VTT, sin subirlos a ningún sitio.",
    "footerLine": "Herramientas de subtítulos gratuitas. Nada de lo que haces aquí sale de tu dispositivo.",
    "mcpDesc1": "SubtitleKit incluye un servidor MCP (Model Context Protocol): asistentes de IA como Claude o Cursor pueden convertir, desplazar, fusionar, reparar y limpiar los mismos archivos de subtítulos de este sitio — la misma lógica probada, sin reimplementar nada.",
    "mcpDesc2": "Las herramientas ejecutan las funciones puras del propio sitio: análisis SRT/VTT, operaciones de tiempo y limpieza de texto. Los subtítulos entran y salen como texto; la ejecución ocurre en la máquina del cliente de IA vía npx — nada se envía a nuestros servidores.",
    "badgeTitle": "Insignias de SubtitleKit",
    "badgeDesc": "Pon una insignia de SubtitleKit en tu sitio, README o documentación. Enlaza aquí y cuenta que las herramientas de subtítulos funcionan por completo en el navegador.",
  },
  "pt": {
    "tagline": "Todo conserto de legenda acontece no seu navegador.",
    "metaDesc": "Ferramentas de legenda gratuitas: conversão SRT ↔ VTT, deslocamento e reescala da linha do tempo, mesclagem bilíngue, reparo de tempos e limpeza de texto. Tudo no seu navegador — seus arquivos nunca saem do seu aparelho.",
    "heroTitle": "Arquivos de legenda consertados em segundos — sem upload, sem cadastro",
    "heroSub": "SubtitleKit é um conjunto de ferramentas de legenda para criadores de vídeo: converta entre SRT e WebVTT, desloque ou reescale linhas do tempo, mescle trilhas bilíngues, conserte tempos quebrados e limpe texto em lote. Tudo no seu navegador — rápido, grátis, nada enviado a ninguém.",
    "rotating": [
      "Converta SRT em VTT e vice-versa — tags, configurações e tempos preservados",
      "Legenda fora de sincronia? Desloque todos os cues por segundos ou milissegundos",
      "Cópia PAL de 25 fps ou master de 23.976? Reescale a linha do tempo num clique",
      "Empilhe duas trilhas num arquivo bilíngue, alinhadas pelo tempo",
    ],
    "categoriesSub": "Cinco ferramentas de legenda, todas rodando no seu aparelho.",
    "endSub": "Quinze idiomas, zero uploads, nada para instalar.",
    "privacyTitle": "Suas legendas nunca saem do seu aparelho.",
    "utilityName": "Legendas",
    "utilityDesc": "Converta, desloque, mescle, conserte e limpe arquivos de legenda — SRT e VTT, sem enviar nada para servidores.",
    "footerLine": "Ferramentas de legenda gratuitas. Nada do que você faz aqui sai do seu aparelho.",
    "mcpDesc1": "O SubtitleKit inclui um servidor MCP (Model Context Protocol): assistentes de IA como Claude ou Cursor podem converter, deslocar, mesclar, consertar e limpar os mesmos arquivos de legenda deste site — a mesma lógica testada, sem reimplementar.",
    "mcpDesc2": "As ferramentas executam as funções puras do próprio site: leitura de SRT/VTT, cálculos de tempo e limpeza de texto. Legendas entram e saem como texto; a execução acontece na máquina do cliente de IA via npx — nada é enviado aos nossos servidores.",
    "badgeTitle": "Selos do SubtitleKit",
    "badgeDesc": "Coloque um selo do SubtitleKit no seu site, README ou documentação. Ele linka para cá e conta que as ferramentas de legenda rodam inteiramente no navegador.",
  },
  "fr": {
    "tagline": "Chaque correction de sous-titres se fait dans votre navigateur.",
    "metaDesc": "Outils de sous-titres gratuits : conversion SRT ↔ VTT, décalage et mise à l'échelle de la timeline, fusion bilingue, réparation du timing et nettoyage du texte. Tout dans votre navigateur — vos fichiers ne quittent jamais votre appareil.",
    "heroTitle": "Vos sous-titres réparés en quelques secondes — sans envoi, sans compte",
    "heroSub": "SubtitleKit est une panoplie d'outils de sous-titres pour créateurs vidéo : convertissez entre SRT et WebVTT, décalez ou mettez à l'échelle les timelines, fusionnez deux pistes bilingues, réparez un timing cassé et nettoyez le texte par lots. Tout dans votre navigateur — rapide, gratuit, rien n'est envoyé nulle part.",
    "rotating": [
      "Convertissez SRT vers VTT et inversement — balises, réglages et timing préservés",
      "Sous-titres désynchronisés ? Décalez tous les sous-titres de secondes ou de millisecondes",
      "Copie PAL 25 fps ou master 23.976 ? Remettez la timeline à l'échelle en un clic",
      "Superposez deux pistes en un fichier bilingue, alignées dans le temps",
    ],
    "categoriesSub": "Cinq outils de sous-titres, tous sur votre appareil.",
    "endSub": "Quinze langues, zéro envoi, rien à installer.",
    "privacyTitle": "Vos sous-titres ne quittent jamais votre appareil.",
    "utilityName": "Sous-titres",
    "utilityDesc": "Convertissez, décalez, fusionnez, réparez et nettoyez vos fichiers de sous-titres — SRT et VTT, sans les envoyer nulle part.",
    "footerLine": "Outils de sous-titres gratuits. Rien de ce que vous faites ici ne quitte votre appareil.",
    "mcpDesc1": "SubtitleKit embarque un serveur MCP (Model Context Protocol) : les assistants IA comme Claude ou Cursor peuvent convertir, décaler, fusionner, réparer et nettoyer les mêmes fichiers de sous-titres que ce site — même logique testée, aucune réimplémentation.",
    "mcpDesc2": "Les outils exécutent les fonctions pures du site lui-même : analyse SRT/VTT, calculs temporels, nettoyage de texte. Les sous-titres entrent et sortent en texte ; l'exécution se fait sur la machine du client IA via npx — rien n'est envoyé à nos serveurs.",
    "badgeTitle": "Badges SubtitleKit",
    "badgeDesc": "Affichez un badge SubtitleKit sur votre site, votre README ou votre documentation. Il renvoie ici et signale que les outils de sous-titres fonctionnent entièrement dans le navigateur.",
  },
  "de": {
    "tagline": "Jede Untertitel-Korrektur passiert in Ihrem Browser.",
    "metaDesc": "Kostenlose Untertitel-Tools: SRT ↔ VTT-Konvertierung, Zeitverschiebung und -skalierung, zweisprachiges Zusammenführen, Timing-Reparatur und Textbereinigung. Alles in Ihrem Browser — Ihre Dateien verlassen niemals Ihr Gerät.",
    "heroTitle": "Untertitel-Dateien in Sekunden repariert — ohne Upload, ohne Konto",
    "heroSub": "SubtitleKit ist ein Set von Untertitel-Tools für Videomacher: SRT und WebVTT konvertieren, Timelines verschieben oder skalieren, zweisprachige Spuren zusammenführen, kaputtes Timing reparieren und Text im Batch säubern. Alles im Browser — schnell, kostenlos, nichts wird versendet.",
    "rotating": [
      "SRT zu VTT und zurück — Tags, Einstellungen und Timing bleiben erhalten",
      "Untertitel aus dem Takt? Verschieben Sie jeden Cue um Sekunden oder Millisekunden",
      "25-fps-PAL-Kopie oder 23.976-Master? Timeline mit einem Klick skalieren",
      "Zwei Spuren zu einer zweisprachigen Untertiteldatei stapeln, zeitsynchron",
    ],
    "categoriesSub": "Fünf Untertitel-Tools, alle auf Ihrem Gerät.",
    "endSub": "Fünfzehn Sprachen, null Uploads, nichts zu installieren.",
    "privacyTitle": "Ihre Untertitel verlassen niemals Ihr Gerät.",
    "utilityName": "Untertitel",
    "utilityDesc": "Konvertieren, verschieben, zusammenführen, reparieren und bereinigen Sie Untertiteldateien — SRT und VTT, ohne sie irgendwohin hochzuladen.",
    "footerLine": "Kostenlose Untertitel-Tools. Nichts, was Sie hier tun, verlässt Ihr Gerät.",
    "mcpDesc1": "SubtitleKit liefert einen MCP-Server (Model Context Protocol): KI-Assistenten wie Claude oder Cursor konvertieren, verschieben, führen zusammen, reparieren und bereinigen dieselben Untertiteldateien wie diese Website — dieselbe getestete Logik, keine Neuimplementierung.",
    "mcpDesc2": "Die Tools führen die reinen Funktionen der Website selbst aus: SRT/VTT-Parsing, Zeitberechnung, Textbereinigung. Untertitel gehen als Text hinein und heraus; die Ausführung erfolgt über npx auf dem Rechner des KI-Clients — nichts wird an unsere Server gesendet.",
    "badgeTitle": "SubtitleKit-Badges",
    "badgeDesc": "Setzen Sie ein SubtitleKit-Badge auf Ihre Website, Ihr README oder Ihre Doku. Es verlinkt hierher und zeigt, dass die Untertitel-Tools dahinter komplett im Browser laufen.",
  },
  "ru": {
    "tagline": "Каждая правка субтитров происходит в вашем браузере.",
    "metaDesc": "Бесплатные инструменты для субтитров: конвертация SRT ↔ VTT, сдвиг и масштабирование таймлайна, двуязычное объединение, починка тайминга и очистка текста. Всё в вашем браузере — файлы не покидают ваше устройство.",
    "heroTitle": "Файлы субтитров починены за секунды — без загрузки и регистрации",
    "heroSub": "SubtitleKit — набор инструментов для работы с субтитрами: конвертация между SRT и WebVTT, сдвиг и масштабирование таймлайна, объединение двуязычных дорожек, починка сломанного тайминга и пакетная очистка текста. Всё в браузере — быстро, бесплатно, ничего никуда не отправляется.",
    "rotating": [
      "Конвертируйте SRT в VTT и обратно — теги, настройки и тайминг сохраняются",
      "Субтитры разошлись с видео? Сдвиньте все реплики на секунды или миллисекунды",
      "PAL-копия 25 fps или мастер 23.976? Масштабируйте таймлайн одним кликом",
      "Сложите две дорожки в один двуязычный файл, выровняв по времени",
    ],
    "categoriesSub": "Пять инструментов для субтитров, все на вашем устройстве.",
    "endSub": "Пятнадцать языков, ноль загрузок, ничего устанавливать не нужно.",
    "privacyTitle": "Ваши субтитры не покидают ваше устройство.",
    "utilityName": "Субтитры",
    "utilityDesc": "Конвертируйте, сдвигайте, объединяйте, чините и очищайте файлы субтитров — SRT и VTT, никуда их не загружая.",
    "footerLine": "Бесплатные инструменты для субтитров. Ничто из того, что вы здесь делаете, не покидает ваше устройство.",
    "mcpDesc1": "SubtitleKit поставляется с MCP-сервером (Model Context Protocol): ИИ-ассистенты вроде Claude или Cursor могут конвертировать, сдвигать, объединять, чинить и очищать те же файлы субтитров, что и на этом сайте — та же проверенная логика, без повторной реализации.",
    "mcpDesc2": "Инструменты выполняют чистые функции самого сайта: разбор SRT/VTT, операции со временем, очистка текста. Субтитры передаются как текст; выполнение идёт на машине ИИ-клиента через npx — на наши серверы ничего не отправляется.",
    "badgeTitle": "Бейджи SubtitleKit",
    "badgeDesc": "Разместите бейдж SubtitleKit на своём сайте, в README или документации. Он ведёт сюда и сообщает, что стоящие за ним инструменты субтитров работают целиком в браузере.",
  },
  "it": {
    "tagline": "Ogni correzione dei sottotitoli avviene nel tuo browser.",
    "metaDesc": "Strumenti gratuiti per sottotitoli: conversione SRT ↔ VTT, spostamento e riscala della timeline, unione bilingue, riparazione dei tempi e pulizia del testo. Tutto nel tuo browser — i file non lasciano mai il tuo dispositivo.",
    "heroTitle": "File di sottotitoli sistemati in pochi secondi — senza upload, senza account",
    "heroSub": "SubtitleKit è un set di strumenti per sottotitoli pensato per chi crea video: converti tra SRT e WebVTT, sposti o riscali le timeline, unisci due tracce bilingui, ripari i tempi rotti e pulisci il testo in blocco. Tutto nel browser — veloce, gratis, nulla viene inviato da nessuna parte.",
    "rotating": [
      "Converti SRT in VTT e viceversa — tag, impostazioni e tempi al loro posto",
      "Sottotitoli fuori sincrono? Sposta tutti i cue di secondi o millisecondi",
      "Copia PAL a 25 fps o master 23.976? Riscala la timeline con un clic",
      "Impila due tracce in un file bilingue, allineate nel tempo",
    ],
    "categoriesSub": "Cinque strumenti per sottotitoli, tutti sul tuo dispositivo.",
    "endSub": "Quindici lingue, zero upload, niente da installare.",
    "privacyTitle": "I tuoi sottotitoli non lasciano mai il tuo dispositivo.",
    "utilityName": "Sottotitoli",
    "utilityDesc": "Converti, sposta, unisci, ripara e pulisci i file di sottotitoli — SRT e VTT, senza caricarli da nessuna parte.",
    "footerLine": "Strumenti gratuiti per sottotitoli. Niente di ciò che fai qui lascia il tuo dispositivo.",
    "mcpDesc1": "SubtitleKit include un server MCP (Model Context Protocol): assistenti IA come Claude o Cursor possono convertire, spostare, unire, riparare e pulire gli stessi file di sottotitoli di questo sito — la stessa logica testata, senza reimplementare nulla.",
    "mcpDesc2": "Gli strumenti eseguono le funzioni pure del sito stesso: parsing SRT/VTT, operazioni sui tempi, pulizia del testo. I sottotitoli entrano ed escono come testo; l'esecuzione avviene sulla macchina del client IA via npx — nulla viene inviato ai nostri server.",
    "badgeTitle": "Badge SubtitleKit",
    "badgeDesc": "Metti un badge SubtitleKit sul tuo sito, nel README o nella documentazione. Rimanda qui e racconta che gli strumenti per sottotitoli dietro girano interamente nel browser.",
  },
  "tr": {
    "tagline": "Her altyazı düzeltmesi tarayıcında olur.",
    "metaDesc": "Ücretsiz altyazı araçları: SRT ↔ VTT dönüştürme, zaman çizelgesi kaydırma ve ölçekleme, iki dilli birleştirme, zamanlama onarımı ve metin temizliği. Hepsi tarayıcında — dosyaların cihazından asla çıkmaz.",
    "heroTitle": "Altyazı dosyaları saniyeler içinde düzelir — yükleme yok, hesap yok",
    "heroSub": "SubtitleKit, video üreticileri için bir altyazı araç setidir: SRT ile WebVTT arasında dönüştür, zaman çizelgesini kaydır veya ölçekle, iki dilli parçayı birleştir, bozuk zamanlamayı onar, metni toplu temizle. Hepsi tarayıcında — hızlı, ücretsiz, hiçbir yere veri gitmez.",
    "rotating": [
      "SRT'yi VTT'ye ve geriye çevir — etiketler, ayarlar ve zamanlama korunur",
      "Altyazı kaydı mı? Tüm cue'ları saniye veya milisaniye kaydır",
      "25 fps PAL kopyası mı, 23.976 master mı? Zaman çizelgesini tek tıkla ölçekle",
      "İki parçayı zamana göre hizalayıp tek bir iki dilli dosyaya üst üste koy",
    ],
    "categoriesSub": "Beş altyazı aracı, hepsi cihazında çalışır.",
    "endSub": "On beş dil, sıfır yükleme, kuruluma gerek yok.",
    "privacyTitle": "Altyazıların cihazından asla çıkmaz.",
    "utilityName": "Altyazı",
    "utilityDesc": "Altyazı dosyalarını dönüştür, kaydır, birleştir, onar ve temizle — SRT ve VTT, hiçbir yere yüklemeden.",
    "footerLine": "Ücretsiz altyazı araçları. Burada yaptığın hiçbir şey cihazından çıkmaz.",
    "mcpDesc1": "SubtitleKit bir MCP (Model Context Protocol) sunucusu içerir: Claude veya Cursor gibi AI asistanları bu sitedeki altyazı dosyalarını aynen dönüştürebilir, kaydırabilir, birleştirebilir, onarabilir ve temizleyebilir — aynı test edilmiş mantık, yeniden yazmaya gerek yok.",
    "mcpDesc2": "Araçlar sitenin kendi saf fonksiyonlarını çalıştırır: SRT/VTT ayrıştırma, zaman hesapları, metin temizliği. Altyazılar metin olarak girer ve çıkar; yürütme npx üzerinden AI istemcisinin makinesinde olur — sunucularımıza hiçbir şey gönderilmez.",
    "badgeTitle": "SubtitleKit rozetleri",
    "badgeDesc": "SubtitleKit rozetini sitene, README'ne veya dokümanlarına ekle. Rozet buraya bağlanır ve arkasındaki altyazı araçlarının tamamen tarayıcıda çalıştığını söyler.",
  },
  "ko": {
    "tagline": "모든 자막 수정은 브라우저 안에서 끝납니다.",
    "metaDesc": "무료 자막 도구: SRT ↔ VTT 변환, 타임라인 이동과 스케일, 이중 언어 병합, 타이밍 복구, 텍스트 일괄 정리. 전부 브라우저에서 실행되며 자막 파일은 기기를 떠나지 않습니다.",
    "heroTitle": "자막 파일, 몇 초 만에 수정 — 업로드도 계정도 없이",
    "heroSub": "SubtitleKit은 영상 제작자를 위한 자막 도구 모음입니다. SRT와 WebVTT 변환, 타임라인 이동과 스케일, 두 트랙 병합, 타이밍 복구, 텍스트 일괄 정리. 모두 브라우저에서 — 빠르고, 무료이며, 어디에도 전송되지 않습니다.",
    "rotating": [
      "SRT를 VTT로, 다시 돌려 — 태그, 설정, 타이밍 모두 그대로",
      "자막이 밀렸나요? 모든 큐를 초·밀리초 단위로 한 번에 이동",
      "25fps PAL 복사본인가요, 23.976 마스터인가요? 타임라인을 한 번에 스케일",
      "두 트랙을 시간으로 맞춰 하나의 이중 언어 자막으로 쌓기",
    ],
    "categoriesSub": "다섯 가지 자막 도구, 모두 기기에서 실행됩니다.",
    "endSub": "15개 언어, 업로드 없음, 설치 불필요.",
    "privacyTitle": "자막은 기기를 떠나지 않습니다.",
    "utilityName": "자막",
    "utilityDesc": "자막 파일을 변환, 이동, 병합, 복구, 정리하세요 — SRT와 VTT를 어디에도 업로드하지 않고.",
    "footerLine": "무료 자막 도구. 여기서 하는 모든 일은 기기를 떠나지 않습니다.",
    "mcpDesc1": "SubtitleKit는 MCP(Model Context Protocol) 서버를 제공합니다: Claude, Cursor 같은 AI 어시스턴트가 이 사이트의 자막 파일을 그대로 변환·이동·병합·복구·정리합니다 — 같은 테스트된 로직, 재구현 불필요.",
    "mcpDesc2": "도구는 사이트 자체의 순수 함수를 실행합니다: SRT/VTT 파싱, 시간 연산, 텍스트 정리. 자막은 텍스트로 들어오고 나가며, 실행은 npx를 통해 AI 클라이언트의 머신에서 일어납니다 — 우리 서버로는 아무것도 전송되지 않습니다.",
    "badgeTitle": "SubtitleKit 배지",
    "badgeDesc": "사이트, README, 문서에 SubtitleKit 배지를 달아 보세요. 여기로 연결되며, 배지 뒤의 자막 도구들이 전부 브라우저 안에서 실행된다는 뜻이기도 합니다.",
  },
  "ar": {
    "tagline": "كل إصلاح للترجمات يحدث داخل متصفحك.",
    "metaDesc": "أدوات ترجمات مجانية: تحويل SRT ↔ VTT، إزاحة وجدولة الخط الزمني، دمج ثنائي اللغة، إصلاح التوقيت، وتنظيف النص. كل شيء داخل متصفحك — ملفاتك لا تترك جهازك أبداً.",
    "heroTitle": "ملفات الترجمة تُصلَح في ثوانٍ — دون رفع ولا حساب",
    "heroSub": "SubtitleKit مجموعة أدوات ترجمات لصنّاع الفيديو: حوّل بين SRT وWebVTT، أزِح الخط الزمني أو اضبط مقياسه، ادمج مسارين ثنائيي اللغة، أصلح التوقيت المعطوب، ونظّف النص بالجملة. كل ذلك داخل المتصفح — سريع ومجاني ولا يُرسَل شيء لأي مكان.",
    "rotating": [
      "حوّل من SRT إلى VTT والعكس — الوسوم والإعدادات والتوقيت كما هي",
      "الترجمة متأخرة؟ أزِح كل السطور بالثواني أو الأجزاء من الألف",
      "نسخة PAL بـ 25 إطاراً أم نسخة أصل بـ 23.976؟ اضبط مقياس الخط الزمني بنقرة",
      "اجمع مسارين فوق بعض في ملف ترجمة ثنائي اللغة متوافق زمنياً",
    ],
    "categoriesSub": "خمس أدوات ترجمات، كلها تعمل على جهازك.",
    "endSub": "خمس عشرة لغة، صفر رفع، ولا شيء للتثبيت.",
    "privacyTitle": "ترجماتك لا تترك جهازك أبداً.",
    "utilityName": "الترجمات",
    "utilityDesc": "حوّل وأزِح وادمج وأصلح ونظّف ملفات الترجمة — SRT وVTT دون رفعها إلى أي مكان.",
    "footerLine": "أدوات ترجمات مجانية. لا شيء مما تفعله هنا يترك جهازك.",
    "mcpDesc1": "يأتي SubtitleKit مع خادم MCP (Model Context Protocol): يمكن لمساعدي الذكاء الاصطناعي مثل Claude وCursor تحويل ملفات الترجمة نفسها الموجودة على هذا الموقع وإزاحتها ودمجها وإصلاحها وتنظيفها — نفس المنطق المُختبَر، دون إعادة تنفيذ.",
    "mcpDesc2": "تشغّل الأدوات الدوال الصرفة الخاصة بالموقع نفسه: تحليل SRT/VTT، عمليات الزمن، تنظيف النص. تدخل الترجمات وتخرج كنص؛ ويتم التنفيذ عبر npx على جهاز عميل الذكاء الاصطناعي — لا يُرسَل شيء إلى خوادمنا.",
    "badgeTitle": "شارات SubtitleKit",
    "badgeDesc": "ضع شارة SubtitleKit على موقعك أو ملف README أو مستنداتك. تصل الشارة إلى هنا وتخبر الزوار أن أدوات الترجمة خلفها تعمل بالكامل داخل المتصفح.",
  },
  "hi": {
    "tagline": "हर सबटाइटल सुधार आपके ब्राउज़र में होता है।",
    "metaDesc": "मुफ़्त सबटाइटल टूल: SRT ↔ VTT रूपांतरण, टाइमलाइन शिफ्ट और स्केल, द्विभाषी मर्ज, टाइमिंग मरम्मत और टेक्स्ट सफ़ाई। सब आपके ब्राउज़र में — आपकी फ़ाइलें कभी डिवाइस नहीं छोड़तीं।",
    "heroTitle": "सबटाइटल फ़ाइलें सेकंडों में ठीक — न अपलोड, न अकाउंट",
    "heroSub": "SubtitleKit वीडियो बनाने वालों के लिए सबटाइटल टूल्स का सेट है: SRT और WebVTT के बीच बदलें, टाइमलाइन शिफ्ट या स्केल करें, दो ट्रैक मिलाकर द्विभाषी फ़ाइल बनाएँ, खराब टाइमिंग ठीक करें और टेक्स्ट बैच में साफ़ करें। सब ब्राउज़र में — तेज़, मुफ़्त, कहीं कुछ भेजे बिना।",
    "rotating": [
      "SRT को VTT में और वापस बदलें — टैग, सेटिंग और टाइमिंग सुरक्षित",
      "सबटाइटल पीछे छूट गए? हर cue को सेकंड या मिलीसेकंड तक शिफ्ट करें",
      "25 fps PAL कॉपी या 23.976 मास्टर? टाइमलाइन एक क्लिक में स्केल करें",
      "दो ट्रैक समय के हिसाब से जोड़कर एक द्विभाषी फ़ाइल बनाएँ",
    ],
    "categoriesSub": "पाँच सबटाइटल टूल्स, सब आपके डिवाइस पर चलते हैं।",
    "endSub": "पंद्रह भाषाएँ, शून्य अपलोड, कुछ इंस्टॉल नहीं।",
    "privacyTitle": "आपके सबटाइटल कभी डिवाइस नहीं छोड़ते।",
    "utilityName": "सबटाइटल",
    "utilityDesc": "सबटाइटल फ़ाइलें बदलें, शिफ्ट करें, मिलाएँ, ठीक करें और साफ़ करें — SRT और VTT, कहीं अपलोड किए बिना।",
    "footerLine": "मुफ़्त सबटाइटल टूल्स। आप यहाँ जो कुछ भी करते हैं, वह डिवाइस नहीं छोड़ता।",
    "mcpDesc1": "SubtitleKit एक MCP (Model Context Protocol) सर्वर शिप करता है: Claude या Cursor जैसे AI असिस्टेंट इस साइट की उन्हीं सबटाइटल फ़ाइलों को बदल, शिफ्ट, मर्ज, फ़िक्स और क्लीन कर सकते हैं — वही टेस्ट किया हुआ लॉजिक, दोबारा लिखने की ज़रूरत नहीं।",
    "mcpDesc2": "टूल्स साइट के अपने शुद्ध फ़ंक्शन चलाते हैं: SRT/VTT पार्सिंग, टाइम गणना, टेक्स्ट सफ़ाई। सबटाइटल टेक्स्ट के रूप में आते-जाते हैं; निष्पादन npx के ज़रिए AI क्लाइंट की मशीन पर होता है — हमारे सर्वर पर कुछ नहीं जाता।",
    "badgeTitle": "SubtitleKit बैज",
    "badgeDesc": "अपनी साइट, README या डॉक्स पर SubtitleKit बैज लगाएँ। यह यहीं ले जाता है और बताता है कि इसके पीछे के सबटाइटल टूल पूरी तरह ब्राउज़र में चलते हैं।",
  },
  "id": {
    "tagline": "Setiap perbaikan subtitle terjadi di browser Anda.",
    "metaDesc": "Alat subtitle gratis: konversi SRT ↔ VTT, geser dan skala linimasa, penggabungan dwibahasa, perbaikan timing, dan pembersihan teks. Semua di browser Anda — berkas Anda tidak pernah meninggalkan perangkat.",
    "heroTitle": "Berkas subtitle diperbaiki dalam hitungan detik — tanpa unggah, tanpa akun",
    "heroSub": "SubtitleKit adalah kumpulan alat subtitle untuk pembuat video: konversi antara SRT dan WebVTT, geser atau skala linimasa, gabungkan dua trek menjadi dwibahasa, perbaiki timing yang rusak, dan bersihkan teks secara massal. Semua di browser — cepat, gratis, tidak ada yang dikirim ke mana pun.",
    "rotating": [
      "Konversi SRT ke VTT dan kembali — tag, pengaturan, dan timing tetap utuh",
      "Subtitle tidak sinkron? Geser semua cue detik demi detik atau milidetik",
      "Salinan PAL 25 fps atau master 23.976? Skala linimasa dalam satu klik",
      "Tumpuk dua trek menjadi satu berkas subtitle dwibahasa, selaras waktu",
    ],
    "categoriesSub": "Lima alat subtitle, semuanya berjalan di perangkat Anda.",
    "endSub": "Lima belas bahasa, nol unggahan, tidak ada yang perlu dipasang.",
    "privacyTitle": "Subtitle Anda tidak pernah meninggalkan perangkat Anda.",
    "utilityName": "Subtitle",
    "utilityDesc": "Konversi, geser, gabungkan, perbaiki, dan bersihkan berkas subtitle — SRT dan VTT, tanpa mengunggahnya ke mana pun.",
    "footerLine": "Alat subtitle gratis. Tidak ada yang Anda lakukan di sini yang meninggalkan perangkat Anda.",
    "mcpDesc1": "SubtitleKit menyertakan server MCP (Model Context Protocol): asisten AI seperti Claude atau Cursor dapat mengonversi, menggeser, menggabungkan, memperbaiki, dan membersihkan berkas subtitle yang sama dengan situs ini — logika teruji yang sama, tanpa menulis ulang.",
    "mcpDesc2": "Alat menjalankan fungsi murni milik situs sendiri: parsing SRT/VTT, operasi waktu, pembersihan teks. Subtitle masuk dan keluar sebagai teks; eksekusi terjadi lewat npx di mesin klien AI — tidak ada yang dikirim ke server kami.",
    "badgeTitle": "Badge SubtitleKit",
    "badgeDesc": "Pasang badge SubtitleKit di situs, README, atau dokumentasi Anda. Badge ini menautkan kembali ke sini dan memberi tahu bahwa alat subtitle di belakangnya berjalan sepenuhnya di browser.",
  },
  "vi": {
    "tagline": "Mọi lần sửa phụ đề đều diễn ra ngay trong trình duyệt của bạn.",
    "metaDesc": "Công cụ phụ đề miễn phí: chuyển đổi SRT ↔ VTT, dịch và co giãn dòng thời gian, ghép song ngữ, sửa lỗi thời gian và làm sạch văn bản. Tất cả trong trình duyệt — tệp của bạn không bao giờ rời thiết bị.",
    "heroTitle": "Tệp phụ đề được sửa trong vài giây — không tải lên, không cần tài khoản",
    "heroSub": "SubtitleKit là bộ công cụ phụ đề dành cho người làm video: chuyển đổi giữa SRT và WebVTT, dịch hoặc co giãn dòng thời gian, ghép hai track thành song ngữ, sửa thời gian bị lỗi và làm sạch văn bản hàng loạt. Tất cả ngay trong trình duyệt — nhanh, miễn phí, không gửi đi đâu cả.",
    "rotating": [
      "Chuyển SRT sang VTT và ngược lại — giữ nguyên tag, thiết lập và thời gian",
      "Phụ đề lệch thời gian? Dịch toàn bộ cue theo giây hoặc mili giây",
      "Bản PAL 25 fps hay master 23.976? Co giãn dòng thời gian chỉ với một cú nhấp",
      "Xếp hai track thành một tệp phụ đề song ngữ, căn theo thời gian",
    ],
    "categoriesSub": "Năm công cụ phụ đề, tất cả chạy trên thiết bị của bạn.",
    "endSub": "Mười lăm ngôn ngữ, không tải lên, không cần cài đặt.",
    "privacyTitle": "Phụ đề của bạn không bao giờ rời thiết bị.",
    "utilityName": "Phụ đề",
    "utilityDesc": "Chuyển đổi, dịch, ghép, sửa và làm sạch tệp phụ đề — SRT và VTT, không tải lên bất kỳ đâu.",
    "footerLine": "Công cụ phụ đề miễn phí. Không có gì bạn làm ở đây rời khỏi thiết bị của bạn.",
    "mcpDesc1": "SubtitleKit đi kèm máy chủ MCP (Model Context Protocol): các trợ lý AI như Claude hay Cursor có thể chạy chính các tệp phụ đề của trang này — chuyển đổi, dịch, ghép, sửa và làm sạch — cùng logic đã kiểm thử, không cần viết lại.",
    "mcpDesc2": "Các công cụ chạy chính hàm thuần của trang: phân tích SRT/VTT, tính toán thời gian, làm sạch văn bản. Phụ đề đi vào và ra dưới dạng văn bản; việc thực thi diễn qua npx trên máy của client AI — không gửi gì đến máy chủ của chúng tôi.",
    "badgeTitle": "Huy hiệu SubtitleKit",
    "badgeDesc": "Gắn huy hiệu SubtitleKit lên trang web, README hay tài liệu của bạn. Nó dẫn về đây và cho mọi người biết các công cụ phụ đề phía sau chạy hoàn toàn trong trình duyệt.",
  },
}

MISS = []

def patch(path, locale, V):
    src = open(path, encoding="utf-8").read()
    lines = src.split("\n")
    out = []
    parent = None
    i = 0
    n = len(lines)

    def fail(what):
        MISS.append(f"{locale}: {what}")

    while i < n:
        line = lines[i]
        pm = re.match(r"^(\s*)(\w+): \{\s*$", line)
        if pm and len(pm.group(1)) <= 4:
            parent = pm.group(2)
            out.append(line)
            i += 1
            continue
        if parent == "home" and re.match(r"^\s*rotating: \[\s*$", line):
            out.append(line)
            i += 1
            for rot in V["rotating"]:
                while i < n and not re.match(r'^\s*"', lines[i]):
                    out.append(lines[i]); i += 1
                if i < n:
                    out.append("      " + q(rot) + ",")
                    i += 1
                else:
                    fail("rotating entry missing")
            continue
        um = re.match(r'^(\s*)utility: \{ name: "(?:[^"\\]|\\.)*", desc: "(?:[^"\\]|\\.)*" \},\s*$', line)
        if parent == "categories" and um:
            out.append(f'{um.group(1)}utility: {{ name: {q(V["utilityName"])}, desc: {q(V["utilityDesc"])} }},')
            i += 1
            continue
        km = re.match(r'^(\s*)(\w+): (?:"(?:[^"\\]|\\.)*",?\s*)?$', line)
        if km:
            key = km.group(2)
            target = None
            if parent is None and key in ("brand", "tagline", "metaDesc"):
                target = {"brand": "SubtitleKit"}.get(key, V.get(key))
            elif parent == "home" and key in ("heroTitle", "heroSub", "categoriesSub", "endSub", "privacyTitle"):
                target = V.get(key)
            elif parent == "footer" and key == "line":
                target = V["footerLine"]
            elif parent == "mcp" and key in ("desc1", "desc2"):
                target = V["mcpDesc1" if key == "desc1" else "mcpDesc2"]
            elif parent == "badge" and key in ("title", "desc"):
                target = V["badgeTitle" if key == "title" else "badgeDesc"]
            if target is not None:
                # multi-line value: swallow following lines until one ends with a quoted string + comma
                j = i + 1
                while j < n and not re.search(r'"(?:[^"\\]|\\.)*",\s*$', lines[j]):
                    j += 1
                if j < n:
                    out.append(f'{km.group(1)}{key}: {q(target)},')
                    i = j + 1
                    continue
                else:
                    fail(f"{key}: terminator not found")
        out.append(line)
        i += 1

    open(path, "w", encoding="utf-8").write("\n".join(out))

for loc in COPY:
    patch(f"lib/dictionaries/{loc}.ts", loc, COPY[loc])

if MISS:
    print("MISSES:")
    print("\n".join(MISS))
    sys.exit(1)
print("all dicts patched")
