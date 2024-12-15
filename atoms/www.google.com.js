export async function data() {
    if(document.location.pathname === "/search") {
        return {
            "type": "plain",
            "primaryText": "Searching Google",
            "primaryImageUri": "https://www.google.com/images/branding/googleg/2x/googleg_standard_color_128dp.png",
            "text1": new URLSearchParams(location.search).get("q")
        }
    }
}