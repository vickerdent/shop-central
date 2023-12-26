
document.addEventListener("DOMContentLoaded", () => {
    const unSuccess = document.getElementById("toastError")
    const failToast = bootstrap.Toast.getOrCreateInstance(unSuccess)

    fetch("/open_staff_carts")
    .then((response) => {
        if (!response.ok) {
            failToast.show();
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json()})
    .then(data => {
        document.getElementById("noOfCustomers").value = data.carts.length
    })

    var newArray = [];
    for (let index = 1; index <= document.getElementById("noOfCustomers").value; index++) {
        newArray.push(index)
    }

    const links = document.getElementsByClassName("purchases");
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        element.disabled = true;
    }

    var idNum = document.getElementById("currNum").value
    document.addEventListener("click", event => {
        const element = event.target;
        // If element.id starts with
        if (element.id.startsWith("amountPaid")) {
            const currID = element.id;
            document.getElementById("currNum").value = parseInt(currID.split("_")[1])
            idNum = document.getElementById("currNum").value
        }
        console.log(`The Loop counter is: ${idNum}`)
    })

    document.querySelector(`#amountPaid_${idNum}`).onkeyup = () => {
        if (document.querySelector(`#amountPaid_${idNum}`).value.length > 0 && !(document.querySelector(`#amountPaid_${idNum}`).value.startsWith("0"))) {
            document.querySelector(`#purchaseOrder_${idNum}`).disabled = false;
            var moneyBrought = parseFloat(document.querySelector(`#amountPaid_${idNum}`).value);
            var amountOwed = parseFloat(document.getElementById(`totalAmount_${idNum}`).value) - moneyBrought
            document.getElementById(`amountOwed_${idNum}`).value = amountOwed.toFixed(2)
            var strAmount = amountOwed.toFixed(2)
            document.getElementById(`owed_${idNum}`).innerHTML = editPrice(strAmount)
            console.log(editPrice(strAmount));
        } else {
            document.querySelector(`#purchaseOrder_${idNum}`).disabled = true;
            var moneyBrought = parseFloat(0);
            var amountOwed = parseFloat(document.getElementById(`totalAmount_${idNum}`).value) - moneyBrought
            console.log(amountOwed);
            document.getElementById(`amountOwed_${idNum}`).value = amountOwed.toFixed(2)
            var strAmount = amountOwed.toFixed(2)
            document.getElementById(`owed_${idNum}`).innerHTML = editPrice(strAmount)
        }
    }
    
});

function editPrice(dPrice) {
    var point = dPrice.indexOf(".")
    if (point) {
        var strPrice  = dPrice.slice(0, point);
    } else {
        var strPrice  = dPrice.toString();
    }
    var decimalFig = dPrice.slice(-3)
    var revStrPrice = strPrice.split("").reverse().join("");
    var humPrice = "";
    if (revStrPrice.length > 3) {
        for (let index = 0; index < revStrPrice.length; index++) {
            const element = revStrPrice[index];
            humPrice += element;
            if ((index + 1) % 3 == 0 && index != revStrPrice.length - 1) {
                humPrice += ",";
            }
        }
        strPrice = humPrice.split("").reverse().join("");
    } else {
        return strPrice + decimalFig;
    }
    return strPrice + decimalFig;
}
