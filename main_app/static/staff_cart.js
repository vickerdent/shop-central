
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

            const recipient = button.getAttribute("data-customer");
            const totalAmount = button.getAttribute("data-amount");
            const identity = button.getAttribute("data-identify");
            // If necessary, you could initiate an Ajax request here
            // and then do the updating in a callback.

            // Update the modal's content.
            document.getElementById("confirmPay").disabled = false;
            const custName = document.getElementById("custName");
            custName.textContent = `Customer's Name: ${recipient}`;
            document.getElementById("hiddenCustName").value = recipient;

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
                document.getElementById("custType").value = "ok"
                document.getElementById("quest").textContent = `${recipient} brought ₦${editPrice(amountBrought)},`
                document.getElementById("addInfo").textContent = `which is equal to the total cost.`;
                payElement.setAttribute("data-bs-target", "")
                payElement.setAttribute("data-bs-toggle", "")
                payElement.setAttribute("data-customer", recipient)
                payElement.setAttribute("data-amount", totalAmount)
                payElement.setAttribute("data-amtbrought", amountBrought)
                payElement.setAttribute("data-identify", identity)
                payElement.setAttribute("data-owed", "")
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
                payElement.setAttribute("data-amtbrought", amountBrought)
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
                payElement.setAttribute("data-bs-target", "")
                payElement.setAttribute("data-bs-toggle", "")
                payElement.setAttribute("data-customer", recipient)
                payElement.setAttribute("data-amount", totalAmount)
                payElement.setAttribute("data-amtbrought", amountBrought)
                payElement.setAttribute("data-identify", identity)
                payElement.setAttribute("data-owed", "")
            }
        })

        document.addEventListener("click", event => {
            const element = event.target;

            if (element.id == "confirmPay") {
                document.getElementById("confirmPay").disabled = true;
                const custType = document.getElementById("custType")
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                const cartData = {customerName: element.getAttribute("data-customer"),
                amountPaid: element.getAttribute("data-amtbrought")};
                const checkVideo = document.getElementById("checkVideo");
                const confirmPurchaseModal = bootstrap.Modal.getInstance(document.getElementById('confirmPurchaseModal'));
                const txnSuccessfulModal = bootstrap.Modal.getInstance(document.getElementById('txnSuccessfulModal'));

                if (custType.value === "ok") {
                    // Customer owes nothing nor is owed anything
                    fetch("transactions/make_payment/", {
                        method: "POST",
                        headers: {'X-CSRFToken': csrftoken,
                                    "Content-Type": "application/json"},
                        mode: "same-origin",
                        body: JSON.stringify(cartData),
                    })
                    .then((response) => {
                        if (!response.ok) {
                            failToast.show();
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json()})
                    .then(data => {
                        const result = data.result
                        if (result === "Exact") {
                            // Successful transaction
                            document.getElementById("change").style.display = "none";
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = data.txn_id
                            document.getElementById("refNo").textContent = data.ref_no
                            // Call modal for success
                            confirmPurchaseModal.hide();
                            txnSuccessfulModal.show();
                            checkVideo.play();
                        } else {
                            failToast.show();
                        }
                    })
                    .catch(error => {
                        // failToast.show();
                        console.error({"error": error});
                    });
                } else if (custType.value === "change") {
                    // Customer needs change
                    fetch("transactions/make_payment/", {
                        method: "POST",
                        headers: {'X-CSRFToken': csrftoken,
                                    "Content-Type": "application/json"},
                        mode: "same-origin",
                        body: JSON.stringify(cartData),
                    })
                    .then((response) => {
                        if (!response.ok) {
                            failToast.show();
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json()})
                    .then(data => {
                        const result = data.result
                        if (result === "Change") {
                            // Successful transaction
                            document.getElementById("change").style.display = ""
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = data.txn_id
                            document.getElementById("refNo").textContent = data.ref_no
                            document.getElementById("change").textContent = ` ₦${data.change}`
                            // Call modal for success
                            confirmPurchaseModal.hide()
                            txnSuccessfulModal.show();
                            checkVideo.play();
                        } else {
                            failToast.show();
                        }
                    })
                    .catch(error => {
                        // failToast.show();
                        console.error({"error": error});
                    });
                }
            }

        })

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
            const debtAmt = button.getAttribute("data-owed")
            // If necessary, you could initiate an Ajax request here
            // and then do the updating in a callback.

            // Fetch debtors data from Django
            fetch("/get_debtors")
            .then((response) => {
                if (!response.ok) {
                    failToast.show();
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json()})
            .then(data => {
                const result = data.result
                if (result === true) {
                    // Successfully got debtors
                    data.debtors.forEach(element => {
                        const li = document.createElement("li");
                        li.className = "list-group-item";
                        // Obtains the first phone number belonging to each debtor
                        li.innerHTML = [
                            `<a class="debtor-button link-offset-2 link-underline link-underline-opacity-0" href="#" role="button" data-phone="${element.phone_no.phone_number}"`,
                            `   data-name="${element.first_name} ${element.last_name}" data-descrip="${element.description}" data-oldamount="${element.amount_owed}"`,
                            `   data-newamount="${debtAmt}" data-totalamount="${parseFloat(element.amount_owed) + parseFloat(debtAmt)}">`,
                            `   <span class="fw-bold">Name:</span> ${element.first_name} ${element.last_name}<br>`,
                            `   <span class="fw-bold">Description:</span> ${element.description}<br>`,
                            `   <span class="fw-bold">Amount Owed:</span> ₦${editPrice(element.amount_owed)}<br>`,
                            '</a>'
                          ].join('')
                        document.getElementById("debtor_list").append(li)
                    });
                } else {
                    failToast.show();
                }
            })

            // Update the modal's content.
            document.getElementById("amount_owed").value = `₦${debtAmt}`
            document.getElementById("first_name").value = recipient
            document.getElementById("add_debtor").checked = true;
            document.getElementById("update_debtor").checked = false;
            document.getElementById("new_debtor_form").style.display = "";
            document.getElementById("update_debtor_div").style.display = "none";


            const cancelDebt = document.getElementById("cancelDebtButton")
            cancelDebt.setAttribute("data-customer", recipient)
            cancelDebt.setAttribute("data-amount", totalAmount)
            cancelDebt.setAttribute("data-identify", identity)
        })

        document.addEventListener("click", event => {
            const element = event.target;

            if (element.id == "submitDebt") {
                
            } else if (element.id == "add_debtor") {
                // console.log("Adding");
                document.getElementById("new_debtor_form").style.display = "";
                document.getElementById("update_debtor_div").style.display = "none";
            } else if (element.id == "update_debtor") {
                // console.log("Updating");
                document.getElementById("new_debtor_form").style.display = "none";
                document.getElementById("update_debtor_div").style.display = "";
            } else if (element.className == "debtor-button") {
                console.log(element.className)
            }
        })

        // Remove info on close
        confirmPurchaseModal.addEventListener("hidden.bs.modal", () => {
            const curr_debtors = document.querySelectorAll(".list-group-item");
            if (curr_debtors) {
                curr_debtors.forEach(debtor => {
                    debtor.remove();
                })
            }
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
