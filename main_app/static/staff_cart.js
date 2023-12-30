
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

    const links = document.getElementsByClassName("purchases");
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        element.disabled = true;
    }

    let idNum = 1

    document.addEventListener("click", event => {
        const element = event.target;
        // If element.id starts with
        if (element.id.startsWith("amountPaid")) {
            const currID = element.id;
            idNum = parseInt(currID.split("_")[1])
        }

        document.getElementById(`amountPaid_${idNum}`).onkeyup = () => {
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

            const recipient = button.getAttribute("data-customer")
            const totalAmount = button.getAttribute("data-amount")
            const identity = button.getAttribute("data-identify")
            // If necessary, you could initiate an Ajax request here
            // and then do the updating in a callback.

            // Update the modal's content.
            const custName = document.getElementById("custName");
            custName.textContent = `Customer's Name: ${recipient}`
            document.getElementById("hiddenCustName").value = recipient

            const orderTotal = document.getElementById("orderTotal");
            orderTotal.textContent = `${editPrice(totalAmount)}`

            const idNum = parseInt(identity.split("_")[1])
            const amountBrought = document.getElementById(`amountPaid_${idNum}`).value
            const hiddenAmtDebt = document.getElementById("hiddenAmtDebt")
            hiddenAmtDebt.value = parseFloat(totalAmount) - parseFloat(amountBrought)

            const infoHold = document.getElementById("arrange");
            const payInfo = document.createElement("p");
            payInfo.id = "payInfo";
            payInfo.className = "fs-5 d-flex justify-content-center";

            const payElement = document.getElementById("confirmPay")

            if (parseFloat(totalAmount).toFixed(2) === parseFloat(amountBrought).toFixed(2)) {
                // Customer brought exact amount
                document.getElementById("custType").value = "change"
                document.getElementById("quest").textContent = `${recipient} brought ₦${editPrice(amountBrought)},`
                document.getElementById("addInfo").textContent = `which is equal to the total cost.`;
            } else if (parseFloat(totalAmount) > parseFloat(amountBrought)) {
                // Customer is a debtor
                var debt = parseFloat(totalAmount) - parseFloat(amountBrought)
                document.getElementById("custType").value = "debtor"
                document.getElementById("quest").textContent = `${recipient} brought ₦${editPrice(amountBrought)},`;
                document.getElementById("addInfo").textContent = `which is less than the total cost.`;
                payInfo.textContent = `Customer will owe ₦${editPrice(debt.toFixed(2))}.`;
                infoHold.appendChild(payInfo);
                payElement.setAttribute("data-bs-target", "#updateDebtorModal")
                payElement.setAttribute("data-bs-toggle", "modal")
                payElement.setAttribute("data-customer", recipient)
                payElement.setAttribute("data-amount", totalAmount)
                payElement.setAttribute("data-identify", identity)
                payElement.setAttribute("data-owed", editPrice(debt.toFixed(2)))
            } else {
                // Customer needs change
                document.getElementById("custType").value = "change"
                var change = parseFloat(amountBrought) - parseFloat(totalAmount)
                document.getElementById("quest").textContent = `${recipient} brought ₦${editPrice(amountBrought)},`;
                document.getElementById("addInfo").textContent = `which is more than the total cost.`;
                payInfo.textContent = `Customer's change is ₦${editPrice(change.toFixed(2))}.`;
                infoHold.appendChild(payInfo);
            }
        })

        // document.addEventListener("click", event => {
        //     const element = event.target;

        //     if (element.id == "confirmPay") {
        //         const paymentType = document.getElementById("custType")
        //         if (paymentType.value == "debtor") {
        //             // Customer is owing money
                    
                    
        //         }
        //     }

        // })

        // Remove info on close
        confirmPurchaseModal.addEventListener("hidden.bs.modal", () => {
            const varDel = document.getElementById("payInfo");
            if (varDel) {
                varDel.remove();
            }
        })
    }

    const updateDebtorModal = document.getElementById('updateDebtorModal')
    if (updateDebtorModal) {
        updateDebtorModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-* attributes

            const recipient = button.getAttribute("data-customer")
            const totalAmount = button.getAttribute("data-amount")
            const identity = button.getAttribute("data-identify")
            // If necessary, you could initiate an Ajax request here
            // and then do the updating in a callback.

            // Update the modal's content.
            const cancelDebt = document.getElementById("cancelDebt")
            cancelDebt.setAttribute("data-customer", recipient)
            cancelDebt.setAttribute("data-amount", totalAmount)
            cancelDebt.setAttribute("data-identify", identity)
        })
    }
});

function editPrice(dPrice) {
    var point = dPrice.indexOf(".")
    if (point != -1) {
        var strPrice  = dPrice.slice(0, point);
        var revStrPrice = strPrice.split("").reverse().join("");
        var humPrice = "";
        var decimalFig = dPrice.slice(-3)
        if (revStrPrice.length > 3) {
            for (let index = 0; index < revStrPrice.length; index++) {
                const element = revStrPrice[index];
                humPrice += element;
                if ((index + 1) % 3 == 0 && index != revStrPrice.length - 1) {
                    humPrice += ",";
                }
            }
            strPrice = humPrice.split("").reverse().join("");
            return strPrice + decimalFig;
        } else {
            return strPrice + decimalFig;
        }
    } else {
        var strPrice  = dPrice.toString();
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
            return strPrice + ".00";
        } else {
            return strPrice + ".00";
        }
    }
}
