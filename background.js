let atomState = null;
let receiver = null;
let wasLoggedOut = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request === "state") {
            chrome.storage.local.get("accessToken").then(storage => {
                if(wasLoggedOut && storage.accessToken) {
                    wasLoggedOut = false;
                    sendToLQ();
                }

                if (!storage.accessToken) {
                    sendResponse({ view: "loginarea" });
                } else if (atomState) {
                    sendResponse({ view: "casting", atom: atomState})
                } else {
                    sendResponse({ view: "nocompat" });
                }
            });
            return true;
        }
    }
);

chrome.runtime.onConnect.addListener(function(port) {
    if(port.name === "casting") {
        port.onMessage.addListener(function(msg) {
            if(JSON.stringify(atomState) !== JSON.stringify(msg)) {
                atomState = msg;
                if(receiver) receiver.postMessage(msg);
                console.log(msg)
                sendToLQ();
            }
        });
    } else if (port.name === "atomreceiver") {
        receiver = port;
        port.onDisconnect.addListener(function(msg) {
            receiver = null;
        })
    }
});

async function sendToLQ() {
    chrome.storage.local.get(["baseURI", "accessToken", "refreshToken"]).then(storage => {
        if(!storage.accessToken) {
            wasLoggedOut = true;
            return chrome.action.setBadgeText({text:"!"})
        }

        if(!atomState) {
            fetch(`${storage.baseURI}/v4/user/me/status`, {
                method: "DELETE",
                headers: {"Authorization": `Bearer ${storage.accessToken}`, "User-Agent": "Quarkcast", "LQ-Agent": "Quarkcast"}
            })
        } else {
            const fd = new FormData();
            fd.append("payload", JSON.stringify(atomState));
            fetch(`${storage.baseURI}/v4/user/me/status`, {
                method: "PUT",
                headers: {"Authorization": `Bearer ${storage.accessToken}`, "User-Agent": "Quarkcast", "LQ-Agent": "Quarkcast"},
                body: fd
            })
        }
    });
}
