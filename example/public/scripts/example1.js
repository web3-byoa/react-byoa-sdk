( () => {
    if (window.byoa === undefined) {
        console.error('byoa context is undefined');
        return;
    }

    let loopIv = null;
    try {
        let context = window.byoa.context;
        if(context == undefined) return;

        let globalHud = document.querySelector(`#${context.target.hud}`);
        if (globalHud == null) return;

        let myTarget = globalHud.innerHTML += `
            <div id='abc123' style='background-color: green; width: 50%; margin: 0 auto; color: white;'>
                
            </div>
        `;
        let myTargetEl = document.querySelector(`#abc123`);

        loopIv = setInterval( () => {
            context.jrpcProvider.getBlockNumber().then ( (result) => {
                console.log(result);
                myTargetEl.innerHTML = `<h1>Last Block Number: ${result}</h1>`;
            });
        }, 1000)
        
    } catch( error ) {
        if(loopIv !== null) clearInterval(loopIv);
    }
})();