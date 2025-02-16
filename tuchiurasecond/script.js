document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得を最適化
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    const header = document.querySelector('.header-content');
    const menuItems = document.querySelectorAll('.main-nav li');

    // メニュー項目にアニメーション用のインデックスを設定
    menuItems.forEach((item, index) => {
        item.style.setProperty('--i', index);
    });

    // パフォーマンス最適化のためのデバウンス関数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // スクロール処理の最適化
    let lastScrollTop = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollTop = window.pageYOffset;
                if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                lastScrollTop = currentScrollTop;
                ticking = false;
            });
            ticking = true;
        }
    });

    // メニュートグルの処理
    menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.contains('active');
        
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        body.classList.toggle('menu-open');

        // アクセシビリティ対応
        menuToggle.setAttribute('aria-expanded', !isOpen);
        mainNav.setAttribute('aria-hidden', isOpen);
    });

    // タッチ操作の最適化
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!mainNav.classList.contains('active')) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // 水平スワイプの判定
        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50) {
            e.preventDefault();
            if (deltaX < 0) {
                closeMenu();
            }
        }
    }, { passive: false });

    // メニューを閉じる関数
    function closeMenu() {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
    }

    // 画面サイズ変更時の処理を最適化
    const handleResize = debounce(() => {
        if (window.innerWidth > 768) {
            closeMenu();
            header.style.transform = 'translateY(0)';
        }
    }, 150);

    window.addEventListener('resize', handleResize);

    // メニューリンクのクリックイベント
    mainNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            closeMenu();
        }
    });
});

// グラフの設定を更新
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: window.innerWidth <= 480 ? 10 : 
                          window.innerWidth <= 768 ? 12 : 14
                },
                maxRotation: 45,
                minRotation: 45
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                font: {
                    size: window.innerWidth <= 480 ? 10 : 
                          window.innerWidth <= 768 ? 12 : 14
                }
            }
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                padding: 20,
                font: {
                    size: window.innerWidth <= 480 ? 10 : 
                          window.innerWidth <= 768 ? 12 : 14
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#2d3748',
            bodyColor: '#2d3748',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: window.innerWidth <= 480 ? 8 : 12,
            titleFont: {
                size: window.innerWidth <= 480 ? 12 : 14,
                weight: 'bold'
            },
            bodyFont: {
                size: window.innerWidth <= 480 ? 11 : 13
            },
            displayColors: true,
            boxWidth: window.innerWidth <= 480 ? 6 : 8,
            boxHeight: window.innerWidth <= 480 ? 6 : 8,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y + '名';
                    }
                    return label;
                }
            }
        }
    }
};

// グラフの設定を適用
const charts = document.querySelectorAll('canvas');
charts.forEach(canvas => {
    const chart = Chart.getChart(canvas);
    if (chart) {
        chart.options = { ...chart.options, ...chartOptions };
        chart.update();
    }
});

// ウィンドウサイズが変更されたときにグラフを更新
window.addEventListener('resize', debounce(() => {
    charts.forEach(canvas => {
        const chart = Chart.getChart(canvas);
        if (chart) {
            chart.options = { ...chart.options, ...chartOptions };
            chart.update();
        }
    });
}, 250));
