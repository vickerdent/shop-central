let idNum = 1

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

    document.addEventListener("click", event => {
        const element = event.target;
        // If element.id starts with
        if (element.id.startsWith("amountPaid")) {
            const currID = element.id;
            idNum = parseInt(currID.split("_")[1])
        }

        document.getElementById(`amountPaid_${idNum}`).onkeyup = () => {
            console.log(`The num is: ${idNum}`)
            if (document.getElementById(`amountPaid_${idNum}`).value.length > 0 && !(document.getElementById(`amountPaid_${idNum}`).value.startsWith("0"))) {
                document.getElementById(`purchaseOrder_${idNum}`).disabled = false;
                var moneyBrought = parseFloat(document.getElementById(`amountPaid_${idNum}`).value);
                var amountOwed = parseFloat(document.getElementById(`totalAmount_${idNum}`).value) - moneyBrought
                document.getElementById(`amountOwed_${idNum}`).value = amountOwed.toFixed(2)
                var strAmount = amountOwed.toFixed(2)
                if (strAmount <= parseFloat(0.0)) {
                    document.getElementById(`owed_${idNum}`).textContent = editPrice("0.00")
                } else {
                    document.getElementById(`owed_${idNum}`).textContent = editPrice(strAmount)
                }
                
            } else {
                document.getElementById(`purchaseOrder_${idNum}`).disabled = true;
                var moneyBrought = parseFloat(0);
                var amountOwed = parseFloat(document.getElementById(`totalAmount_${idNum}`).value) - moneyBrought
                document.getElementById(`amountOwed_${idNum}`).value = amountOwed.toFixed(2)
                var strAmount = amountOwed.toFixed(2)
                document.getElementById(`owed_${idNum}`).textContent = editPrice(strAmount)
            }
        }
    })
    
    const confirmPurchaseModal = document.getElementById('confirmPurchaseModal')
    if (confirmPurchaseModal) {
        confirmPurchaseModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-* attributes

            const recipient = button.getAttribute('data-customer')
            // If necessary, you could initiate an Ajax request here
            // and then do the updating in a callback.

            // Update the modal's content.
            const custName = document.getElementById("custName");
            custName.textContent = recipient
            console.log(recipient)
        })
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
