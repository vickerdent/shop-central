
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
    .catch(error => {
        failToast.show();
        console.error({"error": error});
    });

    const quantities = document.getElementsByClassName("item-quantity")
    for (let index = 0; index < quantities.length; index++) {
        const element = quantities[index];
        var num_quantity = element.textContent
        element.textContent = humanize_float(num_quantity)
    }

    const links = document.getElementsByClassName("purchases");
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        element.disabled = true;
    }

    let idNum = 1

    document.addEventListener("click", event => {
        const element = event.target;
        if (element.classList.contains("delete-item")) {
            // alert("Ready to delete")
            
        } else if (element.id.startsWith("amountPaid")) {
            const currID = element.id;
            idNum = parseInt(currID.split("_")[1])
        }

        const pay_amount = document.getElementById(`amountPaid_${idNum}`)
        if (pay_amount) {
            document.getElementById(`amountPaid_${idNum}`).onkeyup = () => {
                document.getElementById(`amountPaid_${idNum}`).value = ensure_two_sf(document.getElementById(`amountPaid_${idNum}`).value);
                // document.getElementById(`amountPaid_${idNum}`).setSelectionRange(end_of_value, end_of_value)
                if (document.getElementById(`amountPaid_${idNum}`).value.length > 0 && (!(document.getElementById(`amountPaid_${idNum}`).value.startsWith("0")) || (document.getElementById(`amountPaid_${idNum}`).value.startsWith("0") && document.getElementById(`amountPaid_${idNum}`).value.length == 1)) && parseFloat(document.getElementById(`amountPaid_${idNum}`).value) >= 0) {
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
                document.getElementById("confirmPay").style.display = "none";
                document.getElementById("load_payment").style.display = "block";
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
                            document.getElementById("txnInfo").textContent = ` ${data.txn_id}`
                            document.getElementById("refNo").textContent = ` ${data.ref_no}`
                            // Call modal for success
                            confirm_purchase_modal.hide();
                            txnSuccessfulModal.show();
                            checkVideo.play();
                        } else {
                            failToast.show();
                        }
                    })
                    .catch(error => {
                        failToast.show();
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
                        const dresult = data.result
                        if (dresult === "Change") {
                            // Successful transaction
                            document.getElementById("descrip_text").style.display = "block"
                            document.getElementById("more_text").style.display = "none"
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = ` ${data.txn_id}`
                            document.getElementById("refNo").textContent = ` ${data.ref_no}`
                            document.getElementById("descrip_text").textContent = `Change amount: ₦${data.change}`
                            // Call modal for success
                            confirm_purchase_modal.hide();
                            txnSuccessfulModal.show();
                            checkVideo.play();
                        } else {
                            failToast.show();
                        }
                    })
                    .catch(error => {
                        failToast.show();
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
            document.getElementById("confirmPay").style.display = "block";
            document.getElementById("load_payment").style.display = "none";
        })
    }

    var debtor_phones = []

    const updateDebtorModal = document.getElementById('updateDebtorModal')
    if (updateDebtorModal) {
        updateDebtorModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-* attributes

            const recipient = button.getAttribute("data-customer")
            const totalAmount = button.getAttribute("data-amount")
            const amt_brought = button.getAttribute("data-amtbrought")
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
                            `<a class="link-light link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" href="#" role="button" data-phone="${element.phone_no[0].number}"`,
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
                        debtor_phones.push(element.phone_no[0].number);
                    });
                    document.getElementById("ze_spinner").style.display = "none";
                    document.getElementById("debtor_content").style.display = "block";
                } else {
                    failToast.show();
                }
            })
            .catch(error => {
                failToast.show();
                console.error({"error": error});
            });

            // Update the modal's content.
            document.getElementById("amount_owed").value = `₦${editPrice(debtAmt)}`;
            document.getElementById("hidden_amount_owed").value = debtAmt;
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
            cancelDebt.setAttribute("data-amtbrought", amt_brought)
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

        updateDebtorModal.addEventListener("click", event => {
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

                    // Check if phone number already exists
                    const cust_phone_no = document.getElementById("phone_number").value;
                    var processed_phone = "";
                    if (cust_phone_no.length == 11) {
                        processed_phone = cust_phone_no.slice(1);
                        document.getElementById("phone_number").value = processed_phone
                    } else {
                        processed_phone = cust_phone_no;
                    }

                    if (debtor_phones.includes(processed_phone)) {
                        const div_hold = document.getElementById("warn_user");
                        const wrapper = document.createElement("div");
                        wrapper.id = "alertError";

                        wrapper.innerHTML = [
                            '<div class="alert alert-danger d-flex align-items-center alert-dismissible" role="alert">',
                            '   <svg class="bi flex-shrink-0 me-2" width="16" height="16" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>',
                            '   <div>',
                            '       Debtor with entered phone number already exists!',
                            '       <br> Enter a unique phone number belonging to debtor or update existing debtor',
                            '   </div>',
                            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close_alert"></button>',
                            '</div>'
                        ].join('')

                        div_hold.append(wrapper);
                        document.getElementById("phone_number").classList.add('is-invalid');
                        document.getElementById("close_alert").focus();
                        // document.getElementById("phone_number").focus();
                        return false;
                    }

                    // submit debtor information, then to transaction view
                    document.getElementById("submitDebt").style.display = "none";
                    document.getElementById("load_button").style.display = "block";
                    document.getElementById("cancelDebtButton").disabled = true;
                    const cust_first_name = document.getElementById("first_name").value;
                    const cust_last_name = document.getElementById("last_name").value;
                    const cust_email = document.getElementById("email").value;
                    const cust_gender = document.getElementById("gender").value;
                    const cust_dialing_code = document.getElementById("dialing_code").value;
                    const cust_address = document.getElementById("address").value;
                    const cust_state = document.getElementById("state").value;
                    const cust_description = document.getElementById("description").value;
                    const cust_amount_owed = document.getElementById("hidden_amount_owed").value;

                    const initial_cust_id = document.getElementById("cancelDebtButton").dataset.customer;
                    const money_brought = document.getElementById("cancelDebtButton").dataset.amtbrought;

                    const debt_data = {debtor_first_name: cust_first_name, debtor_last_name: cust_last_name,
                    debtor_email: cust_email, debtor_gender: cust_gender, debtor_dialing_code: cust_dialing_code,
                    debtor_phone_no: processed_phone, debtor_address: cust_address, debtor_state: cust_state,
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
                            document.getElementById("txnInfo").textContent = ` ${data.txn_id}`
                            document.getElementById("refNo").textContent = ` ${data.ref_no}`
                            // Make change to the text Content and update previous fetches
                            document.getElementById("descrip_text").textContent = `Debt amount: ₦${data.debt}`
                            // Call modal for success
                            update_debtor_modal.hide();
                            txnSuccessfulModal.show();
                            checkVideo.play();
                        } else {
                            failToast.show();
                        }
                    })
                    .catch(error => {
                        failToast.show();
                        console.error({"error": error});
                    });
                      
                } else if (debt_type.value == "old_debtor") {
                    // Debtor is old and only amount owed needs to be modified
                    document.getElementById("submitDebt").style.display = "none";
                    document.getElementById("load_button").style.display = "block";
                    document.getElementById("cancelDebtButton").disabled = false;
                    const debtor_phone = document.getElementById("upd_act_phone").value;
                    const new_debt = document.getElementById("upd_act_new_amount").value;
                    const total_debt = document.getElementById("upd_act_total_debt").value;
                    const initial_cust_id = document.getElementById("cancelDebtButton").dataset.customer;
                    const money_brought = document.getElementById("cancelDebtButton").dataset.amtbrought;
                    
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
                            document.getElementById("txnInfo").textContent = ` ${data.txn_id}`
                            document.getElementById("refNo").textContent = ` ${data.ref_no}`
                            // Make change to the text Content and update previous fetches
                            document.getElementById("descrip_text").textContent = `Amount Owed for this TXN: ₦${data.debt}`
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
                        failToast.show();
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
        });

        // Remove info on close
        updateDebtorModal.addEventListener("hidden.bs.modal", () => {
            const curr_debtors = document.querySelectorAll(".list-group-item");
            if (curr_debtors) {
                curr_debtors.forEach(debtor => {
                    debtor.remove();
                })
            }
            document.getElementById("submitDebt").style.display = "block";
            document.getElementById("load_button").style.display = "none";
            document.getElementById("cancelDebtButton").disabled = false;
        });
    }

    const txnSuccessfulModal = document.getElementById('txnSuccessfulModal')
    if (txnSuccessfulModal) {
        txnSuccessfulModal.addEventListener("click", event => {
            const element = event.target;

            if (element.id == "refresh_button") {
                const transaction_success = bootstrap.Modal.getInstance(document.getElementById('txnSuccessfulModal'));
                transaction_success.hide();
                location.reload();
            }
        });
    }

    // Delete modal
    const confirm_delete_modal = document.getElementById('confirm_delete_modal')
    if (confirm_delete_modal) {
        confirm_delete_modal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-* attributes

            const ze_customer = button.getAttribute("data-customer");
            const ze_product = button.getAttribute("data-product");
            const ze_slug = button.getAttribute("data-slug");

            // Update the modal's content.
            document.getElementById("prod_name").textContent = `${ze_product}`;
            document.getElementById("cust_name").textContent = `${ze_customer}`;

            const confirm_delete = document.getElementById("confirm_delete");
            confirm_delete.setAttribute("data-delslug", ze_slug);
            confirm_delete.setAttribute("data-delcustomer", ze_customer);

        });

        confirm_delete_modal.addEventListener("click", (event) => {
            const element = event.target;

            if (element.id == "confirm_delete") {
                document.getElementById("confirm_delete").style.display = "none";
                document.getElementById("load_button_two").style.display = "block";
                document.getElementById("confirm_cancel").disabled = true;
                
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                const item_data = {item_slug: element.dataset.delslug,
                item_customer: element.dataset.delcustomer}
                
                // Remove beginning slash to add new url to current page, instead of base
                fetch("delete_item/", {
                    method: "POST",
                    headers: {'X-CSRFToken': csrftoken,
                                "Content-Type": "application/json"},
                    mode: "same-origin",
                    body: JSON.stringify(item_data),
                })
                .then((response) => {
                    if (!response.ok) {
                        failToast.show();
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json()})
                .then(data => {
                    const result = data.result
                    if (result === "Successful") {
                        // Successful deletion
                        const noOfCarts = document.getElementById("noOfCarts");
                        const confirm_delete = bootstrap.Modal.getInstance(document.getElementById('confirm_delete_modal'));
                        const del_item = document.querySelector(`a[data-slug=${element.dataset.delslug}][data-customer="${element.dataset.delcustomer}"]`);
                        var item_sub_total = parseFloat(document.querySelector(`input[name=hidden_item_sub_total][data-slug=${element.dataset.delslug}][data-customer="${element.dataset.delcustomer}"]`).value);
                        var cart_total = parseFloat(document.querySelector(`input[name=hidden_total_amount][data-customer="${element.dataset.delcustomer}"]`).value);
                        var new_cart_total = cart_total - item_sub_total
                        // Set new cart total (hidden and shown)
                        document.querySelector(`input[name=hidden_total_amount][data-customer="${element.dataset.delcustomer}"]`).value = new_cart_total;
                        document.querySelector(`span[data-customertotal="${element.dataset.delcustomer}"]`).textContent = editPrice(new_cart_total.toString());
                        
                        // Also set amount owed (hidden and shown) as well as button data attribute
                        document.querySelector(`input[type=text][data-customer="${element.dataset.delcustomer}"]`).value = "";
                        document.querySelector(`button[type=button][data-customer="${element.dataset.delcustomer}"]`).disabled = true;
                        document.querySelector(`input[name=hidden_amount_owed][data-customer="${element.dataset.delcustomer}"]`).value = new_cart_total;
                        document.querySelector(`span[data-customerowed="${element.dataset.delcustomer}"]`).textContent = editPrice(new_cart_total.toString());
                        document.querySelector(`button[type=button][data-customer="${element.dataset.delcustomer}"]`).dataset.amount = new_cart_total;
                        if (new_cart_total == 0) {
                            // Remove entire cart from list
                            del_item.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
                            noOfCarts.textContent = parseInt(document.querySelector("#noOfCustomers").value) - 1
                            if (noOfCarts.textContent == "0") {
                                noOfCarts.remove()
                            }
                        } else {
                            del_item.parentElement.parentElement.parentElement.style.animationPlayState = "running";
                            del_item.parentElement.parentElement.parentElement.addEventListener("animationend", () => {
                                del_item.parentElement.parentElement.parentElement.remove();
                            })
                        }
                        setTimeout(confirm_delete.hide(), 3000);
                    } else {
                        failToast.show();
                    }
                })
                .catch(error => {
                    failToast.show();
                    console.error({"error": error});
                });
            }
        })

        confirm_delete_modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("load_button_two").style.display = "none";
            document.getElementById("confirm_delete").style.display = "block";
            document.getElementById("confirm_cancel").disabled = false;
        })
    }
});

function humanize_float(d_float) {
    var point = d_float.indexOf(".")
    if ((point != -1)) {
        var whole_value  = d_float.slice(0, point);
        var decimal_value = d_float.slice(point + 1);
        var final_value = "";

        if (whole_value == "0") {
            if (decimal_value == "5") {
                // Quantity ends with half value
                final_value = `Half`;
            } else if (decimal_value == "25") {
                // Quantity ends with quarter value
                final_value = `Quarter`;
            } else if (decimal_value == "75") {
                // Quantity ends with quarter value
                final_value = `Three Quarters`;
            }
        } else {
            if (decimal_value == "5") {
                // Quantity ends with half value
                final_value = `${whole_value} and Half`;
            } else if (decimal_value == "25") {
                // Quantity ends with quarter value
                final_value = `${whole_value} and Quarter`;
            } else if (decimal_value == "75") {
                // Quantity ends with quarter value
                final_value = `${whole_value} and Three Quarters`;
            }
        }
        return final_value
    } else {
        // Variable has no point in it
        return d_float
    }
}

function ensure_two_sf(value) {
    var point = value.indexOf(".")
    if (value.includes(".")) {
        // There's a point in value. Apply limits
        var main_value = value.slice(0, point)
        var kobo_cent = value.slice(point + 1)
        var new_kobo_cent = kobo_cent
        if (kobo_cent.length > 2) {
            // Attempting to extend bounds
            new_kobo_cent = kobo_cent.slice(0, 2)
        }
        return main_value + "." + new_kobo_cent
    } else {
        return value
    }
}

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
