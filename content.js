(async () => {
    const host = location.hostname;
    try {
        const atom = await import(chrome.runtime.getURL(`atoms/${host}.js`));
        const port = chrome.runtime.connect({name: "casting"});
        async function atomInspector() {
            if(document.hidden) return;
            const data = await atom.data();
            port.postMessage(data);
        }

        let interval = setInterval(atomInspector, 500)
        document.addEventListener("visibilitychange", function() {
            if(document.hidden) {
                clearInterval(interval);
                interval = null;
                port.postMessage(null);
                return;
            }
            if(!interval) interval = setInterval(atomInspector, 500);
        })
    } catch (err) {
        console.warn("No atom for this site",host);
    }
})();