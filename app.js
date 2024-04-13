(() => {
    const ENTRIES = [
        "Fermo a pascolare",
        "Boombox",
        "Sciopero non pervenuto",
        "Traffico",
        "Coincidenza persa",
        "Veiculo longo che si immette",
        "Carrello sui binari",
        "Bicock jumpscare",
        "Persone sui binari",
        "Speaker lobby COD",
        "Treno '45",
        "Papers, please",
        "Ritardo",
        "Escursione termica",
        "Treno pieno",
        "Poderosa dormita",
        "Treno Riciclato",
        "Condizioni meteo avverse",
        "Lussana jumpscare",
        "Trattore / pecore",
        "Cancellato",
        "Bergamo moved out of borrow",
        "Parcheggio pieno",
        "Ustione in stazione",
        "Fermo a Pioltello"
    ];
    const ENTRIES_AMT = ENTRIES.length;

    const todaysDate = new Date();
    todaysDate.setHours(23, 59, 59, 999); //Saved data expires at midnight
    document.getElementById("hero").innerHTML += todaysDate.toLocaleDateString("en-GB");

    let randomizedEntries = [];
    let matrix = [...Array(25)].map(e => false);
    readDataIfSaved();

    const table = document.getElementById("bingoTable");
    [...table.children].forEach((row, rowId) =>
        [...row.children].forEach(
            (cell, cellId) => {
                cell.id = cellId + rowId * 5;
                cell.innerHTML = randomizedEntries[cell.id];
                setCellFound(cell, cell.id);

                cell.addEventListener("mouseup", e => {
                    cellPos = parseInt(e.target.id);
                    matrix[cellPos] = !matrix[cellPos];
                    setCellFound(e.target, cellPos);

                    checkBingoOnAffectedBy(cellPos); //async can be let loose here
                    setCookie("boardState", matrix.reduce((acc, cell) => acc + +cell, ""));
                    
                    e.preventDefault(); return false;
                });

                cell.addEventListener("animationend", e => e.target.classList.remove("bingo"));
            }));
    
    let modeIsNight = false;
    // I need to save the btn otherwise the svg inside it becomes the event target lmao.
    const modeBtn = document.getElementById("mode");
    modeBtn.onclick =_=> {
        modeIsNight = !modeIsNight;
        attrStr     =  modeIsNight ? "night" : "day";

        modeBtn.setAttribute("mode", attrStr);
        document.documentElement.setAttribute("mode", attrStr);
    };

    function readDataIfSaved() {
        if(!document.cookie) {
            for(let i = 0; i < ENTRIES_AMT; i++)
                randomizedEntries.push(ENTRIES.splice(Math.floor(Math.random() * ENTRIES.length), 1)[0])
            
            setCookie("boardEntries", randomizedEntries.join("#")); return;
        }
        
        boardState = getCookie("boardState");
        randomizedEntries = getCookie("boardEntries").split("#");
        
        if(boardState) matrix = boardState.split("").map(d => !!+d);
    }

    function setCellFound(cell, pos) {
        cell.setAttribute("found", matrix[pos]);
    }
    
    async function checkBingoOnAffectedBy(cellPos) {
        const affectedColId   = cellPos % 5;
        const affectedRowId   = Math.floor(cellPos / 5);
        const affectsMainDiag = cellPos % 6 == 0;
        const affectsScndDiag = (cellPos + affectedRowId + 1) % 5 == 0;

        let colCount = 0;
        const colIds = [];

        let rowCount = 0;
        const rowIds = [];
        for(let i = 0; i < 5; i++) {
            const colCellId = affectedColId + i * 5;
            colCount += matrix[colCellId];
            colIds.push(colCellId);

            const rowCellId = affectedRowId * 5 + i;
            rowCount += matrix[rowCellId];
            rowIds.push(rowCellId);
        }

        if(colCount == 5) await startBingoAnimOnCells(colIds);
        if(rowCount == 5) await startBingoAnimOnCells(rowIds);

        if(affectsMainDiag) {
            let mdCount = 0;
            const mdIds = [];
            for(let i = 0; i < 5; i++) {
                const mdId = i * 6;
                mdIds.push(mdId);
                mdCount += matrix[mdId];
            }

            if(mdCount == 5) await startBingoAnimOnCells(mdIds);
        }

        if(affectsScndDiag) {
            let sdCount = 0;
            const mdIds = [];
            for(let i = 0; i < 5; i++) {
                const mdId = i * 5 + (4 - i);
                mdIds.push(mdId);
                sdCount += matrix[mdId];
            }
            
            if(sdCount == 5) await startBingoAnimOnCells(mdIds);
        }
    }

    async function startBingoAnimOnCells(ids) {
        for(id of ids) {
            document.getElementById(id).classList.add("bingo");
            await sleep(100);
        };
    }
    
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function setCookie(name, value) {
        document.cookie = `${name}=${value}; expires=${todaysDate.toUTCString()}; path=/`;
    }

    function getCookie(name) {
        return document.cookie.match(RegExp(`${name}\=([^;]+)(?:;|$)`))?.[1];
    }
})();

function clearCookie(name) {
    document.cookie = `${name}=0; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
}

function debug_clearCookies() {
    clearCookie("boardState");
    clearCookie("boardEntries");
}