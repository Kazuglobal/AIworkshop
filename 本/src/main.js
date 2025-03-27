// カスタム機能を追加したmain.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlipBook } from 'quick_flipbook';

// 多言語対応 - 各言語のテキストデータ
const languageData = {
    ja: { // 日本語（デフォルト）
        page1: 'お友達とたくさん遊んだ公園におもいでがいっぱい',
        page2: 'どんなお弁当か楽しみだったな。遠足。',
        page3: '皆で一生懸命に頑張った運動会。心を一つにしたよ。',
        page4: 'お化けになった先生が怖かったけど、いい思い出になったおばけやしき。',
        page5: 'たくさん練習してパパとママに見てもらったにじいろステージ。思い出がたくさん。',
        page6: '先生とのお別れは寂しいけど、思い出をありがとう',
        langName: '日本語',
        prevBtn: '前のページ',
        nextBtn: '次のページ',
        langBtn: '言語選択'
    },
    en: { // 英語
        page1: 'So many memories of playing with friends at the park',
        page2: 'Looking forward to what was in the lunchbox. The field trip.',
        page3: 'The sports day where everyone did their best. We were united as one.',
        page4: 'The teacher was scary as a ghost, but the haunted house became a good memory.',
        page5: 'The rainbow stage where we practiced hard and performed for mom and dad. So many memories.',
        page6: 'Saying goodbye to our teacher is sad, but thank you for the memories',
        langName: 'English',
        prevBtn: 'Previous',
        nextBtn: 'Next',
        langBtn: 'Language'
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
        langBtn: 'Idioma'
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
        langBtn: 'Langue'
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
        langBtn: '语言'
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
        langBtn: '언어'
    }
};

// 現在の言語設定（デフォルトは日本語）
let currentLanguage = 'ja';

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
controls.target.set(0, -1.1, 0);
controls.update();

// 光源の設定
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 背景の設定 - 部屋のような環境を作成
const roomGeometry = new THREE.BoxGeometry(20, 15, 20);
const roomMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xA9A9A9, side: THREE.BackSide }), // 右
    new THREE.MeshBasicMaterial({ color: 0xA9A9A9, side: THREE.BackSide }), // 左
    new THREE.MeshBasicMaterial({ color: 0xD3D3D3, side: THREE.BackSide }), // 上
    new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.BackSide }), // 下（床）
    new THREE.MeshBasicMaterial({ color: 0xA9A9A9, side: THREE.BackSide }), // 前
    new THREE.MeshBasicMaterial({ color: 0xA9A9A9, side: THREE.BackSide })  // 後ろ
];
const room = new THREE.Mesh(roomGeometry, roomMaterials);
scene.add(room);

// テーブルの作成
const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3);
const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.position.y = -1.5;
table.receiveShadow = true;
scene.add(table);

// 絵本の作成
const book = new FlipBook({
    flipDuration: 0.8, // ページめくりの時間（秒）
    yBetweenPages: 0.001, // ページ間のスペース
    pageSubdivisions: 20 // ページの分割数（滑らかさに影響）
});

// 絵本のスケール調整（縦横比を調整）
book.scale.x = 0.8;
book.scale.y = 1.1; // 縦方向に少し大きく
book.position.y = -1.1; // テーブルの上の位置を調整
book.rotation.x = -0.35; // より見やすい角度に傾ける
scene.add(book);

// 画像の上にテキストを追加する関数（プロフェッショナルな編集レイアウト）
function createTextOverlayTexture(imagePath, text, rubyText, yPosition = 0.85) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            
            // 画像を描画
            ctx.drawImage(img, 0, 0);
            
            // 高品質なテキストレンダリングの設定
            ctx.textRendering = 'optimizeLegibility';
            ctx.imageSmoothingEnabled = true;
            
            // テキスト用の背景 - より洗練された半透明グラデーション
            const textY = canvas.height * yPosition;
            const bgHeight = 150; // 背景の高さを統一
            
            // グラデーション背景を作成
            const gradient = ctx.createLinearGradient(0, textY - 75, 0, textY + 75);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.75)');
            
            // 4ページ目の場合のみ、背景の高さと透明度を調整
            if (text.startsWith('お化けになった先生が怖かった')) {
                const bgHeightForPage4 = 180; // 4ページ目の背景の高さを他のページと同じに調整
                
                // 背景に角丸を適用（4ページ目）
                const radius = 15;
                ctx.beginPath();
                ctx.moveTo(10, textY - bgHeightForPage4/2 + radius);
                ctx.lineTo(10, textY + bgHeightForPage4/2 - radius);
                ctx.arcTo(10, textY + bgHeightForPage4/2, 10 + radius, textY + bgHeightForPage4/2, radius);
                ctx.lineTo(canvas.width - 10 - radius, textY + bgHeightForPage4/2);
                ctx.arcTo(canvas.width - 10, textY + bgHeightForPage4/2, canvas.width - 10, textY + bgHeightForPage4/2 - radius, radius);
                ctx.lineTo(canvas.width - 10, textY - bgHeightForPage4/2 + radius);
                ctx.arcTo(canvas.width - 10, textY - bgHeightForPage4/2, canvas.width - 10 - radius, textY - bgHeightForPage4/2, radius);
                ctx.lineTo(10 + radius, textY - bgHeightForPage4/2);
                ctx.arcTo(10, textY - bgHeightForPage4/2, 10, textY - bgHeightForPage4/2 + radius, radius);
                ctx.closePath();
            } else {
                // 背景に角丸を適用（その他のページ）
                const radius = 15;
                ctx.beginPath();
                ctx.moveTo(10, textY - bgHeight/2 + radius);
                ctx.lineTo(10, textY + bgHeight/2 - radius);
                ctx.arcTo(10, textY + bgHeight/2, 10 + radius, textY + bgHeight/2, radius);
                ctx.lineTo(canvas.width - 10 - radius, textY + bgHeight/2);
                ctx.arcTo(canvas.width - 10, textY + bgHeight/2, canvas.width - 10, textY + bgHeight/2 - radius, radius);
                ctx.lineTo(canvas.width - 10, textY - bgHeight/2 + radius);
                ctx.arcTo(canvas.width - 10, textY - bgHeight/2, canvas.width - 10 - radius, textY - bgHeight/2, radius);
                ctx.lineTo(10 + radius, textY - bgHeight/2);
                ctx.arcTo(10, textY - bgHeight/2, 10, textY - bgHeight/2 + radius, radius);
                ctx.closePath();
            }
            
            // 背景のグラデーション塗りつぶし
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // テキストを大きくよりはっきりと表示
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // 4ページ目の場合、テキストを2段に分けて表示するための特別処理
            if (text.startsWith('お化けになった先生が怖かった')) {
                // 文字列を分解（2行に分けるため）
                const textParts1 = analyzeText('お化けになった先生が怖かったけど、');
                const textParts2 = analyzeText('いい思い出になったおばけやしき。');
                
                // フォントサイズを大きくし、フォントファミリーを追加
                ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                
                // 行間を調整 - 狭くする
                const lineHeight = 55;
                
                // 全体のテキスト幅を計算（文字間隔を含む）- 1行目
                let totalWidth1 = 0;
                for (const part of textParts1) {
                    totalWidth1 += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
                // 全体のテキスト幅を計算（文字間隔を含む）- 2行目
                let totalWidth2 = 0;
                for (const part of textParts2) {
                    totalWidth2 += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
                // 開始位置を計算（中央揃え）- 1行目
                const centerX = canvas.width / 2;
                let currentX1 = centerX - totalWidth1 / 2;
                
                // 各部分を描画 - 1行目
                for (const part of textParts1) {
                    const width = ctx.measureText(part.text).width;
                    
                    // 本文テキストを描画 - より鮮明に
                    ctx.fillStyle = '#000000';
                    ctx.fillText(part.text, currentX1, textY - lineHeight/2);
                    
                    // 読み仮名（ルビ）を描画 - 漢字の真上に配置
                    if (part.isKanji && part.ruby) {
                        // 正確な中央位置
                        const charCenterX = currentX1 + width/2;
                        
                        ctx.font = '18px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                        const rubyWidth = ctx.measureText(part.ruby).width;
                        
                        // ルビを漢字の真上、中央揃えで配置
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.ruby, charCenterX - rubyWidth/2, textY - lineHeight/2 - 35);
                        
                        // フォントを元に戻す
                        ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                    }
                    
                    // X位置を更新
                    currentX1 += width + (part.spacing || 0);
                }
                
                // 開始位置を計算（中央揃え）- 2行目
                let currentX2 = centerX - totalWidth2 / 2;
                
                // 各部分を描画 - 2行目
                for (const part of textParts2) {
                    const width = ctx.measureText(part.text).width;
                    
                    // 本文テキストを描画
                    ctx.fillStyle = '#000000';
                    ctx.fillText(part.text, currentX2, textY + lineHeight/2);
                    
                    // 読み仮名（ルビ）を描画 - 漢字の真上に配置
                    if (part.isKanji && part.ruby) {
                        // 正確な中央位置
                        const charCenterX = currentX2 + width/2;
                        
                        ctx.font = '18px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                        const rubyWidth = ctx.measureText(part.ruby).width;
                        
                        // ルビを漢字の真上、中央揃えで配置
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.ruby, charCenterX - rubyWidth/2, textY + lineHeight/2 - 35);
                        
                        // フォントを元に戻す
                        ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                    }
                    
                    // X位置を更新
                    currentX2 += width + (part.spacing || 0);
                }
            } 
            // 5ページ目も2段に分ける特別処理
            else if (text.startsWith('たくさん練習してパパとママに見て')) {
                // 文字列を分解（2行に分けるため）
                const textParts1 = analyzeText('たくさん練習してパパとママに見てもらった');
                const textParts2 = analyzeText('にじいろステージ。思い出がたくさん。');
                
                // フォントサイズを大きくし、フォントファミリーを追加
                ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                
                // 行間を調整 - 狭くする
                const lineHeight = 55;
                
                // 全体のテキスト幅を計算（文字間隔を含む）- 1行目
                let totalWidth1 = 0;
                for (const part of textParts1) {
                    totalWidth1 += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
                // 全体のテキスト幅を計算（文字間隔を含む）- 2行目
                let totalWidth2 = 0;
                for (const part of textParts2) {
                    totalWidth2 += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
                // 開始位置を計算（中央揃え）- 1行目
                const centerX = canvas.width / 2;
                let currentX1 = centerX - totalWidth1 / 2;
                
                // 各部分を描画 - 1行目
                for (const part of textParts1) {
                    const width = ctx.measureText(part.text).width;
                    
                    // 本文テキストを描画
                    ctx.fillStyle = '#000000';
                    ctx.fillText(part.text, currentX1, textY - lineHeight/2);
                    
                    // 読み仮名（ルビ）を描画 - 漢字の真上に配置
                    if (part.isKanji && part.ruby) {
                        // 正確な中央位置
                        const charCenterX = currentX1 + width/2;
                        
                        ctx.font = '18px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                        const rubyWidth = ctx.measureText(part.ruby).width;
                        
                        // ルビを漢字の真上、中央揃えで配置
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.ruby, charCenterX - rubyWidth/2, textY - lineHeight/2 - 35);
                        
                        // フォントを元に戻す
                        ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                    }
                    
                    // X位置を更新
                    currentX1 += width + (part.spacing || 0);
                }
                
                // 開始位置を計算（中央揃え）- 2行目
                let currentX2 = centerX - totalWidth2 / 2;
                
                // 各部分を描画 - 2行目
                for (const part of textParts2) {
                    const width = ctx.measureText(part.text).width;
                    
                    // 本文テキストを描画
                    ctx.fillStyle = '#000000';
                    ctx.fillText(part.text, currentX2, textY + lineHeight/2);
                    
                    // 読み仮名（ルビ）を描画 - 漢字の真上に配置
                    if (part.isKanji && part.ruby) {
                        // 正確な中央位置
                        const charCenterX = currentX2 + width/2;
                        
                        ctx.font = '18px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                        const rubyWidth = ctx.measureText(part.ruby).width;
                        
                        // ルビを漢字の真上、中央揃えで配置
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.ruby, charCenterX - rubyWidth/2, textY + lineHeight/2 - 35);
                        
                        // フォントを元に戻す
                        ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                    }
                    
                    // X位置を更新
                    currentX2 += width + (part.spacing || 0);
                }
            }
            // 6ページ目も2段に分ける特別処理
            else if (text === '先生とのお別れは寂しいけど思い出をありがとう' || text === '先生とのお別れは寂しいけど、思い出をありがとう') {
                // 文字列を分解（2行に分けるため）
                const textParts1 = analyzeText('先生とのお別れは寂しいけど、');
                const textParts2 = analyzeText('思い出をありがとう');
                
                // フォントサイズを大きくし、フォントファミリーを追加
                ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                
                // 行間を調整 - 狭くする
                const lineHeight = 55;
                
                // 全体のテキスト幅を計算（文字間隔を含む）- 1行目
                let totalWidth1 = 0;
                for (const part of textParts1) {
                    totalWidth1 += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
                // 全体のテキスト幅を計算（文字間隔を含む）- 2行目
                let totalWidth2 = 0;
                for (const part of textParts2) {
                    totalWidth2 += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
                // 開始位置を計算（中央揃え）- 1行目
                const centerX = canvas.width / 2;
                let currentX1 = centerX - totalWidth1 / 2;
                
                // 各部分を描画 - 1行目
                for (const part of textParts1) {
                    const width = ctx.measureText(part.text).width;
                    
                    // 本文テキストを描画
                    ctx.fillStyle = '#000000';
                    ctx.fillText(part.text, currentX1, textY - lineHeight/2);
                    
                    // 読み仮名（ルビ）を描画 - 漢字の真上に配置
                    if (part.isKanji && part.ruby) {
                        // 正確な中央位置
                        const charCenterX = currentX1 + width/2;
                        
                        ctx.font = '18px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                        const rubyWidth = ctx.measureText(part.ruby).width;
                        
                        // ルビを漢字の真上、中央揃えで配置
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.ruby, charCenterX - rubyWidth/2, textY - lineHeight/2 - 35);
                        
                        // フォントを元に戻す
                        ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                    }
                    
                    // X位置を更新
                    currentX1 += width + (part.spacing || 0);
                }
                
                // 開始位置を計算（中央揃え）- 2行目
                let currentX2 = centerX - totalWidth2 / 2;
                
                // 各部分を描画 - 2行目
                for (const part of textParts2) {
                    const width = ctx.measureText(part.text).width;
                    
                    // 本文テキストを描画
                    ctx.fillStyle = '#000000';
                    ctx.fillText(part.text, currentX2, textY + lineHeight/2);
                    
                    // 読み仮名（ルビ）を描画 - 漢字の真上に配置
                    if (part.isKanji && part.ruby) {
                        // 正確な中央位置
                        const charCenterX = currentX2 + width/2;
                        
                        ctx.font = '18px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                        const rubyWidth = ctx.measureText(part.ruby).width;
                        
                        // ルビを漢字の真上、中央揃えで配置
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.ruby, charCenterX - rubyWidth/2, textY + lineHeight/2 - 35);
                        
                        // フォントを元に戻す
                        ctx.font = 'bold 36px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                    }
                    
                    // X位置を更新
                    currentX2 += width + (part.spacing || 0);
                }
            }
            // 標準的なテキスト処理（他のページ）
            else {
                // 文字列を分解
                const textParts = analyzeText(text);
                
                // 言語ごとにフォントサイズを調整
                let fontSize = 38;
                if (currentLanguage !== 'ja') {
                    // 長いテキストのチェック
                    const estimatedLength = text.length;
                    if (estimatedLength > 60) {
                        fontSize = 28; // とても長いテキスト
                    } else if (estimatedLength > 40) {
                        fontSize = 32; // 長いテキスト
                    } else if (estimatedLength > 30) {
                        fontSize = 34; // やや長いテキスト
                    }
                }
                
                // テキスト位置計算のための準備 - 言語に応じたフォントサイズ
                ctx.font = `bold ${fontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif`;
                
                // 全体のテキスト幅を計算（文字間隔を含む）
                let totalWidth = 0;
                for (const part of textParts) {
                    totalWidth += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
                // 2行に分ける必要があるかチェック
                if (totalWidth > canvas.width * 0.9 && currentLanguage !== 'ja') {
                    // テキストを2行に分ける処理
                    // 最適な分割位置を探す（スペースがある場合はそこで分割）
                    const words = text.split(' ');
                    let firstLine = '';
                    let secondLine = '';
                    
                    if (words.length > 1) {
                        // 単語数の半分で分割
                        const midPoint = Math.ceil(words.length / 2);
                        firstLine = words.slice(0, midPoint).join(' ');
                        secondLine = words.slice(midPoint).join(' ');
                    } else {
                        // スペースがない場合は文字数で中央付近で分割
                        const midPoint = Math.ceil(text.length / 2);
                        firstLine = text.substring(0, midPoint);
                        secondLine = text.substring(midPoint);
                    }
                    
                    // 2行に分けて表示
                    const textParts1 = analyzeText(firstLine);
                    const textParts2 = analyzeText(secondLine);
                    
                    // 行間を調整
                    const lineHeight = 55;
                    
                    // 全体のテキスト幅を計算（文字間隔を含む）- 1行目
                    let totalWidth1 = 0;
                    for (const part of textParts1) {
                        totalWidth1 += ctx.measureText(part.text).width + (part.spacing || 0);
                    }
                    
                    // 全体のテキスト幅を計算（文字間隔を含む）- 2行目
                    let totalWidth2 = 0;
                    for (const part of textParts2) {
                        totalWidth2 += ctx.measureText(part.text).width + (part.spacing || 0);
                    }
                    
                    // 開始位置を計算（中央揃え）- 1行目
                    const centerX = canvas.width / 2;
                    let currentX1 = centerX - totalWidth1 / 2;
                    
                    // 各部分を描画 - 1行目
                    for (const part of textParts1) {
                        const width = ctx.measureText(part.text).width;
                        
                        // 本文テキストを描画
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.text, currentX1, textY - lineHeight/2);
                        
                        // X位置を更新
                        currentX1 += width + (part.spacing || 0);
                    }
                    
                    // 開始位置を計算（中央揃え）- 2行目
                    let currentX2 = centerX - totalWidth2 / 2;
                    
                    // 各部分を描画 - 2行目
                    for (const part of textParts2) {
                        const width = ctx.measureText(part.text).width;
                        
                        // 本文テキストを描画
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.text, currentX2, textY + lineHeight/2);
                        
                        // X位置を更新
                        currentX2 += width + (part.spacing || 0);
                    }
                } else {
                    // 1行で表示可能な場合
                    // 開始位置を計算（中央揃え）
                    const centerX = canvas.width / 2;
                    let currentX = centerX - totalWidth / 2;
                    
                    // テキストの表示位置を統一 - ページによって調整
                    const displayY = textY;
                    
                    // 各部分を描画
                    for (const part of textParts) {
                        const width = ctx.measureText(part.text).width;
                        
                        // 本文テキストを描画 - 読みやすく
                        ctx.fillStyle = '#000000';
                        ctx.fillText(part.text, currentX, displayY);
                        
                        // 読み仮名（ルビ）を描画 - 漢字の真上に配置
                        if (part.isKanji && part.ruby) {
                            // 正確な中央位置
                            const charCenterX = currentX + width/2;
                            
                            ctx.font = '18px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                            const rubyWidth = ctx.measureText(part.ruby).width;
                            
                            // ルビを漢字の真上、中央揃えで配置
                            ctx.fillStyle = '#000000';
                            ctx.fillText(part.ruby, charCenterX - rubyWidth/2, displayY - 30);
                            
                            // フォントを元に戻す
                            ctx.font = `bold ${fontSize}px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif`;
                        }
                        
                        // X位置を更新
                        currentX += width + (part.spacing || 0);
                    }
                }
            }
            
            // 小さな装飾を追加 - プロのような仕上がりに
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(canvas.width/2 - 50, textY + bgHeight/2 + 10, 100, 2);
            
            // テクスチャを作成
            const texture = new THREE.CanvasTexture(canvas);
            resolve(texture);
        };
        img.src = imagePath;
    });
}

// テキストを解析して漢字とその読みを特定する関数（出版社クオリティに調整）
function analyzeText(text) {
    // 日本語以外の言語の場合は、シンプルな配列を返す
    if (currentLanguage !== 'ja') {
        // 非日本語の場合は文字ごとに分割して単純な配列を返す
        return text.split('').map(char => {
            return {
                text: char,
                isKanji: false,
                ruby: null,
                spacing: 8
            };
        });
    }
    
    // 以下は日本語の場合の処理
    // ページ1のテキスト
    if (text === 'お友達とたくさん遊んだ公園におもいでがいっぱい') {
        return [
            { text: 'お', isKanji: false, ruby: null, spacing: 10 },
            { text: '友', isKanji: true, ruby: 'とも', spacing: 25 },
            { text: '達', isKanji: true, ruby: 'だち', spacing: 30 },
            { text: 'と', isKanji: false, ruby: null, spacing: 20 },
            { text: 'た', isKanji: false, ruby: null, spacing: 10 },
            { text: 'く', isKanji: false, ruby: null, spacing: 10 },
            { text: 'さ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ん', isKanji: false, ruby: null, spacing: 20 },
            { text: '遊', isKanji: true, ruby: 'あそ', spacing: 30 },
            { text: 'ん', isKanji: false, ruby: null, spacing: 10 },
            { text: 'だ', isKanji: false, ruby: null, spacing: 10 },
            { text: '公', isKanji: true, ruby: 'こう', spacing: 30 },
            { text: '園', isKanji: true, ruby: 'えん', spacing: 25 },
            { text: 'に', isKanji: false, ruby: null, spacing: 18 },
            { text: 'お', isKanji: false, ruby: null, spacing: 10 },
            { text: 'も', isKanji: false, ruby: null, spacing: 10 },
            { text: 'い', isKanji: false, ruby: null, spacing: 10 },
            { text: 'で', isKanji: false, ruby: null, spacing: 20 },
            { text: 'が', isKanji: false, ruby: null, spacing: 12 },
            { text: 'い', isKanji: false, ruby: null, spacing: 10 },
            { text: 'っ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ぱ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'い', isKanji: false, ruby: null }
        ];
    } 
    // ページ2のテキスト
    else if (text === 'どんなお弁当か楽しみだったな。遠足。') {
        return [
            { text: 'ど', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ん', isKanji: false, ruby: null, spacing: 10 },
            { text: 'な', isKanji: false, ruby: null, spacing: 10 },
            { text: 'お', isKanji: false, ruby: null, spacing: 10 },
            { text: '弁', isKanji: true, ruby: 'べん', spacing: 25 },
            { text: '当', isKanji: true, ruby: 'とう', spacing: 28 },
            { text: 'か', isKanji: false, ruby: null, spacing: 15 },
            { text: '楽', isKanji: true, ruby: 'たの', spacing: 28 },
            { text: 'し', isKanji: false, ruby: null, spacing: 10 },
            { text: 'み', isKanji: false, ruby: null, spacing: 10 },
            { text: 'だ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'っ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'た', isKanji: false, ruby: null, spacing: 10 },
            { text: 'な', isKanji: false, ruby: null, spacing: 15 },
            { text: '。', isKanji: false, ruby: null, spacing: 20 },
            { text: '遠', isKanji: true, ruby: 'えん', spacing: 25 },
            { text: '足', isKanji: true, ruby: 'そく', spacing: 25 },
            { text: '。', isKanji: false, ruby: null }
        ];
    } 
    // ページ3のテキスト
    else if (text === '皆で一生懸命に頑張った運動会。心を一つにしたよ。') {
        return [
            { text: '皆', isKanji: true,  ruby: 'みな',   spacing: 25 },
            { text: 'で', isKanji: false, ruby: null,     spacing: 12 },
            { text: '一', isKanji: true,  ruby: 'いっ',   spacing: 25 },
            { text: '生', isKanji: true,  ruby: 'しょう', spacing: 25 },
            { text: '懸', isKanji: true,  ruby: 'けん',   spacing: 25 },
            { text: '命', isKanji: true,  ruby: 'めい',   spacing: 25 },
            { text: 'に', isKanji: false, ruby: null,     spacing: 12 },
            { text: '頑', isKanji: true,  ruby: 'がん',   spacing: 25 },
            { text: '張', isKanji: true,  ruby: 'ば',     spacing: 25 },
            { text: 'っ', isKanji: false, ruby: null,     spacing: 12 },
            { text: 'た', isKanji: false, ruby: null,     spacing: 12 },
            { text: '運', isKanji: true,  ruby: 'うん',   spacing: 25 },
            { text: '動', isKanji: true,  ruby: 'どう',   spacing: 25 },
            { text: '会', isKanji: true,  ruby: 'かい',   spacing: 25 },
            { text: '。', isKanji: false, ruby: null,     spacing: 15 },
            { text: '心', isKanji: true,  ruby: 'こころ', spacing: 25 },
            { text: 'を', isKanji: false, ruby: null,     spacing: 12 },
            { text: '一', isKanji: true,  ruby: 'ひと',   spacing: 25 },
            { text: 'つ', isKanji: false, ruby: null,     spacing: 12 },
            { text: 'に', isKanji: false, ruby: null,     spacing: 12 },
            { text: 'し', isKanji: false, ruby: null,     spacing: 12 },
            { text: 'た', isKanji: false, ruby: null,     spacing: 12 },
            { text: 'よ', isKanji: false, ruby: null,     spacing: 12 },
            { text: '。', isKanji: false, ruby: null }
        ];
    } 
    // ページ4の1行目
    else if (text === 'お化けになった先生が怖かったけど、') {
        return [
            { text: 'お', isKanji: false, ruby: null, spacing: 12 },
            { text: '化', isKanji: true, ruby: 'ば', spacing: 20 },
            { text: 'け', isKanji: false, ruby: null, spacing: 12 },
            { text: 'に', isKanji: false, ruby: null, spacing: 12 },
            { text: 'な', isKanji: false, ruby: null, spacing: 12 },
            { text: 'っ', isKanji: false, ruby: null, spacing: 12 },
            { text: 'た', isKanji: false, ruby: null, spacing: 12 },
            { text: '先', isKanji: true, ruby: 'せん', spacing: 25 },
            { text: '生', isKanji: true, ruby: 'せい', spacing: 25 },
            { text: 'が', isKanji: false, ruby: null, spacing: 12 },
            { text: '怖', isKanji: true, ruby: 'こわ', spacing: 25 },
            { text: 'か', isKanji: false, ruby: null, spacing: 12 },
            { text: 'っ', isKanji: false, ruby: null, spacing: 12 },
            { text: 'た', isKanji: false, ruby: null, spacing: 12 },
            { text: 'け', isKanji: false, ruby: null, spacing: 12 },
            { text: 'ど', isKanji: false, ruby: null, spacing: 12 }
        ];
    }
    // ページ4の2行目
    else if (text === 'いい思い出になったおばけやしき。') {
        return [
            { text: 'い', isKanji: false, ruby: null, spacing: 12 },
            { text: 'い', isKanji: false, ruby: null, spacing: 12 },
            { text: '思', isKanji: true, ruby: 'おも', spacing: 25 },
            { text: 'い', isKanji: false, ruby: null, spacing: 12 },
            { text: '出', isKanji: true, ruby: 'で', spacing: 20 },
            { text: 'に', isKanji: false, ruby: null, spacing: 12 },
            { text: 'な', isKanji: false, ruby: null, spacing: 12 },
            { text: 'っ', isKanji: false, ruby: null, spacing: 12 },
            { text: 'た', isKanji: false, ruby: null, spacing: 12 },
            { text: 'お', isKanji: false, ruby: null, spacing: 12 },
            { text: 'ば', isKanji: false, ruby: null, spacing: 12 },
            { text: 'け', isKanji: false, ruby: null, spacing: 12 },
            { text: 'や', isKanji: false, ruby: null, spacing: 12 },
            { text: 'し', isKanji: false, ruby: null, spacing: 12 },
            { text: 'き', isKanji: false, ruby: null, spacing: 12 },
            { text: '。', isKanji: false, ruby: null, spacing: 12 }
        ];
    }
    // ページ5の1行目
    else if (text === 'たくさん練習してパパとママに見てもらった') {
        return [
            { text: 'た', isKanji: false, ruby: null, spacing: 10 },
            { text: 'く', isKanji: false, ruby: null, spacing: 10 },
            { text: 'さ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ん', isKanji: false, ruby: null, spacing: 10 },
            { text: '練', isKanji: true, ruby: 'れん', spacing: 28 },
            { text: '習', isKanji: true, ruby: 'しゅう', spacing: 30 },
            { text: 'し', isKanji: false, ruby: null, spacing: 10 },
            { text: 'て', isKanji: false, ruby: null, spacing: 10 },
            { text: 'パ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'パ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'と', isKanji: false, ruby: null, spacing: 10 },
            { text: 'マ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'マ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'に', isKanji: false, ruby: null, spacing: 10 },
            { text: '見', isKanji: true, ruby: 'み', spacing: 22 },
            { text: 'て', isKanji: false, ruby: null, spacing: 10 },
            { text: 'も', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ら', isKanji: false, ruby: null, spacing: 10 },
            { text: 'っ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'た', isKanji: false, ruby: null }
        ];
    }
    // ページ5の2行目
    else if (text === 'にじいろステージ。思い出がたくさん。') {
        return [
            { text: 'に', isKanji: false, ruby: null, spacing: 10 },
            { text: 'じ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'い', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ろ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ス', isKanji: false, ruby: null, spacing: 10 },
            { text: 'テ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ー', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ジ', isKanji: false, ruby: null, spacing: 10 },
            { text: '。', isKanji: false, ruby: null, spacing: 18 },
            { text: '思', isKanji: true, ruby: 'おも', spacing: 28 },
            { text: 'い', isKanji: false, ruby: null, spacing: 10 },
            { text: '出', isKanji: true, ruby: 'で', spacing: 22 },
            { text: 'が', isKanji: false, ruby: null, spacing: 10 },
            { text: 'た', isKanji: false, ruby: null, spacing: 10 },
            { text: 'く', isKanji: false, ruby: null, spacing: 10 },
            { text: 'さ', isKanji: false, ruby: null, spacing: 10 },
            { text: 'ん', isKanji: false, ruby: null, spacing: 10 },
            { text: '。', isKanji: false, ruby: null }
        ];
    }
    // ページ6のテキスト
    else if (text === '先生とのお別れは寂しいけど思い出をありがとう' || text === '先生とのお別れは寂しいけど、思い出をありがとう') {
        return [
            { text: '先', isKanji: true, ruby: 'せん', spacing: 20 },
            { text: '生', isKanji: true, ruby: 'せい', spacing: 20 },
            { text: 'と', isKanji: false, ruby: null, spacing: 8 },
            { text: 'の', isKanji: false, ruby: null, spacing: 8 },
            { text: 'お', isKanji: false, ruby: null, spacing: 8 },
            { text: '別', isKanji: true, ruby: 'わか', spacing: 20 },
            { text: 'れ', isKanji: false, ruby: null, spacing: 8 },
            { text: 'は', isKanji: false, ruby: null, spacing: 8 },
            { text: '寂', isKanji: true, ruby: 'さび', spacing: 20 },
            { text: 'し', isKanji: false, ruby: null, spacing: 8 },
            { text: 'い', isKanji: false, ruby: null, spacing: 8 },
            { text: 'け', isKanji: false, ruby: null, spacing: 8 },
            { text: 'ど', isKanji: false, ruby: null, spacing: 15 },
            { text: '、', isKanji: false, ruby: null, spacing: 8 },
            { text: '思', isKanji: true, ruby: 'おも', spacing: 20 },
            { text: 'い', isKanji: false, ruby: null, spacing: 8 },
            { text: '出', isKanji: true, ruby: 'で', spacing: 15 },
            { text: 'を', isKanji: false, ruby: null, spacing: 8 },
            { text: 'あ', isKanji: false, ruby: null, spacing: 8 },
            { text: 'り', isKanji: false, ruby: null, spacing: 8 },
            { text: 'が', isKanji: false, ruby: null, spacing: 8 },
            { text: 'と', isKanji: false, ruby: null, spacing: 8 },
            { text: 'う', isKanji: false, ruby: null }
        ];
    }
    // ページ6の1行目
    else if (text === '先生とのお別れは寂しいけど、') {
        return [
            { text: '先', isKanji: true, ruby: 'せん', spacing: 20 },
            { text: '生', isKanji: true, ruby: 'せい', spacing: 20 },
            { text: 'と', isKanji: false, ruby: null, spacing: 8 },
            { text: 'の', isKanji: false, ruby: null, spacing: 8 },
            { text: 'お', isKanji: false, ruby: null, spacing: 8 },
            { text: '別', isKanji: true, ruby: 'わか', spacing: 20 },
            { text: 'れ', isKanji: false, ruby: null, spacing: 8 },
            { text: 'は', isKanji: false, ruby: null, spacing: 8 },
            { text: '寂', isKanji: true, ruby: 'さび', spacing: 20 },
            { text: 'し', isKanji: false, ruby: null, spacing: 8 },
            { text: 'い', isKanji: false, ruby: null, spacing: 8 },
            { text: 'け', isKanji: false, ruby: null, spacing: 8 },
            { text: 'ど', isKanji: false, ruby: null, spacing: 15 },
            { text: '、', isKanji: false, ruby: null, spacing: 8 }
        ];
    }
    // ページ6の2行目
    else if (text === '思い出をありがとう') {
        return [
            { text: '思', isKanji: true, ruby: 'おも', spacing: 20 },
            { text: 'い', isKanji: false, ruby: null, spacing: 8 },
            { text: '出', isKanji: true, ruby: 'で', spacing: 15 },
            { text: 'を', isKanji: false, ruby: null, spacing: 8 },
            { text: 'あ', isKanji: false, ruby: null, spacing: 8 },
            { text: 'り', isKanji: false, ruby: null, spacing: 8 },
            { text: 'が', isKanji: false, ruby: null, spacing: 8 },
            { text: 'と', isKanji: false, ruby: null, spacing: 8 },
            { text: 'う', isKanji: false, ruby: null }
        ];
    }
    
    return [];
}

// ページをロードして設定する関数
async function loadPages() {
    // 現在選択されている言語のテキストを取得
    const texts = languageData[currentLanguage];
    
    // ページ1用のテクスチャを作成（画像+テキスト）
    const page1Texture = await createTextOverlayTexture(
        '/images/page1.jpg',
        texts.page1,
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ2用のテクスチャを作成
    const page2Texture = await createTextOverlayTexture(
        '/images/page2.jpg',
        texts.page2,
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ3用のテクスチャを作成
    const page3Texture = await createTextOverlayTexture(
        '/images/page3.jpg',
        texts.page3,
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ4用のテクスチャを作成
    const page4Texture = await createTextOverlayTexture(
        '/images/page4.jpg',
        texts.page4,
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ5用のテクスチャを作成 - 2段に分けてテキストを表示
    const page5Texture = await createTextOverlayTexture(
        '/images/page5.jpg',
        texts.page5,
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ6用のテクスチャを作成
    const page6Texture = await createTextOverlayTexture(
        '/images/page6.jpg',
        texts.page6,
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページの設定
    const dummyPages = [
        "/images/cover.jpg", // 表紙に「おもいで」の画像を使用
        "/images/inside-cover.jpg", // 表紙の裏
        page1Texture, // ページ1（テキスト付き）
        page2Texture, // ページ2（テキスト付き）
        page3Texture, // ページ3（テキスト付き）
        page4Texture, // ページ4（テキスト付き）
        page5Texture, // ページ5（テキスト付き）
        page6Texture, // ページ6（テキスト付き）
        "/images/back-inside.jpg", // 裏表紙の裏
        "/images/back-cover.jpg" // 裏表紙
    ];
    
    book.setPages(dummyPages);
    
    // ページめくり効果の調整
    for (const page of book) {
        // ページの曲げ効果を強調
        page.pageCurve.factor = 0.3;
        
        // ページの影を強調
        if (page.material && page.material.aoMap) {
            page.material.aoMapIntensity = 1.5;
        }
        
        // 変更を適用
        page.modifiers.apply();
    }
    
    // UIのテキストを更新
    updateUIText();
}

// ページめくり効果の音声
let pageFlipSound = null;
// 音声の読み込み
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);

// 音声の作成
pageFlipSound = new THREE.Audio(listener);
audioLoader.load('https://assets.codepen.io/28963/page-flip.mp3', function(buffer) {
    pageFlipSound.setBuffer(buffer);
    pageFlipSound.setVolume(0.5);
});

// ボタンイベントの設定
document.getElementById('prevPage').addEventListener('click', () => {
    book.previousPage();
    if (pageFlipSound) pageFlipSound.play();
});

document.getElementById('nextPage').addEventListener('click', () => {
    book.nextPage();
    if (pageFlipSound) pageFlipSound.play();
});

// 言語切り替えのUIを作成
function createLanguageSelector() {
    // 言語選択ボタンを作成
    const langButton = document.createElement('button');
    langButton.id = 'langButton';
    langButton.className = 'control-button lang-button';
    langButton.textContent = languageData[currentLanguage].langBtn;
    langButton.style.position = 'fixed';
    langButton.style.right = '20px';
    langButton.style.top = '20px';
    langButton.style.zIndex = '100';
    langButton.style.padding = '10px 15px';
    langButton.style.background = 'rgba(33, 150, 243, 0.9)'; // より鮮明な青色
    langButton.style.color = 'white';
    langButton.style.fontWeight = 'bold';
    langButton.style.border = 'none';
    langButton.style.borderRadius = '5px';
    langButton.style.cursor = 'pointer';
    langButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // 言語選択メニューを作成
    const langMenu = document.createElement('div');
    langMenu.id = 'langMenu';
    langMenu.style.position = 'fixed';
    langMenu.style.right = '20px';
    langMenu.style.top = '70px';
    langMenu.style.zIndex = '100';
    langMenu.style.background = 'rgba(255, 255, 255, 0.95)';
    langMenu.style.border = 'none';
    langMenu.style.borderRadius = '5px';
    langMenu.style.display = 'none';
    langMenu.style.flexDirection = 'column';
    langMenu.style.padding = '10px';
    langMenu.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    langMenu.style.minWidth = '120px';
    
    // 各言語のオプションを追加
    Object.keys(languageData).forEach(langCode => {
        const langOption = document.createElement('button');
        langOption.textContent = languageData[langCode].langName;
        langOption.style.padding = '10px 15px';
        langOption.style.margin = '5px 0';
        langOption.style.background = langCode === currentLanguage ? 'rgba(33, 150, 243, 0.2)' : 'transparent';
        langOption.style.border = 'none';
        langOption.style.borderRadius = '3px';
        langOption.style.borderBottom = '1px solid #eee';
        langOption.style.cursor = 'pointer';
        langOption.style.textAlign = 'left';
        langOption.style.width = '100%';
        langOption.style.transition = 'background 0.3s';
        
        // ホバー効果
        langOption.addEventListener('mouseover', () => {
            langOption.style.background = 'rgba(33, 150, 243, 0.1)';
        });
        
        langOption.addEventListener('mouseout', () => {
            langOption.style.background = langCode === currentLanguage ? 'rgba(33, 150, 243, 0.2)' : 'transparent';
        });
        
        // 最後の項目のボーダーを消す
        if (langCode === Object.keys(languageData)[Object.keys(languageData).length - 1]) {
            langOption.style.borderBottom = 'none';
        }
        
        // 言語選択時の動作
        langOption.addEventListener('click', () => {
            changeLanguage(langCode);
            langMenu.style.display = 'none';
            
            // 全ての言語オプションのスタイルをリセット
            Array.from(langMenu.children).forEach(opt => {
                opt.style.background = 'transparent';
            });
            
            // 選択された言語のスタイルを変更
            langOption.style.background = 'rgba(33, 150, 243, 0.2)';
        });
        
        langMenu.appendChild(langOption);
    });
    
    // ボタンクリックでメニュー表示切り替え
    langButton.addEventListener('click', () => {
        if (langMenu.style.display === 'none') {
            langMenu.style.display = 'flex';
        } else {
            langMenu.style.display = 'none';
        }
    });
    
    // 画面上のどこかをクリックしたらメニューを閉じる
    document.addEventListener('click', (e) => {
        if (e.target !== langButton && !langMenu.contains(e.target)) {
            langMenu.style.display = 'none';
        }
    });
    
    // UIに追加
    document.body.appendChild(langButton);
    document.body.appendChild(langMenu);
}

// 言語を切り替える関数
function changeLanguage(langCode) {
    // 言語コードが有効か確認
    if (languageData[langCode]) {
        currentLanguage = langCode;
        
        // ページを再ロード
        loadPages();
        
        // UIのテキストを更新
        updateUIText();
    }
}

// UIのテキストを更新する関数
function updateUIText() {
    const texts = languageData[currentLanguage];
    
    // ボタンのテキストを更新
    document.getElementById('prevPage').textContent = texts.prevBtn;
    document.getElementById('nextPage').textContent = texts.nextBtn;
    
    // 言語ボタンのテキストを更新
    const langButton = document.getElementById('langButton');
    if (langButton) {
        langButton.textContent = texts.langBtn;
    }
}

// 言語選択UIを作成
createLanguageSelector();

// ページをロード
loadPages();

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// アニメーションループ
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    // 絵本のアニメーション更新
    book.animate(clock.getDelta());
    
    // コントロールの更新
    controls.update();
    
    // シーンのレンダリング
    renderer.render(scene, camera);
}

animate();

// マウスクリックでページをめくる機能
renderer.domElement.addEventListener('click', (event) => {
    // マウス座標の正規化
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // レイキャスティング
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // 交差オブジェクトの取得
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // クリックされたオブジェクトがページの場合、そのページをめくる
    if (intersects.length > 0) {
        const object = intersects[0].object;
        // ページの親オブジェクトを探す
        let parent = object;
        while (parent && parent.parent !== book) {
            parent = parent.parent;
        }
        
        if (parent) {
            book.flipPage(parent);
            if (pageFlipSound) pageFlipSound.play();
        }
    }
}); 