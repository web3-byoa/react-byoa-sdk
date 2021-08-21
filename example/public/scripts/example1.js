( () => {
    if (window.byoa === undefined) {
        console.error('byoa context is undefined');
        return;
    }

    let loopIv = null;
    try {
        let context = window.byoa.context;
        if(context == undefined) return;

        loopIv = setInterval( () => {
            context.jrpcProvider.getBlockNumber().then ( (result) => {
                console.log(result);
            });
        }, 1000)
        
    } catch( error ) {
        if(loopIv !== null) clearInterval(loopIv);
    }
})();