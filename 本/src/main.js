// カスタム機能を追加したmain.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlipBook } from 'quick_flipbook';

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
                
                // テキスト位置計算のための準備 - フォントサイズを大きく
                ctx.font = 'bold 38px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                
                // 全体のテキスト幅を計算（文字間隔を含む）
                let totalWidth = 0;
                for (const part of textParts) {
                    totalWidth += ctx.measureText(part.text).width + (part.spacing || 0);
                }
                
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
                        ctx.font = 'bold 38px "Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';
                    }
                    
                    // X位置を更新
                    currentX += width + (part.spacing || 0);
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
            { text: 'ど', isKanji: false, ruby: null, spacing: 12 },
            { text: '、', isKanji: false, ruby: null, spacing: 12 }
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
    // ページ1用のテクスチャを作成（画像+テキスト）
    const page1Texture = await createTextOverlayTexture(
        '/images/page1.jpg',
        'お友達とたくさん遊んだ公園におもいでがいっぱい',
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ2用のテクスチャを作成
    const page2Texture = await createTextOverlayTexture(
        '/images/page2.jpg',
        'どんなお弁当か楽しみだったな。遠足。',
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ3用のテクスチャを作成
    const page3Texture = await createTextOverlayTexture(
        '/images/page3.jpg',
        '皆で一生懸命に頑張った運動会。心を一つにしたよ。',
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ4用のテクスチャを作成
    const page4Texture = await createTextOverlayTexture(
        '/images/page4.jpg',
        'お化けになった先生が怖かったけど、いい思い出になったおばけやしき。',
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ5用のテクスチャを作成 - 2段に分けてテキストを表示
    const page5Texture = await createTextOverlayTexture(
        '/images/page5.jpg',
        'たくさん練習してパパとママに見てもらったにじいろステージ。思い出がたくさん。',
        '',
        0.85 // テキスト位置をより下に配置
    );
    
    // ページ6用のテクスチャを作成
    const page6Texture = await createTextOverlayTexture(
        '/images/page6.jpg',
        '先生とのお別れは寂しいけど、思い出をありがとう',
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
}

// ページをロード
loadPages();

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