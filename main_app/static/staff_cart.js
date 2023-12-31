
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

        const pay_amount = document.getElementById(`amountPaid_${idNum}`)
        if (pay_amount) {
            document.getElementById(`amountPaid_${idNum}`).onkeyup = () => {
                if (document.getElementById(`amountPaid_${idNum}`).value.length > 0 && !(document.getElementById(`amountPaid_${idNum}`).value.startsWith("0")) && parseFloat(document.getElementById(`amountPaid_${idNum}`).value) > 0) {
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
                payElement.setAttribute("data-owed", debt)
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
                const confirm_purchase_modal = bootstrap.Modal.getInstance(document.getElementById('confirmPurchaseModal'));
                const txnSuccessfulModal = new bootstrap.Modal(document.getElementById('txnSuccessfulModal'), {
                    keyboard: false
                });

                if (custType.value === "ok") {
                    // Customer owes nothing nor is owed anything
                    // Place slash before url to ensure it picks from base url, not current page, if needed
                    fetch("/transactions/make_payment/", {
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
                            document.getElementById("descrip_text").style.display = "none";
                            document.getElementById("more_text").style.display = "none"
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = data.txn_id
                            document.getElementById("refNo").textContent = data.ref_no
                            // Call modal for success
                            confirm_purchase_modal.hide();
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
                    fetch("/transactions/make_payment/", {
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
                            document.getElementById("descrip_text").style.display = "block"
                            document.getElementById("more_text").style.display = "none"
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = data.txn_id
                            document.getElementById("refNo").textContent = data.ref_no
                            document.getElementById("descrip_text").textContent = "Change amount:"
                            document.getElementById("change").textContent = ` ₦${data.change}`
                            // Call modal for success
                            confirm_purchase_modal.hide();
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
                        // Obtains the first phone number belonging to each debtor, maybe add dialing code,
                        // and also place value of phone number in hidden input field (for aesthetics)
                        li.innerHTML = [
                            `<a class="link-offset-2 link-underline link-underline-opacity-0" href="#" role="button" data-phone="${element.phone_no[0].number}"`,
                            `   data-name="${element.first_name} ${element.last_name}" data-descrip="${element.description}" data-oldamount="${element.amount_owed}"`,
                            `   data-newamount="${debtAmt}" data-totalamount="${parseFloat(element.amount_owed) + parseFloat(debtAmt)}" data-btntype="debtor-button"`,
                            `   data-address="${element.address}, ${element.state}" data-dial="${element.phone_no[0].dialing_code}">`,
                            `   <span class="fw-bold">Name:</span> ${element.first_name} ${element.last_name}  <span class="fw-bold">Phone No:</span> ${element.phone_no[0].dialing_code}${element.phone_no[0].number}<br>`,
                            `   <span class="fw-bold">Address:</span> ${element.address}<br>`,
                            `   <span class="fw-bold">Description:</span> ${element.description}<br>`,
                            `   <span class="fw-bold">Amount Owed:</span> ₦${editPrice(element.amount_owed)}<br>`,
                            '</a>'
                          ].join('')
                        document.getElementById("debtor_list").append(li);
                    });
                } else {
                    failToast.show();
                }
            })

            // Update the modal's content.
            document.getElementById("amount_owed").value = `₦${editPrice(debtAmt)}`;
            document.getElementById("amount_owed").value = debtAmt;
            document.getElementById("first_name").value = recipient;
            document.getElementById("add_debtor").checked = true;
            document.getElementById("update_debtor").checked = false;
            document.getElementById("submitDebt").disabled = true;
            document.getElementById("new_debtor_form").style.display = "block";
            document.getElementById("update_debtor_div").style.display = "none";
            document.getElementById("update_debtor_form").style.display = "none";
            document.getElementById("hold_update_button").style.visibility = "visible";

            const cancelDebt = document.getElementById("cancelDebtButton")
            cancelDebt.setAttribute("data-customer", recipient)
            cancelDebt.setAttribute("data-amount", totalAmount)
            cancelDebt.setAttribute("data-identify", identity)
        })

        document.getElementById("first_name").onkeyup = () => {
            if (document.getElementById("first_name").value.trim().length > 0) {
                document.getElementById("first_name").classList.remove("is-invalid");
                if (document.getElementById("description").value.trim().length > 0) {
                    if (document.getElementById("last_name").value.trim().length > 0) {
                        if (document.getElementById("email").value.trim().length > 0) {
                            if (document.getElementById("phone_number").value.trim().length > 0) {
                                if (document.getElementById("address").value.trim().length > 0) {
                                    if (document.getElementById("state").value.trim().length > 0) {
                                        document.getElementById("submitDebt").disabled = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                document.getElementById("first_name").classList.add('is-invalid');
                document.getElementById("submitDebt").disabled = true;
            }
        }

        document.getElementById("last_name").onkeyup = () => {
            if (document.getElementById("last_name").value.trim().length > 0) {
                document.getElementById("last_name").classList.remove("is-invalid");
                if (document.getElementById("first_name").value.trim().length > 0) {
                    if (document.getElementById("description").value.trim().length > 0) {
                        if (document.getElementById("email").value.trim().length > 0) {
                            if (document.getElementById("phone_number").value.trim().length > 0) {
                                if (document.getElementById("address").value.trim().length > 0) {
                                    if (document.getElementById("state").value.trim().length > 0) {
                                        document.getElementById("submitDebt").disabled = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                document.getElementById("last_name").classList.add('is-invalid');
                document.getElementById("submitDebt").disabled = true;
            }
        }

        document.getElementById("email").onkeyup = () => {
            if (document.getElementById("email").value.trim().length > 0) {
                document.getElementById("email").classList.remove("is-invalid");
                if (document.getElementById("first_name").value.trim().length > 0) {
                    if (document.getElementById("last_name").value.trim().length > 0) {
                        if (document.getElementById("description").value.trim().length > 0) {
                            if (document.getElementById("phone_number").value.trim().length > 0) {
                                if (document.getElementById("address").value.trim().length > 0) {
                                    if (document.getElementById("state").value.trim().length > 0) {
                                        document.getElementById("submitDebt").disabled = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                document.getElementById("email").classList.add('is-invalid');
                document.getElementById("submitDebt").disabled = true;
            }
        }

        document.getElementById("phone_number").onkeyup = () => {
            if (document.getElementById("phone_number").value.trim().length > 0) {
                document.getElementById("phone_number").classList.remove("is-invalid");
                if (document.getElementById("first_name").value.trim().length > 0) {
                    if (document.getElementById("last_name").value.trim().length > 0) {
                        if (document.getElementById("email").value.trim().length > 0) {
                            if (document.getElementById("description").value.trim().length > 0) {
                                if (document.getElementById("address").value.trim().length > 0) {
                                    if (document.getElementById("state").value.trim().length > 0) {
                                        document.getElementById("submitDebt").disabled = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                document.getElementById("phone_number").classList.add('is-invalid');
                document.getElementById("submitDebt").disabled = true;
            }
        }

        document.getElementById("address").onkeyup = () => {
            if (document.getElementById("address").value.trim().length > 0) {
                document.getElementById("address").classList.remove("is-invalid");
                if (document.getElementById("first_name").value.trim().length > 0) {
                    if (document.getElementById("last_name").value.trim().length > 0) {
                        if (document.getElementById("email").value.trim().length > 0) {
                            if (document.getElementById("phone_number").value.trim().length > 0) {
                                if (document.getElementById("description").value.trim().length > 0) {
                                    if (document.getElementById("state").value.trim().length > 0) {
                                        document.getElementById("submitDebt").disabled = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                document.getElementById("address").classList.add('is-invalid');
                document.getElementById("submitDebt").disabled = true;
            }
        }

        document.getElementById("state").onkeyup = () => {
            if (document.getElementById("state").value.trim().length > 0) {
                document.getElementById("state").classList.remove("is-invalid");
                if (document.getElementById("first_name").value.trim().length > 0) {
                    if (document.getElementById("last_name").value.trim().length > 0) {
                        if (document.getElementById("email").value.trim().length > 0) {
                            if (document.getElementById("phone_number").value.trim().length > 0) {
                                if (document.getElementById("address").value.trim().length > 0) {
                                    if (document.getElementById("description").value.trim().length > 0) {
                                        document.getElementById("submitDebt").disabled = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                document.getElementById("state").classList.add('is-invalid');
                document.getElementById("submitDebt").disabled = true;
            }
        }

        document.getElementById("gender").onchange = () => {
            if (document.getElementById("gender").value) {
                document.getElementById("gender").classList.remove("is-invalid");
            }
        }

        document.getElementById("description").onkeyup = () => {
            if (document.getElementById("description").value.trim().length > 0) {
                document.getElementById("description").classList.remove("is-invalid");
                if (document.getElementById("first_name").value.trim().length > 0) {
                    if (document.getElementById("last_name").value.trim().length > 0) {
                        if (document.getElementById("email").value.trim().length > 0) {
                            if (document.getElementById("phone_number").value.trim().length > 0) {
                                if (document.getElementById("address").value.trim().length > 0) {
                                    if (document.getElementById("state").value.trim().length > 0) {
                                        document.getElementById("submitDebt").disabled = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                document.getElementById("description").classList.add('is-invalid');
                document.getElementById("submitDebt").disabled = true;
            }
        }

        document.addEventListener("click", event => {
            const element = event.target;

            if (element.id == "submitDebt") {
                const debt_type = document.querySelector("input[name=debtor_type]:checked");
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                const checkVideo = document.getElementById("checkVideo");
                const update_debtor_modal = bootstrap.Modal.getInstance(document.getElementById('updateDebtorModal'));
                const txnSuccessfulModal = new bootstrap.Modal(document.getElementById('txnSuccessfulModal'), {
                    keyboard: false
                });
                
                if (debt_type.value == "new_debtor") {
                    // Debtor is new and needs to be added to the database
                    
                    if (document.getElementById("first_name").value.trim().length < 2) {
                        document.getElementById("first_name").classList.add('is-invalid');
                        alert("Enter valid input for customer's first name");
                        document.getElementById("first_name").focus();
                        return false;
                    }

                    if (document.getElementById("last_name").value.trim().length < 2) {
                        document.getElementById("last_name").classList.add('is-invalid');
                        alert("Enter valid input for customer's last name");
                        document.getElementById("last_name").focus();
                        return false;
                    }

                    if (document.getElementById("email").value.trim().length < 2) {
                        document.getElementById("email").classList.add('is-invalid');
                        alert("Enter valid input for customer's email address");
                        document.getElementById("email").focus();
                        return false;
                    }

                    if (document.getElementById("phone_number").value.trim().length < 10) {
                        document.getElementById("phone_number").classList.add('is-invalid');
                        alert("Enter valid input for customer's phone number");
                        document.getElementById("phone_number").focus();
                        return false;
                    }

                    if (document.getElementById("address").value.trim().length < 2) {
                        document.getElementById("address").classList.add('is-invalid');
                        alert("Enter valid input for customer's address");
                        document.getElementById("address").focus();
                        return false;
                    }

                    if (document.getElementById("state").value.trim().length < 2) {
                        document.getElementById("state").classList.add('is-invalid');
                        alert("Enter valid input for customer's state");
                        document.getElementById("state").focus();
                        return false;
                    }

                    if (document.getElementById("description").value.trim().length < 5) {
                        document.getElementById("description").classList.add('is-invalid');
                        alert("Enter valid input for customer's description");
                        document.getElementById("description").focus();
                        return false;
                    }

                    if (!(document.getElementById("gender").value)) {
                        document.getElementById("gender").classList.add('is-invalid');
                        document.getElementById("gender").focus();
                        return false;
                    }

                    // submit debtor information, then to transaction view
                    document.getElementById("submitDebt").disabled = true;
                    const cust_first_name = document.getElementById("first_name").value;
                    const cust_last_name = document.getElementById("last_name").value;
                    const cust_email = document.getElementById("email").value;
                    const cust_gender = document.getElementById("gender").value;
                    const cust_dialing_code = document.getElementById("dialing_code").value;
                    const cust_phone_no = document.getElementById("phone_number").value;
                    const cust_address = document.getElementById("address").value;
                    const cust_state = document.getElementById("state").value;
                    const cust_description = document.getElementById("description").value;
                    const cust_amount_owed = document.getElementById("hidden_amount_owed").value;

                    const initial_cust_id = document.getElementById("cancelDebtButton").dataset.customer;
                    const money_brought = document.getElementById("cancelDebtButton").dataset.amount;

                    const debt_data = {debtor_first_name: cust_first_name, debtor_last_name: cust_last_name,
                    debtor_email: cust_email, debtor_gender: cust_gender, debtor_dialing_code: cust_dialing_code,
                    debtor_phone_no: cust_phone_no, debtor_address: cust_address, debtor_state: cust_state,
                    debtor_description: cust_description, debt_amount: cust_amount_owed,
                    name_in_cart: initial_cust_id, amount_paid: money_brought};                    
                    
                    fetch("/add_debtor/", {
                        method: "POST",
                        headers: {'X-CSRFToken': csrftoken,
                                    "Content-Type": "application/json"},
                        mode: "same-origin",
                        body: JSON.stringify(debt_data),
                    })
                    .then((response) => {
                        if (!response.ok) {
                            failToast.show();
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json()})
                    .then(data => {
                        const result = data.result
                        if (result === "New Debtor") {
                            // Successful transaction
                            document.getElementById("descrip_text").style.display = "block"
                            document.getElementById("more_text").style.display = "none"
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = data.txn_id
                            document.getElementById("refNo").textContent = data.ref_no
                            // Make change to the text Content and update previous fetches
                            document.getElementById("descrip_text").textContent = "Debt amount:"
                            document.getElementById("change").textContent = ` ₦${data.debt}`
                            // Call modal for success
                            update_debtor_modal.hide();
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
                      
                } else if (debt_type.value == "old_debtor") {
                    // Debtor is old and only amount owed needs to be modified
                    const debtor_phone = document.getElementById("upd_act_phone").value;
                    const new_debt = document.getElementById("upd_act_new_amount").value;
                    const total_debt = document.getElementById("upd_act_total_debt").value;
                    const initial_cust_id = document.getElementById("cancelDebtButton").dataset.customer;
                    const money_brought = document.getElementById("cancelDebtButton").dataset.amount;
                    
                    const debt_data = {d_phone_no: debtor_phone, d_new_debt: new_debt, d_total_debt: total_debt,
                    customer_name: initial_cust_id, amount_brought: money_brought}
                    
                    fetch("/update_debtor/", {
                        method: "POST",
                        headers: {'X-CSRFToken': csrftoken,
                                    "Content-Type": "application/json"},
                        mode: "same-origin",
                        body: JSON.stringify(debt_data),
                    })
                    .then((response) => {
                        if (!response.ok) {
                            failToast.show();
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json()})
                    .then(data => {
                        const result = data.result
                        if (result === "Old Debtor") {
                            // Successful transaction
                            document.getElementById("descrip_text").style.display = "block"
                            document.getElementById("more_text").style.display = "block"
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = data.txn_id
                            document.getElementById("refNo").textContent = data.ref_no
                            // Make change to the text Content and update previous fetches
                            document.getElementById("descrip_text").textContent = "Amount Owed for this TXN:"
                            document.getElementById("change").textContent = ` ₦${data.debt}`
                            document.getElementById("more_text").textContent = `Total Amount Owed: ₦${data.total_debt}`
                            // Call modal for success
                            update_debtor_modal.hide();
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
                
            } else if (element.id == "add_debtor") {
                // console.log("Adding");
                document.getElementById("new_debtor_form").style.display = "block";
                document.getElementById("update_debtor_div").style.display = "none";
                document.getElementById("update_debtor_form").style.display = "none";
                document.getElementById("hold_update_button").style.visibility = "visible";
                document.getElementById("submitDebt").disabled = true;
            } else if (element.id == "update_debtor") {
                // console.log("Updating");
                document.getElementById("new_debtor_form").style.display = "none";
                document.getElementById("update_debtor_div").style.display = "block";
                document.getElementById("submitDebt").disabled = true;
            } else if (element.dataset.btntype == "debtor-button") {
                // Works. Update data in update form div, while hiding respective divs
                document.getElementById("hold_update_button").style.visibility = "hidden";
                document.getElementById("update_debtor_div").style.display = "none";

                document.getElementById("upd_full_name").value = element.dataset.name;
                document.getElementById("upd_phone").value = `${element.dataset.dial}${element.dataset.phone}`;
                document.getElementById("upd_act_phone").value = element.dataset.phone;
                document.getElementById("upd_description").value = element.dataset.descrip;
                document.getElementById("upd_address").value = element.dataset.address;
                document.getElementById("upd_old_amount").value = `₦${editPrice(element.dataset.oldamount)}`;
                document.getElementById("upd_new_amount").value = `₦${editPrice(element.dataset.newamount)}`;
                document.getElementById("upd_total_debt").value = `₦${editPrice(element.dataset.totalamount)}`;
                document.getElementById("upd_act_old_amount").value = element.dataset.oldamount;
                document.getElementById("upd_act_new_amount").value = element.dataset.newamount;
                document.getElementById("upd_act_total_debt").value = element.dataset.totalamount;
                // Bring entire form into view
                document.getElementById("update_debtor_form").style.display = "block";
                document.getElementById("submitDebt").disabled = false;
            }
        });

        // For search debtor feature
        document.getElementById("search_debtor").addEventListener("input", function(event) {
            const search_term = event.target.value.toLowerCase();
            const list_items = document.querySelectorAll("#debtor_list li");

            list_items.forEach(element => {
                const item_text = element.textContent.toLowerCase();

                if (item_text.includes(search_term)) {
                    element.style.display = "block";
                } else {
                    element.style.display = "none";
                }
            });
        })

        // Remove info on close
        updateDebtorModal.addEventListener("hidden.bs.modal", () => {
            const curr_debtors = document.querySelectorAll(".list-group-item");
            if (curr_debtors) {
                curr_debtors.forEach(debtor => {
                    debtor.remove();
                })
            }
        })
    }

    const txnSuccessfulModal = document.getElementById('txnSuccessfulModal')
    if (txnSuccessfulModal) {
        document.addEventListener("click", event => {
            const element = event.target;

            if (element.id == "refresh_button") {
                location.reload();
            }
        });
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
