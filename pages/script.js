
function showLoader() {
    const loader = document.querySelector(".loader");
    loader.classList.remove("loader-hidden");
    loader.style.display = "flex"; 
}


function hideLoader() {
    const loader = document.querySelector(".loader");
    loader.classList.add("loader-hidden");

    loader.addEventListener("transitionend", () => {
        loader.style.display = "none"; 
    }, { once: true }); 
}



document.getElementById('submitButton').addEventListener('click', function() {
    showLoader();
    submitRecording().finally(() => {
        hideLoader();
    });
});

window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");
    loader.classList.add("loader-hidden");
    loader.addEventListener("transitioned", () => {
        document.body.removeChild("loader");
    })
})
async function submitRecording() {
    return new Promise(resolve => setTimeout(resolve, 3000)); //PROBLEM IN THIS LINE!! This logic runs it for like 3 seconds, but I have no idea how to make it depend on runtime
    
}

