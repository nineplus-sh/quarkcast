document.querySelector("#login").addEventListener("submit", async function (e) {
    e.preventDefault();

    const baseuri = document.querySelector('#baseuri').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const tokenCall = await fetch(`${baseuri}/v4/auth/token`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "User-Agent": "Quarkcast", "LQ-Agent": "Quarkcast"},
        body: JSON.stringify({email, password})
    })

    if(tokenCall.ok) {
        const tokens = (await tokenCall.json()).response;
        await chrome.storage.local.set({baseURI: baseuri, accessToken: tokens.access_token, refreshToken: tokens.refresh_token});
        chrome.action.setBadgeText({text:""});
        stateChecker();
    } else {
        document.body.innerHTML = "Try that again."
    }
})

async function stateChecker() {
    const response = await chrome.runtime.sendMessage("state");
    console.log(response)
    document.querySelectorAll(".view").forEach(view => view.classList.add("hidden"))
    if(response.atom) {
        document.querySelector("#castdata").innerText = JSON.stringify(response.atom)
        const port = chrome.runtime.connect({name: "atomreceiver"});
        port.onMessage.addListener(function(msg) {
            document.querySelector("#castdata").innerText = JSON.stringify(msg);
        })
    }
    document.querySelector(`#${response.view}`).classList.remove("hidden");
}
stateChecker();