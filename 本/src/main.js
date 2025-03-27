import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// quick_flipbook のインポートパスは環境に合わせてください
// 例: import { FlipBook } from './node_modules/quick_flipbook/dist/quick_flipbook.mjs';
// もしくはCDNや他の方法で読み込んでいる場合、その方法に従います。
// ここでは仮に 'quick_flipbook' モジュール名でインポートできると仮定します。
import { FlipBook } from 'quick_flipbook';
import { textToSpeech, getBestVoiceForLanguage } from './api/openai.js'; // openai.js のパスが正しい前提
import audioPlayer from './utils/audioPlayer.js'; // audioPlayer.js のパスが正しい前提

// --- OpenAI APIキーの設定に関する注意 ---
// 以下の方法はデモや開発初期段階向けです。
// 本番環境では絶対にコード内にAPIキーを直接記述しないでください。
// 環境変数やサーバーサイド経由で安全に管理・利用することを強く推奨します。
window.OPENAI_DIRECT_API_KEY = 'sk-proj-xxx'; // ★ 必ず実際のAPIキーに置き換え、かつ漏洩に注意してください。可能なら.env等で管理。

// 多言語対応 - 各言語のテキストデータ
const languageData = {
    ja: { // 日本語（デフォルト）
        page1: 'お友達とたくさん遊んだ公園におもいでがいっぱい',
        page2: 'どんなお弁当か楽しみだったな。遠足。',
        page3: '皆で一生懸命に頑張った運動会。\n心を一つにしたよ。',
        page4: 'お化けになった先生が怖かったけど、いい思い出になったおばけやしき。',
        page5: 'たくさん練習してパパとママに見てもらったにじいろステージ。思い出がたくさん。',
        page6: '先生とのお別れは寂しいけど、思い出をありがとう',
        langName: '日本語',
        prevBtn: '前のページ',
        nextBtn: '次のページ',
        langBtn: '言語選択',
        speakBtn: '読み上げ',
        stopBtn: '停止'
    },
    en: { // 英語
        page1: 'So many memories of playing with friends at the park',
        page2: 'Looking forward to what was in the lunchbox. The field trip.',
        page3: 'The sports day where everyone did their best.\nWe were united as one.',
        page4: 'The teacher was scary as a ghost, but the haunted house became a good memory.',
        page5: 'The rainbow stage where we practiced hard and performed for mom and dad. So many memories.',
        page6: 'Saying goodbye to our teacher is sad, but thank you for the memories',
        langName: 'English',
        prevBtn: 'Previous',
        nextBtn: 'Next',
        langBtn: 'Language',
        speakBtn: 'Read Aloud',
        stopBtn: 'Stop'
    },
    es: { // スペイン語
        page1: 'Tantos recuerdos jugando con amigos en el parque',
        page2: 'Expectativas sobre qué habría en la lonchera. La excursión.',
        page3: 'El día deportivo donde todos se esforzaron. Estuvimos unidos como uno solo.',
        page4: 'El profesor era aterrador como un fantasma, pero la casa embrujada se convirtió en un buen recuerdo.',
        page5: 'El escenario arcoíris donde practicamos mucho y actuamos para mamá y papá. Tantos recuerdos.',
        page6: 'Despedirnos de nuestro profesor es triste, pero gracias por los recuerdos',
        langName: 'Español',
        prevBtn: 'Anterior',
        nextBtn: 'Siguiente',
        langBtn: 'Idioma',
        speakBtn: 'Leer en voz alta',
        stopBtn: 'Detener'
    },
    fr: { // フランス語
        page1: 'Tant de souvenirs à jouer avec des amis dans le parc',
        page2: 'Curieux de savoir ce qu\'il y avait dans la boîte à déjeuner. La sortie scolaire.',
        page3: 'La journée sportive où tout le monde a fait de son mieux. Nous étions unis comme un seul.',
        page4: 'Le professeur était effrayant comme un fantôme, mais la maison hantée est devenue un bon souvenir.',
        page5: 'La scène arc-en-ciel où nous avons beaucoup pratiqué et joué pour maman et papa. Tant de souvenirs.',
        page6: 'Dire au revoir à notre professeur est triste, mais merci pour les souvenirs',
        langName: 'Français',
        prevBtn: 'Précédent',
        nextBtn: 'Suivant',
        langBtn: 'Langue',
        speakBtn: 'Lire à haute voix',
        stopBtn: 'Arrêter'
    },
    zh: { // 中国語
        page1: '在公园里和朋友们一起玩耍的美好回忆',
        page2: '期待午餐盒里有什么。郊游。',
        page3: '大家都尽力而为的运动会。我们团结一心。',
        page4: '老师变成鬼很可怕，但鬼屋成了美好的回忆。',
        page5: '我们努力练习并为爸爸妈妈表演的彩虹舞台。许多美好的回忆。',
        page6: '与老师道别虽然伤心，但谢谢您带给我们的回忆',
        langName: '中文',
        prevBtn: '上一页',
        nextBtn: '下一页',
        langBtn: '语言',
        speakBtn: '朗读',
        stopBtn: '停止'
    },
    ko: { // 韓国語
        page1: '공원에서 친구들과 함께 놀았던 많은 추억',
        page2: '도시락 안에 무엇이 있을지 기대했던 소풍.',
        page3: '모두가 최선을 다했던 운동회. 우리는 하나로 단결했습니다.',
        page4: '유령이 된 선생님은 무서웠지만, 귀신의 집은 좋은 추억이 되었습니다.',
        page5: '열심히 연습하고 엄마 아빠를 위해 공연했던 무지개 무대. 많은 추억이 있습니다.',
        page6: '선생님과 작별하는 것은 슬프지만, 추억을 주셔서 감사합니다',
        langName: '한국어',
        prevBtn: '이전',
        nextBtn: '다음',
        langBtn: '언어',
        speakBtn: '읽어주기',
        stopBtn: '중지'
    }
};

// 現在の言語設定（デフォルトは日本語）
let currentLanguage = 'ja';

// 読み上げ用の変数
let isSpeaking = false;

// 言語コードから音声言語コードへのマッピング (SpeechSynthesis用)
const languageVoiceMap = {
    ja: 'ja-JP',
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    zh: 'zh-CN',
    ko: 'ko-KR'
};

// シーンの設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// カメラの設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -0.2, 1.6);

// レンダラーの設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// コントロールの設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, -1.1, 0); // 本の位置に合わせて調整
controls.minDistance = 0.5; // より近くまで寄れるように
controls.maxDistance = 10; // より遠くまで離れられるように
controls.maxPolarAngle = Math.PI - 0.1; // ほぼ全方向から見られるように
controls.minPolarAngle = 0.1; // 少し制限を設ける
controls.enableZoom = true; // ズーム機能を有効化
controls.zoomSpeed = 1.0; // 標準のズーム速度
controls.enableRotate = true; // 回転を有効化
controls.rotateSpeed = 1.0; // 標準の回転速度
controls.enablePan = true; // パン（移動）も有効化
controls.panSpeed = 1.0; // 標準のパン速度
controls.update();

// 光源の設定
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(2, 3, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.4 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

// 背景の設定 - 部屋のような環境を作成
const roomGeometry = new THREE.BoxGeometry(20, 15, 20);
const roomMaterials = [
    new THREE.MeshStandardMaterial({ color: 0xc2d1e0, side: THREE.BackSide, roughness: 0.9, metalness: 0.1 }), // 右
    new THREE.MeshStandardMaterial({ color: 0xc2d1e0, side: THREE.BackSide, roughness: 0.9, metalness: 0.1 }), // 左
    new THREE.MeshStandardMaterial({ color: 0xe0e0e0, side: THREE.BackSide, roughness: 0.9, metalness: 0.1 }), // 上
    new THREE.MeshStandardMaterial({ color: 0x967969, side: THREE.BackSide, roughness: 0.8, metalness: 0.2 }), // 下
    new THREE.MeshStandardMaterial({ color: 0xc2d1e0, side: THREE.BackSide, roughness: 0.9, metalness: 0.1 }), // 前
    new THREE.MeshStandardMaterial({ color: 0xc2d1e0, side: THREE.BackSide, roughness: 0.9, metalness: 0.1 })  // 後ろ
];
const room = new THREE.Mesh(roomGeometry, roomMaterials);
room.position.y = 7.5 - 1.5 - 0.1;
scene.add(room);

// テーブルの作成
const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3);
const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7, metalness: 0.3 });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.position.y = -1.5;
table.receiveShadow = true;
table.castShadow = true;
scene.add(table);

// 絵本の作成
const book = new FlipBook({
    flipDuration: 0.8,
    yBetweenPages: 0.0015,
    pageSubdivisions: 15
});

book.scale.set(0.7, 0.9, 0.9);  // サイズ調整：全体的にやや小さめに
book.position.y = -1.3;         // 位置調整：少し上に
book.rotation.x = 0;            // 回転調整：傾きをなくす
book.castShadow = true;
scene.add(book);

// 画像の上にテキストを追加する関数
function createTextOverlayTexture(imagePath, text, rubyText = '', yPosition = 0.93) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Failed to get 2D context');

                // 画像を描画する前にスケールしてサイズ調整（上部に余白を作る）
                const imageScaleFactor = 0.85; // 画像を85%のサイズに縮小
                const scaledHeight = img.naturalHeight * imageScaleFactor;
                const yOffset = (img.naturalHeight - scaledHeight) * 0.1; // 画像を少し上に移動

                // クリアキャンバス
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 画像を縮小して描画（上部に配置）
                ctx.drawImage(img, 0, yOffset, canvas.width, scaledHeight);
                
                ctx.textRendering = 'optimizeLegibility';
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                const textY = canvas.height * yPosition;
                const padding = canvas.width * 0.08; // パディングを増やして描画領域を狭く

                // テキストを読みやすくするための設定
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; 
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillStyle = '#000000'; // 黒テキスト
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const textParts = analyzeText(text);
                
                // フォントサイズを調整
                const fontSize = Math.min(canvas.width * 0.034, 28); // 適切なサイズに調整
                ctx.font = `bold ${fontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;

                // ページ6のテキスト特別処理
                if (text === languageData[currentLanguage].page6 && currentLanguage === 'ja') {
                    // 2行に分けて表示
                    const firstLine = "先生とのお別れは寂しいけど";
                    const secondLine = "思い出をありがとう";
                    
                    const firstLineParts = analyzeText(firstLine);
                    const secondLineParts = analyzeText(secondLine);
                    
                    const rubyFontSize = fontSize * 0.4;
                    const rubyOffsetY = -fontSize * 0.7;
                    const lineHeight = fontSize * 2.5; // 行間をさらに広げる
                    
                    // 1行目の幅を計算
                    let firstLineWidth = 0;
                    for (const part of firstLineParts) {
                        const metrics = ctx.measureText(part.text);
                        firstLineWidth += metrics.width + (part.spacing || 0);
                    }
                    
                    // 2行目の幅を計算
                    let secondLineWidth = 0;
                    for (const part of secondLineParts) {
                        const metrics = ctx.measureText(part.text);
                        secondLineWidth += metrics.width + (part.spacing || 0);
                    }
                    
                    // 1行目の描画
                    let currentX = (canvas.width - firstLineWidth) / 2;
                    const firstLineY = textY - lineHeight / 2;
                    for (const part of firstLineParts) {
                        const partWidth = ctx.measureText(part.text).width;
                        const drawX = currentX + partWidth / 2;
                        ctx.font = `bold ${fontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                        ctx.fillStyle = '#000000'; // 黒テキスト
                        ctx.fillText(part.text, drawX, firstLineY);
                        if (part.isKanji && part.ruby) {
                            ctx.font = `${rubyFontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                            ctx.fillStyle = '#000000'; // ルビも黒
                            ctx.fillText(part.ruby, drawX, firstLineY + rubyOffsetY);
                        }
                        currentX += partWidth + (part.spacing || 0);
                    }
                    
                    // 2行目の描画
                    currentX = (canvas.width - secondLineWidth) / 2;
                    const secondLineY = textY + lineHeight / 2;
                    for (const part of secondLineParts) {
                        const partWidth = ctx.measureText(part.text).width;
                        const drawX = currentX + partWidth / 2;
                        ctx.font = `bold ${fontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                        ctx.fillStyle = '#000000'; // 黒テキスト
                        ctx.fillText(part.text, drawX, secondLineY);
                        if (part.isKanji && part.ruby) {
                            ctx.font = `${rubyFontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                            ctx.fillStyle = '#000000'; // ルビも黒
                            ctx.fillText(part.ruby, drawX, secondLineY + rubyOffsetY);
                        }
                        currentX += partWidth + (part.spacing || 0);
                    }
                } 
                // 改行が含まれているテキストの処理
                else if (text.includes('\n')) {
                    // 改行で分割
                    const lines = text.split('\n');
                    
                    // 各行ごとに文字パーツを分析
                    const linesParts = lines.map(line => analyzeText(line));
                    
                    const rubyFontSize = fontSize * 0.4;
                    const rubyOffsetY = -fontSize * 0.7;
                    const lineHeight = fontSize * 2.5; // 行間を広めに
                    
                    // 各行の幅を計算
                    const linesWidths = linesParts.map(lineParts => {
                        let width = 0;
                        for (const part of lineParts) {
                            const metrics = ctx.measureText(part.text);
                            width += metrics.width + (part.spacing || 0);
                        }
                        return width;
                    });
                    
                    // 行数に基づいて開始Y位置を計算
                    const startY = textY - (lineHeight * (lines.length - 1)) / 2;
                    
                    // 各行を描画
                    linesParts.forEach((lineParts, lineIndex) => {
                        let currentX = (canvas.width - linesWidths[lineIndex]) / 2;
                        const lineY = startY + lineIndex * lineHeight;
                        
                        // 行内の各パーツを描画
                        for (const part of lineParts) {
                            const partWidth = ctx.measureText(part.text).width;
                            const drawX = currentX + partWidth / 2;
                            ctx.font = `bold ${fontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                            ctx.fillStyle = '#000000';
                            ctx.fillText(part.text, drawX, lineY);
                            
                            // ルビがある場合は描画
                            if (part.isKanji && part.ruby && currentLanguage === 'ja') {
                                ctx.font = `${rubyFontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                                ctx.fillStyle = '#000000';
                                ctx.fillText(part.ruby, drawX, lineY + rubyOffsetY);
                            }
                            
                            currentX += partWidth + (part.spacing || 0);
                        }
                    });
                }
                else {
                    // 通常のテキスト処理（既存のコード）
                    const availableWidth = canvas.width - padding * 2 - 40; // 実際の描画スペースをさらに少し狭く
                    const lines = [];
                    let currentLine = [];
                    let currentLineWidth = 0;
                    const rubyFontSize = fontSize * 0.4;
                    const rubyOffsetY = -fontSize * 0.7;

                    for (const part of textParts) {
                        const metrics = ctx.measureText(part.text);
                        const partWidth = metrics.width + (part.spacing || 0);
                        if (currentLineWidth + partWidth > availableWidth && currentLine.length > 0) {
                            lines.push({ parts: currentLine, width: currentLineWidth });
                            currentLine = [part];
                            currentLineWidth = partWidth;
                        } else {
                            currentLine.push(part);
                            currentLineWidth += partWidth;
                        }
                    }
                    if (currentLine.length > 0) {
                        lines.push({ parts: currentLine, width: currentLineWidth });
                    }

                    const totalLines = lines.length;
                    const lineHeight = fontSize * 2.5; // 行間をさらに広げて重なりを確実に防ぐ
                    const startY = textY - (lineHeight * (totalLines - 1)) / 2;

                    lines.forEach((line, lineIndex) => {
                        let currentX = (canvas.width - line.width) / 2;
                        const lineY = startY + lineIndex * lineHeight;
                        for (const part of line.parts) {
                            const partWidth = ctx.measureText(part.text).width;
                            const drawX = currentX + partWidth / 2;
                            ctx.font = `bold ${fontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                            ctx.fillStyle = '#000000'; // 黒テキスト
                            ctx.fillText(part.text, drawX, lineY);
                            if (part.isKanji && part.ruby && currentLanguage === 'ja') {
                                ctx.font = `${rubyFontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", "Arial", sans-serif`;
                                ctx.fillStyle = '#000000'; // ルビも黒
                                ctx.fillText(part.ruby, drawX, lineY + rubyOffsetY);
                            }
                            currentX += partWidth + (part.spacing || 0);
                        }
                    });
                }

                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                resolve(texture);
            } catch (error) {
                console.error(`Error creating texture for ${imagePath}:`, error);
                reject(error);
            }
        };
        img.onerror = function(err) {
            console.error(`Error loading image: ${imagePath}`, err);
            const errorCanvas = document.createElement('canvas');
            errorCanvas.width = 512; errorCanvas.height = 512;
            const ctx = errorCanvas.getContext('2d');
            if(ctx){
                ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 512, 512);
                ctx.fillStyle = 'white'; ctx.font = '20px Arial'; ctx.textAlign = 'center';
                ctx.fillText(`Error: ${imagePath}`, 256, 256);
            }
            resolve(new THREE.CanvasTexture(errorCanvas));
        };
        img.src = imagePath;
    });
}

// テキストを解析して漢字とその読みを特定する関数 (日本語用)
function analyzeText(text) {
    if (currentLanguage !== 'ja') {
        // 非日本語の場合は文字間隔を広めに設定
        return text.split('').map(char => ({ text: char, isKanji: false, ruby: null, spacing: 4 }));
    }
    const rubyMap = {
        '友': 'とも', '達': 'だち', '遊': 'あそ', '公': 'こう', '園': 'えん',
        '弁': 'べん', '当': 'とう', '楽': 'たの', '遠': 'えん', '足': 'そく',
        '皆': 'みな', '一': 'いっ', '生': 'しょう', '懸': 'けん', '命': 'めい', '頑': 'がん', '張': 'ば', '運': 'うん', '動': 'どう', '会': 'かい', '心': 'こころ', // '一'の読みは文脈依存
        '化': 'ば', '先': 'せん', '生': 'せい', '怖': 'こわ', '思': 'おも', '出': 'で',
        '練': 'れん', '習': 'しゅう', '見': 'み',
        '別': 'わか', '寂': 'さび'
    };
    // '一' の読み分けを試みる（簡易）
    if (text.includes('心を一つに')) rubyMap['一'] = 'ひと';
    else if (text.includes('一生懸命')) rubyMap['一'] = 'いっ'; // こちらを優先

    // 文字間隔を広めに設定して重なりを防止
    const parts = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const ruby = rubyMap[char];
        const isKanji = !!ruby;
        // 文字間隔を広めに取る
        let currentSpacing = 8; // 基本間隔をさらに広くする
        if (['。', '、', '！', '？'].includes(char)) currentSpacing = 10; // 句読点の後はさらに広く
        const spacing = (i < text.length - 1) ? currentSpacing : 0;
        parts.push({ text: char, isKanji: isKanji, ruby: ruby || null, spacing: spacing });
    }
    return parts;
}

// ページをロードして設定する関数
async function loadPages() {
    console.log(`Loading pages for language: ${currentLanguage}`);
    const texts = languageData[currentLanguage];
    const imagePaths = [
        '/images/cover.jpg', '/images/inside-cover.jpg', '/images/page1.jpg',
        '/images/page2.jpg', '/images/page3.jpg', '/images/page4.jpg',
        '/images/page5.jpg', '/images/page6.jpg', '/images/back-inside.jpg',
        '/images/back-cover.jpg'
    ];
    const pageKeys = [null, null, 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', null, null];

    const texturePromises = imagePaths.map((path, index) => {
        const pageKey = pageKeys[index];
        if (pageKey && texts[pageKey]) {
            console.log(`Creating texture for page index ${index} (key: ${pageKey})`);
            return createTextOverlayTexture(path, texts[pageKey]);
        } else {
            console.log(`Using image path directly for page index ${index}`);
            return Promise.resolve(path);
        }
    });

    try {
        const pagesContent = await Promise.all(texturePromises);
        console.log("All page textures/paths loaded:", pagesContent.map(p => typeof p === 'string' ? p : '[Texture]'));
        const validPagesContent = pagesContent.map(content => content || '/images/error.jpg');
        book.setPages(validPagesContent);

        book.traverse(child => {
            if (child.isMesh) {
                 child.castShadow = true;
                 child.receiveShadow = true;
                 if (child.material instanceof THREE.MeshStandardMaterial) {
                     child.material.roughness = 0.8;
                     child.material.metalness = 0.1;
                     if (child.material.aoMap) child.material.aoMapIntensity = 1.2;
                 }
            }
        });

        // quick_flipbook のバージョン等に合わせて調整
         if (book.pages && Array.isArray(book.pages)) {
             book.pages.forEach(page => {
                 if (page && page.pageCurve && typeof page.modifiers?.apply === 'function') {
                     page.pageCurve.factor = 0.3;
        page.modifiers.apply();
                 }
             });
         }

        console.log("Book pages set successfully.");
        updateUIText();
    } catch (error) {
        console.error("Error loading or setting pages:", error);
        alert("絵本の読み込み中にエラーが発生しました。");
    }
}

// ページめくり効果の音声
let pageFlipSound = null;
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);

try {
pageFlipSound = new THREE.Audio(listener);
    audioLoader.load('https://assets.codepen.io/28963/page-flip.mp3', buffer => {
    pageFlipSound.setBuffer(buffer);
        pageFlipSound.setVolume(0.4);
        console.log("Page flip sound loaded.");
    }, undefined, err => console.error("Error loading page flip sound:", err));
} catch (e) { console.error("Failed to initialize Audio:", e); }

// --- UI関連の関数 ---
document.getElementById('prevPage')?.addEventListener('click', () => {
    book.previousPage();
    if (pageFlipSound) { if (pageFlipSound.isPlaying) pageFlipSound.stop(); pageFlipSound.play(); }
    stopSpeaking();
    // ページめくり後、少し遅延させて読み上げ開始
    setTimeout(() => {
        speakCurrentPage();
    }, 800); // 800ms後に読み上げ開始（ページめくりアニメーション完了後）
});

document.getElementById('nextPage')?.addEventListener('click', () => {
    book.nextPage();
    if (pageFlipSound) { if (pageFlipSound.isPlaying) pageFlipSound.stop(); pageFlipSound.play(); }
    stopSpeaking();
    // ページめくり後、少し遅延させて読み上げ開始
    setTimeout(() => {
        speakCurrentPage();
    }, 800); // 800ms後に読み上げ開始（ページめくりアニメーション完了後）
});

function createLanguageSelector() {
    document.getElementById('langButton')?.remove();
    document.getElementById('langMenu')?.remove();
    const langButton = document.createElement('button');
    langButton.id = 'langButton'; langButton.className = 'control-button lang-button';
    langButton.textContent = languageData[currentLanguage]?.langBtn || 'Language';
    Object.assign(langButton.style, { position: 'fixed', right: '20px', top: '20px', zIndex: '100', padding: '10px 15px', background: 'rgba(33, 150, 243, 0.9)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' });
    const langMenu = document.createElement('div');
    langMenu.id = 'langMenu';
    Object.assign(langMenu.style, { position: 'fixed', right: '20px', top: '70px', zIndex: '100', background: 'rgba(255, 255, 255, 0.98)', border: '1px solid #ddd', borderRadius: '5px', display: 'none', flexDirection: 'column', padding: '5px', boxShadow: '0 4px 8px rgba(0,0,0,0.15)', minWidth: '120px' });
    Object.keys(languageData).forEach(langCode => {
        const langOption = document.createElement('button');
        langOption.textContent = languageData[langCode]?.langName || langCode;
        Object.assign(langOption.style, { padding: '8px 12px', margin: '3px 0', background: langCode === currentLanguage ? 'rgba(33, 150, 243, 0.15)' : 'transparent', border: 'none', borderRadius: '3px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.2s ease' });
        langOption.addEventListener('mouseover', () => { if(langCode !== currentLanguage) langOption.style.background = 'rgba(0, 0, 0, 0.05)'; });
        langOption.addEventListener('mouseout', () => { langOption.style.background = langCode === currentLanguage ? 'rgba(33, 150, 243, 0.15)' : 'transparent'; });
        langOption.addEventListener('click', (e) => { e.stopPropagation(); if (currentLanguage !== langCode) changeLanguage(langCode); langMenu.style.display = 'none'; });
        langMenu.appendChild(langOption);
    });
    langButton.addEventListener('click', (e) => { e.stopPropagation(); langMenu.style.display = langMenu.style.display === 'none' ? 'flex' : 'none'; });
    document.addEventListener('click', (e) => { 
        if (!langButton.contains(e.target) && !langMenu.contains(e.target)) {
            langMenu.style.display = 'none'; 
        }
    });
    document.body.appendChild(langButton); document.body.appendChild(langMenu);
}

function changeLanguage(langCode) {
    if (languageData[langCode] && currentLanguage !== langCode) {
        console.log(`Changing language to: ${langCode}`);
        stopSpeaking(); currentLanguage = langCode;
        loadPages().then(() => { // loadPages が完了してからUI更新
             updateLanguageSelectorUI();
             updateUIText(); // ボタンテキスト等も更新
        });
    }
}

function updateUIText() {
    const texts = languageData[currentLanguage]; if (!texts) return;
    const prevBtn = document.getElementById('prevPage'); if (prevBtn) prevBtn.textContent = texts.prevBtn;
    const nextBtn = document.getElementById('nextPage'); if (nextBtn) nextBtn.textContent = texts.nextBtn;
    const speakButton = document.getElementById('speakButton'); if (speakButton) speakButton.textContent = isSpeaking ? texts.stopBtn : texts.speakBtn;
    const langButton = document.getElementById('langButton'); if (langButton) langButton.textContent = texts.langBtn;
}

function updateLanguageSelectorUI() {
     const langMenu = document.getElementById('langMenu');
     if (langMenu) {
         Array.from(langMenu.children).forEach((option, index) => {
             const langCode = Object.keys(languageData)[index];
             if (option instanceof HTMLButtonElement) option.style.background = langCode === currentLanguage ? 'rgba(33, 150, 243, 0.15)' : 'transparent';
         });
     }
 }

function createSpeakButton() {
    document.getElementById('speakButton')?.remove();
    const speakButton = document.createElement('button');
    speakButton.id = 'speakButton'; speakButton.className = 'control-button speak-button';
    speakButton.textContent = languageData[currentLanguage]?.speakBtn || 'Read Aloud';
    speakButton.addEventListener('click', speakCurrentPage);
    const controlsContainer = document.querySelector('.controls');
    if (controlsContainer) { controlsContainer.appendChild(speakButton); console.log("Speak button added."); }
    else { console.warn(".controls container not found, adding to body."); Object.assign(speakButton.style, { position: 'fixed', bottom: '20px', left: 'calc(50% - 50px)' }); document.body.appendChild(speakButton); }
}

// --- 読み上げ関連の関数 ---

// ★★★ 見開き両ページを読むように再修正された関数 ★★★
async function speakCurrentPage() {
    // 再生中にクリックされたら停止
    if (isSpeaking) {
        stopSpeaking();
        return;
    }

    const currentPageIndex = book.currentPage;
    console.log(`[speakCurrentPage] Current page index from book: ${currentPageIndex}`);

    // 実際に見えているページを特定
    // 見開きのどちらを読むか決定する
    let pageKey = null;

    // FlipBookのページインデックスから適切なテキストキーを特定
    if (currentPageIndex === 0) {
        // 表紙の場合は読み上げない
        console.log("[speakCurrentPage] Cover page, nothing to read.");
        return;
    } else if (currentPageIndex === 1) {
        // 表紙裏の場合も読み上げない
        console.log("[speakCurrentPage] Inside cover, nothing to read.");
        return;
    } else if (currentPageIndex === 2 || currentPageIndex === 3) {
        // 1ページ目のテキスト
        pageKey = 'page1';
    } else if (currentPageIndex === 4 || currentPageIndex === 5) {
        // 2ページ目/3ページ目のテキスト
        pageKey = currentPageIndex === 4 ? 'page3' : 'page4';
    } else if (currentPageIndex === 6 || currentPageIndex === 7) {
        // 4ページ目/5ページ目のテキスト
        pageKey = currentPageIndex === 6 ? 'page5' : 'page6';
    } else if (currentPageIndex >= 8) {
        // 裏表紙部分は読み上げない
        console.log("[speakCurrentPage] Back cover, nothing to read.");
        return;
    }

    console.log(`[speakCurrentPage] Selected page key: ${pageKey}`);

    const texts = languageData[currentLanguage];
    if (!texts) {
        console.error(`[speakCurrentPage] Language data not found for "${currentLanguage}".`);
        stopSpeaking();
        return;
    }

    // 選択したページのテキストを取得
    const textToSpeak = texts[pageKey] || "";

    if (!textToSpeak) {
        console.warn(`[speakCurrentPage] Text not found for key "${pageKey}". Nothing to speak.`);
        stopSpeaking();
        return;
    }

    console.log(`[speakCurrentPage] Text to speak: "${textToSpeak}"`);

    // 読み上げ実行
    try {
        await speakText(textToSpeak);
    } catch (error) {
        console.error("[speakCurrentPage] Failed to initiate speakText:", error);
        isSpeaking = false;
        updateSpeakButtonState();
    }
}


async function speakText(text) {
    if (!text) { console.error('[speakText] Error: Text is empty.'); return; }
    if(isSpeaking) { console.warn('[speakText] Warning: Already speaking.'); stopSpeaking(); }

    isSpeaking = true; updateSpeakButtonState();

    try {
        const voice = getBestVoiceForLanguage(currentLanguage);
        console.log(`[speakText] Requesting speech for: "${text.substring(0, 50)}..." with voice: ${voice}`);
        try {
            const audioBuffer = await textToSpeech(text, voice);
            if (!audioBuffer || !(audioBuffer instanceof ArrayBuffer) || audioBuffer.byteLength < 100) { // サイズが小さすぎる場合もエラー扱い
                console.error('[speakText] Error: Invalid or empty audio data from OpenAI API.');
                throw new Error('Invalid or empty audio data');
            }
            console.log(`[speakText] Received audio data (size: ${audioBuffer.byteLength} bytes). Playing...`);

            // audioPlayer.playAudio が Promise を返すことを期待
            await audioPlayer.playAudio(audioBuffer);

            // 再生完了のハンドリング (audioPlayerの実装に依存)
            if (audioPlayer.audio && typeof audioPlayer.audio.addEventListener === 'function') {
                 const onEndHandler = () => {
                     console.log('[speakText] Audio playback finished (onended).');
                     isSpeaking = false; updateSpeakButtonState();
                     audioPlayer.audio.removeEventListener('ended', onEndHandler);
                 };
                 // 'ended' イベントが発火しない場合があるため、'pause' も監視する方が安全かもしれない
                 audioPlayer.audio.addEventListener('ended', onEndHandler, { once: true });
             } else {
                 console.warn('[speakText] Cannot attach ended listener. Manual state reset needed?');
                 // ここで isSpeaking = false にすると再生終了前に状態が変わる可能性
             }
        } catch (apiError) {
            console.error('[speakText] Error during OpenAI TTS or playback:', apiError);
            console.log('[speakText] Falling back to browser SpeechSynthesis...');
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = languageVoiceMap[currentLanguage] || 'ja-JP';
                utterance.rate = 1.0; utterance.pitch = 1.0;
                utterance.onend = () => { console.log('[speakText] Browser SpeechSynthesis finished.'); isSpeaking = false; updateSpeakButtonState(); };
                utterance.onerror = (event) => { console.error('[speakText] Browser SpeechSynthesis error:', event); isSpeaking = false; updateSpeakButtonState(); };
                // SpeechSynthesisがビジーな場合があるので、念のためキャンセルしてからspeak
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            } else {
                console.error('[speakText] Browser SpeechSynthesis not supported.');
                isSpeaking = false; updateSpeakButtonState();
                alert('音声読み上げ機能が利用できません。');
            }
        }
    } catch (error) {
        console.error('[speakText] Unexpected error:', error);
        isSpeaking = false; updateSpeakButtonState();
        alert('音声読み上げ準備中にエラーが発生しました。');
    }
}

function stopSpeaking() {
    console.log('[stopSpeaking] Stopping speech...');
    audioPlayer.stop();
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    if (isSpeaking) { // isSpeakingがtrueの場合のみ更新
        isSpeaking = false;
        updateSpeakButtonState();
    }
}

function updateSpeakButtonState() {
    const speakButton = document.getElementById('speakButton');
    const texts = languageData[currentLanguage];
    if (speakButton && texts) {
        speakButton.textContent = isSpeaking ? texts.stopBtn : texts.speakBtn;
        if(isSpeaking) speakButton.classList.add('speaking');
        else speakButton.classList.remove('speaking');
        console.log(`[updateSpeakButtonState] Button text: ${speakButton.textContent}, isSpeaking: ${isSpeaking}`);
    }
}

// --- 初期化とアニメーションループ ---
function init() {
    console.log("Initializing application...");
    createLanguageSelector();
    createSpeakButton();
    loadPages(); // 非同期開始
    
    // イベントリスナー設定
    window.addEventListener('resize', onWindowResize, false);
    
    // マウスイベントの設定 - ページめくり用
    renderer.domElement.addEventListener('click', onMouseClick, false);
    
    // タッチイベントの設定 - モバイル端末用ページめくり
    setupTouchEvents();
    
    // ホイールイベントの設定 - ズーム用
    renderer.domElement.addEventListener('wheel', function(event) {
        event.preventDefault(); // デフォルトのスクロール動作を防止
    }, { passive: false });
    
    animate();
    console.log("Initialization complete.");
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
    // Ctrl, Alt, Shiftキーが押されている場合や右クリックの場合は
    // OrbitControlsの操作と解釈してページめくりを行わない
    if (event.button !== 0 || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }
    
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(book.children, true);

    if (intersects.length > 0) {
        const clickWorldPoint = intersects[0].point;
        const localClickPoint = book.worldToLocal(clickWorldPoint.clone());
        console.log("Local click point X:", localClickPoint.x);
        if (localClickPoint.x > 0.05) { // 右側をクリック (閾値を少し設ける)
             console.log("Clicked right side -> nextPage()");
             book.nextPage();
             if (pageFlipSound) { if (pageFlipSound.isPlaying) pageFlipSound.stop(); pageFlipSound.play(); }
             stopSpeaking();
             // ページめくり後、少し遅延させて読み上げ開始
             setTimeout(() => {
                 speakCurrentPage();
             }, 800); // 800ms後に読み上げ開始
        } else if (localClickPoint.x < -0.05) { // 左側をクリック
            console.log("Clicked left side -> previousPage()");
             book.previousPage();
             if (pageFlipSound) { if (pageFlipSound.isPlaying) pageFlipSound.stop(); pageFlipSound.play(); }
             stopSpeaking();
             // ページめくり後、少し遅延させて読み上げ開始
             setTimeout(() => {
                 speakCurrentPage();
             }, 800); // 800ms後に読み上げ開始
        } else {
            console.log("Clicked near center, no page turn.");
        }
    }
}

// タッチイベントのセットアップ
function setupTouchEvents() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    const swipeThreshold = 50; // スワイプを検出する最小の距離（ピクセル）
    
    renderer.domElement.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchMoved = false;
    }, false);
    
    renderer.domElement.addEventListener('touchmove', function(event) {
        // 既定のスクロール動作を防止
        event.preventDefault();
        touchMoved = true;
    }, { passive: false });
    
    renderer.domElement.addEventListener('touchend', function(event) {
        if (!touchMoved) return; // タッチが移動していない場合は無視
        
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        // X軸の移動距離
        const deltaX = touchEndX - touchStartX;
        // Y軸の移動距離
        const deltaY = touchEndY - touchStartY;
        
        // 水平方向の移動が垂直方向より大きい場合に処理（ページめくりジェスチャー）
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) {
                // 右にスワイプ -> 前のページ
                console.log("Right swipe detected -> previousPage()");
                book.previousPage();
                if (pageFlipSound) { 
                    if (pageFlipSound.isPlaying) pageFlipSound.stop(); 
                    pageFlipSound.play(); 
                }
                stopSpeaking();
                // ページめくり後、少し遅延させて読み上げ開始
                setTimeout(() => {
                    speakCurrentPage();
                }, 800);
            } else {
                // 左にスワイプ -> 次のページ
                console.log("Left swipe detected -> nextPage()");
                book.nextPage();
                if (pageFlipSound) { 
                    if (pageFlipSound.isPlaying) pageFlipSound.stop(); 
                    pageFlipSound.play(); 
                }
                stopSpeaking();
                // ページめくり後、少し遅延させて読み上げ開始
                setTimeout(() => {
                    speakCurrentPage();
                }, 800);
            }
        }
    }, false);
}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (typeof book.update === 'function') book.update(delta); // quick_flipbookがupdateメソッドを持つ場合
    else if (typeof book.animate === 'function') book.animate(delta); // animateメソッドを持つ場合
    controls.update();
    renderer.render(scene, camera);
}

// DOMContentLoadedを待って初期化 (より安全)
document.addEventListener('DOMContentLoaded', init);