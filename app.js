// Use a public CORS proxy for GitHub Pages deployment
const API_URL = 'https://api.allorigins.win/get?url=' + encodeURIComponent('http://wanfu9999.com/get_price.php');

// Data mapping based on the flat array structure
const PRODUCTS = {
    general: [
        { name: '黄金', start: 1 },
        { name: '18K金', start: 129 },
        { name: '白银', start: 9 },
        { name: '铂金', start: 17 },
        { name: '钯金', start: 25 },
        { name: '铑金', start: 137 },
        { name: '港金', start: 33 }
    ],
    shanghai: [
        { name: '黄金 99.99', start: 105 },
        { name: '黄金 (T+D)', start: 113 },
        { name: '白银 (T+D)', start: 121 }
    ],
    international: [
        { name: '伦敦金 (XAU)', start: 49 },
        { name: '伦敦银 (XAG)', start: 57 },
        { name: '美黄金', start: 65 },
        { name: '美铂金', start: 73 },
        { name: '美钯金', start: 81 },
        { name: '美白银', start: 89 },
        { name: '美元', start: 97 }
    ]
};

/**
 * Format value for display
 */
function fmt(val) {
    if (val === null || val === undefined || val === '--' || val === '') {
        return '--';
    }
    return val;
}

/**
 * Extract record from flat array starting at index
 */
function extractRecord(data, start) {
    return {
        buy: data[start + 1],
        buySign: data[start],
        sell: data[start + 3],
        sellSign: data[start + 2],
        high: data[start + 5],
        highSign: data[start + 4],
        low: data[start + 7],
        lowSign: data[start + 6]
    };
}

function getPriceClass(sign) {
    if (sign === '+') return 'up';
    if (sign === '-') return 'down';
    return '';
}

/**
 * Render a table based on product list and data
 */
function renderTable(tableId, products, data) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    const html = products.map(p => {
        const rec = extractRecord(data, p.start);
        
        // Buy/Sell part
        const buySell = `
            <span class="price-box ${getPriceClass(rec.buySign)}">${fmt(rec.buy)}</span> 
            <span class="buy-sell-sep">/</span> 
            <span class="price-box ${getPriceClass(rec.sellSign)}">${fmt(rec.sell)}</span>`;
        
        // High/Low part
        const highLow = `
            <span class="secondary-box ${getPriceClass(rec.highSign)}">${fmt(rec.high)}</span> 
            <span class="buy-sell-sep">/</span> 
            <span class="secondary-box ${getPriceClass(rec.lowSign)}">${fmt(rec.low)}</span>`;

        return `
            <tr>
                <td class="name-cell">${p.name}</td>
                <td class="center">${buySell}</td>
                <td class="right">${highLow}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

/**
 * Update the clock in the top right corner
 */
function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('lastUpdate');
    if (clockEl) {
        clockEl.innerText = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\//g, '.');
    }
}

/**
 * Fetch data and update UI
 */
async function updateData() {
    try {
        // allorigins needs a cache-busting parameter in the proxy URL if needed
        const response = await fetch(`${API_URL}&rand=${Date.now()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const json = await response.json();
        // allorigins returns data in a 'contents' field as a string
        const data = JSON.parse(json.contents);
        
        renderTable('table-general', PRODUCTS.general, data);
        renderTable('table-shanghai', PRODUCTS.shanghai, data);
        renderTable('table-international', PRODUCTS.international, data);

        // Add visual feedback
        const boxes = document.querySelectorAll('.price-box');
        boxes.forEach(b => {
            b.classList.remove('updating');
            void b.offsetWidth; // trigger reflow
            b.classList.add('updating');
        });

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Start clock (1s interval)
updateClock();
setInterval(updateClock, 1000);

// Initial fetch
updateData();

// Poll every 1 second
setInterval(updateData, 1000);
