const tourSeen = localStorage.getItem("simulatorTourSeen")

if (!tourSeen) {

    const tg = new tourguide.TourGuideClient({
        exitOnEscape: true,
        exitOnClickOutside: true,
        keyboardControls: true,

        steps: [

            {
                target: ".sim-header",
                order: 1,
                title: "Crypto Market Simulator",
                content: "This tool lets you simulate how crypto markets react to different events like whale activity, hacks, regulation, and retail FOMO.",
                placement: "bottom"
            },

            {
                target: ".sim-events-bull",
                order: 2,
                title: "Bullish Events",
                content: "Trigger positive market events like ETF approval, whale buying, or corporate adoption to see how the market reacts.",
                placement: "right"
            },

            {
                target: ".sim-events-bear",
                order: 3,
                title: "Bearish Events",
                content: "Simulate negative market events like exchange hacks, government bans, or whale sell-offs.",
                placement: "left"
            },

            {
                target: ".sim-chart",
                order: 4,
                title: "Market Chart",
                content: "Watch how the price moves when events happen. The chart updates in real time as the simulation runs.",
                placement: "top"
            },

            {
                target: ".sim-market-data",
                order: 5,
                title: "Market Data",
                content: "Monitor order flow, market actors, and news while the simulation runs.",
                placement: "left"
            },

            {
                target: ".sim-neutral-controls",
                order: 6,
                title: "Simulation Controls",
                content: "Adjust speed, pause the simulation, or trigger neutral events like volatility spikes.",
                placement: "right"
            },

            {
                target: ".sim-god-mode",
                order: 7,
                title: "GOD Mode",
                content: "Take full control of the market. Instantly force bull markets, bear markets, or disable liquidations.",
                placement: "left"
            }

        ]

    });

    tg.start();

    localStorage.setItem("simulatorTourSeen", true);
}


/* MARKET STATE */
let market = {
    price: 42000,
    sentiment: 50,
    funding: 0.01,
    openInterest: 2100000000,
    volume: 0,
    marketCap: 800000000000,
    dominance: 50,
    level: 1,
    xp: 0,
    speed: 1,
    volMult: 1,
    paused: false,
    pendingPriceImpact: 0,
    pendingSentImpact: 0
}

/* CHARTS */
const chart = LightweightCharts.createChart(document.getElementById("chart"), {
    height: 320,
    layout: {
        background: {
            color: "#ffffff"
        },
        textColor: "#334155"
    },
    grid: {
        vertLines: {
            color: "#e2e8f0"
        },
        horzLines: {
            color: "#e2e8f0"
        }
    },
    crosshair: {
        mode: 1
    },
    rightPriceScale: {
        borderColor: "#334155"
    },
    timeScale: {
        borderColor: "#334155",
        timeVisible: true,
        secondsVisible: false
    }
});
const candles = chart.addSeries(LightweightCharts.CandlestickSeries);

const volumeChart = LightweightCharts.createChart(document.getElementById("volume-chart"), {
    height: 100,
    layout: {
        background: {
            color: "#020617"
        },
        textColor: "#cbd5f5"
    },
    grid: {
        vertLines: {
            color: "#1e293b"
        },
        horzLines: {
            color: "#1e293b"
        }
    },
    rightPriceScale: {
        borderColor: "#334155"
    },
    timeScale: {
        borderColor: "#334155"
    }
});
const volumeSeries = volumeChart.addSeries(LightweightCharts.HistogramSeries, {
    color: '#26a69a'
});

const sentimentChart = LightweightCharts.createChart(document.getElementById("sentiment-chart"), {
    height: 100,
    layout: {
        background: {
            color: "#020617"
        },
        textColor: "#cbd5f5"
    },
    grid: {
        vertLines: {
            color: "#1e293b"
        },
        horzLines: {
            color: "#1e293b"
        }
    },
    rightPriceScale: {
        borderColor: "#334155"
    },
    timeScale: {
        borderColor: "#334155"
    }
});
const sentimentSeries = sentimentChart.addSeries(LightweightCharts.LineSeries, {
    color: '#6366f1'
});

/* UI UPDATE */
function updateUI() {
    document.getElementById("price").innerText = "$" + market.price.toFixed(0);
    let s = "Neutral";
    if (market.sentiment > 60) s = "Bullish";
    if (market.sentiment < 40) s = "Bearish";
    document.getElementById("sentiment").innerText = s;
    document.getElementById("funding").innerText = market.funding.toFixed(3) + "%";
    document.getElementById("oi").innerText = "$" + (market.openInterest / 1e9).toFixed(2) + "B";
    document.getElementById("liq").innerText = "$0";
    document.getElementById("volume").innerText = "$" + (market.volume / 1e9).toFixed(2) + "B";
    let vol = "Medium";
    if (market.volMult > 1.5) vol = "High";
    if (market.volMult < 0.7) vol = "Low";
    document.getElementById("volatility").innerText = vol;
    document.getElementById("marketCap").innerText = "$" + (market.marketCap / 1e9).toFixed(0) + "B";
    document.getElementById("dominance").innerText = market.dominance.toFixed(0) + "%";
    document.getElementById("level").innerText = market.level;
    document.getElementById("xp").innerText = market.xp + "/100";
    let buy = Math.min(100, market.sentiment);
    let sell = 100 - buy;
    document.getElementById("buyFlow").style.width = buy + "%";
    document.getElementById("sellFlow").style.width = sell + "%";
}

/* NEWS */
function news(text) {
    let el = document.getElementById("news");
    let n = document.createElement("div");
    n.className = "news-item";
    n.innerText = text;
    el.prepend(n);
    if (el.children.length > 20) el.removeChild(el.lastChild);
}

/* LOG */
function log(t) {
    let l = document.getElementById("log");
    let e = document.createElement("div");
    e.innerText = t;
    l.prepend(e);
    if (l.children.length > 50) l.removeChild(l.lastChild);
}

/* ACTORS */
const actors = [{
    name: "Whales",
    power: 500
},
{
    name: "Institutions",
    power: 300
},
{
    name: "Retail",
    power: 120
},
{
    name: "Market Makers",
    power: 200
},
{
    name: "Hedge Funds",
    power: 250
},
{
    name: "Miners",
    power: 150
},
{
    name: "Bots",
    power: 100
},
{
    name: "Influencers",
    power: 80
}
];

function runActors() {
    let html = "";
    actors.forEach(a => {
        let move = (Math.random() - 0.5) * a.power * market.volMult;
        market.price += move;
        market.sentiment += move / 200;
        market.volume += Math.abs(move) * 100;
        html += a.name + " active: " + move.toFixed(0) + "<br>";
    });
    document.getElementById("actors").innerHTML = html;
}

/* LIQUIDATIONS */
let noLiq = false;

function liquidationEngine() {
    if (noLiq) return;
    if (Math.random() < 0.08 * market.volMult) {
        let amt = Math.random() * 30000000 * market.volMult;
        market.price -= amt / 200000;
        market.openInterest -= amt;
        market.volume += amt;
        document.getElementById("liq").innerText = "$" + (amt / 1e6).toFixed(1) + "M";
        news("🔥 Liquidations wiped " + (amt / 1e6).toFixed(1) + "M");
        log("Liquidation cascade");
    }
}

/* EVENTS */
function eventFire(type) {
    let impact = 0;
    let sentImpact = 0;
    let newsText = "";
    switch (type) {
        case "etf":
            impact = 2000;
            sentImpact = 10;
            newsText = "ETF approved — institutional inflow begins";
            break;
        case "adoption":
            impact = 1200;
            sentImpact = 7;
            newsText = "Major corporation adopts crypto payments";
            break;
        case "whaleBuy":
            impact = 900;
            sentImpact = 5;
            newsText = "Large whale wallets accumulating BTC";
            break;
        case "halving":
            impact = 3000;
            sentImpact = 15;
            newsText = "Bitcoin Halving Event";
            break;
        case "regulation":
            impact = 1500;
            sentImpact = 8;
            newsText = "Positive Regulatory News";
            break;
        case "partnership":
            impact = 1000;
            sentImpact = 6;
            newsText = "Major Partnership Announced";
            break;
        case "upgrade":
            impact = 800;
            sentImpact = 4;
            newsText = "Network Upgrade Successful";
            break;
        case "listing":
            impact = 600;
            sentImpact = 3;
            newsText = "New Exchange Listing";
            break;
        case "fomo":
            impact = 500;
            sentImpact = 10;
            newsText = "Retail FOMO Kicks In";
            break;
        case "pump":
            impact = 2000;
            sentImpact = 12;
            newsText = "Meme Coin Pump";
            break;
        case "hack":
            impact = -1500;
            sentImpact = -10;
            newsText = "Major exchange hack triggers panic";
            break;
        case "ban":
            impact = -2000;
            sentImpact = -15;
            newsText = "Government bans crypto trading";
            break;
        case "liquidation":
            impact = -2500;
            sentImpact = -12;
            newsText = "Mass liquidation cascade triggered";
            break;
        case "scam":
            impact = -1800;
            sentImpact = -9;
            newsText = "Major Scam Exposed";
            break;
        case "downgrade":
            impact = -1200;
            sentImpact = -7;
            newsText = "Network Issue or Downgrade";
            break;
        case "delisting":
            impact = -800;
            sentImpact = -5;
            newsText = "Exchange Delisting";
            break;
        case "whaleSell":
            impact = -900;
            sentImpact = -6;
            newsText = "Whale Selling Pressure";
            break;
        case "recession":
            impact = -3000;
            sentImpact = -20;
            newsText = "Economic Recession Fears";
            break;
        case "fud":
            impact = -1000;
            sentImpact = -8;
            newsText = "Heavy FUD Campaign";
            break;
        case "dump":
            impact = -2000;
            sentImpact = -10;
            newsText = "Flash Dump";
            break;
        case "volSpike":
            market.volMult *= 1.5;
            newsText = "Volatility Spike";
            break;
        case "newsNeutral":
            newsText = "Neutral Market News";
            break;
        case "sideways":
            market.volMult = 0.2;
            newsText = "Market Enters Sideways Mode";
            break;
    }
    market.pendingPriceImpact += impact;
    market.pendingSentImpact += sentImpact;
    if (newsText) news(newsText);
    gainXP(20 + Math.abs(sentImpact));
    updateUI();
}

/* APPLY PENDING IMPACTS */
function applyPendingImpacts() {
    if (market.pendingPriceImpact !== 0) {
        let step = market.pendingPriceImpact / 5;
        market.price += step;
        market.volume += Math.abs(step) * 200;
        market.pendingPriceImpact -= step;
        if (Math.abs(market.pendingPriceImpact) < 1) market.pendingPriceImpact = 0;
    }
    if (market.pendingSentImpact !== 0) {
        let step = market.pendingSentImpact / 5;
        market.sentiment += step;
        market.sentiment = Math.max(0, Math.min(100, market.sentiment));
        market.pendingSentImpact -= step;
        if (Math.abs(market.pendingSentImpact) < 1) market.pendingSentImpact = 0;
    }
}

/* XP SYSTEM */
let xpPerLevel = 100;

function gainXP(x) {
    market.xp += x;
    while (market.xp >= xpPerLevel) {
        market.level++;
        market.xp -= xpPerLevel;
        xpPerLevel += 50;
        news("🏆 Level Up! Trader Level " + market.level);
        addBadge("Level " + market.level);
        log("Level up to " + market.level);
    }
}

/* BADGES */
function addBadge(t) {
    let b = document.createElement("span");
    b.className = "badge";
    b.innerText = t;
    document.getElementById("achievements").appendChild(b);
}

/* CANDLE GENERATION */
let lastTime = Math.floor(Date.now() / 1000) - 60 * 60;

function newCandle() {
    let time = lastTime + 60;
    let open = market.price;
    applyPendingImpacts();
    let move = (Math.random() - 0.5) * 600 * market.volMult;
    market.price += move;
    let high = Math.max(open, market.price) + Math.random() * 200 * market.volMult;
    let low = Math.min(open, market.price) - Math.random() * 200 * market.volMult;
    let close = market.price;
    let vol = Math.random() * 1000000000 + market.volume;
    market.volume = 0;
    candles.update({
        time,
        open,
        high,
        low,
        close
    });
    volumeSeries.update({
        time,
        value: vol,
        color: close > open ? '#26a69a' : '#ef5350'
    });
    sentimentSeries.update({
        time,
        value: market.sentiment
    });
    market.marketCap = market.price * 21000000;
    updateUI();
    lastTime = time;
}

/* SIMULATION LOOP */
let simInterval;

function startSim() {
    clearInterval(simInterval);
    simInterval = setInterval(() => {
        if (market.paused) return;
        runActors();
        liquidationEngine();
        newCandle();
        adjustFunding();
        adjustDominance();
    }, 2000 / market.speed);
}
startSim();

/* ADDITIONAL SIM FUNCTIONS */
function adjustFunding() {
    market.funding = (market.sentiment - 50) / 5000;
}

function adjustDominance() {
    market.dominance += (Math.random() - 0.5) * 0.5;
    market.dominance = Math.max(30, Math.min(70, market.dominance));
}

/* SPEED CONTROL */
function speedUp(factor) {
    market.speed *= factor;
    log("Simulation speed x" + market.speed.toFixed(1));
    startSim();
}

/* PAUSE/RESUME */
function pauseSim() {
    market.paused = true;
    log("Simulation paused");
}

function resumeSim() {
    market.paused = false;
    log("Simulation resumed");
}

/* RESET */
function resetSim() {
    market = {
        price: 42000,
        sentiment: 50,
        funding: 0.01,
        openInterest: 2100000000,
        volume: 0,
        marketCap: 800000000000,
        dominance: 50,
        level: 1,
        xp: 0,
        speed: 1,
        volMult: 1,
        paused: false,
        pendingPriceImpact: 0,
        pendingSentImpact: 0
    };
    noLiq = false;
    document.getElementById("news").innerHTML = "";
    document.getElementById("achievements").innerHTML = "";
    document.getElementById("log").innerHTML = "";
    document.getElementById("actors").innerHTML = "";
    candles.setData([]);
    volumeSeries.setData([]);
    sentimentSeries.setData([]);
    updateUI();
    log("Simulation reset");
    lastTime = Math.floor(Date.now() / 1000) - 60 * 60;
}

/* SAVE/LOAD STATE */
function saveState() {
    localStorage.setItem("cryptoReactorState", JSON.stringify(market));
    log("State saved");
}

function loadState() {
    let saved = localStorage.getItem("cryptoReactorState");
    if (saved) {
        market = JSON.parse(saved);
        updateUI();
        log("State loaded");
    } else {
        log("No saved state");
    }
}

/* GOD CHEATS */
function godCheat(type) {
    switch (type) {
        case "maxLevel":
            market.level = 99;
            market.xp = 0;
            addBadge("God Level");
            log("GOD: Max Level");
            break;
        case "infiniteOI":
            market.openInterest = Infinity;
            log("GOD: Infinite Open Interest");
            break;
        case "zeroLiq":
            noLiq = true;
            log("GOD: No Liquidations");
            break;
        case "bullMarket":
            market.sentiment = 100;
            market.volMult = 1.2;
            log("GOD: Forced Bull Market");
            break;
        case "bearMarket":
            market.sentiment = 0;
            market.volMult = 1.5;
            log("GOD: Forced Bear Market");
            break;
    }
    updateUI();
}

/* AUTO NEWS */
let autoNewsInterval = setInterval(() => {
    if (market.paused) return;
    const headlines = [
        "Whales accumulating BTC",
        "Institutional inflows rising",
        "Retail FOMO increasing",
        "Crypto volatility expanding",
        "Liquidity tightening across exchanges",
        "Miners selling rewards",
        "Bots trading frenzy",
        "Influencers shilling",
        "Hedge funds positioning",
        "Market stabilizing",
        "Altcoins rotating",
        "Stablecoin inflows",
        "Defi TVL rising",
        "NFT hype building",
        "Web3 adoption news"
    ];
    news(headlines[Math.floor(Math.random() * headlines.length)]);
}, 9000 / market.speed);

// Update auto news interval when speed changes
const originalSpeedUp = speedUp;
speedUp = function (factor) {
    originalSpeedUp(factor);
    clearInterval(autoNewsInterval);
    autoNewsInterval = setInterval(() => {
        if (market.paused) return;
        const headlines = [
            "Whales accumulating BTC",
            "Institutional inflows rising",
            "Retail FOMO increasing",
            "Crypto volatility expanding",
            "Liquidity tightening across exchanges",
            "Miners selling rewards",
            "Bots trading frenzy",
            "Influencers shilling",
            "Hedge funds positioning",
            "Market stabilizing",
            "Altcoins rotating",
            "Stablecoin inflows",
            "Defi TVL rising",
            "NFT hype building",
            "Web3 adoption news"
        ];
        news(headlines[Math.floor(Math.random() * headlines.length)]);
    }, 9000 / market.speed);
}

// Initial update
updateUI();

// Add some initial candles for history
for (let i = 0; i < 60; i++) {
    newCandle();
}